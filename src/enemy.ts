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
    // Draw the base ball with rotation dots
    super.draw(ctx);
  }
}
