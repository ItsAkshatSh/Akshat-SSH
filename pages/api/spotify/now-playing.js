import {
  fetchSpotifyTracks,
  refreshSpotifyAccessToken,
} from '../../../lib/githubProfile/fetchSpotifyTracks';

const TRACK_LIMIT = 1;

// Spotify serves one image id in several sizes; the six-digit segment before
// the hash picks the size. Ask for the 640px cut instead of the 64px one the
// GitHub-profile proxy embeds.
const SIZE_UPGRADES = [
  ['ab67616d00004851', 'ab67616d0000b273'], // 64 -> 640
  ['ab67616d00001e02', 'ab67616d0000b273'], // 300 -> 640
];

const upgradeArt = (url) => {
  if (!url) return '';
  return SIZE_UPGRADES.reduce((out, [from, to]) => out.replace(from, to), url);
};

// oEmbed needs no credentials and returns a 300px thumbnail for a track URL,
// which the size upgrade turns into the full 640px cover.
const fetchOEmbedArt = async (trackUrl) => {
  if (!trackUrl) return '';
  try {
    const response = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return '';
    const data = await response.json();
    return upgradeArt(data.thumbnail_url || '');
  } catch {
    return '';
  }
};

const toTrack = (track) => ({
  title: track?.name || '',
  artist: (track?.artists || []).map((artist) => artist.name).join(', '),
  url: track?.external_urls?.spotify || '',
  albumArt: upgradeArt(
    track?.album?.images?.[0]?.url || track?.album?.images?.[2]?.url || ''
  ),
});

/**
 * Public, read-only summary for the hero's listening line. When credentials
 * are present, the current track (or the most recent one) is returned;
 * otherwise it falls back to the same recently played source the GitHub
 * profile GIF is built from. Only the latest track is returned.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const accessToken = await refreshSpotifyAccessToken();
    let track = null;
    let isPlaying = false;

    if (accessToken) {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [nowResponse, recentResponse] = await Promise.all([
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers,
          cache: 'no-store',
        }),
        fetch(
          `https://api.spotify.com/v1/me/player/recently-played?limit=${TRACK_LIMIT}`,
          { headers, cache: 'no-store' }
        ),
      ]);

      // 204 means nothing is playing right now.
      if (nowResponse.status === 200) {
        const now = await nowResponse.json();
        if (now?.item) {
          isPlaying = Boolean(now.is_playing);
          track = toTrack(now.item);
        }
      }

      if (!track && recentResponse.ok) {
        const recent = await recentResponse.json();
        const latest = (recent.items || [])[0];
        if (latest?.track) track = toTrack(latest.track);
      }
    }

    // No live data: use the GitHub profile GIF's Spotify source (works through
    // its readme proxy, so the hero still has something to show).
    if (!track) {
      const fallback = await fetchSpotifyTracks();
      const latest = (fallback.tracks || [])[0];
      if (latest?.title) {
        track = {
          title: latest.title || '',
          artist: latest.artist || '',
          url: latest.url || '',
          albumArt: latest.albumArt || '',
        };
      }
    }

    // The proxy only embeds a 64px thumbnail; trade it for the 640px cover.
    if (track && (!track.albumArt || track.albumArt.startsWith('data:'))) {
      track.albumArt = (await fetchOEmbedArt(track.url)) || track.albumArt;
    }

    return res.status(200).json({
      isPlaying,
      tracks: track ? [track] : [],
    });
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    return res.status(200).json({ isPlaying: false, tracks: [] });
  }
}
