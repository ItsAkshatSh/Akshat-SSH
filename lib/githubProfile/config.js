export const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'ItsAkshatSh';

export const SPOTIFY_TRACK_COUNT = Number(process.env.SPOTIFY_TRACK_COUNT || 5);

export const SPOTIFY_PROXY_URL =
  process.env.SPOTIFY_RECENTLY_PLAYED_URL ||
  'https://spotify-recently-played-readme.vercel.app/api?user=31wdtishcujpgv47o2y4ip3vvaba&count=5';

export const PROFILE_SITE_URL =
  process.env.PROFILE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.akshaaaat.xyz';

export const PROFILE_SECRET = process.env.GITHUB_PROFILE_SECRET || '';

export const CACHE_SECONDS = Number(process.env.GITHUB_PROFILE_CACHE_SECONDS || 900);

export const THEME = {
  bg: '#060a10',
  bgDeep: '#070707',
  surface: '#0a0f16',
  surfaceRaised: '#0f141c',
  border: 'rgba(255,255,255,0.08)',
  text: '#f5f5f5',
  textMuted: '#a3a3a3',
  textDim: '#7d8b9c',
  accent: '#5a8c80',
  spotify: '#1db954',
  godRay: 'rgba(255, 224, 196, 0.055)',
};
