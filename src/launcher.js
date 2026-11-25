'use strict';
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');

const CANDIDATE_EXES = [
  process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null,
  'C:\\Program Files\\RL Career Hub\\RL Career Hub.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'RL Career Hub', 'RL Career Hub.exe'),
].filter(Boolean);

const WAIT_MS = 20 * 60 * 1000;
const LOG = path.join(process.env.TEMP || '.', 'rlcareerplus.log');
const say = (m) => {
  console.log('[RL Career+]', m);
  try { fs.appendFileSync(LOG, new Date().toISOString() + ' launcher: ' + m + '\n'); } catch {}
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findFreePort(preferred = 9345) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', () => resolve(findFreePort(0)));
    srv.listen(preferred, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function waitInspectorUrl(port) {
  for (let i = 0; i < 400; i++) {
    try {
      const list = await getJson(`http://127.0.0.1:${port}/json/list`);
      if (list[0] && list[0].webSocketDebuggerUrl) return list[0].webSocketDebuggerUrl;
    } catch {}
    await sleep(75);
  }
  throw new Error('Inspector port did not open on ' + port);
}

function remoteEvalExpr() {
  const inproc = path.join(__dirname, 'inproc.js').replace(/\\/g, '/');
  return `(function () {
    let req = (typeof require === 'function' ? require : (process.mainModule && process.mainModule.require.bind(process.mainModule)));
    if (!req && typeof process.getBuiltinModule === 'function') {
      try { const M = process.getBuiltinModule('module'); if (M && M.createRequire) req = M.createRequire(${JSON.stringify(inproc)}); } catch {}
    }
    if (!req) return 'wait-require';
    return req(${JSON.stringify(inproc)}).attach({ log: ${JSON.stringify(LOG)}, closeInspector: true });
  })()`;
}

function openInspectorWs(wsUrl) {
  const u = new URL(wsUrl);
  return new Promise((resolve, reject) => {
    const sock = net.connect(Number(u.port), u.hostname);
    let buf = Buffer.alloc(0);
    let handshakeDone = false;
    const api = {
      onmessage: null,
      send(text) {
        const payload = Buffer.from(text, 'utf8');
        const mask = crypto.randomBytes(4);
        let hdr;
        if (payload.length < 126) {
          hdr = Buffer.from([0x81, 0x80 | payload.length]);
        } else if (payload.length < 65536) {
          hdr = Buffer.alloc(4);
          hdr[0] = 0x81; hdr[1] = 0x80 | 126;
          hdr.writeUInt16BE(payload.length, 2);
        } else {
          hdr = Buffer.alloc(10);
          hdr[0] = 0x81; hdr[1] = 0x80 | 127;
          hdr.writeBigUInt64BE(BigInt(payload.length), 2);
        }
        const masked = Buffer.allocUnsafe(payload.length);
        for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i & 3];
        sock.write(Buffer.concat([hdr, mask, masked]));
      },
      close() { try { sock.end(); } catch {} },
    };
    sock.on('error', reject);
    sock.on('connect', () => {
      const key = crypto.randomBytes(16).toString('base64');
      sock.write(
        `GET ${u.pathname}${u.search} HTTP/1.1\r\n` +
        `Host: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n` +
        `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
      );
    });
    sock.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (!handshakeDone) {
        const idx = buf.indexOf('\r\n\r\n');
        if (idx === -1) return;
        const head = buf.slice(0, idx).toString('utf8');
        if (!/^HTTP\/1\.[01]\s+101\b/i.test(head)) {
          sock.destroy();
          return reject(new Error('WebSocket upgrade rejected'));
        }
        handshakeDone = true;
        buf = buf.slice(idx + 4);
        resolve(api);
      }
      while (buf.length >= 2) {
        const b0 = buf[0];
        const b1 = buf[1];
        let len = b1 & 0x7f;
        let off = 2;
        if (len === 126) {
          if (buf.length < 4) return;
          len = buf.readUInt16BE(2);
          off = 4;
        } else if (len === 127) {
          if (buf.length < 10) return;
          len = Number(buf.readBigUInt64BE(2));
          off = 10;
        }
        if (b1 & 0x80) off += 4;
        if (buf.length < off + len) return;
        const frame = buf.slice(off, off + len);
        buf = buf.slice(off + len);
        const opcode = b0 & 0x0f;
        if (opcode === 0x08) { sock.end(); return; }
        if (opcode === 0x09) { sock.write(Buffer.from([0x8a, 0x80, 0, 0, 0, 0])); continue; }
        if ((opcode === 0x01 || opcode === 0x00) && api.onmessage) {
          api.onmessage({ data: frame.toString('utf8') });
        }
      }
    });
  });
}

(async () => {
  const exe = CANDIDATE_EXES.find((p) => fs.existsSync(p));
  if (!exe) {
    say('RL Career Hub.exe not found.');
    process.exit(1);
  }

  const port = Number(process.env.RLCPLUS_PORT) || await findFreePort(9345);
  const childEnv = { ...process.env };
  delete childEnv.ELECTRON_RUN_AS_NODE;
  say(`Launching ${exe} (--inspect=${port})`);
  spawn(exe, [`--inspect=${port}`], { detached: true, stdio: 'ignore', cwd: path.dirname(exe), env: childEnv }).unref();

  const wsUrl = await waitInspectorUrl(port);
  const ws = await openInspectorWs(wsUrl);

  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const evalRemote = () => new Promise((res) => {
    const reqId = ++id;
    pending.set(reqId, (msg) => res(msg.result && msg.result.result ? msg.result.result.value : JSON.stringify(msg)));
    ws.send(JSON.stringify({ id: reqId, method: 'Runtime.evaluate', params: { expression: remoteEvalExpr(), includeCommandLineAPI: true, returnByValue: true } }));
  });

  const t0 = Date.now();
  let last = '';
  while (Date.now() - t0 < WAIT_MS) {
    let status;
    try { status = await evalRemote(); } catch (e) { status = 'error: ' + e.message; }
    if (status !== last) { say('status: ' + status); last = status; }
    if (status === 'wrapped' || status === 'already' || String(status).startsWith('error')) break;
    if (status === 'wait-require' && Date.now() - t0 > 15000) break;
    await sleep(Date.now() - t0 < 4000 ? 100 : 300);
  }

  try { ws.close(); } catch {}
  say(last === 'wrapped' || last === 'already' ? 'RL Career+ active!' : 'Ended with: ' + last);
  process.exit(last === 'wrapped' || last === 'already' ? 0 : 1);
})().catch((e) => {
  say('Failed: ' + e.message);
  process.exit(1);
});
