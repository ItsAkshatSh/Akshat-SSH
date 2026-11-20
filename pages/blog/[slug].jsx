import Head from 'next/head';
import Link from 'next/link';
import { getAllPosts, getPostContent } from '../../lib/blog';
import { format } from 'date-fns';
import PostErrorBoundary from '../../components/utilities/ErrorBoundary';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://akshaaaat.xyz';

export default function BlogPost({ post, slug }) {
  const { data, contentHtml } = post;
  const url = `${SITE_URL}/blog/${slug}`;
  const title = `${data.title} · Akshat Sharma`;
  const description =
    data.excerpt ||
    `${data.title} - a blog post by Akshat Sharma.`;
  const image = data.image
    ? data.image.startsWith('http')
      ? data.image
      : `${SITE_URL}${data.image}`
    : `${SITE_URL}/images/ascii/real_pfp.jpg`;

  const postSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description,
    url,
    image,
    datePublished: data.date || undefined,
    dateModified: data.date || undefined,
    author: {
      '@type': 'Person',
      name: 'Akshat Sharma',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Akshat Sharma',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: (data.tags || []).join(', ') || undefined,
  };

  const hasMeta = Boolean(data.date || data.tags?.length);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        {data.date && (
          <meta property="article:published_time" content={data.date} />
        )}
        <meta property="article:author" content="Akshat Sharma" />
        {(data.tags || []).map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(postSchema) }}
        />
      </Head>

      {/* Flat ink reading surface: no living canvas behind long-form text. */}
      <div id="app-root" className="blog-surface relative min-h-dvh text-bone">
        <main className="relative mx-auto min-h-dvh w-full max-w-4xl px-6 sm:px-10 md:px-12 pb-28 pt-10 sm:pt-14 md:pt-16">
          <header>
            <Link
              href="/blog"
              className="font-mono text-[11px] uppercase text-muted-warm transition-colors duration-200 hover:text-bone"
            >
              All writing
            </Link>
          </header>

          <article className="pt-12 md:pt-16">
            <h1 className="max-w-3xl text-balance font-display text-[clamp(2.25rem,5.5vw,3.6rem)] leading-[1.08]">
              {data.title}
            </h1>

            {hasMeta && (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase text-muted-warm">
                {data.date && (
                  <time dateTime={data.date} className="tabular-nums">
                    {format(new Date(data.date), 'd MMM yyyy')}
                  </time>
                )}
                {data.date && data.tags?.length > 0 && (
                  <span aria-hidden="true">·</span>
                )}
                {data.tags?.length > 0 && (
                  <span>{data.tags.slice(0, 3).join(' · ')}</span>
                )}
              </p>
            )}

            <div className="prose-wrapper mt-12 max-w-3xl border-t border-hair pt-10">
              <PostErrorBoundary>
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              </PostErrorBoundary>
            </div>

            <footer className="mt-16 max-w-3xl border-t border-hair pt-8">
              <Link
                href="/blog"
                className="font-mono text-[11px] uppercase text-muted-warm transition-colors duration-200 hover:text-bone"
              >
                More writing
              </Link>
            </footer>
          </article>
        </main>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const posts = getAllPosts();
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const post = await getPostContent(params.slug);
  return { props: { post, slug: params.slug } };
}
