import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownContent = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
          img: ({ node, ...props }) => {
            const src = props.src;
            if (src?.startsWith('/') || src?.startsWith('http')) {
              return (
                <span className="block my-8 -mx-4 md:-mx-8 lg:-mx-16">
                  <img
                    {...props}
                    alt={props.alt || ''}
                    className="w-full h-auto rounded-lg"
                  />
                </span>
              );
            }
            return <img {...props} alt={props.alt || ''} className="rounded-lg" />;
          },
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/50 hover:decoration-cyan-300 transition-colors"
              target={props.href?.startsWith('http') ? '_blank' : undefined}
              rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <pre className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 overflow-x-auto my-6">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-neutral-900/50 text-cyan-400 px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl md:text-5xl font-light mt-12 mb-6 tracking-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl md:text-4xl font-light mt-10 mb-5 tracking-tight" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl md:text-3xl font-light mt-8 mb-4 tracking-tight" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-relaxed mb-6 text-neutral-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-6 text-neutral-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-6 text-neutral-300" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="pl-2" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-neutral-700 pl-6 py-2 my-6 italic text-neutral-400"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-neutral-800 my-12" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-neutral-800 px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
  );
};

export default MarkdownContent;

