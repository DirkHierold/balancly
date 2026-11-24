import type { Vector2 } from './utils';

export interface BallConfig {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity?: Vector2;
}

export class Ball {
  public position: Vector2;
  public velocity: Vector2;
  public radius: number;
  public color: string;
  protected rotation: number = 0;
  protected rotationSpeed: number = 0;

  constructor(config: BallConfig) {
    this.position = { x: config.x, y: config.y };
    this.velocity = config.velocity || { x: 0, y: 0 };
    this.radius = config.radius;
    this.color = config.color;
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Calculate rotation based on movement (roll physics)
    const speed = Math.sqrt(
      this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
    );
    this.rotationSpeed = speed / this.radius;
    this.rotation += this.rotationSpeed * deltaTime;

    // Bounce off walls
    if (this.position.x - this.radius < 0) {
      this.position.x = this.radius;
      this.velocity.x *= -1;
    } else if (this.position.x + this.radius > canvasWidth) {
      this.position.x = canvasWidth - this.radius;
      this.velocity.x *= -1;
    }

    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.velocity.y *= -1;
    } else if (this.position.y + this.radius > canvasHeight) {
      this.position.y = canvasHeight - this.radius;
      this.velocity.y *= -1;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Draw 3D ball with radial gradient
    const gradient = ctx.createRadialGradient(
      -this.radius * 0.3,
      -this.radius * 0.3,
      this.radius * 0.1,
      0,
      0,
      this.radius
    );

    // Create 3D effect with gradient
    gradient.addColorStop(0, this.getLightColor());
    gradient.addColorStop(0.4, this.color);
    gradient.addColorStop(1, this.getDarkColor());

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw rotation markers (dots on the ball)
    this.drawRotationMarkers(ctx);

    ctx.restore();
  }

  protected drawRotationMarkers(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.rotate(this.rotation);

    // Draw 4 dots around the ball to show rotation
    const dotRadius = this.radius * 0.08;
    const dotDistance = this.radius * 0.65;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const x = Math.cos(angle) * dotDistance;
      const y = Math.sin(angle) * dotDistance;

      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  protected getLightColor(): string {
    // Convert hex color to lighter version
    const hex = this.color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 60);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 60);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 60);
    return `rgb(${r}, ${g}, ${b})`;
  }

  protected getDarkColor(): string {
    // Convert hex color to darker version
    const hex = this.color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 60);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 60);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 60);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
