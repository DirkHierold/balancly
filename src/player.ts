import { Ball, BallConfig } from './ball';

export class Player extends Ball {
  constructor(x: number, y: number, radius: number = 25) {
    super({
      x,
      y,
      radius,
      color: '#FFFF00', // Yellow
      velocity: { x: 0, y: 0 }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw the base ball
    super.draw(ctx);

    // Draw happy face
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Eyes (looking in direction of movement)
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

    // Smiling mouth (arc)
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
