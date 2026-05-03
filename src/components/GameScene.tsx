"use client";
import React, { useEffect, useRef } from 'react';

export default function GameScene() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: any = null;
    let resizeObserver: ResizeObserver | null = null;

    const initPhaser = async () => {
      const Phaser = await import('phaser');
      if (!gameRef.current) return;

      let player: Phaser.Physics.Arcade.Sprite;
      let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
      let wasd: any;
      let numericKeys: any;
      let enemies: Phaser.Physics.Arcade.Group;
      let bullets: Phaser.Physics.Arcade.Group;
      let xps: Phaser.Physics.Arcade.Group;
      
      let stats = {
        level: 1,
        xp: 0,
        xpToNext: 50,
        hp: 100,
        maxHp: 100,
        speed: 200,
        fireRate: 800,
        damage: 1,
        spawnRate: 1000
      };

      let upgradeLevels = {
        fireRate: 0, // Max 6
        damage: 0,   // Max 6
        speed: 0     // Max 6
      };

      let scoreText: Phaser.GameObjects.Text;
      let levelText: Phaser.GameObjects.Text;
      let hpBarFill: Phaser.GameObjects.Rectangle;
      let upgradeContainer: Phaser.GameObjects.Container;
      let isUpgrading = false;
      let lastFired = 0;
      let lastSpawned = 0;

      function createUI(scene: Phaser.Scene) {
        scoreText = scene.add.text(20, 20, 'XP: 0 / 50', { font: 'bold 18px Courier', color: '#00ff00' }).setScrollFactor(0).setDepth(1000);
        levelText = scene.add.text(20, 45, 'LEVEL: 1', { font: 'bold 16px Courier', color: '#fff' }).setScrollFactor(0).setDepth(1000);
        
        scene.add.rectangle(20, 75, 200, 15, 0x330000).setOrigin(0, 0).setScrollFactor(0).setDepth(1000);
        hpBarFill = scene.add.rectangle(20, 75, 200, 15, 0xff0000).setOrigin(0, 0).setScrollFactor(0).setDepth(1000);

        const fsBtn = scene.add.image(scene.scale.width - 40, 40, 'fs_btn').setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(1000);
        fsBtn.on('pointerdown', () => {
           // Берем контейнер, который лежит в page.tsx, или сам gameRef
           const container = document.getElementById('game-container') || gameRef.current;
           if (container) {
             if (!document.fullscreenElement) {
               container.requestFullscreen().catch(err => console.log(err));
             } else {
               document.exitFullscreen().catch(err => console.log(err));
             }
           }
        });
        
        scene.scale.on('resize', (gameSize: any) => {
           fsBtn.setPosition(gameSize.width - 40, 40);
        });

        upgradeContainer = scene.add.container(0, 0).setScrollFactor(0).setDepth(2000).setVisible(false);
      }

      function updateUI() {
        scoreText.setText(`XP: ${stats.xp} / ${stats.xpToNext}`);
        levelText.setText(`LEVEL: ${stats.level}`);
        hpBarFill.width = Math.max(0, (stats.hp / stats.maxHp) * 200);
      }

      function applyUpgrade(scene: Phaser.Scene, action: Function) {
        action();
        isUpgrading = false;
        upgradeContainer.setVisible(false);
        scene.physics.world.resume();
      }

      function triggerLevelUp(scene: Phaser.Scene) {
        stats.level += 1;
        stats.xp = 0;
        stats.xpToNext = Math.floor(stats.xpToNext * 1.5);
        stats.hp = Math.min(stats.maxHp, stats.hp + 20); 
        stats.spawnRate = Math.max(200, stats.spawnRate * 0.85); 
        
        updateUI();
        isUpgrading = true;
        scene.physics.world.pause();

        upgradeContainer.removeAll(true);
        
        const w = scene.cameras.main.width;
        const h = scene.cameras.main.height;
        
        const bg = scene.add.rectangle(w/2, h/2, w, h, 0x000000, 0.85).setInteractive(); 
        const title = scene.add.text(w/2, h/2 - 150, 'SYSTEM UPGRADE', { font: 'bold 32px Courier', color: '#ff0000' }).setOrigin(0.5);
        const hint = scene.add.text(w/2, h/2 + 200, '(Click or press 1, 2, 3)', { font: '14px Courier', color: '#888' }).setOrigin(0.5);
        
        upgradeContainer.add([bg, title, hint]);

        const availableUpgrades = [];
        
        if (upgradeLevels.fireRate < 6) {
          availableUpgrades.push({ 
            text: `OVERCLOCK LVL ${upgradeLevels.fireRate + 1}/6 (Fire Rate +)`, 
            action: () => { stats.fireRate *= 0.8; upgradeLevels.fireRate++; updateUI(); } 
          });
        }
        if (upgradeLevels.damage < 6) {
          availableUpgrades.push({ 
            text: `PAYLOAD LVL ${upgradeLevels.damage + 1}/6 (Damage +)`, 
            action: () => { stats.damage += 1; upgradeLevels.damage++; updateUI(); } 
          });
        }
        if (upgradeLevels.speed < 6) {
          availableUpgrades.push({ 
            text: `THRUSTERS LVL ${upgradeLevels.speed + 1}/6 (Speed +)`, 
            action: () => { stats.speed += 40; upgradeLevels.speed++; updateUI(); } 
          });
        }

        while (availableUpgrades.length < 3) {
          availableUpgrades.push({ 
            text: "REPAIR CORE (Heal 50 HP)", 
            action: () => { stats.hp = Math.min(stats.maxHp, stats.hp + 50); updateUI(); } 
          });
        }

        const finalUpgrades = availableUpgrades.map((upg, i) => ({
           text: `[${i + 1}] ${upg.text}`,
           action: upg.action
        }));

        scene.registry.set('active_upgrades', finalUpgrades);

        finalUpgrades.forEach((upg, i) => {
          const btnY = h/2 - 50 + (i * 70);
          const btnBg = scene.add.rectangle(w/2, btnY, 400, 50, 0x440000).setInteractive({ useHandCursor: true });
          const btnTxt = scene.add.text(w/2, btnY, upg.text, { font: 'bold 16px Courier', color: '#fff' }).setOrigin(0.5);
          
          btnBg.on('pointerover', () => btnBg.setFillStyle(0xff0000));
          btnBg.on('pointerout', () => btnBg.setFillStyle(0x440000));
          
          btnBg.on('pointerdown', () => {
             applyUpgrade(scene, upg.action);
          });
          
          upgradeContainer.add([btnBg, btnTxt]);
        });

        upgradeContainer.setVisible(true);
      }

      function preload(this: Phaser.Scene) {
        this.load.image('player', '/images/game/player.webp');
        this.load.image('enemy_fast', '/images/game/enemy_fast.webp');
        this.load.image('enemy_tank', '/images/game/enemy_tank.webp');
        this.load.image('enemy_range', '/images/game/enemy_range.webp');
        this.load.image('xp', '/images/game/xp_orb.webp');
        
        const graphics = this.add.graphics();
        graphics.fillStyle(0x330000, 0.8);
        graphics.fillRect(0, 0, 32, 32);
        graphics.lineStyle(2, 0xff0000, 1);
        graphics.strokeRect(4, 4, 24, 24);
        graphics.generateTexture('fs_btn', 32, 32);
        graphics.destroy();

        const bgGraphics = this.add.graphics();
        bgGraphics.fillStyle(0x0a0510, 1);
        bgGraphics.fillRect(0, 0, 128, 128);
        bgGraphics.lineStyle(1, 0x220000, 0.5);
        bgGraphics.strokeRect(0, 0, 128, 128);
        bgGraphics.generateTexture('bg_grid', 128, 128);
        bgGraphics.destroy();
      }

      function create(this: Phaser.Scene) {
        const scene = this;
        this.physics.world.setBounds(0, 0, 3000, 3000);
        this.add.tileSprite(1500, 1500, 3000, 3000, 'bg_grid').setDepth(0);

        player = this.physics.add.sprite(1500, 1500, 'player').setScale(0.15);
        player.setCollideWorldBounds(true);
        player.setDepth(10);

        this.cameras.main.setBounds(0, 0, 3000, 3000);
        this.cameras.main.startFollow(player, true, 0.05, 0.05);

        if (this.input.keyboard) {
            cursors = this.input.keyboard.createCursorKeys();
            wasd = this.input.keyboard.addKeys('W,A,S,D');
            numericKeys = this.input.keyboard.addKeys('ONE,TWO,THREE');
        }

        enemies = this.physics.add.group();
        bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });
        xps = this.physics.add.group();

        const g = this.add.graphics();
        g.fillStyle(0xff0000, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('laser', 8, 8);
        g.destroy();

        this.physics.add.overlap(bullets, enemies, (b, e) => {
          b.destroy();
          const enemy = e as Phaser.Physics.Arcade.Sprite;
          let hp = enemy.getData('hp') - stats.damage;
          enemy.setData('hp', hp);
          enemy.setTint(0xff0000);
          scene.time.delayedCall(100, () => { if (enemy.active) enemy.clearTint(); });

          if (hp <= 0) {
            if (Math.random() > 0.3) xps.create(enemy.x, enemy.y, 'xp').setScale(0.12);
            enemy.destroy();
          }
        });

        this.physics.add.overlap(player, xps, (p, x) => {
          x.destroy();
          stats.xp += 10;
          updateUI();
          if (stats.xp >= stats.xpToNext) triggerLevelUp(scene);
        });

        this.physics.add.overlap(player, enemies, (p, e) => {
          stats.hp -= 0.5;
          updateUI();
          scene.cameras.main.flash(500, 255, 0, 0);
          
          if (stats.hp <= 0) {
             const currentHigh = parseInt(localStorage.getItem('sponge_high_score') || '0');
             if (stats.xp > currentHigh) {
                 localStorage.setItem('sponge_high_score', stats.xp.toString());
                 window.dispatchEvent(new Event('score_updated'));
             }
             
             stats.hp = stats.maxHp;
             stats.xp = 0;
             stats.level = 1;
             stats.fireRate = 800;
             stats.speed = 200;
             stats.damage = 1;
             stats.spawnRate = 1000;
             upgradeLevels = { fireRate: 0, damage: 0, speed: 0 };
             
             updateUI();
             enemies.clear(true, true);
             xps.clear(true, true);
          }
        });

        createUI(scene);
      }

      function update(this: Phaser.Scene, time: number) {
        if (isUpgrading) {
            const upgrades = this.registry.get('active_upgrades');
            if (upgrades && numericKeys) {
              if (Phaser.Input.Keyboard.JustDown(numericKeys.ONE) && upgrades[0]) applyUpgrade(this, upgrades[0].action);
              if (Phaser.Input.Keyboard.JustDown(numericKeys.TWO) && upgrades[1]) applyUpgrade(this, upgrades[1].action);
              if (Phaser.Input.Keyboard.JustDown(numericKeys.THREE) && upgrades[2]) applyUpgrade(this, upgrades[2].action);
            }
            return;
        }

        if (time > lastSpawned) {
            const cam = this.cameras.main;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.max(cam.width, cam.height) / 1.2;
            const x = player.x + Math.cos(angle) * distance;
            const y = player.y + Math.sin(angle) * distance;

            const typeRoll = Math.random();
            let tex = 'enemy_fast'; let scale = 0.1; 
            let hp = 2 + (stats.level * 0.5); 
            
            if (typeRoll > 0.8) { tex = 'enemy_tank'; scale = 0.2; hp = 10 + (stats.level * 2); }
            else if (typeRoll > 0.6) { tex = 'enemy_range'; scale = 0.15; hp = 5 + stats.level; }

            const enemy = enemies.create(x, y, tex).setScale(scale);
            if (enemy) enemy.setData('hp', hp);

            lastSpawned = time + stats.spawnRate;
        }

        player.setVelocity(0);
        if (cursors?.left.isDown || wasd?.A.isDown) player.setVelocityX(-stats.speed);
        else if (cursors?.right.isDown || wasd?.D.isDown) player.setVelocityX(stats.speed);
        if (cursors?.up.isDown || wasd?.W.isDown) player.setVelocityY(-stats.speed);
        else if (cursors?.down.isDown || wasd?.S.isDown) player.setVelocityY(stats.speed);

        if (this.input.activePointer.isDown && !isUpgrading) {
            if (this.input.activePointer.y > 100) {
                this.physics.moveToObject(player, {x: this.cameras.main.scrollX + this.input.activePointer.x, y: this.cameras.main.scrollY + this.input.activePointer.y}, stats.speed);
            }
        }

        if (time > lastFired) {
          let closestEnemy: any = null;
          let minDistance = 600;

          enemies.getChildren().forEach((enemy: any) => {
            if (enemy.active) {
              const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
              if (dist < minDistance) { minDistance = dist; closestEnemy = enemy; }
            }
          });

          if (closestEnemy) {
            const bullet = bullets.create(player.x, player.y, 'laser');
            if (bullet) {
              this.physics.moveToObject(bullet, closestEnemy, 800);
              const angle = Phaser.Math.Angle.Between(player.x, player.y, closestEnemy.x, closestEnemy.y);
              player.setRotation(angle + Math.PI / 2);
              this.time.delayedCall(1500, () => { if(bullet.active) bullet.destroy(); });
              lastFired = time + stats.fireRate;
            }
          }
        }

        enemies.getChildren().forEach((enemy: any) => {
          if (enemy.active) {
            const speed = enemy.texture.key === 'enemy_tank' ? 40 : (enemy.texture.key === 'enemy_range' ? 70 : 100);
            this.physics.moveToObject(enemy, player, speed);
          }
        });
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: '100%',
        height: '100%',
        backgroundColor: '#05020a',
        physics: {
          default: 'arcade',
          arcade: { debug: false }
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          parent: gameRef.current,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: { preload, create, update }
      };

      game = new Phaser.Game(config);

      // --- ИСПРАВЛЕНИЕ: ЖЕСТКОЕ ОБНОВЛЕНИЕ РАЗМЕРОВ ЧЕРЕЗ ResizeObserver ---
      // Он отслеживает физическое изменение размеров div-контейнера и форсирует ресайз игры
      resizeObserver = new ResizeObserver((entries) => {
        window.requestAnimationFrame(() => {
          if (!game || !game.scale || !gameRef.current) return;
          const { width, height } = entries[0].contentRect;
          if (width > 0 && height > 0) {
            game.scale.resize(width, height);
          }
        });
      });
      
      if (gameRef.current) {
        resizeObserver.observe(gameRef.current);
      }
    };

    initPhaser();

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (game) game.destroy(true);
    };
  }, []);

  // Добавили absolute inset-0, чтобы холст жестко цеплялся за края родительского контейнера
  return <div ref={gameRef} className="absolute inset-0 rounded-xl overflow-hidden" />;
}