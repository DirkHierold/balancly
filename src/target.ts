import { Ball } from './ball';

export class Target extends Ball {
  constructor(x: number, y: number, radius: number = 25) {
    super({
      x,
      y,
      radius,
      color: '#FFFF00', // Yellow (same as player)
      velocity: { x: 0, y: 0 }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw the base ball
    super.draw(ctx);

    // Draw happy face
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Eyes
    const eyeOffsetX = this.radius * 0.65;
    const eyeOffsetY = this.radius * 0.35;
    const eyeRadius = Math.max(4, this.radius * 0.07);

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(eyeOffsetX, -eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Smiling mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      this.radius * 0.75,
      0,
      Math.max(8, this.radius * 0.15),
      Math.PI * 0.2,
      Math.PI * 1.8,
      false
    );
    ctx.stroke();

    ctx.restore();
  }

  update(deltaTime: number, _canvasWidth: number, _canvasHeight: number): void {
    // Target doesn't move, but simulate a slow spinning animation
    // Add small incremental distance to create slow rotation
    this.totalDistance += 10 * deltaTime;
  }
}
