import { test, expect } from '@playwright/test';

test('record ball rolling animation', async ({ page, context }) => {
  // Start recording
  await context.tracing.start({ screenshots: true, snapshots: true });

  await page.goto('http://localhost:3001/balancly/');
  await page.waitForTimeout(1000);

  // Start video recording
  const recordingPath = '/tmp/ball-animation-current.webm';

  // Take initial screenshot
  await page.screenshot({ path: '/tmp/ball-initial.png' });

  // Simulate continuous right arrow key press for 5 seconds to see rolling
  await page.keyboard.down('ArrowRight');

  // Record for 5 seconds while ball moves and rolls
  for (let i = 0; i < 50; i++) {
    await page.waitForTimeout(100);
    await page.screenshot({ path: `/tmp/ball-frame-${i.toString().padStart(3, '0')}.png` });
  }

  await page.keyboard.up('ArrowRight');

  // Let it decelerate
  await page.waitForTimeout(1000);

  // Take final screenshot
  await page.screenshot({ path: '/tmp/ball-final.png' });

  console.log('✅ Ball animation recorded');
  console.log('📸 Screenshots saved to /tmp/ball-frame-*.png');
  console.log('Use: ffmpeg -framerate 10 -i /tmp/ball-frame-%03d.png -c:v libx264 -pix_fmt yuv420p /tmp/ball-animation.mp4');
});

test('record ball rolling in multiple directions', async ({ page }) => {
  await page.goto('http://localhost:3001/balancly/');
  await page.waitForTimeout(1000);

  // Test horizontal roll
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(2000);
  await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: '/tmp/ball-horizontal.png' });

  await page.waitForTimeout(500);

  // Test vertical roll
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(2000);
  await page.keyboard.up('ArrowDown');
  await page.screenshot({ path: '/tmp/ball-vertical.png' });

  await page.waitForTimeout(500);

  // Test diagonal roll
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(2000);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.up('ArrowDown');
  await page.screenshot({ path: '/tmp/ball-diagonal.png' });

  console.log('✅ Recorded ball rolling in multiple directions');
});
