import Head from 'next/head';
import Link from 'next/link';
import { getAllPosts } from '../../lib/blog';
import { format } from 'date-fns';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://akshaaaat.xyz';

const BLOG_TITLE = 'Blog · Akshat Sharma';
const BLOG_DESCRIPTION =
  'Personal writing and long-form notes from Akshat Sharma: projects, community events, and the craft behind them.';
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

      <div id="app-root" className="blog-surface relative min-h-dvh text-bone">
        <div className="relative mx-auto max-w-5xl px-6 sm:px-10 md:px-12 pb-28 pt-10 sm:pt-14 md:pt-16">
          <header>
            <Link
              href="/"
              className="font-mono text-[11px] uppercase text-muted-warm transition-colors duration-200 hover:text-bone"
            >
              Home
            </Link>
          </header>

          <div className="mt-14 md:mt-20">
            <h1 className="max-w-2xl font-display text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.94] text-balance">
              Writing
            </h1>
            <p className="mt-5 max-w-xl text-[1.08rem] leading-[1.7] text-muted-warm text-pretty">
              Notes on building, community, and learning in public.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="mt-16 border-t border-hair pt-10">
              <p className="text-[1.05rem] leading-[1.7] text-muted-warm text-pretty">
                Nothing published yet. The first entry is still being written.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block font-mono text-[11px] uppercase text-muted-warm transition-colors duration-200 hover:text-bone"
              >
                Back home
              </Link>
            </div>
          ) : (
            <ul className="mt-14 divide-y divide-[color:var(--border)] border-y border-hair" role="list">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid grid-cols-1 gap-2.5 py-7 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-10 sm:py-8"
                  >
                    {post.date ? (
                      <time
                        dateTime={post.date}
                        className="font-mono text-[11px] uppercase leading-6 text-muted-warm tabular-nums sm:pt-1.5"
                      >
                        {format(new Date(post.date), 'd MMM yyyy')}
                      </time>
                    ) : (
                      <span className="hidden sm:block" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <h2 className="font-display text-balance text-[1.65rem] leading-[1.18] text-bone transition-opacity duration-200 group-hover:opacity-70 sm:text-[1.85rem]">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2.5 max-w-3xl text-pretty text-[1rem] leading-[1.7] text-muted-warm">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
