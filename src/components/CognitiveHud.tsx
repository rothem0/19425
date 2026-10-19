import React from 'react';
import { Heart, Star, Shield, RotateCw, Pause, Play, Volume2, VolumeX, Settings } from 'lucide-react';
import { FlightSessionStats, GameSettings } from '../types/game';

interface CognitiveHudProps {
  hp: number;
  maxHp: number;
  loopRollsLeft: number;
  stats: FlightSessionStats;
  settings: GameSettings;
  isPaused: boolean;
  onTogglePause: () => void;
  onExecuteLoop: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const CognitiveHud: React.FC<CognitiveHudProps> = ({
  hp,
  maxHp,
  loopRollsLeft,
  stats,
  settings,
  isPaused,
  onTogglePause,
  onExecuteLoop,
  onOpenSettings,
  onToggleSound
}) => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 select-none shadow-md z-20">
      {/* Left: Health & Pilot Condition */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
          <span className="text-xs text-slate-400 font-semibold mr-1">비행 체력</span>
          {Array.from({ length: maxHp }).map((_, i) => (
            <Heart
              key={i}
              className={`w-6 h-6 transition-all duration-300 ${
                i < hp
                  ? 'text-rose-500 fill-rose-500 scale-100'
                  : 'text-slate-600 fill-slate-700/40 scale-90'
              }`}
            />
          ))}
          {settings.careModeInvincible && (
            <span className="ml-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              안심 보호
            </span>
          )}
        </div>
      </div>

      {/* Center: Memory Stars & Score */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/30 px-3.5 py-1.5 rounded-xl">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] text-amber-300/80 font-medium leading-none">기억의 별</span>
            <span className="text-lg font-bold text-amber-200 tabular-nums leading-tight">
              {stats.starsCollected}개
            </span>
          </div>
        </div>

        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[11px] text-slate-400 font-medium">비행 점수</span>
          <span className="text-xl font-extrabold text-white tabular-nums tracking-wide">
            {stats.totalScore.toLocaleString()}점
          </span>
        </div>
      </div>

      {/* Right: Loop Roll Trigger Button & Settings / Controls */}
      <div className="flex items-center gap-2">
        {/* Big Loop-the-loop Button for Quick Evasion */}
        <button
          onClick={onExecuteLoop}
          disabled={loopRollsLeft <= 0}
          title="공중제비 360도 회전 회피"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
            loopRollsLeft > 0
              ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer ring-2 ring-sky-400/40'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <RotateCw className="w-5 h-5 animate-spin-slow" />
          <span>공중제비 ({loopRollsLeft}회)</span>
        </button>

        {/* Pause Button */}
        <button
          onClick={onTogglePause}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title={isPaused ? '계속하기' : '잠시 멈춤'}
        >
          {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title={settings.sfxEnabled ? '소리 끄기' : '소리 켜기'}
        >
          {settings.sfxEnabled ? (
            <Volume2 className="w-5 h-5 text-amber-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="보호자 및 게임 설정"
        >
          <Settings className="w-5 h-5 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
