export interface Vector2 {
  x: number;
  y: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function circleCollision(
  a: Vector2,
  radiusA: number,
  b: Vector2,
  radiusB: number
): boolean {
  return distance(a, b) < radiusA + radiusB;
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max));
}

export function applyDeadzone(value: number, deadzone: number): number {
  if (Math.abs(value) < deadzone) {
    return 0;
  }
  return value;
}
