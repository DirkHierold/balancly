import { Ball } from './ball';
import { randomRange } from './utils';

export class Enemy extends Ball {
  constructor(x: number, y: number, radius: number = 25) {
    // Random velocity for each enemy
    const speed = randomRange(60, 180);
    const angle = randomRange(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    super({
      x,
      y,
      radius,
      color: '#FF6666', // Red
      velocity: { x: vx, y: vy }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw the base ball
    super.draw(ctx);

    // Draw unhappy face
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

    // Unhappy mouth (inverted arc)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      this.radius * 0.75,
      0,
      Math.max(8, this.radius * 0.15),
      Math.PI * 0.2,
      Math.PI * 1.8,
      true // Inverted for sad face
    );
    ctx.stroke();

    ctx.restore();
  }
}
