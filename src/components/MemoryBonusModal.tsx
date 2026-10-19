import React, { useState } from 'react';
import { Star, Sparkles, CheckCircle2, Award } from 'lucide-react';
import { seniorAudio } from '../sound/audioManager';

interface MemoryBonusModalProps {
  onComplete: (bonusStars: number) => void;
}

interface QuizOption {
  id: string;
  label: string;
  icon: string;
  isRecommendedAnswer?: boolean;
}

export const MemoryBonusModal: React.FC<MemoryBonusModalProps> = ({ onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  // Dementia-friendly cognitive question: simple, pleasant, visual
  const quiz = {
    question: '잠시 쉬어가는 두뇌 퀴즈! 하늘에서 만난 보너스 비행기의 색깔은 무엇이었을까요?',
    hint: '힌트: 따뜻하고 선명한 붉은빛 편대 비행기였습니다.',
    options: [
      { id: 'red', label: '빨간색 비행기', icon: '🔴', isRecommendedAnswer: true },
      { id: 'blue', label: '파란색 비행기', icon: '🔵', isRecommendedAnswer: false },
      { id: 'green', label: '초록색 비행기', icon: '🟢', isRecommendedAnswer: false },
    ] as QuizOption[]
  };

  const handleSelect = (option: QuizOption) => {
    if (isAnswered) return;
    setSelectedOption(option.id);
    setIsAnswered(true);

    seniorAudio.playStarChime();
    seniorAudio.speakEncouragement('정답입니다! 두뇌 기억력이 쑥쑥 자라납니다!');
  };

  const handleContinue = () => {
    onComplete(5); // Award 5 memory stars
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-6">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-950/60 border border-amber-500/40 rounded-full text-amber-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>두뇌 비타민 · 기억력 충전 시간</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          {quiz.question}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base font-medium">
          {quiz.hint}
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3.5 my-4">
          {quiz.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.isRecommendedAnswer;

            let btnStyle = 'bg-slate-800 border-slate-700 text-slate-100 hover:border-amber-400 hover:bg-slate-750';
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-900/60 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/50';
              } else if (isSelected) {
                btnStyle = 'bg-amber-900/40 border-amber-500 text-amber-200';
              } else {
                btnStyle = 'bg-slate-850 border-slate-800 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
                className={`py-4 px-6 rounded-2xl border-2 text-lg font-bold flex items-center justify-between transition-all active:scale-98 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Encouraging Feedback & Continue Button */}
        {isAnswered && (
          <div className="space-y-4 pt-2 animate-fadeIn">
            <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-emerald-200 flex items-center justify-center gap-3">
              <Award className="w-8 h-8 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="font-extrabold text-lg text-emerald-300">
                  훌륭하십니다! 기억의 별 +5개 획득!
                </p>
                <p className="text-xs text-emerald-200/80">
                  사물을 인지하고 회상하는 뇌 활동이 활발하게 일어났습니다.
                </p>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xl rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Star className="w-6 h-6 fill-slate-950" />
              <span>신나게 비행 계속하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
