import { Ball } from './ball';

export class Target extends Ball {
  constructor(x: number, y: number, radius: number = 18) {
    super({
      x,
      y,
      radius,
      color: '#FFFF00', // Yellow (same as player)
      velocity: { x: 0, y: 0 }
    });
  }

  // Override to prevent rotation dots on target
  protected drawRotationMarkers(_ctx: CanvasRenderingContext2D): void {
    // Target has no rotation markers - just a plain ball
  }

  update(_deltaTime: number, _canvasWidth: number, _canvasHeight: number): void {
    // Target doesn't move or rotate
  }
}
