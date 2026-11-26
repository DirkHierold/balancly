import { Ball } from './ball';

export class Player extends Ball {
  constructor(x: number, y: number, radius: number = 18) {
    super({
      x,
      y,
      radius,
      color: '#FFFF00', // Yellow
      velocity: { x: 0, y: 0 }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw the base ball with rotation dots
    super.draw(ctx);
  }

  accelerate(ax: number, ay: number, deltaTime: number): void {
    // Apply acceleration from device orientation
    this.velocity.x += ax * deltaTime;
    this.velocity.y += ay * deltaTime;

    // Apply some friction
    this.velocity.x *= 0.99;
    this.velocity.y *= 0.99;

    // Limit max velocity
    const maxSpeed = 400;
    const speed = Math.sqrt(
      this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
    );
    if (speed > maxSpeed) {
      this.velocity.x = (this.velocity.x / speed) * maxSpeed;
      this.velocity.y = (this.velocity.y / speed) * maxSpeed;
    }
  }
}
