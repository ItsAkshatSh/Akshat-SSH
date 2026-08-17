/**
 * BlogWindow
 * Full-screen overlay matching the sub-page pattern. Two internal states:
 * an index of posts and a single-post reader. The header title swaps in
 * place when a post is opened.
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MarkdownContent from './MarkdownContent';
import ScrambleText from '../utilities/ScrambleText';

const SectionCorner = ({ position }) => {
  const anchor = {
    tl: 'top-3 left-3 sm:top-6 sm:left-6',
    tr: 'top-3 right-3 sm:top-6 sm:right-6 rotate-90',
    bl: 'bottom-3 left-3 sm:bottom-6 sm:left-6 -rotate-90',
    br: 'bottom-3 right-3 sm:bottom-6 sm:right-6 rotate-180',
  }[position];
  return (
    <div
      aria-hidden="true"
      className={`absolute w-4 h-4 pointer-events-none ${anchor}`}
      style={{
        borderTop: '1px solid rgba(255,255,255,0.25)',
        borderLeft: '1px solid rgba(255,255,255,0.25)',
        opacity: 0,
        animation: 'sectionBackdrop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s',
      }}
    />
  );
};

const BlogWindow = ({ onClose }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetch('/api/blog/posts')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setPosts([]);
        setLoading(false);
      });
  }, []);

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
  const label = selectedPost ? 'Post' : 'Section';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Blog"
    >
      <button
        type="button"
        aria-label="Close blog"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-[#060a10]/55 backdrop-blur-2xl cursor-default"
        tabIndex={-1}
        style={{
          opacity: 0,
          animation: 'sectionBackdrop 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#060a10]/80 to-transparent pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#060a10]/90 via-[#060a10]/45 to-transparent pointer-events-none" />

      <div
        className="readable-on-blur relative flex flex-col h-full w-full max-w-5xl mx-auto pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="absolute top-6 md:top-10 right-4 sm:right-10 md:right-14 pointer-events-none select-none leading-none"
          style={{
            fontSize: 'clamp(10rem, 26vw, 22rem)',
            fontWeight: 500,
            letterSpacing: '-0.05em',
            color: 'rgba(255,255,255,0.035)',
            opacity: 0,
            animation: 'sectionBackdrop 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s',
          }}
        >
          04
        </div>

        <SectionCorner position="tl" />
        <SectionCorner position="tr" />
        <SectionCorner position="bl" />
        <SectionCorner position="br" />

        {/* Header */}
        <div className="relative flex justify-between items-start gap-4 px-6 sm:px-10 md:px-14 pt-16 md:pt-20 pb-6 md:pb-8 shrink-0 pointer-events-auto">
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] uppercase tracking-[0.4em] text-neutral-300 mb-5 flex items-center gap-3"
              style={{
                opacity: 0,
                animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.15s',
              }}
            >
              <span className="text-white">04</span>
              <span className="h-px w-8 bg-neutral-600" />
              <span>{label}</span>
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-medium text-white tracking-[-0.02em] leading-[1.05] break-words"
              style={{
                opacity: 0,
                animation: 'sectionTitleEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.25s',
              }}
            >
              <ScrambleText text={title} active />
            </h2>
          </div>
          <div
            className="flex items-center gap-2 shrink-0 mt-2"
            style={{
              opacity: 0,
              animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.35s',
            }}
          >
            {selectedPost && (
              <button
                onClick={() => setSelectedPost(null)}
                className="interactive h-10 px-4 rounded-full border border-white/[0.14] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300 text-[11px] tracking-[0.25em] uppercase"
                aria-label="Back to index"
              >
                Index
              </button>
            )}
            <button
              onClick={onClose}
              className="interactive h-10 px-4 rounded-full border border-white/[0.14] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300 text-[11px] tracking-[0.25em] uppercase"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>

        {/* Meta bar. */}
        <div
          className="relative mx-6 sm:mx-10 md:mx-14 flex items-center gap-4 shrink-0 pointer-events-none"
          style={{
            opacity: 0,
            animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.32s',
          }}
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-white/25" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400">
            04 / 04
          </span>
          <span className="h-px w-16 bg-white/25" />
        </div>

        {/* Content */}
        <div
          className="relative flex-1 overflow-y-auto px-6 sm:px-10 md:px-14 pt-8 md:pt-10 pb-24 md:pb-28 custom-scrollbar pointer-events-auto"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 40px), transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 40px), transparent 100%)',
          }}
        >
          <div
            key={selectedPost?.slug || 'index'}
            style={{
              opacity: 0,
              animation: 'sectionBodyEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s',
            }}
          >
            {selectedPost ? (
              <article>
                <div className="mb-8 pb-6 border-b border-white/[0.06] flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                  {selectedPost.date && (
                    <time dateTime={selectedPost.date} className="font-mono tracking-[0.22em] uppercase">
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
            ) : loading ? (
              <div className="py-24 flex flex-col items-center gap-3 text-neutral-300">
                <div className="w-8 h-8 border border-white/10 border-t-white/60 rounded-full animate-spin" />
                <p className="text-[11px] tracking-[0.25em] uppercase">Loading</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-[15px] text-neutral-200 mb-1">No posts yet.</p>
                <p className="text-sm text-neutral-400">Check back soon.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 pb-6 border-b border-white/[0.06]">
                  <p className="text-[15px] text-neutral-200 leading-[1.7] max-w-lg">
                    Personal writing and long-form thoughts. Click any entry to read.
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono mt-3 uppercase tracking-[0.22em]">
                    {String(posts.length).padStart(2, '0')} · {posts.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <ul className="divide-y divide-white/[0.06]">
                  {posts.map((post, i) => (
                    <li key={post.slug}>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="interactive group w-full text-left py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 transition-colors duration-300 hover:bg-white/[0.03] -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-lg"
                      >
                        <span className="text-neutral-400 text-[11px] font-mono tracking-[0.25em] w-12 shrink-0 uppercase">
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
                            <span className="text-neutral-400 text-[11px] font-mono whitespace-nowrap uppercase tracking-[0.22em]">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogWindow;
