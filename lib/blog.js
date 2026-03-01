import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content', 'blog');

function normalizeDate(dateValue) {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : dateValue.toISOString();
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

export function getAllPosts() {
  const filenames = fs.readdirSync(postsDirectory);
  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: filename.replace(/\.md$/, ''),
      title: data.title,
      date: normalizeDate(data.date),
      excerpt: data.excerpt,
      tags: data.tags || [],
      image: data.image || null,
      content,
    };
  });

  posts.sort((a, b) => {
    const leftDate = a.date ? new Date(a.date).getTime() : 0;
    const rightDate = b.date ? new Date(b.date).getTime() : 0;
    return rightDate - leftDate;
  });
  return posts;
}

export async function getPostContent(slug) {
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();
    
    return {
      data: {
        ...data,
        date: normalizeDate(data.date),
      },
      contentHtml,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    throw error;
  }
}