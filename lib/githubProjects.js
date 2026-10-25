const GITHUB_API = 'https://api.github.com';
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif)$/i;
const BANNER_NAME = /(banner|header|cover|hero|thumbnail|preview|screenshot)/i;
const EXCLUDED_NAMES = new Set([
  'akshat-ssh',
  'itsakshatsh',
  'share.',
  'devhud',
  'test',
  'tests',
  'dotfiles',
  'config',
]);
const FEATURED_NAMES = ['bathunt', 'thedeck'];

function githubHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };
}

async function githubFetch(path) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: githubHeaders(),
  });
  if (!response.ok) return null;
  return response.json();
}

function decodeReadme(readme) {
  if (!readme?.content) return '';
  return Buffer.from(readme.content, 'base64').toString('utf8');
}

function normalizeReadmeImageUrl(repo, url) {
  if (!url) return null;
  if (url.startsWith('http')) {
    return url.includes('github.com/') && url.includes('/blob/')
      ? url.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/')
      : url;
  }
  return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${url.replace(/^\.?\//, '')}`;
}

function readmeDescription(markdown) {
  const paragraphs = markdown
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .split(/\n\s*\n/)
    .map((part) => part.replace(/[#>*_~-]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((part) => part.length > 45 && !/^(made with|built with|license|installation|controls)/i.test(part));
  return paragraphs[0]?.slice(0, 260) || '';
}

function scoreRepository(repo) {
  const age = Math.max(0, Date.now() - new Date(repo.pushed_at).getTime());
  const freshness = Math.max(0, 180 - age / 86400000);
  const signal = Math.min(repo.stargazers_count || 0, 25) * 2;
  const substance = repo.size > 20 ? 18 : 0;
  const language = repo.language ? 10 : 0;
  return freshness + signal + substance + language;
}

async function findBanner(repo) {
  const readme = await githubFetch(`/repos/${repo.full_name}/readme`);
  const readmeMarkdown = decodeReadme(readme);
  const readmeImage = readmeMarkdown.match(
    /!\[[^\]]*]\((https?:\/\/[^)\s]+)\)|<img[^>]+src=["']([^"']+)["']/i
  );
  const readmeUrl = normalizeReadmeImageUrl(repo, readmeImage?.[1] || readmeImage?.[2]);
  if (readmeUrl && !readmeUrl.includes('img.shields.io') && IMAGE_EXTENSIONS.test(readmeUrl.split('?')[0])) {
    return { url: readmeUrl, readmeMarkdown };
  }

  const tree = await githubFetch(
    `/repos/${repo.full_name}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`
  );
  if (!tree || !Array.isArray(tree.tree)) return { url: null, readmeMarkdown };

  const images = tree.tree.filter(
    (entry) => entry.type === 'blob' && IMAGE_EXTENSIONS.test(entry.path)
  );
  const rankedImages = images.map((image) => {
    const name = image.path.split('/').pop();
    return {
      image,
      score:
        (BANNER_NAME.test(name) ? 20 : 0) +
        (name.toLowerCase().endsWith('.gif') ? 5 : 0),
    };
  }).sort((a, b) => b.score - a.score);
  const preferred = rankedImages[0]?.score > 0 ? rankedImages[0].image : null;

  return {
    url: preferred
      ? `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${preferred.path}`
      : null,
    readmeMarkdown,
  };
}

function toProject(repo, artwork, index) {
  const technologies = [
    repo.language,
    ...(Array.isArray(repo.topics) ? repo.topics.slice(0, 4) : []),
  ].filter(Boolean);

  return {
    id: repo.name,
    title: repo.name.replace(/[-_]/g, ' '),
    subtitle: repo.description || `${repo.language || 'Open-source'} project`,
    date: new Date(repo.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    link: repo.html_url,
    stack: [...new Set(technologies)].slice(0, 5),
    desc: repo.description || readmeDescription(artwork.readmeMarkdown) || 'A project from my public GitHub archive.',
    banner: artwork.url,
    mark: repo.name.slice(0, 2).toUpperCase(),
    accent: index % 3,
    mockup: {
      language: repo.language || 'BUILD',
      topics: technologies.slice(0, 3),
    },
  };
}

export async function getGithubProjects() {
  const repositories = await githubFetch(
    `/users/${encodeURIComponent(process.env.GITHUB_USERNAME || 'ItsAkshatSh')}/repos?per_page=100&sort=updated`
  );
  if (!Array.isArray(repositories)) return [];

  const candidates = repositories
    .filter((repo) => !repo.fork && !repo.archived && !EXCLUDED_NAMES.has(repo.name.toLowerCase()))
    .sort((a, b) => {
      const aFeatured = FEATURED_NAMES.indexOf(a.name.toLowerCase());
      const bFeatured = FEATURED_NAMES.indexOf(b.name.toLowerCase());
      if (aFeatured !== -1 || bFeatured !== -1) {
        if (aFeatured === -1) return 1;
        if (bFeatured === -1) return -1;
        return aFeatured - bFeatured;
      }
      return scoreRepository(b) - scoreRepository(a);
    })
    .slice(0, 8);

  const projects = await Promise.all(
    candidates.map(async (repo, index) => toProject(repo, await findBanner(repo), index))
  );

  return projects;
}
