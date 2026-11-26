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

  // Expose game globally for testing (dev only)
  if (import.meta.env.DEV) {
    (window as any).game = game;
  }
}

// Start game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
