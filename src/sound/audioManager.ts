/**
 * Web Audio Synthesizer & Web Speech (TTS) for Senior 1942 Cognitive Game
 * Zero external audio file dependencies - 100% reliable and instantaneous.
 */

class SeniorAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private speechEnabled: boolean = true;
  private propellerOsc: OscillatorNode | null = null;
  private propellerGain: GainNode | null = null;
  private isPropellerRunning: boolean = false;
  private lastSpokenTime: number = 0;

  constructor() {
    // AudioContext is initialized on first user interaction
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.propellerGain && this.ctx) {
      this.propellerGain.gain.setValueAtTime(this.volume * 0.08, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted && this.propellerGain && this.ctx) {
      this.propellerGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else if (!this.isMuted && this.propellerGain && this.ctx && this.isPropellerRunning) {
      this.propellerGain.gain.setValueAtTime(this.volume * 0.08, this.ctx.currentTime);
    }
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
  }

  // --- Sound Effects ---

  // 1. Gentle machine-gun laser shot
  public playShoot() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio fallback silent
    }
  }

  // 2. Soft, cheerful pop explosion (not harsh or alarming for seniors)
  public playPopExplosion() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // fallback
    }
  }

  // 3. Sparkly melodic chime for Star / Item pickup
  public playStarChime() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.06);

        noteGain.gain.setValueAtTime(0, now + idx * 0.06);
        noteGain.gain.linearRampToValueAtTime(this.volume * 0.25, now + idx * 0.06 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

        noteOsc.connect(noteGain);
        noteGain.connect(ctx.destination);

        noteOsc.start(now + idx * 0.06);
        noteOsc.stop(now + idx * 0.06 + 0.26);
      });
    } catch {
      // fallback
    }
  }

  // 4. Heart Health chime (warm calming bell)
  public playHealChime() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chords = [440, 554.37, 659.25]; // A major peaceful chord

      chords.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(this.volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.65);
      });
    } catch {
      // fallback
    }
  }

  // 5. Loop-the-loop somersault swoosh
  public playLoopSwoosh() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.7);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.35);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.76);
    } catch {
      // fallback
    }
  }

  // 6. Propeller Background Hum (gentle, rhythmic vintage airplane hum)
  public startPropeller() {
    if (this.isPropellerRunning) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, now); // low gentle purr

      const gainVal = this.isMuted ? 0 : this.volume * 0.08;
      gain.gain.setValueAtTime(gainVal, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      this.propellerOsc = osc;
      this.propellerGain = gain;
      this.isPropellerRunning = true;
    } catch {
      // fallback
    }
  }

  public stopPropeller() {
    if (!this.isPropellerRunning) return;
    try {
      if (this.propellerOsc) {
        this.propellerOsc.stop();
        this.propellerOsc.disconnect();
        this.propellerOsc = null;
      }
      if (this.propellerGain) {
        this.propellerGain.disconnect();
        this.propellerGain = null;
      }
    } catch {
      // ignore
    }
    this.isPropellerRunning = false;
  }

  // 7. Victory Fanfare (Triumphant gentle brass progression)
  public playVictoryFanfare() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.5, d: 0.4 },  // C6
      ];
      let t = ctx.currentTime + 0.05;

      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(this.volume * 0.35, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + note.d + 0.05);

        t += note.d + 0.05;
      });
    } catch {
      // fallback
    }
  }

  // --- Korean TTS Speech Cheering for Seniors ---
  public speakEncouragement(phrase: string, force: boolean = false) {
    if (!this.speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const now = Date.now();
    // Throttle encouragement speech so it doesn't speak too rapidly (minimum 4 seconds apart unless forced)
    if (!force && now - this.lastSpokenTime < 4500) {
      return;
    }
    this.lastSpokenTime = now;

    try {
      window.speechSynthesis.cancel(); // cancel any pending
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9; // Slightly slower, calm and articulate pace for seniors
      utterance.pitch = 1.05; // Friendly warm pitch
      utterance.volume = this.volume;

      window.speechSynthesis.speak(utterance);
    } catch {
      // fallback silently
    }
  }
}

export const seniorAudio = new SeniorAudioManager();
