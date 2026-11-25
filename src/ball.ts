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

    // Simple rotating dots approach (like Marble Madness, Super Monkey Ball)
    // 8 dots distributed on sphere surface that rotate realistically

    // Calculate rotation based on distance traveled
    const rollAmount = this.totalDistance / this.radius;

    // Rotation axis perpendicular to movement direction
    const rollAxisX = -Math.sin(this.rotationAngle);
    const rollAxisY = Math.cos(this.rotationAngle);

    // 8 dots positioned around the sphere
    const dots = [
      { theta: 0, phi: 0 },           // front center
      { theta: Math.PI / 2, phi: 0 }, // top
      { theta: Math.PI, phi: 0 },     // back center
      { theta: -Math.PI / 2, phi: 0 }, // bottom
      { theta: Math.PI / 4, phi: Math.PI / 2 }, // right-top
      { theta: -Math.PI / 4, phi: Math.PI / 2 }, // right-bottom
      { theta: 3 * Math.PI / 4, phi: Math.PI / 2 }, // left-top
      { theta: -3 * Math.PI / 4, phi: Math.PI / 2 }, // left-bottom
    ];

    for (const dot of dots) {
      // Initial 3D position on sphere (before rotation)
      let x = Math.cos(dot.phi) * Math.sin(dot.theta) * this.radius * 0.85;
      let y = Math.cos(dot.theta) * this.radius * 0.85;
      let z = Math.sin(dot.phi) * Math.sin(dot.theta) * this.radius * 0.85;

      // Rotate around the roll axis by rollAmount
      // Using Rodrigues' rotation formula
      const cosAngle = Math.cos(rollAmount);
      const sinAngle = Math.sin(rollAmount);

      // For 2D canvas, we rotate around axis in XY plane
      const dotProduct = x * rollAxisX + y * rollAxisY;
      const crossX = rollAxisY * z;
      const crossY = -rollAxisX * z;

      const rotatedX = x * cosAngle + crossX * sinAngle + rollAxisX * dotProduct * (1 - cosAngle);
      const rotatedY = y * cosAngle + crossY * sinAngle + rollAxisY * dotProduct * (1 - cosAngle);
      const rotatedZ = z * cosAngle + (-rollAxisY * x + rollAxisX * y) * sinAngle;

      // Only draw dots on visible hemisphere (z > 0 means facing camera)
      if (rotatedZ > 0) {
        // Alpha based on z-depth (dots further away are more transparent)
        const alpha = Math.max(0.3, Math.min(1, rotatedZ / this.radius + 0.5));

        // Dot size based on depth
        const dotRadius = Math.max(2, this.radius * 0.08 * (rotatedZ / this.radius + 1));

        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, dotRadius, 0, Math.PI * 2);
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
