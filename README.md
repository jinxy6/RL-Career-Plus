# RL Career+ (Community Add-on for RL Career Hub)

**RL Career+** is a standalone, non-destructive community add-on for **RL Career Hub (`0.2.0-beta.33`)**. It launches alongside your existing install in-memory without modifying `RL Career Hub.exe`, `app.asar`, or breaking your existing saves.

## Features

### Visuals & Presentation
- **Custom RLCS Cinematic Intro** (`intro.webm`) with smooth audio/video crossfade into the Home Hub and a **Watch Intro** replay button.
- **Overhauled Home Hub & Dark Esports Theme** (toggleable back to Default Beta 33 styling anytime).
- **All 22 Standard Rocket League Arenas** rotating dynamically as blurred UI backdrops (shuffled on launch, 1 active texture in VRAM at a time).
- **Fixed UI Viewport Overflow** on Team Management and all office/modal windows.

### In-Game Rocket League Fixes & Titles (100% Offline)
- **Epic Games Scoreboard Fix:** Sanitizes corrupted `-epicusername` control/null bytes during Epic auth handoff so `-epicuserid` stays intact, your real Rocket League inventory/car loads, and `rlcareermode.dll` restores your scoreboard row cleanly.
- **Career Name on Scoreboard (`rlcareerplus.dll`):** Tiny open-source BakkesMod SDK plugin (`rlcareerplus.cpp`, offline-only via `IsInOnlineGame()`) that sets your local in-game scoreboard name to your Career Name instead of your Epic display name.
- **Clickable Top-Left Player Profile & Live Earned Title Selector:**
  - Click your top-left player badge to view your full career stats (shows Career totals cleanly at the start of a new season) and choose any title earned in that career.
  - Includes **RLCS Worlds**, **Majors with host city names**, **Regionals**, **Contender/Challenger**, **N-Time World / Major / World Cup Champion**, and **FIFAe World Cup** titles (with authentic **RLCS Blue Glow** and **Golden Glow** both in-game and in the live scoreboard preview).

### Career Quality-of-Life & Control Center
- **RL Career+ Control Center Tab:** Auto-Training (auto-fill slots, skip potential-capped players, catch-up across multi-day sims, national team player training), Notification/Toast filters, Visual toggles, Club Budget & Squad Player Editor (including live potential ceiling fix).
- **Y (Socials) Themes & Pronouns:** 5 cohesive dark Y themes (Dim Slate, Midnight Neon, Royal Violet, Esports Emerald, Championship Gold) + He/Him or She/Her pronoun toggle for social posts.

### Performance Optimizations (Zero Bot Skill Loss)
- Match-mode GPU idle freeze lowers Electron overhead while Rocket League is running.
- `rlcareerplus.dll` sets `RocketLeague.exe` to `AboveNormal` priority on load for smoother frame pacing without throttling Nexto/Ripple bots.
- Fast startup inspector polling, cached title computation, and lightweight `file:///` wallpaper loading.

---

## Install (Players)

1. Download **`RL Career Hub - Career+.exe`** from the **[Releases](../../releases)** page.
2. Double-click **`RL Career Hub - Career+.exe`** from anywhere (Desktop, Downloads, etc. — it automatically locates your `RL Career Hub.exe` install and prompts a file picker only if installed in a custom path).
3. Click **Yes** on the Windows UAC prompt (and **More info -> Run anyway** if SmartScreen appears on first run).

- **Existing saves:** Fully compatible — your saves stay untouched.
- **Other add-ons:** Compatible with **RL Career Pro Presets v1.0** (zero hook/file overlap — Pro Presets only modifies `start_match.py` for bot presets). Not tested with other community add-ons (separate launcher `.exe` mods cannot be stacked together).
- **Uninstall / Vanilla:** Simply open the normal **RL Career Hub** shortcut anytime. To delete cached Career+ files, remove `%LOCALAPPDATA%\RLCareerPlus` and `%APPDATA%\bakkesmod\bakkesmod\plugins\rlcareerplus.dll`.

---

## Transparency & Security Notes

- **Why Administrator elevation (`app.manifest`)?** Many Epic Games Launcher / BakkesMod setups run elevated; requesting elevation prevents Windows `Access Denied` errors when Career Hub closes Epic's initial Rocket League process or restarts BakkesMod before a match.
- **What does `rlcareerplus.dll` do?** Built solely from [src/rlcareerplus.cpp](./src/rlcareerplus.cpp) using the official BakkesMod SDK (`pluginsdk.lib`, zero memory offsets). It reads `%APPDATA%\bakkesmod\bakkesmod\data\rlcareermode\career_name.txt`, calls `PriWrapper::eventSetPlayerName()` only when `!IsInOnlineGame()`, and sets `ABOVE_NORMAL_PRIORITY_CLASS` on `RocketLeague.exe`.

---

## Build From Source

Requirements: Windows 10/11 x64, Node.js, Visual Studio 2022 Build Tools (C++ x64), BakkesMod SDK (`%APPDATA%\bakkesmod\bakkesmod\bakkesmodsdk`), and `.NET Framework 4.x` (`csc.exe`, built into Windows). Place `intro.webm` (from the Release assets, or your own `.webm`) in the repo folder, then run:

```powershell
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

This compiles `rlcareerplus.dll`, runs syntax checks + `test_addon.js`, and outputs `RL Career Hub - Career+.exe`.

---

Tested on **RL Career Hub `0.2.0-beta.33`**.
