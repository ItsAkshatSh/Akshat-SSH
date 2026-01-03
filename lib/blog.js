import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogDirectory = path.join(process.cwd(), 'content', 'blog');

export function getAllPostSlugs() {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(blogDirectory);
  return fileNames
    .filter((name) => name.endsWith('.md') && name.toLowerCase() !== 'readme.md')
    .map((name) => name.replace(/\.md$/, ''));
}

export function getPostBySlug(slug) {
  const fullPath = path.join(blogDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  let dateString = null;
  if (data.date) {
    dateString = data.date instanceof Date 
      ? data.date.toISOString() 
      : new Date(data.date).toISOString();
  }

  return {
    slug,
    content,
    title: data.title || slug,
    date: dateString,
    tags: data.tags || [],
    excerpt: data.excerpt || null,
  };
}

export function getAllPosts() {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post) => post !== null)
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      if (a.date) return -1;
      if (b.date) return 1;
      return b.slug.localeCompare(a.slug);
    });

  return posts;
}

