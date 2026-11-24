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

  // UI Elements
  private scoreElement: HTMLElement;
  private highscoreElement: HTMLElement;
  private alltimeElement: HTMLElement;
  private newGameButton: HTMLButtonElement;
  private permissionButton: HTMLButtonElement;

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
    this.newGameButton = document.getElementById(
      'newGameButton'
    )! as HTMLButtonElement;
    this.permissionButton = document.getElementById(
      'permissionButton'
    )! as HTMLButtonElement;

    this.updateScoreDisplay();
    this.setupEventListeners();
    this.checkPermission();
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

  private checkPermission(): void {
    if (this.orientationController.isAvailable()) {
      if (!this.orientationController.isPermissionGranted()) {
        this.permissionButton.style.display = 'block';
      } else {
        this.start();
      }
    } else {
      // Fallback to keyboard controls
      this.setupKeyboardControls();
      this.start();
    }
  }

  private setupEventListeners(): void {
    this.permissionButton.addEventListener('click', async () => {
      const granted = await this.orientationController.requestPermission();
      if (granted) {
        this.permissionButton.style.display = 'none';
        this.start();
      }
    });

    this.newGameButton.addEventListener('click', () => {
      this.restart();
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
    this.newGameButton.style.display = 'block';
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
    if (this.orientationController.isPermissionGranted()) {
      acceleration = this.orientationController.getAcceleration();
    } else if (this.updateKeyboardControls) {
      acceleration = this.updateKeyboardControls();
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
    // Clear canvas
    this.ctx.fillStyle = '#008000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
    this.newGameButton.style.display = 'none';
    this.updateScoreDisplay();
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.orientationController.stop();
  }
}
