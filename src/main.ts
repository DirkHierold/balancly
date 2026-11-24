import { Game } from './game';

// Mobile Optimizations
async function setupMobileOptimizations(): Promise<void> {
  // Prevent context menu on long press
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  // Prevent default touch behaviors
  document.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  // Lock screen orientation to landscape (if supported)
  if ('orientation' in screen && 'lock' in screen.orientation) {
    try {
      await (screen.orientation as any).lock('landscape');
      console.log('Screen orientation locked to landscape');
    } catch (err) {
      console.warn('Could not lock screen orientation:', err);
    }
  }

  // Request wake lock to prevent screen from sleeping (if supported)
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('Wake lock acquired');

      // Re-acquire wake lock if it's released (e.g., when tab becomes inactive)
      wakeLock.addEventListener('release', async () => {
        console.log('Wake lock released, re-acquiring...');
        try {
          await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn('Could not re-acquire wake lock:', err);
        }
      });
    } catch (err) {
      console.warn('Could not acquire wake lock:', err);
    }
  }
}

// Initialize game
function init(): void {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Setup mobile optimizations
  setupMobileOptimizations();

  // Create and start game
  const game = new Game(canvas);

  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Pause game when tab is hidden
      console.log('Tab hidden');
    } else {
      // Resume game when tab is visible
      console.log('Tab visible');
    }
  });
}

// Start game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
