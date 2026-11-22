/**
 * Captures animated profile card frames and writes public/github.gif.
 *
 * Usage:
 *   1. npm run build && npm run start   (in one terminal)
 *   2. npm run generate:github-gif      (in another)
 *
 * Or point at a running dev server:
 *   GIF_BASE_URL=http://localhost:3000 npm run generate:github-gif
 *
 * Knobs: GIF_SCALE (raster scale, default 2), GIF_FPS (30),
 * GIF_DURATION_SEC (6), GIF_DIFF (inter-frame transparency threshold, 2).
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
const FPS = Number(process.env.GIF_FPS || 30);
const DURATION_SEC = Number(process.env.GIF_DURATION_SEC || 6);
// Raster scale. The card is vector, so capturing at 2x makes the small mono
// labels and the ASCII glyphs crisp on high-density screens; the cost is four
// times the pixels per frame, which GIF pays for in file size.
const SCALE = Number(process.env.GIF_SCALE || 2);
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

const isPortFree = (port) =>
  new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      res.resume();
      resolve(false);
    });
    req.on('error', () => resolve(true));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(true);
    });
  });

const startServer = async () => {
  // Reusing a port that already answers would screenshot a stale build, so
  // walk forward to the first free one.
  const basePort = Number(process.env.GIF_PORT || 3999);
  let port = null;
  for (let i = 0; i < 10 && port === null; i += 1) {
    if (await isPortFree(basePort + i)) port = basePort + i;
  }
  if (port === null) throw new Error(`No free capture port near ${basePort}.`);

  const base = `http://localhost:${port}`;
  // Spawn Next directly rather than via npx + a shell: on Windows killing a
  // shell leaves the real server alive, and the next run would then capture
  // that stale build.
  const nextBin = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
    cwd: ROOT,
    stdio: 'ignore',
    env: { ...process.env },
  });

  return new Promise((resolve, reject) => {
    child.on('error', reject);
    waitForServer(base)
      .then(() => resolve({ child, base }))
      .catch((err) => {
        child.kill();
        reject(err);
      });
  });
};

const pngToRgba = (buffer) => {
  const png = PNG.sync.read(buffer);
  return { width: png.width, height: png.height, data: png.data };
};

// Playwright's bundled browser is not always downloaded (CI images, fresh
// clones). Fall back to the system Chrome so the generator still runs.
async function launchBrowser() {
  const channel = process.env.GIF_CHANNEL;
  try {
    return await chromium.launch(channel ? { channel } : {});
  } catch (err) {
    if (channel) throw err;
    console.warn('Bundled Chromium unavailable; using system Chrome.');
    return chromium.launch({ channel: 'chrome' });
  }
}

async function captureGif(baseUrl) {
  const browser = await launchBrowser();
  const page = await browser.newPage({
    viewport: { width: 1000, height: 900 },
    deviceScaleFactor: SCALE,
  });
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

  // Screenshots take far longer than a frame interval, so wall-clock waits
  // sample the CSS animations at uneven, drifting offsets; the GIF then plays
  // back too fast and jittery. Pause every animation and drive it to an exact
  // point in the loop for each frame instead.
  const animationCount = await page.evaluate(() => {
    const animations = document.getAnimations();
    animations.forEach((animation) => animation.pause());
    return animations.length;
  });

  const seekAnimations = (ms) =>
    page.evaluate(
      (time) =>
        new Promise((resolve) => {
          document.getAnimations().forEach((animation) => {
            animation.currentTime = time;
          });
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
      ms
    );

  const cardBox = await capture.boundingBox();
  console.log(
    animationCount === 0
      ? 'No CSS animations found; falling back to timed capture.'
      : frameCount === 1
        ? 'Capturing static frame…'
        : `Capturing ${frameCount} frames over ${DURATION_SEC}s at ${FPS}fps, ${Math.round(cardBox.width * SCALE)}×${Math.round(cardBox.height * SCALE)}…`
  );

  const frames = [];
  for (let i = 0; i < frameCount; i += 1) {
    if (animationCount > 0) {
      await seekAnimations((i / FPS) * 1000);
    }

    const pngBuffer = await capture.screenshot({ type: 'png' });
    frames.push(pngToRgba(pngBuffer));

    if ((i + 1) % 10 === 0) {
      console.log(`  frame ${i + 1}/${frameCount}`);
    }

    if (animationCount === 0 && i < frameCount - 1) {
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

  // Reserve one palette slot for transparency so each frame can leave the
  // pixels that did not move to the previous frame. Most of the card (panels,
  // text, heatmap) is static, so this is where the size actually goes.
  const globalPalette = quantize(combined, 255);
  const gif = GIFEncoder();
  // Small enough to keep the slow gradient shimmer and glyph drift, large
  // enough to leave truly static pixels on the previous frame.
  const DIFF_THRESHOLD = Number(process.env.GIF_DIFF ?? 2);
  let previous = null;

  frames.forEach((frame, index) => {
    const indexData = applyPalette(frame.data, globalPalette);
    if (previous) {
      for (let pixel = 0; pixel < indexData.length; pixel += 1) {
        const i = pixel * 4;
        if (
          Math.abs(frame.data[i] - previous[i]) <= DIFF_THRESHOLD &&
          Math.abs(frame.data[i + 1] - previous[i + 1]) <= DIFF_THRESHOLD &&
          Math.abs(frame.data[i + 2] - previous[i + 2]) <= DIFF_THRESHOLD
        ) {
          indexData[pixel] = 255;
        }
      }
    }
    gif.writeFrame(indexData, width, height, {
      palette: globalPalette,
      delay: frameCount === 1 ? 100 : FRAME_DELAY_CS,
      // gifenc calls this `dispose`; 1 = keep the previous frame underneath.
      dispose: 1,
      transparent: true,
      transparentIndex: 255,
      repeat: index === 0 ? 0 : undefined,
    });
    previous = frame.data;
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
