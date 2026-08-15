const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');

const server = spawn('python3', ['-m', 'http.server', '8876', '--bind', '127.0.0.1'], { stdio: 'ignore' });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  await wait(400);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:8876/', { waitUntil: 'networkidle' });

  await page.click('#settingsButton');
  assert.equal(await page.locator('#settingsOverlay').getAttribute('class'), 'settings-overlay');
  await page.click('#soundToggle');
  assert.equal(await page.locator('#soundToggle').textContent(), 'Off');
  await page.click('#hapticsToggle');
  assert.equal(await page.locator('#hapticsToggle').textContent(), 'Off');
  await page.click('#settingsClose');

  await page.click('#start');
  let state = await page.evaluate(() => window.__mook.getState());
  assert.equal(state.openingGreenWaiting, true);
  assert.equal(state.active.length, 1);
  assert.equal(state.elapsed, 0);
  await page.evaluate(i => window.__mook.tap(i), state.active[0]);
  await page.evaluate(() => window.__mook.pauseSpawnsForTest());

  for (let i = 0; i < 4; i++) {
    const index = await page.evaluate(() => window.__mook.spawnGreens(1)[0]);
    await page.evaluate(index => window.__mook.tap(index), index);
  }
  state = await page.evaluate(() => window.__mook.getState());
  assert.equal(state.streak, 5);
  assert.equal(state.multiplier, 2);
  assert.equal(state.score, 6);

  await page.evaluate(() => {
    window.__mook.losePoint('test'); window.__mook.losePoint('test');
    window.__mook.losePoint('test'); window.__mook.losePoint('test');
  });
  await wait(300);
  state = await page.evaluate(() => window.__mook.getState());
  assert.equal(state.playing, false);
  assert.equal(state.adVisible, true);
  assert.equal(await page.locator('#adContinue').isDisabled(), true);
  await wait(3200);
  await page.click('#adContinue');
  assert.equal((await page.evaluate(() => window.__mook.getState())).adVisible, false);
  assert.equal(await page.locator('#streakStat').textContent(), '5');
  assert.equal(await page.locator('#accuracyStat').textContent(), '56%');

  console.log(JSON.stringify({ ok: true, state }));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => server.kill('SIGTERM'));
