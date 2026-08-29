import { SPOTIFY_PROXY_URL, SPOTIFY_TRACK_COUNT } from './config';
import { decodeHtmlEntities, formatRelativeTime } from './utils';

const emptyTracks = (errorMessage) => ({
  tracks: [],
  error: errorMessage,
});

async function refreshSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) return null;
  const payload = await response.json();
  return payload.access_token || null;
}

async function fetchSpotifyTracksDirect() {
  const accessToken = await refreshSpotifyAccessToken();
  if (!accessToken) return null;

  const response = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${SPOTIFY_TRACK_COUNT}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) return null;

  const payload = await response.json();
  const tracks = (payload.items || []).map(({ track, played_at: playedAt }) => ({
    title: track?.name || 'Unknown track',
    artist: (track?.artists || []).map((artist) => artist.name).join(', ') || 'Unknown artist',
    albumArt: track?.album?.images?.[2]?.url || track?.album?.images?.[0]?.url || '',
    url: track?.external_urls?.spotify || '',
    playedAt,
    playedAgo: formatRelativeTime(playedAt),
  }));

  return { tracks, error: null };
}

function parseTracksFromProxySvg(svg) {
  const tracks = [];
  const rowPattern =
    /<a[^>]*href="(https:\/\/open\.spotify\.com\/track\/[^"]+)"[^>]*>[\s\S]*?<text[^>]*class="[^"]*-t"[^>]*>([^<]+)<\/text>[\s\S]*?<\/a>[\s\S]*?<text[^>]*x="60"[^>]*y="[^"]+"[^>]*>([^<]+)<\/text>[\s\S]*?<text[^>]*text-anchor="end"[^>]*>([^<]+)<\/text>/g;

  let match = rowPattern.exec(svg);
  while (match && tracks.length < SPOTIFY_TRACK_COUNT) {
    tracks.push({
      title: decodeHtmlEntities(match[2].trim()),
      artist: decodeHtmlEntities(match[3].trim()),
      url: match[1],
      playedAgo: match[4].trim(),
      albumArt: '',
      playedAt: null,
    });
    match = rowPattern.exec(svg);
  }

  if (tracks.length === 0) {
    const ariaMatches = [...svg.matchAll(/aria-label="([^"]+?) on Spotify"/g)];
    for (const [, label] of ariaMatches.slice(0, SPOTIFY_TRACK_COUNT)) {
      tracks.push({
        title: label.trim(),
        artist: '',
        url: '',
        playedAgo: '',
        albumArt: '',
        playedAt: null,
      });
    }
  }

  const imagePattern =
    /<image[^>]*y="(\d+)"[^>]*href="(data:image\/[^"]+|https:\/\/[^"]+)"/g;
  const images = [...svg.matchAll(imagePattern)].map(([, y, href]) => ({
    y: Number(y),
    href,
  }));

  for (let i = 0; i < tracks.length; i += 1) {
    if (images[i]?.href) {
      tracks[i].albumArt = images[i].href;
    }
  }

  return tracks;
}

async function fetchSpotifyTracksFromProxy() {
  const response = await fetch(SPOTIFY_PROXY_URL, {
    headers: { 'User-Agent': 'akshat-github-profile-svg' },
  });

  if (!response.ok) {
    return emptyTracks(`Spotify proxy error (${response.status}).`);
  }

  const svg = await response.text();
  const tracks = parseTracksFromProxySvg(svg);

  if (!tracks.length) {
    return emptyTracks('Could not parse recently played tracks from Spotify proxy.');
  }

  return { tracks, error: null };
}

export async function fetchSpotifyTracks() {
  try {
    const direct = await fetchSpotifyTracksDirect();
    if (direct?.tracks?.length) {
      return direct;
    }

    return await fetchSpotifyTracksFromProxy();
  } catch (error) {
    return emptyTracks(error.message || 'Failed to fetch Spotify tracks.');
  }
}
