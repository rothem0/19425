/**
 * 1942 Senior Cognitive Care Game - Main Application
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { CognitiveHud } from './components/CognitiveHud';
import { OnScreenControls } from './components/OnScreenControls';
import { MemoryBonusModal } from './components/MemoryBonusModal';
import { CaregiverSettingsModal } from './components/CaregiverSettingsModal';
import { DailyReportModal } from './components/DailyReportModal';
import { TitleScreen } from './components/TitleScreen';
import { GameState, GameSettings, FlightSessionStats } from './types/game';
import { seniorAudio } from './sound/audioManager';
import { Award, Star, ArrowRight, RotateCcw } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);

  // Cognitive Objective Prompts that rotate
  const objectives = [
    '빨간색 편대기를 먼저 조준해 보세요! (색깔 분별 훈련)',
    '황금 기억의 별을 모아보세요! (주의 집중력 훈련)',
    '위험할 땐 [공중제비]로 안전하게 회피하세요! (순발력 훈련)',
    '보급 비행기의 초록 십자 하트를 획득하세요! (체력 회복)'
  ];
  const [objectiveIndex, setObjectiveIndex] = useState<number>(0);

  // Player in-flight stats
  const [playerHp, setPlayerHp] = useState<number>(5);
  const [loopRollsLeft, setLoopRollsLeft] = useState<number>(3);

  // Default Care Settings tailored for dementia & senior accessibility
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'healing',       // 안심 힐링 (가장 느리고 편안함)
    controlMode: 'follow',       // 마우스/손가락 따라오기
    autoFire: true,              // 손목 관절 피로 방지 자동 발사 기본 활성화
    careModeInvincible: false,   // 무적 쉴드 (기본은 5하트 + 0하트 시 긴급 구조)
    voiceCheerEnabled: true,     // 따뜻한 한국어 TTS 칭찬
    soundVolume: 0.7,
    sfxEnabled: true,
    bulletSpeedScale: 0.55,      // 느린 탄속으로 시니어 눈의 피로 최소화
    highContrastHud: true
  });

  // Today's Flight Session Stats for Senior Log
  const [stats, setStats] = useState<FlightSessionStats>({
    flightTimeSeconds: 0,
    targetsDefeated: 0,
    redSquadronDefeated: 0,
    starsCollected: 0,
    heartsCollected: 0,
    loopEvadesUsed: 0,
    memoryQuizCorrect: 0,
    totalScore: 0,
    praiseCount: 0,
    reactionClicks: 0
  });

  // Cycle objectives periodically during flight to keep seniors mentally focused
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;
    const interval = setInterval(() => {
      setObjectiveIndex((prev) => (prev + 1) % objectives.length);
    }, 18000);
    return () => clearInterval(interval);
  }, [gameState, isPaused, objectives.length]);

  // Audio start & stop based on game state
  useEffect(() => {
    if (gameState === 'PLAYING' && !isPaused) {
      seniorAudio.startPropeller();
    } else {
      seniorAudio.stopPropeller();
    }
  }, [gameState, isPaused]);

  // Handlers
  const handleStartFlight = () => {
    setPlayerHp(5);
    setLoopRollsLeft(3);
    setIsPaused(false);
    setGameState('PLAYING');
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleToggleSound = () => {
    const updated = !settings.sfxEnabled;
    seniorAudio.setMuted(!updated);
    setSettings((prev) => ({
      ...prev,
      sfxEnabled: updated
    }));
  };

  const handleTriggerMemoryBreak = () => {
    setIsPaused(true);
    setGameState('MEMORY_BREAK');
  };

  const handleMemoryComplete = (bonusStars: number) => {
    setStats((prev) => ({
      ...prev,
      starsCollected: prev.starsCollected + bonusStars,
      totalScore: prev.totalScore + bonusStars * 100,
      memoryQuizCorrect: prev.memoryQuizCorrect + 1
    }));
    setIsPaused(false);
    setGameState('PLAYING');
  };

  const handleStageClear = () => {
    setGameState('STAGE_CLEAR');
    seniorAudio.speakEncouragement('축하드립니다! 항공모함 착함에 성공하셨습니다!');
  };

  const handleNextStage = () => {
    setCurrentStage((prev) => prev + 1);
    setPlayerHp(5);
    setLoopRollsLeft(3);
    setGameState('PLAYING');
    seniorAudio.playVictoryFanfare();
    seniorAudio.speakEncouragement(`제 ${currentStage + 1}구역으로 힘차게 진격합니다!`);
  };

  const handlePlayerRestGameOver = () => {
    // If rest requested, show summary or keep playing safely
    setPlayerHp(3);
  };

  const handleRestartSession = () => {
    setShowReport(false);
    setStats({
      flightTimeSeconds: 0,
      targetsDefeated: 0,
      redSquadronDefeated: 0,
      starsCollected: 0,
      heartsCollected: 0,
      loopEvadesUsed: 0,
      memoryQuizCorrect: 0,
      totalScore: 0,
      praiseCount: 0,
      reactionClicks: 0
    });
    setGameState('TITLE');
  };

  // Keyboard navigation for directional button simulation
  const handleDirectionPress = (dir: 'up' | 'down' | 'left' | 'right') => {
    const codeMap: Record<string, string> = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight'
    };
    const code = codeMap[dir];
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code }));
    }, 120);
  };

  const handleExecuteLoop = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  };

  return (
    <div className="w-full h-screen max-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top HUD (Always visible during flight) */}
      {gameState === 'PLAYING' && (
        <CognitiveHud
          hp={playerHp}
          maxHp={5}
          loopRollsLeft={loopRollsLeft}
          stats={stats}
          settings={settings}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onExecuteLoop={handleExecuteLoop}
          onOpenSettings={() => setShowSettings(true)}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Main View Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {gameState === 'TITLE' ? (
          <TitleScreen
            settings={settings}
            onUpdateSettings={setSettings}
            onStartFlight={handleStartFlight}
            onOpenSettings={() => setShowSettings(true)}
            onOpenReport={() => setShowReport(true)}
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <GameCanvas
              gameState={isPaused ? 'COUNTDOWN' : gameState}
              settings={settings}
              stats={stats}
              onUpdateStats={setStats}
              onTriggerMemoryBreak={handleTriggerMemoryBreak}
              onStageClear={handleStageClear}
              onPlayerRestGameOver={handlePlayerRestGameOver}
              onLoopUsed={(remaining) => setLoopRollsLeft(remaining)}
              currentObjective={objectives[objectiveIndex]}
            />

            {/* Optional On-Screen Direction Pad for Tablets & Touch Monitors */}
            {gameState === 'PLAYING' && settings.controlMode === 'buttons' && (
              <OnScreenControls
                visible={true}
                onDirectionPress={handleDirectionPress}
                onExecuteLoop={handleExecuteLoop}
                loopRollsLeft={loopRollsLeft}
                autoFire={settings.autoFire}
                onToggleAutoFire={() =>
                  setSettings((prev) => ({ ...prev, autoFire: !prev.autoFire }))
                }
              />
            )}

            {/* Pause Overlay */}
            {isPaused && gameState === 'PLAYING' && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white">잠시 쉬어가기</h3>
                  <p className="text-sm text-slate-300">
                    눈과 손목의 긴장을 풀고 편안하게 호흡하세요.
                  </p>
                  <button
                    onClick={handleTogglePause}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-lg transition-all cursor-pointer"
                  >
                    비행 계속하기
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      setGameState('TITLE');
                    }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    처음 화면으로 나가기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Memory Break Cognitive Minigame Modal */}
      {gameState === 'MEMORY_BREAK' && (
        <MemoryBonusModal onComplete={handleMemoryComplete} />
      )}

      {/* Stage Clear Victory Celebration Modal */}
      {gameState === 'STAGE_CLEAR' && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-200 rounded-3xl flex items-center justify-center shadow-lg border-2 border-emerald-300">
              <Award className="w-12 h-12 text-slate-950" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                착함 성공! 제 {currentStage}구역 완주
              </h2>
              <p className="text-emerald-400 font-bold text-sm">
                항공모함에 안전하게 귀환하셨습니다!
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-around">
              <div>
                <div className="text-xs text-slate-400 font-medium">수집한 별</div>
                <div className="text-xl font-bold text-amber-300 tabular-nums">
                  {stats.starsCollected}개
                </div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div>
                <div className="text-xs text-slate-400 font-medium">비행 점수</div>
                <div className="text-xl font-bold text-white tabular-nums">
                  {stats.totalScore.toLocaleString()}점
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleNextStage}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>다음 구역으로 힘차게 출격!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setGameState('TITLE');
                  setShowReport(true);
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                오늘의 비행 일지 확인하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Caregiver Settings Modal */}
      {showSettings && (
        <CaregiverSettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Senior Daily Report / Flight Log Modal */}
      {showReport && (
        <DailyReportModal
          stats={stats}
          onRestart={handleRestartSession}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
