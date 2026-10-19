import React from 'react';
import { Play, Shield, Star, Heart, Volume2, Settings, Sparkles, HelpCircle } from 'lucide-react';
import { GameSettings, DifficultyMode } from '../types/game';
import { seniorAudio } from '../sound/audioManager';

interface TitleScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onStartFlight: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  settings,
  onUpdateSettings,
  onStartFlight,
  onOpenSettings,
  onOpenReport
}) => {
  const handleSelectDifficulty = (mode: DifficultyMode) => {
    let bulletScale = 0.55;
    if (mode === 'comfortable') bulletScale = 0.75;
    if (mode === 'active') bulletScale = 1.0;

    onUpdateSettings({
      ...settings,
      difficulty: mode,
      bulletSpeedScale: bulletScale
    });

    seniorAudio.playStarChime();
    const modeName = mode === 'healing' ? '안심 힐링 모드' : mode === 'comfortable' ? '편안한 비행 모드' : '활력 비행 모드';
    seniorAudio.speakEncouragement(`${modeName}가 선택되었습니다.`);
  };

  const handleStart = () => {
    seniorAudio.startPropeller();
    seniorAudio.playVictoryFanfare();
    seniorAudio.speakEncouragement('항공모함에서 은빛 비행기가 힘차게 출격합니다!');
    onStartFlight();
  };

  return (
    <div className="relative w-full h-full min-h-[750px] flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-slate-950 via-sky-950 to-slate-950 overflow-y-auto select-none">
      {/* Background Decorative Carrier Runway & Clouds */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        <div className="w-48 h-full mx-auto border-x-4 border-dashed border-amber-400/50" />
      </div>

      {/* Top Bar with Brand & Settings */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-extrabold text-lg sm:text-xl tracking-wider">
            1942 은빛 비행대
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-xs text-sky-300 font-semibold">시니어 인지케어 에디션</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>오늘의 비행 일지</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="환경 설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Title Hero Area */}
      <div className="w-full max-w-xl text-center space-y-4 my-auto py-6 z-10">
        {/* Animated P-38 Fighter Silhouette Badge */}
        <div className="relative inline-flex flex-col items-center justify-center mb-2">
          <div className="w-24 h-24 bg-sky-900/40 border-2 border-sky-400/50 rounded-3xl flex items-center justify-center shadow-2xl relative group">
            {/* SVG P-38 Fighter Icon */}
            <svg
              className="w-16 h-16 text-sky-300 drop-shadow-md animate-pulse"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
            >
              {/* Twin tail booms */}
              <rect x="18" y="14" width="6" height="38" rx="2" fill="#38BDF8" opacity="0.9" />
              <rect x="40" y="14" width="6" height="38" rx="2" fill="#38BDF8" opacity="0.9" />
              {/* Main wing */}
              <path d="M4 30 L60 30 L54 36 L10 36 Z" fill="#7DD3FC" />
              {/* Horizontal tail */}
              <rect x="18" y="48" width="28" height="4" fill="#38BDF8" />
              {/* Fuselage pod */}
              <ellipse cx="32" cy="30" rx="5" ry="16" fill="#0284C7" />
              <circle cx="32" cy="24" r="3" fill="#E0F2FE" />
              {/* Propeller tips */}
              <circle cx="21" cy="14" r="2.5" fill="#FACC15" />
              <circle cx="43" cy="14" r="2.5" fill="#FACC15" />
            </svg>
          </div>
          <span className="mt-2 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-0.5 rounded-full">
            추억의 P-38 라이트닝 탑승
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          청춘의 하늘을 날다<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
            1942 은빛 비행대
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
          손가락 소근육과 시각-공간 주의 집중력을 길러주는<br />
          어르신 맞춤형 안심 레트로 비행 게임입니다.
        </p>

        {/* 3 Difficulty Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
          {[
            {
              id: 'healing',
              title: '1. 안심 힐링',
              speed: '가장 여유로운 속도',
              desc: '치매 초기 및 어르신 추천, 탄속이 매우 느립니다'
            },
            {
              id: 'comfortable',
              title: '2. 편안한 비행',
              speed: '기분 좋은 보통 속도',
              desc: '부드러운 손-눈 협응과 경쾌한 리듬'
            },
            {
              id: 'active',
              title: '3. 활력 도전',
              speed: '생생한 속도감',
              desc: '빠른 반응과 높은 주의 집중력 훈련'
            }
          ].map((mode) => {
            const isSelected = settings.difficulty === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleSelectDifficulty(mode.id as DifficultyMode)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/80 border-amber-400 text-white ring-2 ring-amber-400/30 shadow-lg'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="font-extrabold text-sm sm:text-base text-amber-300">
                  {mode.title}
                </div>
                <div className="text-xs font-semibold text-sky-200 mt-0.5">
                  {mode.speed}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Senior Care Assurances */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Shield className="w-4 h-4" />
            <span>실패 없는 안심 보호 시스템</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>자동 발사로 손목 피로 제로</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-300">
            <Heart className="w-4 h-4 fill-rose-400" />
            <span>따뜻한 한국어 칭찬 음성</span>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-3">
          <button
            onClick={handleStart}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black text-xl sm:text-2xl rounded-2xl shadow-2xl transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer ring-4 ring-amber-500/20"
          >
            <Play className="w-7 h-7 fill-slate-950" />
            <span>은빛 날개 출격하기</span>
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="w-full max-w-xl text-center text-xs text-slate-500 z-10 flex items-center justify-center gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400" />
        <span>마우스나 손가락을 화면에 대고 움직이면 비행기가 부드럽게 따라옵니다.</span>
      </div>
    </div>
  );
};
