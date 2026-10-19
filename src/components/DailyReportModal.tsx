import React from 'react';
import { Award, Clock, Star, Target, Zap, RotateCcw, Check, Sparkles } from 'lucide-react';
import { FlightSessionStats } from '../types/game';

interface DailyReportModalProps {
  stats: FlightSessionStats;
  onRestart: () => void;
  onClose: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  stats,
  onRestart,
  onClose
}) => {
  const minutes = Math.floor(stats.flightTimeSeconds / 60);
  const seconds = stats.flightTimeSeconds % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes}분 ` : ''}${seconds}초`;

  // Cognitive assessment tier based on effort and play time
  const isExcellent = stats.starsCollected >= 5 || stats.flightTimeSeconds >= 45;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-6">
        {/* Certificate Golden Medallion */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 rounded-3xl flex items-center justify-center shadow-lg border-2 border-amber-300 relative">
            <Award className="w-12 h-12 text-slate-950" />
            <div className="absolute -bottom-2 px-3 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full border border-rose-300 shadow">
              참 잘했어요!
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 tracking-tight">
            청춘 은빛 조종사 비행 일지
          </h2>
          <p className="text-amber-400 font-bold text-sm mt-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>오늘의 두뇌 인지 활성화 훈련 완료</span>
          </p>
        </div>

        {/* 4-Metric Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {/* 1. Time */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>집중 비행 시간</span>
            </div>
            <div className="text-xl font-bold text-white tabular-nums">{timeFormatted}</div>
            <div className="text-[11px] text-sky-300 mt-0.5">뇌 혈류 활성화</div>
          </div>

          {/* 2. Stars */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Star className="w-4 h-4 text-amber-400" />
              <span>기억의 별 수집</span>
            </div>
            <div className="text-xl font-bold text-amber-300 tabular-nums">
              {stats.starsCollected}개
            </div>
            <div className="text-[11px] text-amber-400/90 mt-0.5">기억력 자극 우수</div>
          </div>

          {/* 3. Targets */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>표적 명중 격추</span>
            </div>
            <div className="text-xl font-bold text-emerald-300 tabular-nums">
              {stats.targetsDefeated}대
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-0.5">시각-공간 주의력</div>
          </div>

          {/* 4. Coordination Reactions */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>손-눈 협응 반응</span>
            </div>
            <div className="text-xl font-bold text-purple-300 tabular-nums">
              {stats.reactionClicks + stats.targetsDefeated}회
            </div>
            <div className="text-[11px] text-purple-400/90 mt-0.5">손가락 소근육 운동</div>
          </div>
        </div>

        {/* Doctor / Caregiver Feedback Banner */}
        <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-left space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>시니어 인지 활력 평가</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {isExcellent
              ? '오늘 어르신의 주의 집중력과 반응 속도가 아주 훌륭했습니다! 양손과 시각을 고루 사용하여 뇌 인지 기능을 기분 좋게 자극하였습니다.'
              : '편안한 호흡으로 비행을 잘 마치셨습니다. 꾸준한 1942 비행 운동은 치매 예방과 기억 회상에 큰 도움이 됩니다.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-slate-950" />
            <span>새로운 비행 시작하기</span>
          </button>
          <button
            onClick={onClose}
            className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base rounded-2xl border border-slate-700 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
