import { getGithubProjects } from '../../lib/githubProjects';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const projects = await getGithubProjects();
    if (!projects.length) return res.status(502).json({ error: 'GitHub projects unavailable' });

    res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate=86400');
    return res.status(200).json({ projects, refreshedAt: new Date().toISOString() });
  } catch (error) {
    console.error('GitHub projects refresh failed:', error);
    return res.status(502).json({ error: 'GitHub projects unavailable' });
  }
}
