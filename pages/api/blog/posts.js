import { getAllPosts, getPostContent } from '../../../lib/blog';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const posts = await Promise.all(
      getAllPosts().map(async (post) => {
        const { data, content, contentHtml } = await getPostContent(post.slug);
        return {
          ...post,
          ...data,
          content,
          contentHtml,
        };
      })
    );
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Error fetching blog posts' });
  }
}


