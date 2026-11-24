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

    // Professional "Great-Circle Stripes" method for realistic rolling
    // Based on game-dev shader techniques (Godot, Unity)

    // Calculate roll phase based on distance traveled
    const rollPhase = (this.totalDistance / this.radius) % (Math.PI * 2);

    // Roll axis is perpendicular to movement direction
    const rollAxis = this.rotationAngle + Math.PI / 2;

    // Draw 3 great-circle stripes around the ball
    const numStripes = 3;
    const stripeWidth = this.radius * 0.12;

    for (let i = 0; i < numStripes; i++) {
      // Each stripe is offset by 120 degrees (360/3)
      const stripePhase = rollPhase + (i * Math.PI * 2) / numStripes;

      // Draw curved stripe as a great circle
      this.drawGreatCircleStripe(
        ctx,
        stripePhase,
        rollAxis,
        stripeWidth
      );
    }

    ctx.restore();
  }

  private drawGreatCircleStripe(
    ctx: CanvasRenderingContext2D,
    phase: number,
    rollAxis: number,
    width: number
  ): void {
    // Draw a curved stripe that wraps around the ball
    // This creates the illusion of a 3D sphere rolling

    ctx.save();

    // Sample points along the stripe
    const segments = 32;
    const path: { x: number; y: number; alpha: number }[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;

      // Position on the great circle (perpendicular to roll axis)
      const circleX = Math.cos(t) * this.radius * 0.9;
      const circleY = Math.sin(t) * this.radius * 0.9;

      // Rotate around roll axis to create the stripe
      const x = circleX * Math.cos(rollAxis) - circleY * Math.sin(rollAxis);
      const y = circleX * Math.sin(rollAxis) + circleY * Math.cos(rollAxis);

      // Calculate z-depth for 3D effect (how far forward/back the point is)
      const z = Math.cos(t + phase);

      // Calculate alpha based on z-depth
      // Points at the back (z < 0) are more transparent
      const alpha = Math.max(0, Math.min(1, (z + 0.5) * 1.2));

      // Check if point is on visible hemisphere
      if (z > -0.3) {
        path.push({ x, y, alpha });
      }
    }

    // Draw the stripe path
    if (path.length > 1) {
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw with varying opacity based on depth
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        // Average alpha for smooth gradient
        const alpha = (p1.alpha + p2.alpha) / 2;

        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
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
