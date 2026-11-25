using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

class Program {
    static string TryCandidate(string p) {
        return !string.IsNullOrWhiteSpace(p) && File.Exists(p) ? Path.GetFullPath(p) : null;
    }

    static string FromUninstallRegistry() {
        string[] subKeys = {
            @"Software\Microsoft\Windows\CurrentVersion\Uninstall",
            @"Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
        };
        RegistryKey[] roots = { Registry.CurrentUser, Registry.LocalMachine };
        foreach (RegistryKey root in roots) {
            foreach (string sub in subKeys) {
                try {
                    using (RegistryKey rk = root.OpenSubKey(sub)) {
                        if (rk == null) continue;
                        foreach (string name in rk.GetSubKeyNames()) {
                            using (RegistryKey app = rk.OpenSubKey(name)) {
                                if (app == null) continue;
                                string dn = Convert.ToString(app.GetValue("DisplayName"));
                                if (string.IsNullOrEmpty(dn) || dn.IndexOf("RL Career Hub", StringComparison.OrdinalIgnoreCase) < 0) continue;
                                string loc = Convert.ToString(app.GetValue("InstallLocation")).Trim('"', ' ');
                                string hit = TryCandidate(string.IsNullOrEmpty(loc) ? null : Path.Combine(loc, "RL Career Hub.exe"));
                                if (hit != null) return hit;
                                string icon = Convert.ToString(app.GetValue("DisplayIcon")).Split(',')[0].Trim('"', ' ');
                                hit = TryCandidate(icon.EndsWith("RL Career Hub.exe", StringComparison.OrdinalIgnoreCase) ? icon : Path.Combine(Path.GetDirectoryName(icon) ?? "", "RL Career Hub.exe"));
                                if (hit != null) return hit;
                            }
                        }
                    }
                } catch {}
            }
        }
        return null;
    }

    static string FromShortcuts() {
        try {
            Type shType = Type.GetTypeFromProgID("WScript.Shell");
            if (shType == null) return null;
            object sh = Activator.CreateInstance(shType);
            string[] dirs = {
                Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
                Environment.GetFolderPath(Environment.SpecialFolder.CommonDesktopDirectory),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "RL Career Hub"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonPrograms), "RL Career Hub")
            };
            foreach (string d in dirs) {
                if (string.IsNullOrEmpty(d) || !Directory.Exists(d)) continue;
                foreach (string lnk in Directory.GetFiles(d, "*RL Career*.lnk")) {
                    try {
                        object sc = shType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, sh, new object[] { lnk });
                        string target = Convert.ToString(sc.GetType().InvokeMember("TargetPath", BindingFlags.GetProperty, null, sc, null));
                        string hit = TryCandidate(target);
                        if (hit != null) return hit;
                    } catch {}
                }
            }
        } catch {}
        return null;
    }

    static string FindGameExe(string dataDir) {
        string savedFile = Path.Combine(dataDir, "game_path.txt");
        try {
            if (File.Exists(savedFile)) {
                string saved = TryCandidate(File.ReadAllText(savedFile).Trim());
                if (saved != null) return saved;
            }
        } catch {}

        string[] direct = {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "RL Career Hub.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "RL Career Hub", "RL Career Hub.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "RL Career Hub", "RL Career Hub.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "RL Career Hub", "RL Career Hub.exe")
        };
        foreach (string p in direct) {
            string hit = TryCandidate(p);
            if (hit != null) return hit;
        }

        string regHit = FromUninstallRegistry();
        if (regHit != null) return regHit;

        string lnkHit = FromShortcuts();
        if (lnkHit != null) return lnkHit;

        using (var dlg = new OpenFileDialog()) {
            dlg.Title = "Locate RL Career Hub.exe";
            dlg.Filter = "RL Career Hub (RL Career Hub.exe)|RL Career Hub.exe|Executable (*.exe)|*.exe";
            dlg.FileName = "RL Career Hub.exe";
            if (dlg.ShowDialog() == DialogResult.OK) {
                string picked = TryCandidate(dlg.FileName);
                if (picked != null) {
                    try { File.WriteAllText(savedFile, picked); } catch {}
                    return picked;
                }
            }
        }
        return null;
    }

    static void ExtractResources(string dir) {
        Assembly asm = Assembly.GetExecutingAssembly();
        string ver = asm.ManifestModule.ModuleVersionId.ToString("N");
        string stampFile = Path.Combine(dir, ".stamp");
        bool stampMatches = false;
        try { stampMatches = File.Exists(stampFile) && File.ReadAllText(stampFile).Trim() == ver; } catch {}

        foreach (string name in asm.GetManifestResourceNames()) {
            if (name.IndexOf('/') >= 0 || name.IndexOf('\\') >= 0) continue;
            string dst = Path.Combine(dir, name);
            using (Stream s = asm.GetManifestResourceStream(name)) {
                if (s == null) continue;
                if (stampMatches && File.Exists(dst) && new FileInfo(dst).Length == s.Length) continue;
                using (FileStream fs = File.Create(dst)) s.CopyTo(fs);
            }
        }
        try { File.WriteAllText(stampFile, ver); } catch {}
    }

    [STAThread]
    static int Main() {
        try {
            string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RLCareerPlus");
            Directory.CreateDirectory(dir);

            Process[] running = Process.GetProcessesByName("RL Career Hub");
            if (running.Length > 0) {
                DialogResult ans = MessageBox.Show(
                    "RL Career Hub is already running.\n\nClose it and relaunch with RL Career+?",
                    "RL Career+", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                if (ans != DialogResult.Yes) return 0;
                foreach (Process r in running) {
                    try { r.Kill(); r.WaitForExit(3000); } catch {}
                }
                Thread.Sleep(350);
            }

            string gameExe = FindGameExe(dir);
            if (gameExe == null) {
                MessageBox.Show("RL Career Hub.exe was not found.\nInstall RL Career Hub first or select RL Career Hub.exe when prompted.", "RL Career+", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return 1;
            }

            ExtractResources(dir);
            string launcher = Path.Combine(dir, "launcher.js");
            var psi = new ProcessStartInfo(gameExe, "\"" + launcher + "\" \"" + gameExe + "\"");
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.WorkingDirectory = dir;
            psi.EnvironmentVariables["ELECTRON_RUN_AS_NODE"] = "1";
            using (Process p = Process.Start(psi)) {
                p.WaitForExit();
                if (p.ExitCode != 0) {
                    MessageBox.Show("RL Career+ could not attach (exit code " + p.ExitCode + ").\nCheck %TEMP%\\rlcareerplus.log.", "RL Career+", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return p.ExitCode;
                }
            }
            return 0;
        } catch (Exception ex) {
            MessageBox.Show("RL Career+ failed: " + ex.Message, "RL Career+", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
}
