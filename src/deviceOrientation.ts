import { applyDeadzone } from './utils';

export interface OrientationData {
  gamma: number; // Left/Right tilt (-90 to 90)
  beta: number;  // Front/Back tilt (-180 to 180)
}

export class DeviceOrientationController {
  private gamma: number = 0;
  private beta: number = 0;
  private deadzone: number = 5; // Degrees
  private isActive: boolean = false;
  private permissionGranted: boolean = false;

  constructor(deadzone: number = 5) {
    this.deadzone = deadzone;
  }

  async requestPermission(): Promise<boolean> {
    // Check if DeviceOrientationEvent is available
    if (!window.DeviceOrientationEvent) {
      console.warn('DeviceOrientationEvent is not supported');
      return false;
    }

    // iOS 13+ requires permission
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (response === 'granted') {
          this.permissionGranted = true;
          this.start();
          return true;
        } else {
          console.warn('DeviceOrientation permission denied');
          return false;
        }
      } catch (error) {
        console.error('Error requesting DeviceOrientation permission:', error);
        return false;
      }
    } else {
      // Non-iOS or older iOS, no permission needed
      this.permissionGranted = true;
      this.start();
      return true;
    }
  }

  start(): void {
    if (this.isActive) return;

    window.addEventListener(
      'deviceorientation',
      this.handleOrientation.bind(this)
    );
    this.isActive = true;
  }

  stop(): void {
    if (!this.isActive) return;

    window.removeEventListener(
      'deviceorientation',
      this.handleOrientation.bind(this)
    );
    this.isActive = false;
  }

  private handleOrientation(event: DeviceOrientationEvent): void {
    if (event.gamma !== null && event.beta !== null) {
      // Apply deadzone to reduce jitter
      this.gamma = applyDeadzone(event.gamma, this.deadzone);
      this.beta = applyDeadzone(event.beta, this.deadzone);
    }
  }

  getAcceleration(): { x: number; y: number } {
    // Convert orientation to acceleration
    // gamma: -90 (left) to 90 (right)
    // beta: -180 (back) to 180 (front)

    // Normalize and scale
    const maxTilt = 45; // Max tilt angle to consider
    const accelerationScale = 500; // Pixels per second squared

    // X acceleration (left/right)
    const ax = (this.gamma / maxTilt) * accelerationScale;

    // Y acceleration (front/back)
    const ay = (this.beta / maxTilt) * accelerationScale;

    return { x: ax, y: ay };
  }

  isPermissionGranted(): boolean {
    return this.permissionGranted;
  }

  isAvailable(): boolean {
    return 'DeviceOrientationEvent' in window;
  }
}
