import Head from 'next/head';
import Link from 'next/link';
import { getAllPostSlugs, getPostBySlug } from '../../lib/blog';
import { format } from 'date-fns';
import MarkdownContent from '../../components/blog/MarkdownContent';

export default function BlogPost({ post }) {
  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">Post not found</h1>
          <Link href="/blog" className="text-cyan-400 hover:text-cyan-300 underline">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} — akshat.ssh</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <Link
            href="/blog"
            className="inline-flex items-center text-neutral-500 hover:text-neutral-300 transition-colors mb-12 text-sm"
          >
            ← Back to blog
          </Link>

          <header className="mb-12 space-y-4">
            {post.date && (
              <time
                dateTime={post.date}
                className="text-sm text-neutral-500 font-mono block"
              >
                {format(new Date(post.date), 'MMMM d, yyyy')}
              </time>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-neutral-100 leading-tight">
              {post.title}
            </h1>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-neutral-600 border border-neutral-800 px-3 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="h-px w-24 bg-neutral-800 mt-8"></div>
          </header>

          <div className="prose-wrapper">
            <MarkdownContent content={post.content} />
          </div>

          <footer className="mt-16 pt-8 border-t border-neutral-800">
            <Link
              href="/blog"
              className="inline-flex items-center text-neutral-500 hover:text-neutral-300 transition-colors text-sm"
            >
              ← Back to blog
            </Link>
          </footer>
        </article>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const slugs = getAllPostSlugs();
  const paths = slugs.map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  return {
    props: {
      post,
    },
  };
}



