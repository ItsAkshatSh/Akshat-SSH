import Head from 'next/head';
import Link from 'next/link';
import { getAllPosts } from '../../lib/blog';
import { format } from 'date-fns';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://akshaaaat.xyz';

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

      <div className="min-h-dvh bg-ink text-bone">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="mb-16">
            <Link
              href="/"
              className="inline-flex items-center text-muted-warm hover:text-accent transition-colors mb-8 text-sm"
            >
              ← Back home
            </Link>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-accent mb-4">
              Journal
            </p>
            <h1 className="font-display text-6xl md:text-7xl tracking-[-0.01em] mb-5 text-bone">
              Blog
            </h1>
            <div className="ink-rule w-32"></div>
          </div>

          <div className="space-y-12">
            {posts.length === 0 ? (
              <div className="text-muted-warm text-lg">
                No posts yet. Check back soon.
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.slug}
                  className="group border-l-2 border-transparent hover:border-[color:var(--accent)] pl-4 sm:pl-6 -ml-4 sm:-ml-6 transition-colors duration-300"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="space-y-3">
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-xl mb-3"
                        />
                      )}
                      {post.date && (
                        <time
                          dateTime={post.date}
                          className="text-[11px] tracking-[0.22em] uppercase text-muted-warm font-mono"
                        >
                          {format(new Date(post.date), 'MMMM d, yyyy')}
                        </time>
                      )}
                      <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em] text-bone group-hover:text-accent transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-warm leading-[1.8]">
                          {post.excerpt}
                        </p>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] tracking-[0.12em] uppercase text-muted-warm border-hair border px-2 py-1 rounded-full"
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
