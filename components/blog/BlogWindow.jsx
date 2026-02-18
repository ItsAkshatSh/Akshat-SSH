import React, { useState, useEffect, useRef } from 'react';
import { X, Minus } from 'lucide-react';
import { format } from 'date-fns';
import MarkdownContent from './MarkdownContent';

const BlogWindow = ({ onClose }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const centerX = (window.innerWidth - 900) / 2;
      const centerY = (window.innerHeight - 700) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, []);

  useEffect(() => {
    fetch('/api/blog/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setLoading(false);
      });
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-drag-handle')) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => {
        setPosition({
          x: e.clientX - dragStartPos.current.x,
          y: e.clientY - dragStartPos.current.y,
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (isMinimized) {
    return (
      <div
        className="fixed bg-surface-elevated border border-white/[0.08] rounded-t-lg shadow-2xl z-[100] cursor-pointer hover:bg-white/[0.04] transition-colors"
        style={{
          left: `${position.x}px`,
          bottom: '0px',
          width: '200px',
          height: '32px',
        }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="window-drag-handle h-full flex items-center px-4 text-xs text-neutral-400">
          Blog
        </div>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      className="fixed bg-surface-elevated border border-white/[0.08] rounded-xl shadow-2xl z-[100] flex flex-col overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '900px',
        height: '700px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: 'calc(100vh - 40px)',
      }}
    >
      <div
        className="window-drag-handle bg-white/[0.04] h-9 flex items-center justify-between px-4 cursor-move select-none border-b border-white/[0.06]"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff4747] transition-colors flex items-center justify-center"
            >
              <X size={8} className="opacity-0 hover:opacity-100" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffa700] transition-colors"
            >
              <Minus size={8} className="opacity-0 hover:opacity-100" />
            </button>
            <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
          </div>
          <span className="text-xs text-neutral-500 ml-4 font-medium">Blog</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-[#1e1e1e]">
          <div className="w-80 border-r border-white/[0.06] bg-white/[0.02] flex flex-col">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-neutral-200 mb-1">Inbox</h2>
            <p className="text-xs text-neutral-500">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-6 flex flex-col items-center justify-center gap-3 text-neutral-500">
                <div className="w-8 h-8 border-2 border-white/10 border-t-cyan-500/50 rounded-full animate-spin" />
                <p className="text-sm">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                <p className="text-sm mb-1">No posts yet.</p>
                <p className="text-xs text-neutral-600">Check back soon.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {posts.map((post) => (
                  <button
                    key={post.slug}
                    onClick={() => setSelectedPost(post)}
                    className={`w-full text-left p-4 transition-all duration-300 ${
                      selectedPost?.slug === post.slug 
                        ? 'bg-white/[0.06] border-l-2 border-cyan-500/70' 
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-medium text-neutral-200 truncate flex-1">
                        {post.title}
                      </h3>
                      {post.date && (
                        <span className="text-xs text-neutral-500 ml-2 whitespace-nowrap">
                          {format(new Date(post.date), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 bg-neutral-700/50 text-neutral-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-surface-elevated">
          {selectedPost ? (
            <>
              <div className="p-6 border-b border-white/[0.06]">
                <h1 className="text-2xl font-light text-neutral-100 mb-2">
                  {selectedPost.title}
                </h1>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  {selectedPost.date && (
                    <time dateTime={selectedPost.date}>
                      {format(new Date(selectedPost.date), 'MMMM d, yyyy')}
                    </time>
                  )}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="flex gap-2">
                      {selectedPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="prose-wrapper">
                  <MarkdownContent content={selectedPost.content} />
                </div>
              </div>

            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              <div className="text-center max-w-[240px]">
                <p className="text-base mb-1 font-light">Select a post to read</p>
                <p className="text-sm text-neutral-600">Choose from the inbox</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogWindow;

