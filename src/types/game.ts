/**
 * 1942 Senior Cognitive Care Game Types
 */

export type GameState = 
  | 'TITLE'
  | 'BRIEFING'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'MEMORY_BREAK'
  | 'STAGE_CLEAR'
  | 'REST_GAME_OVER'
  | 'REPORT';

export type DifficultyMode = 'healing' | 'comfortable' | 'active';

export type ControlMode = 'follow' | 'buttons' | 'keyboard';

export interface PlayerPlane {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  hp: number;
  maxHp: number;
  loopRollsLeft: number;
  isLooping: boolean;
  loopProgress: number; // 0 to 1
  isInvulnerable: boolean;
  invulnerableTimer: number;
  fireLevel: number; // 1 = single, 2 = twin, 3 = spread triple
  fireCooldown: number;
  bankAngle: number; // -1 to 1 for turning tilt
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  color: string;
  radius: number;
}

export type EnemyType = 'greenScout' | 'redSquadron' | 'heavyBomber' | 'supplyPlane';

export interface EnemyPlane {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  shootCooldown: number;
  patternType: 'straight' | 'sine' | 'circleSweep' | 'hover';
  patternTime: number;
  scoreValue: number;
  color: string;
  colorNameKo: string;
}

export type PickupType = 'star' | 'heart' | 'powerup' | 'shield';

export interface PickupItem {
  id: number;
  type: PickupType;
  x: number;
  y: number;
  vy: number;
  text: string;
  size: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'star' | 'spark';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  fontSize: number;
}

export interface Island {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'island' | 'reef' | 'smallIsle';
}

export interface Cloud {
  id: number;
  x: number;
  y: number;
  width: number;
  speed: number;
  opacity: number;
}

export interface GameSettings {
  difficulty: DifficultyMode;
  controlMode: ControlMode;
  autoFire: boolean;
  careModeInvincible: boolean; // 안심 무적 모드 (추락 없음)
  voiceCheerEnabled: boolean;  // TTS 음성 칭찬
  soundVolume: number;         // 0 to 1
  sfxEnabled: boolean;
  bulletSpeedScale: number;    // 0.5 ~ 1.0 (시니어 탄속 조절)
  highContrastHud: boolean;    // 고대비 HUD
}

export interface FlightSessionStats {
  flightTimeSeconds: number;
  targetsDefeated: number;
  redSquadronDefeated: number;
  starsCollected: number;
  heartsCollected: number;
  loopEvadesUsed: number;
  memoryQuizCorrect: number;
  totalScore: number;
  praiseCount: number;
  reactionClicks: number;
}
