# RL Career+ (Community Add-on for RL Career Hub)

**RL Career+** is a standalone, non-destructive community add-on for **RL Career Hub (`0.2.0-beta.33`)**. It launches alongside your existing install in-memory without modifying `RL Career Hub.exe`, `app.asar`, or breaking your existing saves.

## What's New in v1.1

### 1. Full Club Staff Rework (7 Roles × 3 Tiers + 70 IRL RLCS Coaches)
- **Master/Detail Club Staff Tab:** Hire and upgrade across 7 specialized roles (**Scout**, **Mental Coach**, **Media Trainer**, **Assistant Coach**, **Engineer**, **Physiotherapist**, **Youth Development Coach**) in **Bad / Mid / Best** tiers with realistic signing fees and weekly wages.
- **Scouts (Up to 3 Slots):** Brand-new careers start with **0 scouts** (attempting to scout prompts you to hire one). Distinct speed & potential-accuracy bands (`8–10d ±3` / `6–7d ±2` / `3–5d ±1`).
- **Assistant Coach & Auto-Train:** Features **70 real RLCS coaches** pulled from game data, cuts training cooldown (`-1 / -2 / -3 days`), boosts training gains (`+5% / +10% / +15%`), and **exclusively unlocks Auto-Train at Best tier**.
- **Engineer & Monthly HQ Rent/Maintenance:** Cuts facility upgrade costs & monthly HQ rent/maintenance (`-10% / -20% / -30%`). Missing monthly rent triggers a **3-strike eviction** back to Tier 0 + a **6-month lease ban** (with manual overdue payment in Facilities / Finances / Engineer panel).
- **Mental Coach, Media Trainer, Physiotherapist & Youth Dev Coach:** Real gameplay hooks for ego/morale/chat protection, sponsor & media income/follower boosts, injury prevention & faster recovery, and youth potential boosts (`+1 / +2 / +3`) + veteran decay protection (`-50%`).

### 2. Y (Socials) Overhaul — Highlights, Rivalries, Polls & Budget-Aware Leaks
- **Tournament Highlights (`⚡ Highlights`):** Post-match broadcast highlight cards (for both your played/simmed matches AND AI-vs-AI Majors/Worlds/FIFAe matches), plus optional local `.mp4`/`.webm` highlight support.
- **Interactive Banter & Club Rivalries:** **🔥 Clapback**, **😂 Ratio**, **🤝 Respect**, **✍️ Custom Reply**, and **Club Call Outs** with 260+ unique no-repeat RLCS Twitter lines, Twitter/X-style indented thread replies, and live Club Rivalry heat bars.
- **Pre-Match Fan Polls & Pull Receipts (`📸`):** Vote in matchday polls and pull quoted receipts on doubters after beating them.
- **Shift RLCS Insider & Budget-Aware Transfer Leaks (`👀 Leaks`):** React to rumors with **Drop Eyes** or **Fake News** — AND if you tweet about buying/signing a player (e.g. *"WE ARE BUYING ZEN"*), **Shift RLCS Insider** checks your real club budget vs. the player's actual transfer value and either roasts you for not having the money or drops a blockbuster leak confirming your warchest!

### 3. Live LAN Crowd Pops & Arena Audio (`rlcareer_crowd.dll`)
- **Real-Time Rocket League Crowd Pops:** Automatically triggers arena crowd roars on **Goals**, **Saves**, **Epic Saves**, **Overtime / Last-10s Eruptions**, and **Full-Time** inside Rocket League matches via our offline-only BakkesMod plugin (`rlcareer_crowd.dll`, auto-deployed).
- **Authentic LAN Eligibility:** Silent in online **Opens / Regional Qualifiers**, activates in **Major Playoffs**, **World Championship**, **FIFAe World Cup**, and other **LAN Cups/Tournaments** (or switch to **Always On** / **Off** anytime).
- **Ultras Kickoff Walkout & Controls:** Optional European-LAN-style bass-drum & clap kickoff buildup, volume slider, and instant sound test buttons inside the **Career+** tab.

### 4. 1:1 Rocket League Garage Tag Selector & Core v1.0 Features
- **1:1 Rocket League Tag Selector:** Authentic dark-navy RL Garage title picker with crisp white selection bar, hover live preview, RLCS Blue Glow, and World Cup Gold Glow.
- **Custom RLCS Cinematic Intro**, **22 Rotating Standard RL Arenas**, **Dark Esports Theme**, **Epic Games Scoreboard & Inventory Fix**, **Career Name on Scoreboard (`rlcareerplus.dll`)**, **Club & Squad Editor**, **5 Y Themes + Pronouns**, and **Match-Mode GPU Performance Optimizations**.

---

## Install (Players)

1. Download **`RL Career Hub - Career+.exe`** from the **[Releases](../../releases)** page.
2. Double-click **`RL Career Hub - Career+.exe`** from anywhere (Desktop, Downloads, etc. — it automatically locates your `RL Career Hub.exe` install and prompts a file picker only if installed in a custom path).
3. Click **Yes** on the Windows UAC prompt (and **More info -> Run anyway** if SmartScreen appears on first run).

- **Existing saves:** Fully compatible — your saves stay untouched.
- **Other add-ons:** Compatible with **RL Career Pro Presets v1.0** (zero hook/file overlap — Pro Presets only modifies `start_match.py` for bot presets). Not tested with other standalone launcher `.exe` add-ons.
- **Uninstall / Vanilla:** Simply open the normal **RL Career Hub** shortcut anytime. To delete cached Career+ files, remove `%LOCALAPPDATA%\RLCareerPlus` and `%APPDATA%\bakkesmod\bakkesmod\plugins\rlcareerplus.dll` / `rlcareer_crowd.dll`.

---

## Transparency & Security Notes

- **Why Administrator elevation (`app.manifest`)?** Many Epic Games Launcher / BakkesMod setups run elevated; requesting elevation prevents Windows `Access Denied` errors when Career Hub closes Epic's initial Rocket League process or loads BakkesMod plugins.
- **What do the BakkesMod plugins do?**
  - **`rlcareerplus.dll`** ([src/rlcareerplus.cpp](./src/rlcareerplus.cpp)): Offline-only (`!IsInOnlineGame()`). Reads `%APPDATA%\bakkesmod\bakkesmod\data\rlcareermode\career_name.txt`, calls `PriWrapper::eventSetPlayerName()`, and sets `ABOVE_NORMAL_PRIORITY_CLASS` on `RocketLeague.exe`.
  - **`rlcareer_crowd.dll`** ([src/rlcareer_crowd.cpp](./src/rlcareer_crowd.cpp)): Offline-only (`!IsInOnlineGame()`). Hooks Rocket League goal, save, epic save, kickoff, and match-end events using official BakkesMod SDK wrappers (`pluginsdk.lib`, zero memory offsets) and writes JSON event pings to `%APPDATA%\bakkesmod\bakkesmod\data\rlcareermode\crowd_event.json` so the Hub plays LAN crowd audio.

---

## Build From Source

Requirements: Windows 10/11 x64, Node.js, Visual Studio 2022 Build Tools (C++ x64), BakkesMod SDK (`%APPDATA%\bakkesmod\bakkesmod\bakkesmodsdk`), and `.NET Framework 4.x` (`csc.exe`, built into Windows). Place `intro.webm` (from the Release assets, or your own `.webm`) in the repo folder, then run:

```powershell
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

This compiles `rlcareerplus.dll` and `rlcareer_crowd.dll`, validates all JS modules, runs `test_addon.js` + `test_staff.js`, and outputs `RL Career Hub - Career+.exe`.

---

Tested on **RL Career Hub `0.2.0-beta.33`**.
