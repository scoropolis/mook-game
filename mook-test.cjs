const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.MOOK_URL || 'http://127.0.0.1:8765', { waitUntil: 'networkidle' });
  await page.click('#start');
  await page.waitForFunction(() => window.__mook.getState().active >= 0);
  let state = await page.evaluate(() => window.__mook.getState());
  if (!state.playing || state.roundLength !== 2000) throw new Error(`Bad initial state: ${JSON.stringify(state)}`);
  await page.locator('.cell').nth(state.active).click();
  await page.waitForFunction(() => window.__mook.getState().score === 1);
  state = await page.evaluate(() => window.__mook.getState());
  if (state.score !== 1 || state.misses !== 0) throw new Error(`Hit failed: ${JSON.stringify(state)}`);
  await page.evaluate(() => { for (let i = 0; i < 4; i++) window.__mook.miss(); });
  await page.waitForFunction(() => !window.__mook.getState().playing);
  state = await page.evaluate(() => window.__mook.getState());
  if (state.misses !== 4 || state.playing) throw new Error(`Game over failed: ${JSON.stringify(state)}`);
  const overlayVisible = await page.locator('#overlay').evaluate(el => !el.classList.contains('hidden'));
  if (!overlayVisible) throw new Error('Game-over overlay is hidden');
  if (errors.length) throw new Error(`Page errors: ${errors.join('; ')}`);
  console.log(JSON.stringify({ ok: true, state, overlayVisible }));
  await browser.close();
})();
