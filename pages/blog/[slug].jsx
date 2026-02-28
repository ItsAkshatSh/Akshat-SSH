import Head from 'next/head';
import { getAllPosts, getPostContent } from '../../lib/blog';
import { format } from 'date-fns';

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.data.title} — akshat.ssh</title>
        <meta name="description" content={post.data.excerpt || ''} />
      </Head>

      <article className="prose prose-invert max-w-3xl mx-auto px-6 md:px-8 py-16">
        <h1>{post.data.title}</h1>
        {post.data.date && (
          <time dateTime={post.data.date}>
            {format(new Date(post.data.date), 'MMMM d, yyyy')}
          </time>
        )}

        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>
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