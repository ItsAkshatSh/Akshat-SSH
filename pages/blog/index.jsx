import Head from 'next/head';
import Link from 'next/link';
import { getAllPosts } from '../../lib/blog';
import { format } from 'date-fns';

export default function BlogIndex({ posts }) {
  return (
    <>
      <Head>
        <title>Blog — akshat.ssh</title>
        <meta name="description" content="Personal blog and thoughts" />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="mb-16">
            <Link
              href="/"
              className="inline-flex items-center text-neutral-500 hover:text-neutral-300 transition-colors mb-8 text-sm"
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
                      {post.date && (
                        <time
                          dateTime={post.date}
                          className="text-sm text-neutral-500 font-mono"
                        >
                          {format(new Date(post.date), 'MMMM d, yyyy')}
                        </time>
                      )}
                      <h2 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-100 group-hover:text-cyan-400 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-neutral-400 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-neutral-600 border border-neutral-800 px-2 py-1 rounded"
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
    props: {
      posts,
    },
  };
}



