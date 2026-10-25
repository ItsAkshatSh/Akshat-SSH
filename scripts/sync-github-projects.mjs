import fs from 'node:fs/promises';
import path from 'node:path';

const username = process.env.GITHUB_USERNAME || 'ItsAkshatSh';
const token = process.env.GITHUB_TOKEN;
const root = process.cwd();
const outputDir = path.join(root, 'public', 'images', 'projects');
const outputData = path.join(root, 'public', 'projects.json');
const excluded = new Set(['akshat-ssh', 'itsakshatsh', 'share.', 'devhud', 'test', 'tests', 'dotfiles', 'config']);
const featured = ['bathunt', 'thedeck'];
const imagePattern = /\.(png|jpe?g|webp|gif)$/i;

const headers = {
  Accept: 'application/vnd.github+json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function github(pathname) {
  const response = await fetch(`https://api.github.com${pathname}`, { headers });
  if (!response.ok) throw new Error(`GitHub request failed: ${response.status} ${pathname}`);
  return response.json();
}

function rawUrl(repo, file) {
  return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${file}`;
}

function normalizeImageUrl(url) {
  if (!url) return null;
  if (url.includes('github.com/') && url.includes('/blob/')) {
    return url.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/');
  }
  return url;
}

function description(repo, readme) {
  if (repo.description) return repo.description;
  const text = Buffer.from(readme.content || '', 'base64').toString('utf8')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ');
  return text.match(/[A-Z][^.?!]{45,220}[.?!]/)?.[0] || 'A project from my public GitHub archive.';
}

async function syncRepo(repo) {
  const [tree, readme] = await Promise.all([
    github(`/repos/${repo.full_name}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`),
    github(`/repos/${repo.full_name}/readme`).catch(() => ({})),
  ]);
  const readmeText = Buffer.from(readme.content || '', 'base64').toString('utf8');
  const readmeImage = readmeText.match(
    /!\[[^\]]*]\((https?:\/\/[^)\s]+)\)|<img[^>]+src=["']([^"']+)["']/i
  );
  const readmeBannerCandidate = normalizeImageUrl(readmeImage?.[1] || readmeImage?.[2]);
  const readmeBannerUrl = readmeBannerCandidate && readmeBannerCandidate.startsWith('http')
    ? readmeBannerCandidate
    : readmeBannerCandidate
      ? rawUrl(repo, readmeBannerCandidate.replace(/^\.?\//, ''))
      : null;
  const readmeBanner = readmeBannerCandidate &&
    !readmeBannerUrl.includes('img.shields.io') &&
    imagePattern.test(new URL(readmeBannerUrl).pathname)
    ? readmeBannerUrl
    : null;
  const files = (tree.tree || []).filter((entry) => entry.type === 'blob' && imagePattern.test(entry.path));
  const rankedFiles = files.sort((a, b) => {
    const score = (file) => {
      const name = file.path.split('/').pop();
      return (/banner|header|cover|hero|preview|screenshot/i.test(name) ? 20 : 0) +
        (name.toLowerCase().endsWith('.gif') ? 5 : 0);
    };
    return score(b) - score(a);
  });
  const banner = readmeBanner || (rankedFiles[0] && /banner|header|cover|hero|preview|screenshot/i.test(rankedFiles[0].path)
    ? rawUrl(repo, rankedFiles[0].path)
    : null);
  let localBanner = null;
  if (banner) {
    try {
      const response = await fetch(banner.startsWith('http') ? banner : rawUrl(repo, banner.path));
      if (response.ok) {
        const extension = path.extname(new URL(banner).pathname).toLowerCase() || '.png';
        localBanner = `${repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${extension}`;
        await fs.writeFile(path.join(outputDir, localBanner), Buffer.from(await response.arrayBuffer()));
      }
    } catch (error) {
      console.warn(`Skipping artwork for ${repo.name}: ${error.message}`);
    }
  }
  return {
    id: repo.name,
    title: repo.name.replace(/[-_]/g, ' '),
    subtitle: repo.description || `${repo.language || 'Open-source'} project`,
    date: new Date(repo.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    link: repo.html_url,
    stack: [...new Set([repo.language, ...(repo.topics || [])].filter(Boolean))].slice(0, 5),
    desc: description(repo, readme),
    banner: localBanner ? `/images/projects/${localBanner}` : null,
    mark: repo.name.slice(0, 2).toUpperCase(),
    accent: Math.abs(repo.name.length) % 3,
  };
}

const repos = await github(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
const candidates = repos
  .filter((repo) => !repo.fork && !repo.archived && !excluded.has(repo.name.toLowerCase()))
  .sort((a, b) => {
    const aFeatured = featured.indexOf(a.name.toLowerCase());
    const bFeatured = featured.indexOf(b.name.toLowerCase());
    if (aFeatured !== -1 || bFeatured !== -1) return (aFeatured === -1 ? 99 : aFeatured) - (bFeatured === -1 ? 99 : bFeatured);
    return new Date(b.pushed_at) - new Date(a.pushed_at);
  })
  .slice(0, 8);
await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });
const projects = (await Promise.all(candidates.map(async (repo) => {
  try {
    return await syncRepo(repo);
  } catch (error) {
    console.warn(`Skipping ${repo.name}: ${error.message}`);
    return null;
  }
}))).filter(Boolean);
if (!projects.length) throw new Error('No projects were synced.');
await fs.writeFile(outputData, `${JSON.stringify({ refreshedAt: new Date().toISOString(), projects }, null, 2)}\n`);
console.log(`Synced ${projects.length} GitHub projects.`);
