import React, { useEffect, useRef, useCallback } from 'react';
import {
  PlayerPlane,
  Bullet,
  EnemyPlane,
  PickupItem,
  Particle,
  FloatingText,
  Island,
  Cloud,
  GameSettings,
  FlightSessionStats,
  GameState
} from '../types/game';
import { seniorAudio } from '../sound/audioManager';

interface GameCanvasProps {
  gameState: GameState;
  settings: GameSettings;
  stats: FlightSessionStats;
  onUpdateStats: (updater: (prev: FlightSessionStats) => FlightSessionStats) => void;
  onTriggerMemoryBreak: () => void;
  onStageClear: () => void;
  onPlayerRestGameOver: () => void;
  onLoopUsed: (remaining: number) => void;
  currentObjective: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  settings,
  stats,
  onUpdateStats,
  onTriggerMemoryBreak,
  onStageClear,
  onPlayerRestGameOver,
  onLoopUsed,
  currentObjective
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References to keep game loop state without React re-render overhead
  const stateRef = useRef<{
    player: PlayerPlane;
    bullets: Bullet[];
    enemies: EnemyPlane[];
    pickups: PickupItem[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    islands: Island[];
    clouds: Cloud[];
    oceanOffset: number;
    carrierY: number;
    carrierState: 'takeoff' | 'offscreen' | 'landing';
    carrierLandTargetY: number;
    stageProgress: number; // 0 to 100
    enemySpawnTimer: number;
    waveIndex: number;
    mousePos: { x: number; y: number; active: boolean };
    keysPressed: Record<string, boolean>;
    lastTimestamp: number;
    nextBulletId: number;
    nextEnemyId: number;
    nextPickupId: number;
    nextParticleId: number;
    nextTextId: number;
    autoFireCooldown: number;
    totalPlayTime: number;
    propellerAngle: number;
  }>({
    player: {
      x: 300,
      y: 650,
      width: 64,
      height: 56,
      speed: 360,
      hp: 5,
      maxHp: 5,
      loopRollsLeft: 3,
      isLooping: false,
      loopProgress: 0,
      isInvulnerable: false,
      invulnerableTimer: 0,
      fireLevel: 1,
      fireCooldown: 0,
      bankAngle: 0
    },
    bullets: [],
    enemies: [],
    pickups: [],
    particles: [],
    floatingTexts: [],
    islands: [
      { id: 1, x: 80, y: 150, width: 140, height: 110, type: 'island' },
      { id: 2, x: 420, y: 480, width: 180, height: 130, type: 'island' },
      { id: 3, x: 260, y: 850, width: 110, height: 90, type: 'reef' }
    ],
    clouds: [
      { id: 1, x: 60, y: 50, width: 160, speed: 25, opacity: 0.35 },
      { id: 2, x: 380, y: 280, width: 220, speed: 35, opacity: 0.4 },
      { id: 3, x: 180, y: 550, width: 190, speed: 20, opacity: 0.3 }
    ],
    oceanOffset: 0,
    carrierY: 550,
    carrierState: 'takeoff',
    carrierLandTargetY: 0,
    stageProgress: 0,
    enemySpawnTimer: 0,
    waveIndex: 0,
    mousePos: { x: 300, y: 650, active: false },
    keysPressed: {},
    lastTimestamp: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
    nextPickupId: 1,
    nextParticleId: 1,
    nextTextId: 1,
    autoFireCooldown: 0,
    totalPlayTime: 0,
    propellerAngle: 0
  });

  // Praise phrase pool for TTS and floating badges
  const praiseList = [
    '참 잘하셨어요!',
    '멋진 조종 실력!',
    '기억력 쑥쑥!',
    '은빛 날개 최고!',
    '나이스 샷!',
    '집중력 100점!',
    '두뇌 건강 비행!'
  ];

  const triggerPraise = useCallback((text?: string, x?: number, y?: number) => {
    const s = stateRef.current;
    const phrase = text || praiseList[Math.floor(Math.random() * praiseList.length)];
    const posX = x ?? s.player.x;
    const posY = y ?? (s.player.y - 30);

    s.floatingTexts.push({
      id: s.nextTextId++,
      text: phrase,
      x: posX,
      y: posY,
      vy: -35,
      alpha: 1,
      color: '#FDE047',
      fontSize: 22
    });

    onUpdateStats((prev) => ({
      ...prev,
      praiseCount: prev.praiseCount + 1
    }));

    if (settings.voiceCheerEnabled) {
      seniorAudio.speakEncouragement(phrase);
    }
  }, [settings.voiceCheerEnabled, onUpdateStats]);

  // Execute Loop-the-Loop maneuver
  const executeLoop = useCallback(() => {
    const s = stateRef.current;
    if (s.player.isLooping || s.player.loopRollsLeft <= 0) return;

    s.player.isLooping = true;
    s.player.loopProgress = 0;
    s.player.loopRollsLeft -= 1;
    s.player.isInvulnerable = true;

    seniorAudio.playLoopSwoosh();
    onLoopUsed(s.player.loopRollsLeft);

    onUpdateStats((prev) => ({
      ...prev,
      loopEvadesUsed: prev.loopEvadesUsed + 1
    }));

    // Floating text
    s.floatingTexts.push({
      id: s.nextTextId++,
      text: '공중제비 회피 성공!',
      x: s.player.x,
      y: s.player.y - 40,
      vy: -40,
      alpha: 1,
      color: '#38BDF8',
      fontSize: 24
    });
  }, [onLoopUsed, onUpdateStats]);

  // Expose loop trigger to window / keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      s.keysPressed[e.code] = true;

      // Spacebar for Loop-the-Loop
      if (e.code === 'Space') {
        e.preventDefault();
        executeLoop();
      }

      onUpdateStats((prev) => ({
        ...prev,
        reactionClicks: prev.reactionClicks + 1
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keysPressed[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [executeLoop, onUpdateStats]);

  // Spawn enemy squadrons with calm, rhythmic pacing for seniors
  const spawnEnemies = (dt: number, width: number) => {
    const s = stateRef.current;
    s.enemySpawnTimer += dt;

    // Slower, stress-free spawn rate: every 2.8s ~ 3.5s
    const spawnInterval = settings.difficulty === 'healing' ? 3.4 : settings.difficulty === 'comfortable' ? 2.6 : 2.1;

    if (s.enemySpawnTimer > spawnInterval) {
      s.enemySpawnTimer = 0;
      s.waveIndex++;

      // Every 3rd wave: spawn Red Bonus Formation (classic 1942!)
      if (s.waveIndex % 4 === 0) {
        const startX = 80 + Math.random() * (width - 200);
        for (let i = 0; i < 4; i++) {
          s.enemies.push({
            id: s.nextEnemyId++,
            type: 'redSquadron',
            x: startX + i * 25,
            y: -60 - i * 55,
            width: 44,
            height: 38,
            hp: 2,
            maxHp: 2,
            vx: 0,
            vy: settings.difficulty === 'healing' ? 65 : 85,
            shootCooldown: 999, // Red planes don't shoot in easy mode, just fly in pretty V formation!
            patternType: 'sine',
            patternTime: i * 0.4,
            scoreValue: 200,
            color: '#EF4444',
            colorNameKo: '빨간색 보너스기'
          });
        }
      } else if (s.waveIndex % 7 === 0) {
        // Heavy Bomber (Slow, majestic, very rewarding)
        s.enemies.push({
          id: s.nextEnemyId++,
          type: 'heavyBomber',
          x: width / 2,
          y: -90,
          width: 86,
          height: 64,
          hp: 6,
          maxHp: 6,
          vx: 0,
          vy: 45,
          shootCooldown: 3.5,
          patternType: 'straight',
          patternTime: 0,
          scoreValue: 500,
          color: '#3B82F6',
          colorNameKo: '대형 폭격기'
        });
      } else if (s.waveIndex % 9 === 0) {
        // Friendly supply plane dropping health & stars
        s.enemies.push({
          id: s.nextEnemyId++,
          type: 'supplyPlane',
          x: 100 + Math.random() * (width - 200),
          y: -70,
          width: 60,
          height: 48,
          hp: 1,
          maxHp: 1,
          vx: 0,
          vy: 55,
          shootCooldown: 999,
          patternType: 'hover',
          patternTime: 0,
          scoreValue: 100,
          color: '#10B981',
          colorNameKo: '보급 수송기'
        });
      } else {
        // Standard Green Scouts (2 or 3 planes)
        const count = settings.difficulty === 'healing' ? 2 : 3;
        const side = Math.random() > 0.5 ? 1 : -1;
        const originX = side === 1 ? 60 : width - 60;

        for (let i = 0; i < count; i++) {
          s.enemies.push({
            id: s.nextEnemyId++,
            type: 'greenScout',
            x: originX + i * 40 * -side,
            y: -50 - i * 45,
            width: 42,
            height: 36,
            hp: 2,
            maxHp: 2,
            vx: side * (settings.difficulty === 'healing' ? 25 : 40),
            vy: settings.difficulty === 'healing' ? 60 : 80,
            shootCooldown: 2.5 + i * 0.5,
            patternType: 'circleSweep',
            patternTime: 0,
            scoreValue: 100,
            color: '#22C55E',
            colorNameKo: '초록 정찰기'
          });
        }
      }
    }
  };

  // Player firing mechanic
  const firePlayerBullets = () => {
    const s = stateRef.current;
    if (s.player.isLooping) return;

    seniorAudio.playShoot();

    if (s.player.fireLevel === 1) {
      // Twin nose cannons (Classic P-38 style)
      s.bullets.push(
        { id: s.nextBulletId++, x: s.player.x - 12, y: s.player.y - 20, vx: 0, vy: -550, isPlayer: true, color: '#38BDF8', radius: 4 },
        { id: s.nextBulletId++, x: s.player.x + 12, y: s.player.y - 20, vx: 0, vy: -550, isPlayer: true, color: '#38BDF8', radius: 4 }
      );
    } else if (s.player.fireLevel === 2) {
      // 4-Gun Wing Spread
      s.bullets.push(
        { id: s.nextBulletId++, x: s.player.x - 18, y: s.player.y - 15, vx: -40, vy: -550, isPlayer: true, color: '#FACC15', radius: 4.5 },
        { id: s.nextBulletId++, x: s.player.x - 7, y: s.player.y - 22, vx: 0, vy: -560, isPlayer: true, color: '#FACC15', radius: 4.5 },
        { id: s.nextBulletId++, x: s.player.x + 7, y: s.player.y - 22, vx: 0, vy: -560, isPlayer: true, color: '#FACC15', radius: 4.5 },
        { id: s.nextBulletId++, x: s.player.x + 18, y: s.player.y - 15, vx: 40, vy: -550, isPlayer: true, color: '#FACC15', radius: 4.5 }
      );
    } else {
      // Super Wing Power
      s.bullets.push(
        { id: s.nextBulletId++, x: s.player.x - 24, y: s.player.y - 10, vx: -80, vy: -540, isPlayer: true, color: '#F43F5E', radius: 5 },
        { id: s.nextBulletId++, x: s.player.x - 10, y: s.player.y - 24, vx: -20, vy: -560, isPlayer: true, color: '#FDE047', radius: 5 },
        { id: s.nextBulletId++, x: s.player.x + 10, y: s.player.y - 24, vx: 20, vy: -560, isPlayer: true, color: '#FDE047', radius: 5 },
        { id: s.nextBulletId++, x: s.player.x + 24, y: s.player.y - 10, vx: 80, vy: -540, isPlayer: true, color: '#F43F5E', radius: 5 }
      );
    }
  };

  // Sparkle / Explosion particle explosion
  const createExplosion = (x: number, y: number, color: string, count = 12) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const spd = 40 + Math.random() * 90;
      s.particles.push({
        id: s.nextParticleId++,
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: color,
        size: 3 + Math.random() * 4,
        alpha: 1,
        decay: 1.6 + Math.random() * 0.8,
        shape: Math.random() > 0.4 ? 'star' : 'circle'
      });
    }
  };

  // Handle Player Damage with Senior Care Protection
  const handlePlayerDamage = () => {
    const s = stateRef.current;
    if (s.player.isInvulnerable || s.player.isLooping) return;

    if (settings.careModeInvincible) {
      // Invincible Care Mode: Just flash shield, never lose HP
      s.player.isInvulnerable = true;
      s.player.invulnerableTimer = 1.5;
      s.floatingTexts.push({
        id: s.nextTextId++,
        text: '안심 쉴드 방어!',
        x: s.player.x,
        y: s.player.y - 25,
        vy: -30,
        alpha: 1,
        color: '#67E8F9',
        fontSize: 20
      });
      return;
    }

    s.player.hp -= 1;
    s.player.isInvulnerable = true;
    s.player.invulnerableTimer = 2.0;

    createExplosion(s.player.x, s.player.y, '#F87171', 8);

    if (s.player.hp <= 0) {
      // Rather than abrupt game over, summon emergency medic flight
      seniorAudio.playHealChime();
      s.player.hp = 3; // Refilled!
      s.player.isInvulnerable = true;
      s.player.invulnerableTimer = 3.5;

      s.floatingTexts.push({
        id: s.nextTextId++,
        text: '긴급 정비 완료! 힘내세요!',
        x: s.player.x,
        y: s.player.y - 40,
        vy: -30,
        alpha: 1,
        color: '#4ADE80',
        fontSize: 24
      });

      if (settings.voiceCheerEnabled) {
        seniorAudio.speakEncouragement('괜찮습니다. 정비 지원기가 도착하여 다시 비행합니다!');
      }

      onPlayerRestGameOver();
    }
  };

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      const s = stateRef.current;
      if (!s.lastTimestamp) s.lastTimestamp = time;
      const dt = Math.min((time - s.lastTimestamp) / 1000, 0.08);
      s.lastTimestamp = time;

      const width = canvas.width;
      const height = canvas.height;

      // Update Play Time
      if (gameState === 'PLAYING') {
        s.totalPlayTime += dt;
        s.stageProgress += dt * 1.6; // ~60 seconds per stage run

        // Trigger memory break at 50%
        if (s.stageProgress >= 50 && s.stageProgress < 50 + dt * 2) {
          onTriggerMemoryBreak();
        }

        // Trigger carrier landing victory at 100%
        if (s.stageProgress >= 100 && s.carrierState === 'offscreen') {
          s.carrierState = 'landing';
          s.carrierY = -400;
          s.carrierLandTargetY = height - 320;
        }

        onUpdateStats((prev) => ({
          ...prev,
          flightTimeSeconds: Math.floor(s.totalPlayTime)
        }));
      }

      // Propeller spin
      s.propellerAngle += dt * 35;

      // Background Ocean Scrolling
      s.oceanOffset = (s.oceanOffset + dt * 60) % 64;

      // 1. Draw Deep Pacific Ocean Base
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
      oceanGrad.addColorStop(0, '#0c2744');
      oceanGrad.addColorStop(0.5, '#0a365f');
      oceanGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Ocean Wave Ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1.5;
      for (let y = s.oceanOffset - 64; y < height; y += 48) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 32) {
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + 16, y - 6, x + 32, y);
        }
        ctx.stroke();
      }

      // 3. Render Islands
      s.islands.forEach((isle) => {
        if (gameState === 'PLAYING') {
          isle.y += dt * 35;
          if (isle.y > height + 150) {
            isle.y = -180;
            isle.x = 40 + Math.random() * (width - 240);
          }
        }

        // Coral reef halo
        ctx.fillStyle = 'rgba(20, 184, 166, 0.25)';
        ctx.beginPath();
        ctx.ellipse(isle.x, isle.y, isle.width * 0.58, isle.height * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sand Shore
        ctx.fillStyle = '#EAB308';
        ctx.beginPath();
        ctx.ellipse(isle.x, isle.y, isle.width * 0.5, isle.height * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lush Jungle Foliage
        ctx.fillStyle = '#15803D';
        ctx.beginPath();
        ctx.ellipse(isle.x - 4, isle.y - 2, isle.width * 0.4, isle.height * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(isle.x + 8, isle.y + 6, isle.width * 0.28, isle.height * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Render Aircraft Carrier Deck (Takeoff or Landing)
      if (s.carrierState === 'takeoff') {
        if (gameState === 'PLAYING') {
          s.carrierY += dt * 110;
          if (s.carrierY > height + 400) {
            s.carrierState = 'offscreen';
          }
        }
        drawCarrier(ctx, width / 2, s.carrierY);
      } else if (s.carrierState === 'landing') {
        if (s.carrierY < s.carrierLandTargetY) {
          s.carrierY += dt * 100;
        } else {
          // Player touches down
          if (s.player.y > s.carrierLandTargetY + 50) {
            s.player.y -= dt * 60;
            s.player.x += (width / 2 - s.player.x) * dt * 2;
          } else {
            // Stage Clear Completed!
            seniorAudio.playVictoryFanfare();
            triggerPraise('임무 완수! 안전 착함 성공!');
            onStageClear();
            s.carrierState = 'takeoff'; // reset for next
          }
        }
        drawCarrier(ctx, width / 2, s.carrierY);
      }

      // 5. Update and Render Clouds (Background level)
      s.clouds.forEach((c) => {
        if (gameState === 'PLAYING') {
          c.y += dt * c.speed;
          if (c.y > height + 100) {
            c.y = -120;
            c.x = Math.random() * (width - 150);
          }
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.width * 0.3, 0, Math.PI * 2);
        ctx.arc(c.x + c.width * 0.28, c.y - 12, c.width * 0.25, 0, Math.PI * 2);
        ctx.arc(c.x + c.width * 0.5, c.y, c.width * 0.32, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Gameplay Logic when Playing
      if (gameState === 'PLAYING') {
        // Player Movement Controls
        let targetX = s.player.x;
        let targetY = s.player.y;

        if (settings.controlMode === 'follow' && s.mousePos.active) {
          targetX = s.mousePos.x;
          targetY = s.mousePos.y;
        } else {
          // Keyboard or on-screen directional buttons
          let dx = 0;
          let dy = 0;
          if (s.keysPressed['ArrowLeft'] || s.keysPressed['KeyA']) dx -= 1;
          if (s.keysPressed['ArrowRight'] || s.keysPressed['KeyD']) dx += 1;
          if (s.keysPressed['ArrowUp'] || s.keysPressed['KeyW']) dy -= 1;
          if (s.keysPressed['ArrowDown'] || s.keysPressed['KeyS']) dy += 1;

          if (dx !== 0 || dy !== 0) {
            targetX += dx * s.player.speed * dt;
            targetY += dy * s.player.speed * dt;
          }
        }

        // Smooth follow interpolation
        const smoothFactor = settings.controlMode === 'follow' ? 12 : 18;
        const moveDx = targetX - s.player.x;
        s.player.x += moveDx * Math.min(1, dt * smoothFactor);
        s.player.y += (targetY - s.player.y) * Math.min(1, dt * smoothFactor);

        // Bank tilt based on horizontal movement
        s.player.bankAngle = Math.max(-0.6, Math.min(0.6, moveDx * 0.03));

        // Screen boundary clamp
        s.player.x = Math.max(36, Math.min(width - 36, s.player.x));
        s.player.y = Math.max(80, Math.min(height - 60, s.player.y));

        // Auto Fire
        if (settings.autoFire) {
          s.autoFireCooldown += dt;
          if (s.autoFireCooldown > 0.22) {
            s.autoFireCooldown = 0;
            firePlayerBullets();
          }
        }

        // Loop-the-loop animation progress
        if (s.player.isLooping) {
          s.player.loopProgress += dt * 1.35; // ~0.75 second total loop
          if (s.player.loopProgress >= 1) {
            s.player.isLooping = false;
            s.player.loopProgress = 0;
            s.player.isInvulnerable = false;
          }
        }

        // Invulnerability timer
        if (s.player.invulnerableTimer > 0) {
          s.player.invulnerableTimer -= dt;
          if (s.player.invulnerableTimer <= 0) {
            s.player.isInvulnerable = false;
          }
        }

        // Spawn Enemies
        spawnEnemies(dt, width);

        // Update Bullets
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          if (b.y < -30 || b.y > height + 30 || b.x < -30 || b.x > width + 30) {
            s.bullets.splice(i, 1);
            continue;
          }

          // Player Bullet vs Enemies
          if (b.isPlayer) {
            for (let j = s.enemies.length - 1; j >= 0; j--) {
              const enemy = s.enemies[j];
              const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
              if (dist < enemy.width * 0.5 + b.radius) {
                // Hit!
                s.bullets.splice(i, 1);
                enemy.hp -= 1;
                createExplosion(b.x, b.y, '#FDE047', 4);

                if (enemy.hp <= 0) {
                  // Enemy Defeated!
                  seniorAudio.playPopExplosion();
                  createExplosion(enemy.x, enemy.y, enemy.color, 16);

                  // Update score
                  onUpdateStats((prev) => ({
                    ...prev,
                    totalScore: prev.totalScore + enemy.scoreValue,
                    targetsDefeated: prev.targetsDefeated + 1,
                    redSquadronDefeated: enemy.type === 'redSquadron' ? prev.redSquadronDefeated + 1 : prev.redSquadronDefeated
                  }));

                  // Drops
                  if (enemy.type === 'redSquadron') {
                    // Guaranteed power-up or star from Red Squadron!
                    s.pickups.push({
                      id: s.nextPickupId++,
                      type: Math.random() > 0.4 ? 'star' : 'powerup',
                      x: enemy.x,
                      y: enemy.y,
                      vy: 75,
                      text: '★ 기억의 별',
                      size: 26
                    });
                    triggerPraise('빨간 편대 격추 성공! 별 획득!');
                  } else if (enemy.type === 'supplyPlane') {
                    // Guaranteed First Aid Heart!
                    s.pickups.push({
                      id: s.nextPickupId++,
                      type: 'heart',
                      x: enemy.x,
                      y: enemy.y,
                      vy: 60,
                      text: '♥ 건강 회복',
                      size: 28
                    });
                    triggerPraise('보급 지원품을 획득하세요!');
                  } else if (Math.random() < 0.35) {
                    // Random golden star
                    s.pickups.push({
                      id: s.nextPickupId++,
                      type: 'star',
                      x: enemy.x,
                      y: enemy.y,
                      vy: 70,
                      text: '★ 기억의 별',
                      size: 24
                    });
                  }

                  s.enemies.splice(j, 1);
                }
                break;
              }
            }
          } else {
            // Enemy bullet vs Player
            if (!s.player.isInvulnerable && !s.player.isLooping) {
              const dist = Math.hypot(b.x - s.player.x, b.y - s.player.y);
              if (dist < 22 + b.radius) {
                s.bullets.splice(i, 1);
                handlePlayerDamage();
              }
            }
          }
        }

        // Update Enemies
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const e = s.enemies[i];
          e.patternTime += dt;

          if (e.patternType === 'sine') {
            e.x += Math.sin(e.patternTime * 3) * 65 * dt;
          } else if (e.patternType === 'circleSweep') {
            e.x += e.vx * dt;
          }
          e.y += e.vy * dt;

          // Enemy shooting: gentle, predictable bullets scaled by settings
          e.shootCooldown -= dt;
          if (e.shootCooldown <= 0 && e.y > 60 && e.y < height - 200) {
            e.shootCooldown = 999; // 1 gentle shot per pass
            const bSpeed = 120 * settings.bulletSpeedScale;
            const angle = Math.atan2(s.player.y - e.y, s.player.x - e.x);
            s.bullets.push({
              id: s.nextBulletId++,
              x: e.x,
              y: e.y + 15,
              vx: Math.cos(angle) * bSpeed,
              vy: Math.sin(angle) * bSpeed,
              isPlayer: false,
              color: '#F97316',
              radius: 6 // Large, easily visible for seniors
            });
          }

          // Offscreen removal
          if (e.y > height + 80) {
            s.enemies.splice(i, 1);
            continue;
          }

          // Player plane collision with enemy plane
          if (!s.player.isInvulnerable && !s.player.isLooping) {
            const dist = Math.hypot(e.x - s.player.x, e.y - s.player.y);
            if (dist < 34) {
              handlePlayerDamage();
              createExplosion(e.x, e.y, '#F87171', 10);
            }
          }
        }

        // Update Pickups (Stars, Hearts, Power-ups)
        for (let i = s.pickups.length - 1; i >= 0; i--) {
          const item = s.pickups[i];
          item.y += item.vy * dt;

          // Gentle magnetic pull towards player when close
          const dist = Math.hypot(item.x - s.player.x, item.y - s.player.y);
          if (dist < 110) {
            item.x += (s.player.x - item.x) * dt * 4;
            item.y += (s.player.y - item.y) * dt * 4;
          }

          // Collected by player
          if (dist < 38) {
            if (item.type === 'star') {
              seniorAudio.playStarChime();
              onUpdateStats((prev) => ({
                ...prev,
                starsCollected: prev.starsCollected + 1,
                totalScore: prev.totalScore + 300
              }));
              triggerPraise('기억의 별 획득! 두뇌 번쩍!', item.x, item.y);
            } else if (item.type === 'heart') {
              seniorAudio.playHealChime();
              s.player.hp = Math.min(s.player.maxHp, s.player.hp + 2);
              onUpdateStats((prev) => ({
                ...prev,
                heartsCollected: prev.heartsCollected + 1
              }));
              triggerPraise('건강 하트 회복! 체력 충전!', item.x, item.y);
            } else if (item.type === 'powerup') {
              seniorAudio.playStarChime();
              s.player.fireLevel = Math.min(3, s.player.fireLevel + 1);
              triggerPraise('날개 총알 강화 완료!', item.x, item.y);
            }

            createExplosion(item.x, item.y, '#FDE047', 10);
            s.pickups.splice(i, 1);
            continue;
          }

          if (item.y > height + 40) {
            s.pickups.splice(i, 1);
          }
        }
      }

      // 7. Draw Bullets
      s.bullets.forEach((b) => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // High contrast glow ring for visibility
        ctx.strokeStyle = b.isPlayer ? 'rgba(255, 255, 255, 0.8)' : 'rgba(254, 215, 170, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      // 8. Draw Enemy Planes
      s.enemies.forEach((e) => {
        drawEnemyPlane(ctx, e, s.propellerAngle);
      });

      // 9. Draw Pickups
      s.pickups.forEach((p) => {
        drawPickup(ctx, p, s.propellerAngle);
      });

      // 10. Draw Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.alpha -= pt.decay * dt;

        if (pt.alpha <= 0) {
          s.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        if (pt.shape === 'star') {
          draw5PointStar(ctx, pt.x, pt.y, pt.size, pt.size * 0.5);
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 11. Draw Player Plane (P-38 Lightning Fighter)
      drawPlayerP38(ctx, s.player, s.propellerAngle);

      // 12. Draw Floating Encouragement Texts
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const txt = s.floatingTexts[i];
        txt.y += txt.vy * dt;
        txt.alpha -= dt * 0.75;

        if (txt.alpha <= 0) {
          s.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, txt.alpha);
        ctx.font = `bold ${txt.fontSize}px 'Gowun Dodum', sans-serif`;
        ctx.textAlign = 'center';

        // Dark outline for supreme legibility
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#0F172A';
        ctx.strokeText(txt.text, txt.x, txt.y);

        ctx.fillStyle = txt.color;
        ctx.fillText(txt.text, txt.x, txt.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    gameState,
    settings,
    onTriggerMemoryBreak,
    onStageClear,
    onPlayerRestGameOver,
    onUpdateStats,
    triggerPraise
  ]);

  // Pointer / Mouse tracking for touch screens & mouse
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    stateRef.current.mousePos = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      active: true
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerMove(e);
    if (!settings.autoFire) {
      firePlayerBullets();
    }
    onUpdateStats((prev) => ({
      ...prev,
      reactionClicks: prev.reactionClicks + 1
    }));
  };

  // Helper Drawing Functions
  function drawCarrier(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.save();
    // Carrier Hull
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - 180);
    ctx.lineTo(cx + 70, cy - 180);
    ctx.lineTo(cx + 85, cy + 220);
    ctx.lineTo(cx - 85, cy + 220);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Wooden Runway Plank lines
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    for (let y = cy - 170; y < cy + 210; y += 18) {
      ctx.beginPath();
      ctx.moveTo(cx - 65, y);
      ctx.lineTo(cx + 65, y);
      ctx.stroke();
    }

    // Yellow Runway Center Strips
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 175);
    ctx.lineTo(cx, cy + 215);
    ctx.stroke();
    ctx.setLineDash([]);

    // Island Tower (Bridge) on starboard side
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(cx + 65, cy - 40, 22, 65);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(cx + 68, cy - 30, 16, 12);

    ctx.restore();
  }

  function drawPlayerP38(ctx: CanvasRenderingContext2D, p: PlayerPlane, propAngle: number) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Loop-the-loop 3D zoom & flip
    let scale = 1.0;
    let rotation = 0;
    if (p.isLooping) {
      // Sinusoidal zoom up then down
      scale = 1.0 + Math.sin(p.loopProgress * Math.PI) * 0.65;
      rotation = p.loopProgress * Math.PI * 2;
    }

    ctx.scale(scale, scale);
    ctx.rotate(rotation + p.bankAngle);

    // Invulnerability Blink
    if (p.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Shield Dome when invulnerable
    if (p.isInvulnerable) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.stroke();
    }

    // P-38 Shadow beneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(12, 18, 28 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Main Wing (Wide horizontal swept wing)
    ctx.fillStyle = '#475569'; // Silver/slate military finish
    ctx.beginPath();
    ctx.moveTo(-36, 0);
    ctx.lineTo(36, 0);
    ctx.lineTo(34, 10);
    ctx.lineTo(-34, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Twin Engine Booms (Left and Right)
    [-18, 18].forEach((boomX) => {
      // Boom body
      ctx.fillStyle = '#64748B';
      ctx.fillRect(boomX - 4, -18, 8, 38);

      // Tail fin
      ctx.fillStyle = '#334155';
      ctx.fillRect(boomX - 3, 16, 6, 12);

      // Spinning Propeller
      ctx.save();
      ctx.translate(boomX, -19);
      ctx.rotate(propAngle);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.9)'; // Golden yellow spinning blades
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Horizontal Tail Stabilizer connecting both booms
    ctx.fillStyle = '#475569';
    ctx.fillRect(-20, 22, 40, 5);

    // 4. Central Nacelle & Cockpit Pod
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.ellipse(0, -4, 7, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glass Canopy (Cyan blue highlight)
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(0, -6, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Star Insignia on left wing
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-26, 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawEnemyPlane(ctx: CanvasRenderingContext2D, e: EnemyPlane, propAngle: number) {
    ctx.save();
    ctx.translate(e.x, e.y);

    if (e.type === 'heavyBomber') {
      // Giant Twin-Engine Navy Bomber
      ctx.fillStyle = e.color;
      // Main wing
      ctx.fillRect(-44, -4, 88, 12);
      // Fuselage
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      // Glass nose
      ctx.fillStyle = '#93C5FD';
      ctx.beginPath();
      ctx.ellipse(0, 16, 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Twin propellers
      [-24, 24].forEach((bx) => {
        ctx.save();
        ctx.translate(bx, 12);
        ctx.rotate(propAngle);
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.restore();
      });
    } else if (e.type === 'supplyPlane') {
      // Friendly Green Transport Plane
      ctx.fillStyle = '#10B981';
      ctx.fillRect(-30, -2, 60, 10);
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Red Cross / Medical symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-4, -6, 8, 8);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(-1, -5, 2, 6);
      ctx.fillRect(-3, -3, 6, 2);
    } else {
      // Scout / Red Squadron Fighter
      ctx.fillStyle = e.color;
      // Wing
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(22, 0);
      ctx.lineTo(18, 8);
      ctx.lineTo(-18, 8);
      ctx.closePath();
      ctx.fill();
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tail
      ctx.fillRect(-9, -15, 18, 4);

      // Yellow spinning propeller at front
      ctx.save();
      ctx.translate(0, 18);
      ctx.rotate(-propAngle);
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPickup(ctx: CanvasRenderingContext2D, p: PickupItem, propAngle: number) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.type === 'star') {
      // Golden Memory Star
      ctx.rotate(Math.sin(propAngle * 0.2) * 0.2);
      ctx.fillStyle = '#FBBF24';
      ctx.shadowColor = '#FDE047';
      ctx.shadowBlur = 10;
      draw5PointStar(ctx, 0, 0, 16, 8);
      ctx.shadowBlur = 0;
    } else if (p.type === 'heart') {
      // Medical First Aid Heart
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      const topCurveHeight = 8;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -14, 0, -14, topCurveHeight);
      ctx.bezierCurveTo(-14, 18, 0, 22, 0, 26);
      ctx.bezierCurveTo(0, 22, 14, 18, 14, topCurveHeight);
      ctx.bezierCurveTo(14, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      // Highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-5, 6, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Triple bullet badge
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('3X', 0, 4);
    }

    ctx.restore();
  }

  function draw5PointStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / 5;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < 5; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Visual Canvas Target */}
      <canvas
        ref={canvasRef}
        width={640}
        height={800}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="w-full h-full max-w-[640px] max-h-[800px] object-contain shadow-2xl border border-slate-800 touch-none cursor-crosshair"
      />

      {/* Top Banner: Cognitive Focus Prompt */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-slate-900/90 border border-amber-500/50 rounded-full shadow-lg backdrop-blur-sm pointer-events-none flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm md:text-base">목표:</span>
          <span className="text-amber-100 font-medium text-sm md:text-base tracking-wide">
            {currentObjective}
          </span>
        </div>
      )}
    </div>
  );
};
