/**
 * Hidden capture page for GIF generation. Renders the animated profile SVG
 * inline so Playwright can screenshot CSS animation frames.
 */
import Head from 'next/head';
import { PROFILE_SECRET } from '../lib/githubProfile/config';
import { fetchGitHubStats } from '../lib/githubProfile/fetchGitHubStats';
import { fetchSpotifyTracks } from '../lib/githubProfile/fetchSpotifyTracks';
import { generateGithubProfileSvg } from '../lib/githubProfile/generateSvg';

export default function GithubGifSourcePage({ svg, unauthorized }) {
  if (unauthorized) {
    return (
      <>
        <Head>
          <title>Unauthorized</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <p>Unauthorized</p>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>GIF source</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div
        id="github-gif-capture"
        style={{ background: '#060a10', display: 'inline-block', lineHeight: 0 }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </>
  );
}

export async function getServerSideProps({ query }) {
  if (PROFILE_SECRET && query.key !== PROFILE_SECRET) {
    return { props: { unauthorized: true, svg: '' } };
  }

  const [github, spotify] = await Promise.all([fetchGitHubStats(), fetchSpotifyTracks()]);
  const svg = generateGithubProfileSvg({ github, spotify });

  return {
    props: {
      unauthorized: false,
      svg,
    },
  };
}
