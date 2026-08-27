import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshots() {
  console.log('=== CredBridge 5-Step Playwright UI Screenshot Extractor ===\n');

  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  const rootScreenshotsDir = path.join(__dirname, '..', 'screenshots');

  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  if (!fs.existsSync(rootScreenshotsDir)) fs.mkdirSync(rootScreenshotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const targetUrl = process.env.APP_URL || 'http://localhost:3001';

  try {
    // -------------------------------------------------------------
    // SPECIFICATION 1: Desktop Main Product UI
    // Viewport: 1920x1080 | File: docs/screenshots/01_desktop_main_landing.png
    // -------------------------------------------------------------
    console.log('[1/5] Capturing Desktop Main Landing UI (1920x1080)...');
    const desktopContext1 = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2,
    });
    const page1 = await desktopContext1.newPage();
    await page1.addInitScript(() => { localStorage.setItem('credbridge_onboarded', 'true'); });
    await page1.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page1.waitForTimeout(1500);

    const file1 = path.join(screenshotsDir, '01_desktop_main_landing.png');
    await page1.screenshot({ path: file1 });
    fs.copyFileSync(file1, path.join(rootScreenshotsDir, '01_desktop_main_landing.png'));
    await desktopContext1.close();

    // -------------------------------------------------------------
    // SPECIFICATION 2: Mobile Responsive UI
    // Viewport: iPhone 13 Pro Emulation | File: docs/screenshots/02_mobile_responsive_design.png
    // -------------------------------------------------------------
    console.log('[2/5] Capturing Mobile Responsive Design (iPhone 13 Pro)...');
    const mobileContext = await browser.newContext({
      ...devices['iPhone 13 Pro'],
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.addInitScript(() => { localStorage.setItem('credbridge_onboarded', 'true'); });
    await mobilePage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1500);

    const file2 = path.join(screenshotsDir, '02_mobile_responsive_design.png');
    await mobilePage.screenshot({ path: file2 });
    fs.copyFileSync(file2, path.join(rootScreenshotsDir, '02_mobile_responsive_design.png'));
    await mobileContext.close();

    // -------------------------------------------------------------
    // SPECIFICATION 3: Wallet Interaction State
    // Viewport: 1920x1080 | Action: Click "Connect Wallet" -> Modal Visible | File: docs/screenshots/03_wallet_connection_modal.png
    // -------------------------------------------------------------
    console.log('[3/5] Capturing Wallet Connection Modal State...');
    const desktopContext3 = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2,
    });
    const page3 = await desktopContext3.newPage();
    await page3.addInitScript(() => { localStorage.setItem('credbridge_onboarded', 'true'); });
    await page3.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page3.waitForTimeout(1000);

    const connectBtn = page3.locator('button:has-text("Connect Wallet"), button:has-text("Connect")').first();
    await connectBtn.waitFor({ state: 'visible' });
    await connectBtn.click();
    await page3.waitForSelector('h2:has-text("Stellar Testnet Wallet")', { state: 'visible', timeout: 5000 });
    await page3.waitForTimeout(600);

    const file3 = path.join(screenshotsDir, '03_wallet_connection_modal.png');
    await page3.screenshot({ path: file3 });
    fs.copyFileSync(file3, path.join(rootScreenshotsDir, '03_wallet_connection_modal.png'));
    await desktopContext3.close();

    // -------------------------------------------------------------
    // SPECIFICATION 4: User Feedback Collection UI
    // Viewport: 1920x1080 | Action: Click "Feedback" -> FeedbackModal | File: docs/screenshots/04_user_feedback_modal.png
    // -------------------------------------------------------------
    console.log('[4/5] Capturing User Feedback Modal State...');
    const desktopContext4 = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2,
    });
    const page4 = await desktopContext4.newPage();
    await page4.addInitScript(() => { localStorage.setItem('credbridge_onboarded', 'true'); });
    await page4.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page4.waitForTimeout(1000);

    const feedbackBtn = page4.locator('button:has-text("Feedback")').first();
    await feedbackBtn.waitFor({ state: 'visible' });
    await feedbackBtn.click();
    await page4.waitForSelector('h2:has-text("User Feedback & Rating")', { state: 'visible', timeout: 5000 });
    await page4.waitForTimeout(600);

    const file4 = path.join(screenshotsDir, '04_user_feedback_modal.png');
    await page4.screenshot({ path: file4 });
    fs.copyFileSync(file4, path.join(rootScreenshotsDir, '04_user_feedback_modal.png'));
    await desktopContext4.close();

    // -------------------------------------------------------------
    // SPECIFICATION 5: Analytics/Monitoring Setup
    // Viewport: 1920x1080 | Action: Click "Analytics" -> TelemetryModal | File: docs/screenshots/05_analytics_setup.png
    // -------------------------------------------------------------
    console.log('[5/5] Capturing Analytics & Telemetry Setup State...');
    const desktopContext5 = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2,
    });
    const page5 = await desktopContext5.newPage();
    await page5.addInitScript(() => { localStorage.setItem('credbridge_onboarded', 'true'); });
    await page5.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page5.waitForTimeout(1000);

    const analyticsBtn = page5.locator('button:has-text("Analytics")').first();
    await analyticsBtn.waitFor({ state: 'visible' });
    await analyticsBtn.click();
    await page5.waitForSelector('h2:has-text("System Observability & Telemetry")', { state: 'visible', timeout: 5000 });
    await page5.waitForTimeout(600);

    const file5 = path.join(screenshotsDir, '05_analytics_setup.png');
    await page5.screenshot({ path: file5 });
    fs.copyFileSync(file5, path.join(rootScreenshotsDir, '05_analytics_setup.png'));
    await desktopContext5.close();

    console.log('\n🎉 SUCCESS: All 5 Distinct Specification Screenshots Extracted!');
    console.log(`Saved to directory: ${screenshotsDir}`);
  } catch (err) {
    console.error('Screenshot extraction failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
