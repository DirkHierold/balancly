import { test, expect } from '@playwright/test';

test('keyboard controls should move the player ball', async ({ page }) => {
  // Navigate to the game
  await page.goto('http://localhost:3001/balancly/');

  // Wait for game to initialize
  await page.waitForTimeout(1000);

  // Inject diagnostic logging to track velocity and position
  await page.evaluate(() => {
    const originalUpdate = (window as any).game?.player?.update;
    if (originalUpdate) {
      (window as any).game.player.update = function(deltaTime: number, canvasWidth: number, canvasHeight: number) {
        console.log(`📊 Before update - Position: (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}), Velocity: (${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)})`);
        originalUpdate.call(this, deltaTime, canvasWidth, canvasHeight);
        console.log(`📊 After update - Position: (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)})`);
      };
    }

    const originalAccelerate = (window as any).game?.player?.accelerate;
    if (originalAccelerate) {
      (window as any).game.player.accelerate = function(ax: number, ay: number, deltaTime: number) {
        console.log(`🚀 Accelerate called - ax: ${ax}, ay: ${ay}, deltaTime: ${deltaTime}`);
        console.log(`🚀 Velocity before: (${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)})`);
        originalAccelerate.call(this, ax, ay, deltaTime);
        console.log(`🚀 Velocity after: (${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)})`);
      };
    }
  });

  // Listen to console logs
  page.on('console', msg => {
    if (msg.text().includes('📊') || msg.text().includes('🚀') || msg.text().includes('🎯') || msg.text().includes('⌨️')) {
      console.log(msg.text());
    }
  });

  // Get initial position
  const initialPosition = await page.evaluate(() => {
    return {
      x: (window as any).game?.player?.position.x || 0,
      y: (window as any).game?.player?.position.y || 0
    };
  });

  console.log(`\n🎮 Initial position: (${initialPosition.x}, ${initialPosition.y})`);

  // Take screenshot before key press
  await page.screenshot({ path: '/tmp/before-keypress.png' });

  // Press and hold the right arrow key for 1 second
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(1000);
  await page.keyboard.up('ArrowRight');

  // Wait a bit for physics to settle
  await page.waitForTimeout(500);

  // Take screenshot after key press
  await page.screenshot({ path: '/tmp/after-keypress.png' });

  // Get final position
  const finalPosition = await page.evaluate(() => {
    return {
      x: (window as any).game?.player?.position.x || 0,
      y: (window as any).game?.player?.position.y || 0,
      velocity: {
        x: (window as any).game?.player?.velocity.x || 0,
        y: (window as any).game?.player?.velocity.y || 0
      }
    };
  });

  console.log(`\n🎮 Final position: (${finalPosition.x}, ${finalPosition.y})`);
  console.log(`🎮 Final velocity: (${finalPosition.velocity.x}, ${finalPosition.velocity.y})`);
  console.log(`🎮 Position change: (${finalPosition.x - initialPosition.x}, ${finalPosition.y - initialPosition.y})\n`);

  // Verify the player moved to the right
  expect(finalPosition.x).toBeGreaterThan(initialPosition.x);
});

test('WASD keys should also work', async ({ page }) => {
  await page.goto('http://localhost:3001/balancly/');
  await page.waitForTimeout(1000);

  const initialPosition = await page.evaluate(() => {
    return {
      x: (window as any).game?.player?.position.x || 0,
      y: (window as any).game?.player?.position.y || 0
    };
  });

  // Press 'w' to move up
  await page.keyboard.down('w');
  await page.waitForTimeout(1000);
  await page.keyboard.up('w');
  await page.waitForTimeout(500);

  const finalPosition = await page.evaluate(() => {
    return {
      x: (window as any).game?.player?.position.x || 0,
      y: (window as any).game?.player?.position.y || 0
    };
  });

  console.log(`\n🎮 W key - Initial Y: ${initialPosition.y}, Final Y: ${finalPosition.y}, Change: ${finalPosition.y - initialPosition.y}\n`);

  // Verify the player moved up (y decreased)
  expect(finalPosition.y).toBeLessThan(initialPosition.y);
});
