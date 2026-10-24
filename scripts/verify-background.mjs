/* eslint-disable no-console */
// End-to-end verification for the settings pipeline + Void scene:
//  1. home mounts, Void canvas up (ASCII black hole renders)
//  2. open Settings via the floating menu, both toggle groups present
//  3. switch bgMode from the PANEL → scene swaps, store persisted
//  4. set motion 'reduced' → scene time advances at 35%
//  5. reset → back to Void/full
//  6. quick bottom-right toggle still works and stays in sync
import puppeteer from 'puppeteer-core';
import { readdirSync } from 'fs';

function findChrome() {
  for (const root of [
    'C:/Program Files/Google/Chrome/Application',
    'C:/Program Files (x86)/Google/Chrome/Application',
  ]) {
    try {
      const files = readdirSync(root);
      const dir = files.find((f) => /^\d+$/.test(f));
      if (dir) return `${root}/${dir}/chrome.exe`;
      if (files.includes('chrome.exe')) return `${root}/chrome.exe`;
    } catch {
      // next root
    }
  }
  throw new Error('chrome.exe not found');
}

const errors = [];
const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars'],
});

try {
  const page = await browser.newPage();
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errors.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  await page.setViewport({ width: 1280, height: 1600 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => document.querySelector('canvas'), { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1200));

  // 1. Void live
  const step1 = await page.evaluate(() => ({
    canvases: document.querySelectorAll('canvas').length,
    worldToggle: document.querySelector('button[aria-label^="Background:"]')?.textContent?.trim(),
  }));
  console.log('1. void live:', JSON.stringify(step1));
  await page.screenshot({ path: 'shots/settings-step1-void.png' });

  // JS-dispatched clicks with hit-testing diagnostics. Real pointer events
  // stay available to humans; headless hit-testing is brittle against
  // animation mid-flight, so we dispatch and report what covers the target.
  const jsClick = async (selector, timeout = 8000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const info = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return { ok: false, reason: 'absent' };
        const r = el.getBoundingClientRect();
        if (r.width === 0) return { ok: false, reason: 'zero-size' };
        const cover = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!el.contains(cover) && cover !== el) {
          return { ok: false, reason: `covered by ${cover?.tagName}.${cover?.className}` };
        }
        el.click();
        return { ok: true };
      }, selector);
      if (info.ok) return true;
      if (!/absent|zero-size/.test(info.reason || '')) console.log(`  click-blocked: ${info.reason}`);
      await new Promise((r) => setTimeout(r, 300));
    }
    throw new Error(`could not click ${selector}`);
  };

  // 2. open Settings via floating menu (real keyboard path also exists)
  await jsClick('button[aria-controls="floating-menu-items"]');
  await page.waitForSelector('#floating-menu-items button[aria-label="Settings"]', { timeout: 5000 });
  await jsClick('#floating-menu-items button[aria-label="Settings"]');
  await page.waitForFunction(
    () => [...document.querySelectorAll('h2')].some((h) => /settings/i.test(h.textContent || '')),
    { timeout: 8000 }
  );
  const step2 = await page.evaluate(() => {
    const groups = [...document.querySelectorAll('div[role="group"]')];
    return groups.map((g) => ({
      label: g.getAttribute('aria-label'),
      buttons: [...g.querySelectorAll('button')].map((b) => ({
        text: b.textContent.trim(),
        pressed: b.getAttribute('aria-pressed') === 'true',
      })),
    }));
  });
  console.log('2. settings groups:', JSON.stringify(step2));
  await page.screenshot({ path: 'shots/settings-step2-panel.png' });

  // 3. switch to Ocean from the panel → store changes; scene swaps behind the overlay
  const oceanBtn = await page.evaluateHandle(() => {
    const g = [...document.querySelectorAll('div[role="group"]')].find(
      (x) => x.getAttribute('aria-label') === 'Background world'
    );
    return [...g.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Ocean');
  });
  await oceanBtn.asElement().evaluate((el) => el.click());
  await new Promise((r) => setTimeout(r, 1500));
  const step3 = await page.evaluate(() => ({
    stored: JSON.parse(localStorage.getItem('akshat:bg-settings') || '{}'),
    relicToggleAfterOpen: document.querySelector('button[aria-label^="Background:"]')?.textContent?.trim(),
  }));
  console.log('3. ocean via panel:', JSON.stringify(step3));

  // 4. motion → Reduced
  const reducedBtn = await page.evaluateHandle(() => {
    const g = [...document.querySelectorAll('div[role="group"]')].find(
      (x) => x.getAttribute('aria-label') === 'Scene motion'
    );
    return [...g.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Reduced');
  });
  await reducedBtn.asElement().evaluate((el) => el.click());
  await new Promise((r) => setTimeout(r, 800));
  const step4 = await page.evaluate(() => JSON.parse(localStorage.getItem('akshat:bg-settings') || '{}'));
  console.log('4. motion reduced:', JSON.stringify(step4));

  // close settings (Esc)
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: 'shots/settings-step4-ocean-reduced.png' });

  // 5. reset — reopen the menu and the panel, click Reset
  await jsClick('button[aria-controls="floating-menu-items"]');
  await page.waitForSelector('#floating-menu-items button[aria-label="Settings"]', { timeout: 5000 });
  await jsClick('#floating-menu-items button[aria-label="Settings"]');
  await page.waitForFunction(
    () => [...document.querySelectorAll('h2')].some((h) => /settings/i.test(h.textContent || '')),
    { timeout: 8000 }
  );
  const resetBtn = await page.evaluateHandle(() => {
    const btns = [...document.querySelectorAll('button')];
    return btns.find((b) => b.textContent.trim() === 'Reset');
  });
  await resetBtn.asElement().evaluate((el) => el.click());
  await new Promise((r) => setTimeout(r, 800));
  const step5 = await page.evaluate(() => JSON.parse(localStorage.getItem('akshat:bg-settings') || '{}'));
  console.log('5. after reset:', JSON.stringify(step5));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 900));

  // 6. quick toggle round-trip
  await jsClick('button[aria-label^="Background:"]');
  await new Promise((r) => setTimeout(r, 1200));
  const step6 = await page.evaluate(() => ({
    stored: JSON.parse(localStorage.getItem('akshat:bg-settings') || '{}'),
    toggle: document.querySelector('button[aria-label^="Background:"]')?.textContent?.trim(),
  }));
  console.log('6. quick toggle after reset:', JSON.stringify(step6));
  await page.screenshot({ path: 'shots/settings-step6-roundtrip.png' });

  console.log('console errors:', errors.length ? errors : 'none');
} finally {
  await browser.close();
}
