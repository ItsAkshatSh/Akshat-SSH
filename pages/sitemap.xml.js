/**
 * /sitemap.xml
 * Generated at request time. Includes the home page, the blog index,
 * and every blog post with its `lastmod` derived from the post's date.
 */
import { getAllPosts } from '../lib/blog';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://akshatshh.vercel.app';

const escapeXml = (unsafe) =>
  unsafe.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c])
  );

const generateSitemap = (posts) => {
  const staticEntries = [
    { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE_URL}/blog`, changefreq: 'weekly', priority: '0.8' },
  ];

  const postEntries = posts.map((post) => ({
    loc: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
    lastmod: post.date || new Date().toISOString(),
    changefreq: 'monthly',
    priority: '0.6',
  }));

  const urls = [...staticEntries, ...postEntries]
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${
      entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
    }
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

// Empty page component — the response is streamed via getServerSideProps.
export default function SiteMap() {
  return null;
}

export async function getServerSideProps({ res }) {
  let posts = [];
  try {
    posts = getAllPosts();
  } catch (err) {
    console.error('sitemap: failed to read blog posts', err);
  }

  const xml = generateSitemap(posts);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );
  res.write(xml);
  res.end();

  return { props: {} };
}
