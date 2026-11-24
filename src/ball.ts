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
  // Realistic roll physics: separate rotations for X and Y movement
  protected rotationAngle: number = 0; // Current rotation angle based on direction
  protected totalDistance: number = 0; // Total distance rolled

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

    // Calculate realistic roll rotation based on movement direction
    const dx = this.velocity.x * deltaTime;
    const dy = this.velocity.y * deltaTime;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.001) {
      // Update total distance for rotation calculation
      this.totalDistance += distance;

      // Calculate rotation angle based on movement direction
      // The angle points perpendicular to movement direction
      this.rotationAngle = Math.atan2(dy, dx);
    }

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

    // Calculate rotation phase based on distance rolled
    // Rotation = distance / circumference * 2π
    const rotationPhase = (this.totalDistance / this.radius) % (Math.PI * 2);

    // Draw markers that rotate perpendicular to movement direction
    const dotRadius = this.radius * 0.08;
    const dotDistance = this.radius * 0.65;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

    // Draw 8 dots in a pattern that shows rolling
    for (let i = 0; i < 8; i++) {
      // Angle around the circle
      const circleAngle = (i * Math.PI) / 4;

      // Add rotation phase to simulate rolling
      const angle = circleAngle + rotationPhase;

      // Position dots perpendicular to movement direction
      // Rotate the entire pattern based on movement angle
      const baseX = Math.cos(angle) * dotDistance;
      const baseY = Math.sin(angle) * dotDistance;

      // Rotate by movement direction (90 degrees offset for roll axis)
      const rollAngle = this.rotationAngle + Math.PI / 2;
      const x = baseX * Math.cos(rollAngle) - baseY * Math.sin(rollAngle);
      const y = baseX * Math.sin(rollAngle) + baseY * Math.cos(rollAngle);

      // Calculate depth (z-coordinate) for 3D effect
      const z = Math.sin(angle + rotationPhase);

      // Only draw dots on visible side (z > -0.3)
      if (z > -0.3) {
        // Fade based on depth
        const alpha = Math.max(0.1, (z + 0.3) / 1.3) * 0.5;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;

        // Scale dot size based on depth
        const size = dotRadius * (0.6 + 0.4 * ((z + 1) / 2));

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
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
