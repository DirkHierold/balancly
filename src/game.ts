import { Player } from './player';
import { Target } from './target';
import { Enemy } from './enemy';
import { DeviceOrientationController } from './deviceOrientation';
import { circleCollision, randomInt } from './utils';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private target: Target;
  private enemies: Enemy[] = [];
  private orientationController: DeviceOrientationController;
  private gameOver: boolean = false;
  private score: number = 0;
  private highscore: number = 0;
  private alltime: number = 0;
  private lastTime: number = 0;
  private animationFrameId: number = 0;
  private wakeLock: any = null;

  // UI Elements
  private scoreElement: HTMLElement;
  private highscoreElement: HTMLElement;
  private alltimeElement: HTMLElement;
  private scoreContainer: HTMLElement;
  private newGameButton: HTMLButtonElement;
  private playButton: HTMLButtonElement;
  private themeToggle: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;

    // Initialize canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize game objects
    this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
    this.target = this.createTarget();

    // Initialize orientation controller
    this.orientationController = new DeviceOrientationController(5);

    // Load scores from localStorage
    this.highscore = parseInt(localStorage.getItem('highscore') || '0', 10);
    this.alltime = parseInt(localStorage.getItem('alltime') || '0', 10);

    // Get UI elements
    this.scoreElement = document.getElementById('score')!;
    this.highscoreElement = document.getElementById('highscore')!;
    this.alltimeElement = document.getElementById('alltime')!;
    this.scoreContainer = document.getElementById('scoreContainer')!;
    this.newGameButton = document.getElementById(
      'newGameButton'
    )! as HTMLButtonElement;
    this.playButton = document.getElementById(
      'playButton'
    )! as HTMLButtonElement;
    this.themeToggle = document.getElementById('themeToggle')!;

    this.updateScoreDisplay();
    this.setupEventListeners();
    this.initTheme();
    this.setupWakeLock();
    this.checkPermission();
  }

  private async setupWakeLock(): Promise<void> {
    // Setup wake lock re-acquisition on visibility change
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && this.wakeLock !== null && this.wakeLock.released) {
        console.log('Page visible, re-acquiring wake lock...');
        await this.requestWakeLock();
      }
    });
  }

  private async requestWakeLock(): Promise<void> {
    if (!('wakeLock' in navigator)) {
      return;
    }

    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('Wake lock acquired');

      this.wakeLock.addEventListener('release', () => {
        console.log('Wake lock released');
      });
    } catch (err) {
      console.warn('Could not acquire wake lock:', err);
    }
  }

  private resizeCanvas(): void {
    // Maintain 600x800 aspect ratio
    const targetWidth = 600;
    const targetHeight = 800;
    const windowAspect = window.innerWidth / window.innerHeight;
    const gameAspect = targetWidth / targetHeight;

    if (windowAspect > gameAspect) {
      this.canvas.height = Math.min(targetHeight, window.innerHeight - 20);
      this.canvas.width = this.canvas.height * gameAspect;
    } else {
      this.canvas.width = Math.min(targetWidth, window.innerWidth - 20);
      this.canvas.height = this.canvas.width / gameAspect;
    }
  }

  private initTheme(): void {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.className = savedTheme;

    // Set active button
    const buttons = this.themeToggle.querySelectorAll('.theme-btn');
    buttons.forEach((btn) => {
      const button = btn as HTMLButtonElement;
      if (button.dataset.theme === savedTheme) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  private setTheme(theme: string): void {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);

    // Update active button
    const buttons = this.themeToggle.querySelectorAll('.theme-btn');
    buttons.forEach((btn) => {
      const button = btn as HTMLButtonElement;
      if (button.dataset.theme === theme) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  private checkPermission(): void {
    // Always setup keyboard controls (works on all platforms)
    this.setupKeyboardControls();

    // Show play button initially
    this.playButton.classList.remove('hidden');

    // Don't start the game automatically - wait for play button click
  }

  private setupEventListeners(): void {
    // Play button - start game and request motion permission if needed
    this.playButton.addEventListener('click', async () => {
      // Request wake lock to prevent screen timeout
      await this.requestWakeLock();

      // Request orientation permission (always try - method has its own checks)
      await this.orientationController.requestPermission();

      // Hide play button and start game
      this.playButton.classList.add('hidden');
      this.start();
    });

    // New game button - restart game
    this.newGameButton.addEventListener('click', () => {
      this.restart();
    });

    // Theme toggle buttons
    const themeButtons = this.themeToggle.querySelectorAll('.theme-btn');
    themeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const button = btn as HTMLButtonElement;
        const theme = button.dataset.theme;
        if (theme) {
          this.setTheme(theme);
        }
      });
    });
  }

  private setupKeyboardControls(): void {
    const keys: { [key: string]: boolean } = {};

    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });

    // Update player position based on keyboard in game loop
    this.updateKeyboardControls = () => {
      const acceleration = 800;
      let ax = 0;
      let ay = 0;

      if (keys['ArrowLeft'] || keys['a'] || keys['A']) ax -= acceleration;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) ax += acceleration;
      if (keys['ArrowUp'] || keys['w'] || keys['W']) ay -= acceleration;
      if (keys['ArrowDown'] || keys['s'] || keys['S']) ay += acceleration;

      return { x: ax, y: ay };
    };
  }

  private updateKeyboardControls: (() => { x: number; y: number }) | null =
    null;

  private createTarget(): Target {
    const margin = 64;
    const x = randomInt(margin, this.canvas.width - margin);
    const y = randomInt(margin, this.canvas.height - margin);
    return new Target(x, y);
  }

  private spawnEnemy(): void {
    const margin = 64;
    let x = randomInt(margin, this.canvas.width - margin);
    let y = randomInt(margin, this.canvas.height - margin);

    // Avoid spawning on player
    while (
      Math.abs(x - this.player.position.x) < 100 &&
      Math.abs(y - this.player.position.y) < 100
    ) {
      x = randomInt(margin, this.canvas.width - margin);
      y = randomInt(margin, this.canvas.height - margin);
    }

    this.enemies.push(new Enemy(x, y));
  }

  private handleTargetReached(): void {
    this.score++;
    this.alltime++;
    this.updateScoreDisplay();
    localStorage.setItem('alltime', String(this.alltime));

    if (this.score > this.highscore) {
      this.highscore = this.score;
      localStorage.setItem('highscore', String(this.highscore));
    }

    // Respawn target and add enemy
    this.target = this.createTarget();
    this.spawnEnemy();
  }

  private handlePlayerHit(): void {
    this.gameOver = true;
    this.scoreContainer.classList.add('game-over');
    this.newGameButton.classList.add('visible');
  }

  private updateScoreDisplay(): void {
    this.scoreElement.textContent = `Score: ${this.score}`;
    this.highscoreElement.textContent = `Highscore: ${this.highscore}`;
    this.alltimeElement.textContent = `Alltime: ${this.alltime}`;
  }

  private update(deltaTime: number): void {
    if (this.gameOver) return;

    // Get acceleration from device orientation or keyboard
    let acceleration = { x: 0, y: 0 };

    // Try keyboard controls first (always available on desktop)
    if (this.updateKeyboardControls) {
      const keyAccel = this.updateKeyboardControls();
      // Only use keyboard if keys are pressed
      if (keyAccel.x !== 0 || keyAccel.y !== 0) {
        acceleration = keyAccel;
      } else if (this.orientationController.isPermissionGranted()) {
        // Fall back to orientation if no keys pressed
        acceleration = this.orientationController.getAcceleration();
      }
    } else if (this.orientationController.isPermissionGranted()) {
      acceleration = this.orientationController.getAcceleration();
    }

    // Update player
    this.player.accelerate(acceleration.x, acceleration.y, deltaTime);
    this.player.update(deltaTime, this.canvas.width, this.canvas.height);

    // Update target
    this.target.update(deltaTime, this.canvas.width, this.canvas.height);

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(deltaTime, this.canvas.width, this.canvas.height);
    }

    // Check collision with target
    if (
      circleCollision(
        this.player.position,
        this.player.radius,
        this.target.position,
        this.target.radius
      )
    ) {
      this.handleTargetReached();
    }

    // Check collision with enemies
    for (const enemy of this.enemies) {
      if (
        circleCollision(
          this.player.position,
          this.player.radius,
          enemy.position,
          enemy.radius
        )
      ) {
        this.handlePlayerHit();
        break;
      }
    }
  }

  private draw(): void {
    // Clear canvas to transparent (background comes from #app via CSS)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all game objects
    this.target.draw(this.ctx);

    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }

    this.player.draw(this.ctx);
  }

  private gameLoop(currentTime: number): void {
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
    }

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  start(): void {
    this.lastTime = 0;
    this.gameLoop(0);
  }

  restart(): void {
    this.gameOver = false;
    this.score = 0;
    this.enemies = [];
    this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
    this.target = this.createTarget();
    this.scoreContainer.classList.remove('game-over');
    this.newGameButton.classList.remove('visible');
    this.updateScoreDisplay();
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.orientationController.stop();
  }
}
