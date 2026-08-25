import Head from 'next/head';
import Link from 'next/link';
import { getAllPosts } from '../../lib/blog';
import { format } from 'date-fns';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://akshatshh.vercel.app';

const BLOG_TITLE = 'Blog · Akshat Sharma';
const BLOG_DESCRIPTION =
  'Personal writing and long-form notes from Akshat Sharma — projects, community events, and the craft behind them.';
const BLOG_URL = `${SITE_URL}/blog`;
const BLOG_IMAGE = `${SITE_URL}/images/ascii/real_pfp.jpg`;

export default function BlogIndex({ posts }) {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    author: {
      '@type': 'Person',
      name: 'Akshat Sharma',
      url: SITE_URL,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date || undefined,
      description: post.excerpt || undefined,
    })),
  };

  return (
    <>
      <Head>
        <title>{BLOG_TITLE}</title>
        <meta name="description" content={BLOG_DESCRIPTION} />
        <link rel="canonical" href={BLOG_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={BLOG_TITLE} />
        <meta property="og:description" content={BLOG_DESCRIPTION} />
        <meta property="og:url" content={BLOG_URL} />
        <meta property="og:image" content={BLOG_IMAGE} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={BLOG_TITLE} />
        <meta name="twitter:description" content={BLOG_DESCRIPTION} />
        <meta name="twitter:image" content={BLOG_IMAGE} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="mb-16">
            <Link
              href="/"
              className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
            >
              ← Back home
            </Link>
            <h1 className="text-5xl md:text-6xl font-light tracking-tighter mb-4 text-neutral-100">
              Blog
            </h1>
            <div className="h-px w-24 bg-neutral-800"></div>
          </div>

          <div className="space-y-12">
            {posts.length === 0 ? (
              <div className="text-neutral-500 text-lg">
                No posts yet. Check back soon.
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.slug}
                  className="group transition-opacity duration-300 hover:opacity-80"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="space-y-3">
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-md mb-3"
                        />
                      )}
                      {post.date && (
                        <time
                          dateTime={post.date}
                          className="text-sm text-neutral-400 font-mono"
                        >
                          {format(new Date(post.date), 'MMMM d, yyyy')}
                        </time>
                      )}
                      <h2 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-100 group-hover:text-cyan-400 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-neutral-300 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-neutral-300 border border-neutral-700 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const posts = getAllPosts();
  return {
    props: { posts },
  };
}
