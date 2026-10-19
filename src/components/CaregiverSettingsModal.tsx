import React from 'react';
import { X, Shield, Volume2, Mic, Crosshair, Gauge, MousePointer, Sliders } from 'lucide-react';
import { GameSettings, DifficultyMode, ControlMode } from '../types/game';
import { seniorAudio } from '../sound/audioManager';

interface CaregiverSettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const CaregiverSettingsModal: React.FC<CaregiverSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const handleDifficultyChange = (diff: DifficultyMode) => {
    let bulletScale = 0.55;
    if (diff === 'comfortable') bulletScale = 0.75;
    if (diff === 'active') bulletScale = 1.0;

    onUpdateSettings({
      ...settings,
      difficulty: diff,
      bulletSpeedScale: bulletScale
    });
  };

  const handleControlModeChange = (mode: ControlMode) => {
    onUpdateSettings({
      ...settings,
      controlMode: mode
    });
  };

  const handleToggleCareMode = () => {
    const updated = !settings.careModeInvincible;
    onUpdateSettings({
      ...settings,
      careModeInvincible: updated
    });
    if (updated) {
      seniorAudio.speakEncouragement('안심 보호 모드가 켜졌습니다. 편안하게 즐기세요!');
    }
  };

  const handleToggleVoiceCheer = () => {
    const updated = !settings.voiceCheerEnabled;
    seniorAudio.setSpeechEnabled(updated);
    onUpdateSettings({
      ...settings,
      voiceCheerEnabled: updated
    });
    if (updated) {
      seniorAudio.speakEncouragement('음성 칭찬 기능이 활성화되었습니다.');
    }
  };

  const handleToggleAutoFire = () => {
    onUpdateSettings({
      ...settings,
      autoFire: !settings.autoFire
    });
  };

  const handleVolumeChange = (vol: number) => {
    seniorAudio.setVolume(vol);
    onUpdateSettings({
      ...settings,
      soundVolume: vol,
      sfxEnabled: vol > 0
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-950/80 border border-sky-500/40 rounded-2xl">
              <Sliders className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                시니어 맞춤 비행 설정
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                어르신의 인지 상태와 손 움직임에 맞춰 난이도를 조절하세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Setting 1: Difficulty / Speed */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>비행 속도 및 난이도</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'healing', label: '안심 힐링', sub: '가장 느림 · 치매 안심' },
              { id: 'comfortable', label: '편안한 비행', sub: '보통 속도 · 안정적' },
              { id: 'active', label: '활력 비행', sub: '조금 빠름 · 인지 자극' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => handleDifficultyChange(d.id as DifficultyMode)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  settings.difficulty === d.id
                    ? 'bg-sky-950/70 border-sky-400 text-sky-200 ring-2 ring-sky-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-sm sm:text-base">{d.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Setting 2: Care Invincible Mode (Zero Stress) */}
        <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-base text-white">안심 보호 모드 (무적 쉴드)</div>
              <div className="text-xs text-slate-300 leading-relaxed">
                비행기가 적기와 부딪혀도 추락하지 않고 쉴드로 보호됩니다. 실패 스트레스 없이 성취감을 극대화합니다.
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleCareMode}
            className={`w-14 h-8 rounded-full transition-colors relative shrink-0 p-1 cursor-pointer ${
              settings.careModeInvincible ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                settings.careModeInvincible ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Setting 3: Control Mode */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-sky-400" />
            <span>조종 방법 선택</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'follow',
                label: '마우스 / 손가락 따라오기',
                desc: '손가락이나 마우스가 가는 곳으로 비행기가 따라옵니다 (가장 추천)'
              },
              {
                id: 'buttons',
                label: '화면 큰 방향 버튼',
                desc: '화면 왼쪽의 큰 상하좌우 버튼을 눌러 조종합니다'
              }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleControlModeChange(m.id as ControlMode)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  settings.controlMode === m.id
                    ? 'bg-sky-950/70 border-sky-400 text-sky-200 ring-2 ring-sky-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-sm sm:text-base">{m.label}</div>
                <div className="text-xs text-slate-400 mt-1 leading-normal">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Setting 4: Auto-fire & Korean Voice Encouragement (TTS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Auto fire */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Crosshair className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-bold text-sm text-white">자동 발사</div>
                <div className="text-[11px] text-slate-400">손가락 피로 방지</div>
              </div>
            </div>
            <button
              onClick={handleToggleAutoFire}
              className={`w-12 h-7 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer ${
                settings.autoFire ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  settings.autoFire ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice cheer (TTS) */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mic className="w-5 h-5 text-rose-400" />
              <div>
                <div className="font-bold text-sm text-white">음성 칭찬(TTS)</div>
                <div className="text-[11px] text-slate-400">"참 잘하셨어요!" 음성</div>
              </div>
            </div>
            <button
              onClick={handleToggleVoiceCheer}
              className={`w-12 h-7 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer ${
                settings.voiceCheerEnabled ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  settings.voiceCheerEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Setting 5: Sound Volume Slider */}
        <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Volume2 className="w-5 h-5 text-amber-400" />
              <span>사운드 음량</span>
            </div>
            <span className="text-xs font-bold text-amber-300 tabular-nums">
              {Math.round(settings.soundVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.soundVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-2xl border border-slate-600 transition-colors cursor-pointer"
        >
          설정 완료하고 비행으로 돌아가기
        </button>
      </div>
    </div>
  );
};
