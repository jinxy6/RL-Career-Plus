#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include "bakkesmod/plugin/bakkesmodplugin.h"
#include "bakkesmod/wrappers/GameEvent/ServerWrapper.h"
#include "bakkesmod/wrappers/GameObject/TeamWrapper.h"
#include "bakkesmod/wrappers/GameObject/PriWrapper.h"
#include "bakkesmod/wrappers/GameObject/Stats/StatEventWrapper.h"
#include <chrono>
#include <fstream>
#include <sstream>
#include <string>

struct StatTickerParams {
  uintptr_t Receiver;
  uintptr_t Victim;
  uintptr_t StatEvent;
};

class RLCareerCrowdPlugin : public BakkesMod::Plugin::BakkesModPlugin {
  unsigned long long seq = 0;
  unsigned long long lastGoalMs = 0;
  unsigned long long lastSaveMs = 0;
  unsigned long long lastKickoffMs = 0;
  unsigned long long lastMatchEndMs = 0;
  bool gameStartedOnce = false;

  static unsigned long long nowMs() {
    return (unsigned long long)std::chrono::duration_cast<std::chrono::milliseconds>(
      std::chrono::system_clock::now().time_since_epoch()).count();
  }

  void emitEvent(const char* type, int extraFlags = 0) {
    if (!gameWrapper) return;
    if (gameWrapper->IsInOnlineGame()) return;

    int blueScore = 0;
    int orangeScore = 0;
    int clockSec = 300;
    bool overtime = false;
    int scoredOn = -1;

    auto srv = gameWrapper->GetCurrentGameState();
    if (srv) {
      overtime = srv.GetbOverTime() != 0;
      clockSec = srv.GetSecondsRemaining();
      scoredOn = (int)srv.GetReplicatedScoredOnTeam();
      auto teams = srv.GetTeams();
      for (int i = 0; i < teams.Count(); ++i) {
        auto t = teams.Get(i);
        if (!t) continue;
        int idx = t.GetTeamNum();
        if (idx == 0) blueScore = t.GetScore();
        else if (idx == 1) orangeScore = t.GetScore();
      }
    }

    auto dir = gameWrapper->GetDataFolder() / "rlcareermode";
    CreateDirectoryW(dir.wstring().c_str(), nullptr);
    auto tmpPath = dir / "crowd_event.tmp";
    auto dstPath = dir / "crowd_event.json";

    ++seq;
    unsigned long long ts = nowMs();
    std::ostringstream oss;
    oss << "{"
        << "\"seq\":" << seq << ","
        << "\"type\":\"" << type << "\","
        << "\"overtime\":" << (overtime ? "true" : "false") << ","
        << "\"clock\":" << clockSec << ","
        << "\"blueScore\":" << blueScore << ","
        << "\"orangeScore\":" << orangeScore << ","
        << "\"scoredOnTeam\":" << scoredOn << ","
        << "\"firstKickoff\":" << (extraFlags == 1 ? "true" : "false") << ","
        << "\"ts\":" << ts
        << "}";

    std::ofstream out(tmpPath, std::ios::out | std::ios::binary | std::ios::trunc);
    if (!out.is_open()) return;
    auto body = oss.str();
    out.write(body.data(), (std::streamsize)body.size());
    out.close();
    MoveFileExW(tmpPath.wstring().c_str(), dstPath.wstring().c_str(), MOVEFILE_REPLACE_EXISTING);
  }

  void onGoal() {
    if (!gameWrapper || gameWrapper->IsInOnlineGame()) return;
    unsigned long long t = nowMs();
    if (t - lastGoalMs < 1600) return;
    lastGoalMs = t;
    emitEvent("goal");
  }

  void onStatTicker(void* params) {
    if (!params || !gameWrapper || gameWrapper->IsInOnlineGame()) return;
    auto* p = reinterpret_cast<StatTickerParams*>(params);
    if (!p->StatEvent) return;
    StatEventWrapper statEvent(p->StatEvent);
    if (!statEvent) return;
    std::string evName = statEvent.GetEventName();
    unsigned long long t = nowMs();
    if (evName == "EpicSave") {
      if (t - lastSaveMs < 1200) return;
      lastSaveMs = t;
      emitEvent("epic_save");
    } else if (evName == "Save") {
      if (t - lastSaveMs < 1500) return;
      lastSaveMs = t;
      emitEvent("save");
    } else if (evName == "Goal") {
      onGoal();
    }
  }

public:
  void onLoad() override {
    if (cvarManager) cvarManager->log("RL Career Crowd Pops: loaded (goals, saves, epic saves & LAN kickoff walkout)");

    gameWrapper->HookEventPost("Function TAGame.GameEvent_Soccar_TA.InitGame", [this](std::string) {
      gameStartedOnce = false;
    });

    gameWrapper->HookEventPost("Function TAGame.GameEvent_Soccar_TA.EventMatchCountdownBegin", [this](std::string) {
      if (!gameWrapper || gameWrapper->IsInOnlineGame()) return;
      unsigned long long t = nowMs();
      if (t - lastKickoffMs < 4000) return;
      lastKickoffMs = t;
      bool first = !gameStartedOnce;
      gameStartedOnce = true;
      if (first) emitEvent("kickoff", 1);
    });

    gameWrapper->HookEventPost("Function TAGame.Ball_TA.OnHitGoal", [this](std::string) {
      onGoal();
    });

    gameWrapper->HookEventPost("Function TAGame.GameEvent_Soccar_TA.EventGoalScored", [this](std::string) {
      onGoal();
    });

    gameWrapper->HookEventWithCallerPost<ActorWrapper>(
      "Function TAGame.GFxHUD_TA.HandleStatTickerMessage",
      [this](ActorWrapper, void* params, std::string) {
        onStatTicker(params);
      }
    );

    gameWrapper->HookEventPost("Function TAGame.GameEvent_Soccar_TA.EventMatchEnded", [this](std::string) {
      if (!gameWrapper || gameWrapper->IsInOnlineGame()) return;
      unsigned long long t = nowMs();
      if (t - lastMatchEndMs < 4000) return;
      lastMatchEndMs = t;
      gameStartedOnce = false;
      emitEvent("match_end");
    });
  }

  void onUnload() override {}
};

BAKKESMOD_PLUGIN(RLCareerCrowdPlugin, "RL Career LAN Crowd Pops", "1.0.0", PLUGINTYPE_FREEPLAY)
