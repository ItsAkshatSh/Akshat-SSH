import Head from 'next/head';
import Link from 'next/link';
import { getAllPosts, getPostContent } from '../../lib/blog';
import { format } from 'date-fns';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://akshaaaat.xyz';

export default function BlogPost({ post, slug }) {
  const { data, contentHtml } = post;
  const url = `${SITE_URL}/blog/${slug}`;
  const title = `${data.title} · Akshat Sharma`;
  const description =
    data.excerpt ||
    `${data.title} — a blog post by Akshat Sharma.`;
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

      <div className="min-h-dvh bg-ink text-bone">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <Link
            href="/blog"
            className="inline-flex items-center text-muted-warm hover:text-accent transition-colors mb-10 text-sm"
          >
            ← All posts
          </Link>

          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-accent mb-4">
            Journal
          </p>
          <h1 className="font-display text-4xl md:text-6xl tracking-[-0.01em] leading-[1.05] text-bone mb-5">
            {data.title}
          </h1>
          {data.date && (
            <time
              dateTime={data.date}
              className="block text-[11px] tracking-[0.22em] uppercase text-muted-warm font-mono mb-6"
            >
              {format(new Date(data.date), 'MMMM d, yyyy')}
            </time>
          )}
          <div className="ink-rule w-28 mb-10"></div>

          <div
            className="prose-wrapper"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
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
