/**
 * Captures animated profile card frames and writes public/github.gif.
 *
 * Usage:
 *   1. npm run build && npm run start   (in one terminal)
 *   2. npm run generate:github-gif      (in another)
 *
 * Or point at a running dev server:
 *   GIF_BASE_URL=http://localhost:3000 npm run generate:github-gif
 */
import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';

const { GIFEncoder, quantize, applyPalette } = gifenc;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'public', 'github.gif');
const VERSION_PATH = path.join(ROOT, 'public', 'github-gif-version.txt');
const EMBED_PATH = path.join(ROOT, 'public', 'github-profile-embed.md');
const SITE_URL =
  process.env.PROFILE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.akshaaaat.xyz';

const BASE_URL = process.env.GIF_BASE_URL || 'http://localhost:3999';
const FPS = Number(process.env.GIF_FPS || 15);
const DURATION_SEC = Number(process.env.GIF_DURATION_SEC || 2.5);
const FRAME_COUNT = Math.round(FPS * DURATION_SEC);
const FRAME_DELAY_CS = Math.round(100 / FPS); // gifenc uses centiseconds

const waitForServer = (url, timeoutMs = 60000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      http
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Server not reachable at ${url}`));
            return;
          }
          setTimeout(tick, 500);
        });
    };
    tick();
  });

const startServer = () =>
  new Promise((resolve, reject) => {
    const port = process.env.GIF_PORT || '3999';
    const base = `http://localhost:${port}`;
    const child = spawn('npx', ['next', 'start', '-p', port], {
      cwd: ROOT,
      shell: true,
      stdio: 'ignore',
      env: { ...process.env },
    });
    child.on('error', reject);
    waitForServer(base)
      .then(() => resolve({ child, base }))
      .catch((err) => {
        child.kill();
        reject(err);
      });
  });

const pngToRgba = (buffer) => {
  const png = PNG.sync.read(buffer);
  return { width: png.width, height: png.height, data: png.data };
};

async function captureGif(baseUrl) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const key = process.env.GITHUB_PROFILE_SECRET
    ? `?key=${encodeURIComponent(process.env.GITHUB_PROFILE_SECRET)}`
    : '';

  await page.goto(`${baseUrl}/github-gif-source${key}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#github-gif-capture svg');
  await page.waitForTimeout(1200);

  const html = await page.content();
  if (html.includes('LAST 26 WEEKS')) {
    throw new Error(
      'Stale capture source detected. Run `npm run generate:github-gif` (it rebuilds automatically).'
    );
  }
  if (!html.includes('CONTRIBUTIONS')) {
    throw new Error('Capture page did not render profile stats. Check GITHUB_TOKEN.');
  }

  const capture = page.locator('#github-gif-capture');
  const frameCount = process.env.GIF_STATIC === '1' ? 1 : FRAME_COUNT;

  console.log(
    frameCount === 1
      ? 'Capturing static frame…'
      : `Capturing ${frameCount} frames at ${FPS}fps…`
  );

  const frames = [];
  for (let i = 0; i < frameCount; i += 1) {
    const pngBuffer = await capture.screenshot({ type: 'png' });
    frames.push(pngToRgba(pngBuffer));

    if ((i + 1) % 10 === 0) {
      console.log(`  frame ${i + 1}/${frameCount}`);
    }

    if (i < frameCount - 1) {
      await page.waitForTimeout(1000 / FPS);
    }
  }

  const { width, height } = frames[0];
  const combined = new Uint8Array(frames.reduce((sum, frame) => sum + frame.data.length, 0));
  let offset = 0;
  for (const frame of frames) {
    combined.set(frame.data, offset);
    offset += frame.data.length;
  }

  const globalPalette = quantize(combined, 256);
  const gif = GIFEncoder();

  frames.forEach((frame, index) => {
    const indexData = applyPalette(frame.data, globalPalette);
    gif.writeFrame(indexData, width, height, {
      palette: globalPalette,
      delay: frameCount === 1 ? 100 : FRAME_DELAY_CS,
      disposal: 2,
      repeat: index === 0 ? 0 : undefined,
    });
  });

  gif.finish();
  await browser.close();

  return Buffer.from(gif.bytes());
}

async function main() {
  const useStartServer =
    process.argv.includes('--start-server') || !process.env.GIF_BASE_URL;

  let baseUrl = BASE_URL;
  let child = null;
  let startedLocally = false;

  if (useStartServer) {
    console.log('Starting production server for capture…');
    const started = await startServer();
    baseUrl = started.base;
    child = started.child;
    startedLocally = true;
  } else {
    console.log(`Using ${baseUrl}`);
    await waitForServer(baseUrl);
  }

  try {
    const gifBuffer = await captureGif(baseUrl);
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, gifBuffer);

    const version = Date.now();
    const embed = `<img src="${SITE_URL}/github.gif?v=${version}" alt="GitHub profile" />`;
    fs.writeFileSync(VERSION_PATH, `${version}\n`);
    fs.writeFileSync(EMBED_PATH, `${embed}\n`);

    const kb = (gifBuffer.length / 1024).toFixed(1);
    console.log(`Wrote ${OUT_PATH} (${kb} KB)`);
    console.log(`Wrote ${VERSION_PATH} (${version})`);
    console.log('Embed in README:');
    console.log(`  ${embed}`);
  } finally {
    if (startedLocally && child) {
      child.kill();
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
