import { THEME } from './config.js';
import {
  animatedOceanDefs,
  animatedOceanStyles,
  renderAnimatedOceanBackground,
} from './animatedOceanBackground.js';
import { FONT_ENDLESS, FONT_MONO, getEmbeddedFontFace } from './fonts.js';
import {
  contributionCellAttrs,
  contributionColor,
  contributionLevel,
  decodeHtmlEntities,
  escapeXml,
  monthLabelsForWeeks,
  truncate,
} from './utils.js';

const WIDTH = 830;
const PADDING = 20;

const glassPanel = (x, y, w, h) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="rgba(6,10,16,0.7)" stroke="rgba(255,255,255,0.16)"/>
  <g opacity="0.75">
    <path d="M ${x + 10} ${y + 10} L ${x + 22} ${y + 10} L ${x + 10} ${y + 22} Z" fill="none" stroke="rgba(255,255,255,0.25)"/>
    <path d="M ${x + w - 10} ${y + 10} L ${x + w - 22} ${y + 10} L ${x + w - 10} ${y + 22} Z" fill="none" stroke="rgba(255,255,255,0.25)"/>
    <path d="M ${x + 10} ${y + h - 10} L ${x + 22} ${y + h - 10} L ${x + 10} ${y + h - 22} Z" fill="none" stroke="rgba(255,255,255,0.25)"/>
    <path d="M ${x + w - 10} ${y + h - 10} L ${x + w - 22} ${y + h - 10} L ${x + w - 10} ${y + h - 22} Z" fill="none" stroke="rgba(255,255,255,0.25)"/>
  </g>`;

const statBlock = (centerX, y, label, value) => `
  <g transform="translate(${centerX}, ${y})">
    <text x="0" y="0" text-anchor="middle" font-family="${FONT_MONO}" font-size="10" fill="${THEME.textMuted}" letter-spacing="0.18em">${escapeXml(label)}</text>
    <text x="0" y="36" text-anchor="middle" font-family="${FONT_ENDLESS}" font-size="34" fill="#ffffff">${escapeXml(value)}</text>
  </g>`;

const renderHeatmap = (weeks, contentLeft, contentWidth, y, year) => {
  // A full year of 52 weeks has to stay inside contentWidth (720), so the
  // cells can only grow to 11px before the grid spills past the panel.
  const cell = 11;
  const gap = 2;
  const visibleWeeks = weeks || [];
  const weekCount = Math.max(visibleWeeks.length, 1);
  const heatmapWidth = weekCount * (cell + gap) - gap;
  const heatmapHeight = 7 * (cell + gap) - gap;
  const x = contentLeft + (contentWidth - heatmapWidth) / 2;
  const squares = [];
  const monthLabels = monthLabelsForWeeks(visibleWeeks);

  squares.push(
    `<rect x="${x - 10}" y="${y - 8}" width="${heatmapWidth + 20}" height="${heatmapHeight + 28}" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)"/>`
  );

  visibleWeeks.forEach((week, weekIndex) => {
    (week.contributionDays || []).forEach((day, dayIndex) => {
      const level = contributionLevel(day.contributionCount);
      const px = x + weekIndex * (cell + gap);
      const py = y + dayIndex * (cell + gap);
      squares.push(
        `<rect x="${px}" y="${py}" width="${cell}" height="${cell}" rx="3" fill="${contributionColor(level)}" ${contributionCellAttrs(level)} data-date="${escapeXml(day.date)}" data-count="${day.contributionCount || 0}"><title>${escapeXml(day.date)}: ${day.contributionCount || 0} contributions</title></rect>`
      );
    });
  });

  monthLabels.forEach(({ weekIndex, label }) => {
    const lx = x + weekIndex * (cell + gap) + cell / 2;
    const ly = y + heatmapHeight + 14;
    squares.push(
      `<text x="${lx}" y="${ly}" text-anchor="middle" font-family="${FONT_MONO}" font-size="9.5" fill="${THEME.textMuted}">${label}</text>`
    );
  });

  return {
    markup: `<g aria-label="Contribution graph for ${year}">${squares.join('')}</g>`,
    label: `${year} CONTRIBUTIONS`,
  };
};

const renderTrackRow = (track, index, y, contentLeft, contentWidth) => {
  const artSize = 38;
  const title = truncate(decodeHtmlEntities(track.title), 34);
  const artist = truncate(decodeHtmlEntities(track.artist), 42);
  const linkStart = track.url
    ? `<a href="${escapeXml(track.url)}" target="_blank" rel="noopener noreferrer">`
    : '';
  const linkEnd = track.url ? '</a>' : '';

  const artMarkup = track.albumArt
    ? `<clipPath id="art-${index}"><rect x="0" y="0" width="${artSize}" height="${artSize}" rx="5"/></clipPath>
       <image x="0" y="0" width="${artSize}" height="${artSize}" href="${escapeXml(track.albumArt)}" clip-path="url(#art-${index})" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="0" y="0" width="${artSize}" height="${artSize}" rx="5" fill="rgba(255,255,255,0.05)"/>
       <text x="${artSize / 2}" y="${artSize / 2 + 4}" text-anchor="middle" font-family="${FONT_MONO}" font-size="12" fill="${THEME.textMuted}">♪</text>`;

  return `
    <g transform="translate(${contentLeft}, ${y})">
      ${index > 0 ? `<rect x="0" y="-8" width="${contentWidth}" height="1" fill="rgba(255,255,255,0.06)"/>` : ''}
      <g>${artMarkup}</g>
      ${linkStart}
      <text x="52" y="18" font-family="${FONT_ENDLESS}" font-size="15" fill="${THEME.text}">${escapeXml(title)}</text>
      ${linkEnd}
      <text x="52" y="38" font-family="${FONT_MONO}" font-size="12" fill="#c9d4e0">${escapeXml(artist)}</text>
      <text x="${contentWidth}" y="24" text-anchor="end" font-family="${FONT_MONO}" font-size="11.5" fill="${THEME.textMuted}">${escapeXml(track.playedAgo || '')}</text>
    </g>`;
};

// The site's background is an ASCII ocean. A canvas cannot be captured into a
// GIF frame by frame, so the card carries its own glyph field instead: the
// same ramp, scattered deterministically, drifting on CSS animations the
// capture script can seek to an exact time.
const ASCII_RAMP = ' .·:-=+*x#%@';

const renderAsciiBackdrop = (width, height) => {
  const cellW = 15;
  const cellH = 19;
  const cols = Math.ceil(width / cellW) + 1;
  // One extra row above and below so the drift never exposes an edge.
  const rows = Math.ceil(height / cellH) + 3;
  let seed = 0x9e3779b9;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const layers = [[], [], []];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (rand() > 0.7) continue; // sparse gaps so it reads as texture
      // Squaring the random skews the ramp towards the quiet glyphs; the
      // bright #%@ ones stay rare accents.
      const glyph = ASCII_RAMP[Math.floor(rand() * rand() * ASCII_RAMP.length)];
      if (!glyph.trim()) continue;
      const x = col * cellW + rand() * 7 - 6;
      const y = row * cellH - cellH + rand() * 7;
      const opacity = (0.04 + rand() * 0.15).toFixed(2);
      layers[Math.floor(rand() * layers.length)].push(
        `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="${FONT_MONO}" font-size="${8 + Math.floor(rand() * 4)}" fill="#9fd6c4" opacity="${opacity}">${escapeXml(glyph)}</text>`
      );
    }
  }

  return `<g aria-hidden="true">
  <style>@keyframes gh-ascii-drift { from { transform: translateY(0); } to { transform: translateY(-26px); } }</style>
  ${layers
    .map(
      (glyphs, index) =>
        `<g style="animation: gh-ascii-drift ${18 + index * 7}s linear infinite; animation-delay: -${index * 5}s">${glyphs.join('')}</g>`
    )
    .join('')}
</g>`;
};

export function generateGithubProfileSvg({ github, spotify }) {
  const trackCount = Math.max(spotify.tracks?.length || 0, 1);
  const spotifyPanelHeight = 58 + trackCount * 56 + 12;
  const githubPanelHeight = 300;
  const height = PADDING * 2 + githubPanelHeight + 16 + spotifyPanelHeight;
  const panelInnerWidth = WIDTH - PADDING * 2;
  const panelCenterX = PADDING + panelInnerWidth / 2;
  const contentWidth = 720;
  const contentLeft = PADDING + (panelInnerWidth - contentWidth) / 2;
  const contributionYear = github.contributionYear || new Date().getUTCFullYear();

  const githubY = PADDING;
  const spotifyY = githubY + githubPanelHeight + 16;
  const fontFace = getEmbeddedFontFace();
  const heatmap = renderHeatmap(github.weeks, contentLeft, contentWidth, githubY + 160, contributionYear);

  const trackRows = (spotify.tracks || []).length
    ? (spotify.tracks || [])
        .map((track, index) => renderTrackRow(track, index, 58 + index * 56, contentLeft, contentWidth))
        .join('')
    : `<text x="${panelCenterX}" y="92" text-anchor="middle" font-family="${FONT_MONO}" font-size="12" fill="${THEME.textMuted}">${escapeXml(spotify.error || 'No recent tracks.')}</text>`;

  const githubError = github.error
    ? `<text x="${panelCenterX}" y="${githubY + 290}" text-anchor="middle" font-family="${FONT_MONO}" font-size="11" fill="${THEME.textDim}">${escapeXml(github.error)}</text>`
    : '';

  const statCol1 = PADDING + panelInnerWidth / 6;
  const statCol2 = panelCenterX;
  const statCol3 = PADDING + (panelInnerWidth * 5) / 6;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-label="GitHub and Spotify profile card for ${escapeXml(github.username)}">
  <title>GitHub + Spotify · ${escapeXml(github.username)}</title>
  <style>${fontFace}${animatedOceanStyles()}</style>
  <defs>
    ${animatedOceanDefs(WIDTH, height)}
    <filter id="heatmap-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <g clip-path="url(#card-clip)">
    ${renderAnimatedOceanBackground(WIDTH, height)}
    ${renderAsciiBackdrop(WIDTH, height)}
  </g>

  ${glassPanel(PADDING, githubY, panelInnerWidth, githubPanelHeight)}
  <text x="${panelCenterX}" y="${githubY + 38}" text-anchor="middle" font-family="${FONT_MONO}" font-size="10" fill="${THEME.textMuted}" letter-spacing="0.22em">GITHUB</text>

  ${statBlock(statCol1, githubY + 66, 'TOTAL CONTRIBUTIONS', github.totalContributions.toLocaleString('en-US'))}
  ${statBlock(statCol2, githubY + 66, 'CURRENT STREAK', `${github.currentStreak} days`)}
  ${statBlock(statCol3, githubY + 66, 'LONGEST STREAK', `${github.longestStreak} days`)}

  <text x="${panelCenterX}" y="${githubY + 148}" text-anchor="middle" font-family="${FONT_MONO}" font-size="10" fill="${THEME.textMuted}" letter-spacing="0.16em">${escapeXml(heatmap.label)}</text>
  ${heatmap.markup}
  ${githubError}

  ${glassPanel(PADDING, spotifyY, panelInnerWidth, spotifyPanelHeight)}
  <text x="${panelCenterX}" y="${spotifyY + 34}" text-anchor="middle" font-family="${FONT_ENDLESS}" font-size="20" fill="${THEME.text}">Recently Played</text>
  <rect x="${contentLeft}" y="${spotifyY + 48}" width="${contentWidth}" height="1" fill="rgba(255,255,255,0.06)"/>
  <g transform="translate(0, ${spotifyY})">${trackRows}</g>
</svg>`;
};
