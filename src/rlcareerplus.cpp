#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include "bakkesmod/plugin/bakkesmodplugin.h"
#include "bakkesmod/wrappers/GameEvent/ServerWrapper.h"
#include "bakkesmod/wrappers/GameObject/PriWrapper.h"
#include "bakkesmod/wrappers/PlayerControllerWrapper.h"
#include <fstream>
#include <memory>
#include <string>

class RLCareerPlusPlugin : public BakkesMod::Plugin::BakkesModPlugin {
  bool applying = false;
  std::string cachedName;
  std::shared_ptr<bool> alive = std::make_shared<bool>(true);

  void refreshCareerName() {
    cachedName.clear();
    if (!gameWrapper) return;
    auto p = gameWrapper->GetDataFolder() / "rlcareermode" / "career_name.txt";
    std::ifstream in(p, std::ios::in | std::ios::binary);
    if (!in.is_open()) return;
    std::string line;
    std::getline(in, line);
    while (!line.empty() && (line.back() == '\r' || line.back() == '\n' || line.back() == ' ' || line.back() == '\t'))
      line.pop_back();
    size_t start = 0;
    while (start < line.size() && (line[start] == ' ' || line[start] == '\t')) start++;
    if (start > 0) line.erase(0, start);
    if (line.size() > 32) line.resize(32);
    cachedName = std::move(line);
  }

  void applyName(const char* why, bool reloadFile = false) {
    if (applying || !gameWrapper) return;
    if (gameWrapper->IsInOnlineGame()) return;
    if (reloadFile) refreshCareerName();
    if (cachedName.empty()) return;

    PriWrapper pri(0);
    auto pc = gameWrapper->GetPlayerController();
    if (pc) pri = pc.GetPRI();
    if (!pri) {
      auto srv = gameWrapper->GetCurrentGameState();
      if (srv) {
        auto pris = srv.GetPRIs();
        for (int i = 0; i < pris.Count(); ++i) {
          auto p = pris.Get(i);
          if (p && p.IsLocalPlayerPRI()) {
            pri = p;
            break;
          }
        }
      }
    }
    if (!pri) return;

    if (pri.GetPlayerName().ToString() == cachedName) return;

    applying = true;
    pri.eventSetPlayerName(cachedName);
    applying = false;
    if (cvarManager) {
      cvarManager->log(std::string("RL Career+: set local player name to '") + cachedName + "' (" + why + ")");
    }
  }

  void scheduleApply(const char* why, float delay = 0.05f, bool reloadFile = false) {
    if (!gameWrapper) return;
    auto guard = alive;
    std::string tag(why);
    gameWrapper->SetTimeout([this, guard, tag, reloadFile](GameWrapper*) {
      if (*guard) applyName(tag.c_str(), reloadFile);
    }, delay);
  }

public:
  void onLoad() override {
    *alive = true;
    // Keep Rocket League's render/physics threads ahead of background Electron & OS tasks without throttling bots
    SetPriorityClass(GetCurrentProcess(), ABOVE_NORMAL_PRIORITY_CLASS);
    refreshCareerName();
    if (cvarManager) cvarManager->log("RL Career+: name sync & frame-pacing priority active");
    auto hook = [this](const char* fn, const char* tag, bool reload) {
      gameWrapper->HookEventPost(fn, [this, tag, reload](std::string) { scheduleApply(tag, 0.05f, reload); });
    };
    hook("Function TAGame.GameEvent_Soccar_TA.OnAllTeamsCreated", "teams", true);
    hook("Function TAGame.GameEvent_Soccar_TA.EventMatchCountdownBegin", "countdown", true);
    hook("Function TAGame.GFxHUD_TA.OpenScoreboard", "scoreboard", false);
    hook("Function TAGame.GFxData_PRI_TA.HandlePlayerNameChanged", "pri-name", false);
    hook("Function TAGame.GFxData_PRI_TA.HandleTitleChanged", "pri-title", false);
    hook("Function Engine.PlayerReplicationInfo.SetPlayerName", "set-name", false);
    hook("Function TAGame.PRI_TA.EventTeamChanged", "team-chg", false);
    applyName("onload", false);
    scheduleApply("onload-400ms", 0.4f, false);
    scheduleApply("onload-1500ms", 1.5f, false);
  }

  void onUnload() override {
    *alive = false;
  }
};

BAKKESMOD_PLUGIN(RLCareerPlusPlugin, "RL Career+ Name Sync & Boost", "1.1.0", PLUGINTYPE_FREEPLAY)
