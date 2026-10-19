import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, Crosshair } from 'lucide-react';

interface OnScreenControlsProps {
  onDirectionPress: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onExecuteLoop: () => void;
  loopRollsLeft: number;
  autoFire: boolean;
  onToggleAutoFire: () => void;
  visible: boolean;
}

export const OnScreenControls: React.FC<OnScreenControlsProps> = ({
  onDirectionPress,
  onExecuteLoop,
  loopRollsLeft,
  autoFire,
  onToggleAutoFire,
  visible
}) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-4 inset-x-0 px-6 flex items-end justify-between pointer-events-none select-none z-20">
      {/* Direction Pad (Left Hand) */}
      <div className="bg-slate-900/85 backdrop-blur-md p-3 rounded-3xl border border-slate-700/80 shadow-2xl pointer-events-auto grid grid-cols-3 gap-2 w-48 h-48">
        <div />
        <button
          onPointerDown={() => onDirectionPress('up')}
          className="bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-100 rounded-2xl flex items-center justify-center shadow transition-all border border-slate-600"
          title="위로 이동"
        >
          <ArrowUp className="w-8 h-8" />
        </button>
        <div />

        <button
          onPointerDown={() => onDirectionPress('left')}
          className="bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-100 rounded-2xl flex items-center justify-center shadow transition-all border border-slate-600"
          title="왼쪽으로 이동"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>
        <div className="flex items-center justify-center">
          <span className="text-xs text-slate-400 font-bold">조종</span>
        </div>
        <button
          onPointerDown={() => onDirectionPress('right')}
          className="bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-100 rounded-2xl flex items-center justify-center shadow transition-all border border-slate-600"
          title="오른쪽으로 이동"
        >
          <ArrowRight className="w-8 h-8" />
        </button>

        <div />
        <button
          onPointerDown={() => onDirectionPress('down')}
          className="bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-100 rounded-2xl flex items-center justify-center shadow transition-all border border-slate-600"
          title="아래로 이동"
        >
          <ArrowDown className="w-8 h-8" />
        </button>
        <div />
      </div>

      {/* Action Buttons (Right Hand) */}
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Loop Action */}
        <button
          onClick={onExecuteLoop}
          disabled={loopRollsLeft <= 0}
          className={`w-28 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold shadow-2xl border transition-all active:scale-95 ${
            loopRollsLeft > 0
              ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400 ring-2 ring-sky-300/40'
              : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60'
          }`}
        >
          <RotateCw className="w-7 h-7" />
          <span className="text-xs">공중제비 ({loopRollsLeft})</span>
        </button>

        {/* Auto Fire Toggle */}
        <button
          onClick={onToggleAutoFire}
          className={`w-28 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg border transition-all ${
            autoFire
              ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
          }`}
        >
          <Crosshair className="w-5 h-5 text-emerald-300" />
          <span>{autoFire ? '자동 발사 켜짐' : '수동 발사'}</span>
        </button>
      </div>
    </div>
  );
};
