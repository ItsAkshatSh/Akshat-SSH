import Head from 'next/head';
import Link from 'next/link';
import { getAllPosts, getPostContent } from '../../lib/blog';
import { format } from 'date-fns';

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.data.title} — akshat.ssh</title>
        <meta name="description" content={post.data.excerpt || ''} />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <Link
            href="/blog"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-10 text-sm"
          >
            ← All posts
          </Link>

          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-neutral-50 mb-3">
            {post.data.title}
          </h1>
          {post.data.date && (
            <time
              dateTime={post.data.date}
              className="block text-sm text-neutral-400 font-mono mb-10"
            >
              {format(new Date(post.data.date), 'MMMM d, yyyy')}
            </time>
          )}

          <div
            className="prose-wrapper"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
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
  return { props: { post } };
}