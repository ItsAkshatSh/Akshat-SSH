import fs from 'fs';
import path from 'path';

let cachedFontFace = null;

export function getEmbeddedFontFace() {
  if (cachedFontFace) return cachedFontFace;

  try {
    const fontPath = path.join(process.cwd(), 'public', 'font', 'endless.ttf');
    const fontData = fs.readFileSync(fontPath);
    const base64 = fontData.toString('base64');
    cachedFontFace = `
      @font-face {
        font-family: 'Endless';
        src: url(data:font/truetype;charset=utf-8;base64,${base64}) format('truetype');
        font-weight: 400;
        font-style: normal;
      }
    `;
  } catch {
    cachedFontFace = '';
  }

  return cachedFontFace;
}

export const FONT_ENDLESS = "'Endless', 'JetBrains Mono', ui-monospace, monospace";
export const FONT_MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
