/**
 * BlogWindow
 * Full-screen overlay for the blog index and post reader. Fetches posts
 * from the API and swaps the header title when a post is opened.
 */
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import MarkdownContent from './MarkdownContent';
import ScrambleText from '../utilities/ScrambleText';
import SectionOverlay, { OverlayButton } from '../ui/SectionOverlay';

// Structural skeleton: three rows shaped like the real ones, so the list does
// not jump when the posts land.
const LoadingRows = () => (
  <div aria-hidden="true" className="divide-y divide-white/[0.06]">
    {[0, 1, 2].map((i) => (
      <div key={i} className="py-5 sm:py-6 flex items-start gap-6">
        <div className="h-3 w-8 shrink-0 rounded bg-white/[0.07]" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/5 rounded bg-white/[0.09]" />
          <div className="h-3 w-4/5 rounded bg-white/[0.06]" />
        </div>
        <div className="h-3 w-14 shrink-0 rounded bg-white/[0.06]" />
      </div>
    ))}
  </div>
);

const BlogWindow = ({ onClose }) => {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [selectedPost, setSelectedPost] = useState(null);

  const load = useCallback(() => {
    setStatus('loading');
    return fetch('/api/blog/posts')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setPosts([]);
        // A failed fetch is not an empty archive. Keep them separate states so
        // the reader is told which one they are looking at, and can retry.
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (selectedPost) setSelectedPost(null);
      else onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPost, onClose]);

  const title = selectedPost ? selectedPost.title : 'Blog';

  return (
    <SectionOverlay
      ariaLabel="Blog"
      onClose={onClose}
      onBackdropClose={() => (selectedPost ? setSelectedPost(null) : onClose?.())}
      zIndex={100}
      contentKey={selectedPost?.slug || 'index'}
      titleClassName="text-3xl sm:text-4xl md:text-5xl font-medium text-white tracking-[-0.02em] leading-[1.05] break-words"
      title={<ScrambleText text={title} active duration={850} />}
      headerActions={
        selectedPost ? (
          <OverlayButton onClick={() => setSelectedPost(null)} aria-label="Back to index">
            Index
          </OverlayButton>
        ) : null
      }
    >
      {selectedPost ? (
        <article>
          <div className="mb-8 pb-6 border-b border-white/[0.06] flex flex-wrap items-center gap-3 text-xs text-neutral-300">
            {selectedPost.date && (
              <time
                dateTime={selectedPost.date}
                className="font-mono tracking-[0.22em] uppercase tabular-nums"
              >
                {format(new Date(selectedPost.date), 'MMM d, yyyy')}
              </time>
            )}
            {selectedPost.tags?.length > 0 && (
              <>
                <span className="text-neutral-600">/</span>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 border border-white/[0.12] bg-white/[0.03] rounded text-neutral-200 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="prose-wrapper max-w-none">
            <MarkdownContent content={selectedPost.content} />
          </div>
        </article>
      ) : status === 'loading' ? (
        <div>
          <p role="status" className="sr-only">
            Loading entries
          </p>
          <LoadingRows />
        </div>
      ) : status === 'error' ? (
        <div className="py-16 max-w-sm">
          <p className="text-[15px] text-neutral-100 mb-1">Couldn&rsquo;t load the entries.</p>
          <p className="text-sm text-neutral-400 leading-[1.6]">
            The archive did not respond. Your connection is most likely fine.
          </p>
          <button
            type="button"
            onClick={load}
            className="interactive press mt-5 h-10 px-4 rounded-full border border-white/[0.14] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] text-[11px] tracking-[0.25em] uppercase"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 max-w-sm">
          <p className="text-[15px] text-neutral-100 mb-1">Nothing published yet.</p>
          <p className="text-sm text-neutral-400 leading-[1.6]">
            The first entry is still being written.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="interactive press mt-5 h-10 px-4 rounded-full border border-white/[0.14] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] text-[11px] tracking-[0.25em] uppercase"
          >
            Back to site
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 pb-6 border-b border-white/[0.06]">
            <p className="text-pretty text-[15px] text-neutral-200 leading-[1.7] max-w-lg">
              Personal writing and long-form thoughts. Click any entry to read.
            </p>
            <p className="text-[11px] text-neutral-400 font-mono mt-3 uppercase tracking-[0.22em] tabular-nums">
              {String(posts.length).padStart(2, '0')} · {posts.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {posts.map((post, i) => (
              <li key={post.slug}>
                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="interactive group w-full text-left py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 hover:bg-white/[0.03] active:bg-white/[0.07] -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-lg"
                >
                  <span className="text-neutral-400 text-[11px] font-mono tracking-[0.25em] w-12 shrink-0 uppercase tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl text-white font-medium tracking-[-0.01em] group-hover:text-neutral-100 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-neutral-300 text-[15px] mt-1.5 leading-[1.6] line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {post.date && (
                      <span className="text-neutral-400 text-[11px] font-mono whitespace-nowrap uppercase tracking-[0.22em] tabular-nums">
                        {format(new Date(post.date), 'MMM yyyy')}
                      </span>
                    )}
                    <span className="text-neutral-400 group-hover:text-white transition-colors duration-300">
                      <span className="inline-block group-hover:translate-x-0.5 transition-transform">↗</span>
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionOverlay>
  );
};

export default BlogWindow;
