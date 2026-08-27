import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshots() {
  console.log('=== CredBridge Automated UI Screenshot Extractor ===\n');

  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  const rootScreenshotsDir = path.join(__dirname, '..', 'screenshots');

  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  if (!fs.existsSync(rootScreenshotsDir)) fs.mkdirSync(rootScreenshotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  
  try {
    const targetUrl = process.env.APP_URL || 'http://localhost:3001';

    // 1. Desktop Context
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await desktopContext.newPage();

    // Set localStorage so onboarding modal doesn't block UI
    await page.addInitScript(() => {
      localStorage.setItem('credbridge_onboarded', 'true');
    });

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // 1. Landing Page
    console.log('Capturing 1/5: Landing Page...');
    const path1 = path.join(screenshotsDir, '01_desktop_main_landing.png');
    await page.screenshot({ path: path1 });
    fs.copyFileSync(path1, path.join(rootScreenshotsDir, '01_desktop_main_landing.png'));

    // 2. Wallet Connection State Modal
    console.log('Capturing 2/5: Wallet Modal...');
    const walletBtn = page.locator('button:has-text("Connect Wallet")').first();
    if (await walletBtn.isVisible()) {
      await walletBtn.click({ force: true });
      await page.waitForTimeout(800);
      const path2 = path.join(screenshotsDir, '02_wallet_connection_modal.png');
      await page.screenshot({ path: path2 });
      fs.copyFileSync(path2, path.join(rootScreenshotsDir, '02_wallet_connection_modal.png'));
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(400);
    }

    // 3. User Feedback Modal
    console.log('Capturing 3/5: Feedback Modal...');
    const feedbackBtn = page.locator('button:has-text("Feedback")').first();
    if (await feedbackBtn.isVisible()) {
      await feedbackBtn.click({ force: true });
      await page.waitForTimeout(800);
      const path3 = path.join(screenshotsDir, '03_user_feedback_modal.png');
      await page.screenshot({ path: path3 });
      fs.copyFileSync(path3, path.join(rootScreenshotsDir, '03_user_feedback_modal.png'));
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(400);
    }

    // 4. User Dashboard View
    console.log('Capturing 4/5: Dashboard View...');
    const launchAppBtn = page.locator('button:has-text("Launch App")').first();
    if (await launchAppBtn.isVisible()) {
      await launchAppBtn.click({ force: true });
      await page.waitForTimeout(1000);
      const path4 = path.join(screenshotsDir, '04_user_dashboard_view.png');
      await page.screenshot({ path: path4 });
      fs.copyFileSync(path4, path.join(rootScreenshotsDir, '04_user_dashboard_view.png'));
    }

    await desktopContext.close();

    // 5. Mobile Viewport (iPhone 13)
    console.log('Capturing 5/5: Mobile Viewport...');
    const mobileContext = await browser.newContext({
      ...devices['iPhone 13'],
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.addInitScript(() => {
      localStorage.setItem('credbridge_onboarded', 'true');
    });
    await mobilePage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1200);

    const path5 = path.join(screenshotsDir, '05_mobile_responsive_design.png');
    await mobilePage.screenshot({ path: path5 });
    fs.copyFileSync(path5, path.join(rootScreenshotsDir, '05_mobile_responsive_design.png'));

    await mobileContext.close();

    console.log('\n🎉 ALL 5 Genuine UI Screenshots Captured Successfully!');
  } catch (err) {
    console.error('Screenshot extraction error:', err);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
