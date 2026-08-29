export const getContributionYear = () => new Date().getUTCFullYear();

export const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const decodeHtmlEntities = (value) =>
  String(value ?? '')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

export const truncate = (value, max) => {
  const text = String(value ?? '');
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
};

export const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
  const playedAt = new Date(isoDate);
  if (Number.isNaN(playedAt.getTime())) return '';

  const diffMs = Date.now() - playedAt.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const contributionLevel = (count) => {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
};

const HEATMAP_COLORS = [
  'rgba(255,255,255,0.035)',
  'rgba(72, 118, 108, 0.45)',
  'rgba(90, 150, 135, 0.62)',
  'rgba(130, 200, 180, 0.82)',
  'rgba(185, 240, 220, 0.98)',
];

export const contributionColor = (level) => HEATMAP_COLORS[level] || HEATMAP_COLORS[0];

export const contributionCellAttrs = (level) => {
  if (level >= 4) {
    return 'filter="url(#heatmap-glow)" stroke="rgba(210,255,240,0.35)" stroke-width="0.5"';
  }
  if (level >= 2) {
    return 'stroke="rgba(255,255,255,0.04)" stroke-width="0.35"';
  }
  return '';
};

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const monthLabelsForWeeks = (weeks) => {
  const labels = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDate = week.contributionDays?.[0]?.date;
    if (!firstDate) return;

    const month = new Date(`${firstDate}T00:00:00Z`).getUTCMonth();
    if (month !== lastMonth) {
      labels.push({ weekIndex, label: MONTHS[month] });
      lastMonth = month;
    }
  });

  return labels;
};
