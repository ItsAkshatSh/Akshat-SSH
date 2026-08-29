/**
 * Lightweight animated ocean for the profile GIF/SVG generator —
 * refresh rate (~30–60fps). GitHub README allows CSS animations in SVG.
 */

export const animatedOceanStyles = () => `
  @keyframes gh-ray-pulse {
    0%, 100% { opacity: 0.46; }
    50% { opacity: 0.54; }
  }
  @keyframes gh-ray-sway {
    0%, 100% { transform: rotate(-0.6deg); }
    50% { transform: rotate(0.6deg); }
  }
  @keyframes gh-jelly-drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-4px, 3px) scale(1.015); }
  }
  @keyframes gh-jelly-pulse {
    0%, 100% { opacity: 0.58; }
    50% { opacity: 0.66; }
  }
  @keyframes gh-kelp-sway {
    0%, 100% { transform: rotate(-1deg); }
    50% { transform: rotate(1deg); }
  }
  .gh-ray { animation: gh-ray-pulse 8s ease-in-out infinite, gh-ray-sway 18s ease-in-out infinite; transform-origin: top right; }
  .gh-ray-2 { animation-delay: -2s, -5s; }
  .gh-jelly { animation: gh-jelly-drift 14s ease-in-out infinite, gh-jelly-pulse 7s ease-in-out infinite; transform-origin: center; }
  .gh-kelp { animation: gh-kelp-sway 7s ease-in-out infinite; transform-origin: bottom center; }
`;

export const animatedOceanDefs = (width, height) => `
  <linearGradient id="gh-bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#060a10"/>
    <stop offset="100%" stop-color="#070707"/>
  </linearGradient>
  <radialGradient id="gh-warm-glow" cx="92%" cy="-8%" r="70%">
    <stop offset="0%" stop-color="rgba(255,224,196,0.07)"/>
    <stop offset="62%" stop-color="transparent"/>
  </radialGradient>
  <radialGradient id="gh-jelly-core" cx="50%" cy="40%" r="50%">
    <stop offset="0%" stop-color="rgba(168,207,232,0.55)"/>
    <stop offset="55%" stop-color="rgba(120,160,200,0.22)"/>
    <stop offset="100%" stop-color="transparent"/>
  </radialGradient>
  <radialGradient id="gh-jelly-rim" cx="50%" cy="45%" r="55%">
    <stop offset="70%" stop-color="transparent"/>
    <stop offset="92%" stop-color="rgba(196,210,228,0.35)"/>
    <stop offset="100%" stop-color="rgba(140,180,220,0.12)"/>
  </radialGradient>
  <linearGradient id="gh-ray-a" x1="100%" y1="0%" x2="60%" y2="100%">
    <stop offset="0%" stop-color="rgba(255,226,196,0.28)"/>
    <stop offset="100%" stop-color="transparent"/>
  </linearGradient>
  <linearGradient id="gh-ray-b" x1="100%" y1="0%" x2="70%" y2="100%">
    <stop offset="0%" stop-color="rgba(255,241,220,0.2)"/>
    <stop offset="100%" stop-color="transparent"/>
  </linearGradient>
  <filter id="gh-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="8"/>
  </filter>
  <clipPath id="card-clip"><rect width="${width}" height="${height}" rx="14"/></clipPath>
`;

export function renderAnimatedOceanBackground(width, height) {
  const rayH = height * 0.48;

  const kelpLeft = [0.015, 0.05, 0.09].map(
    (f, i) =>
      `<path class="gh-kelp" style="animation-delay:-${i}s" d="M ${width * f} ${height} Q ${width * (f + 0.01)} ${height * 0.88} ${width * (f + 0.02)} ${height * 0.78}" fill="none" stroke="rgba(90,140,128,0.32)" stroke-width="1.2" stroke-linecap="round"/>`
  ).join('');

  const kelpRight = [0.91, 0.955, 0.99].map(
    (f, i) =>
      `<path class="gh-kelp" style="animation-delay:-${i + 1.5}s" d="M ${width * f} ${height} Q ${width * (f - 0.01)} ${height * 0.9} ${width * (f - 0.015)} ${height * 0.8}" fill="none" stroke="rgba(90,140,128,0.32)" stroke-width="1.2" stroke-linecap="round"/>`
  ).join('');

  return `
    <rect width="${width}" height="${height}" fill="url(#gh-bg)"/>
    <rect width="${width}" height="${height}" fill="url(#gh-warm-glow)"/>

    <g class="gh-ray" aria-hidden="true">
      <polygon points="${width + 20},-10 ${width * 0.72},${rayH} ${width * 0.78},${rayH} ${width + 40},-10" fill="url(#gh-ray-a)"/>
    </g>
    <g class="gh-ray gh-ray-2" aria-hidden="true">
      <polygon points="${width + 30},-10 ${width * 0.82},${rayH * 0.85} ${width * 0.88},${rayH * 0.85} ${width + 50},-10" fill="url(#gh-ray-b)"/>
    </g>

    <g class="gh-jelly" transform="translate(${width * 0.32}, ${height * 0.34})" aria-hidden="true">
      <ellipse cx="0" cy="0" rx="78" ry="58" fill="url(#gh-jelly-core)" filter="url(#gh-soft-blur)"/>
      <ellipse cx="0" cy="0" rx="88" ry="66" fill="url(#gh-jelly-rim)"/>
      <g opacity="0.35" stroke="rgba(196,210,228,0.5)" stroke-width="0.8" fill="none">
        <path d="M -20 28 Q -8 52 0 78 Q 8 52 20 28"/>
        <path d="M -38 24 Q -22 50 -10 72"/>
        <path d="M 38 24 Q 22 50 10 72"/>
        <path d="M -52 20 Q -34 46 -18 68"/>
        <path d="M 52 20 Q 34 46 18 68"/>
      </g>
    </g>

    <g opacity="0.4" aria-hidden="true">
      <ellipse cx="${width * 0.74}" cy="${height * 0.28}" rx="14" ry="5" fill="rgba(176,196,216,0.5)" transform="rotate(-12 ${width * 0.74} ${height * 0.28})"/>
      <ellipse cx="${width * 0.78}" cy="${height * 0.34}" rx="11" ry="4" fill="rgba(176,196,216,0.4)" transform="rotate(8 ${width * 0.78} ${height * 0.34})"/>
      <ellipse cx="${width * 0.7}" cy="${height * 0.32}" rx="10" ry="4" fill="rgba(176,196,216,0.35)" transform="rotate(-5 ${width * 0.7} ${height * 0.32})"/>
    </g>

    ${kelpLeft}
    ${kelpRight}
  `;
}
