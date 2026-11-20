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
                <span className="block my-6 -mx-4 md:-mx-8 lg:-mx-16 flex justify-center">
                  <img
                    {...props}
                    alt={props.alt || ''}
                    className="max-w-md w-full h-auto rounded-lg"
                  />
                </span>
              );
            }
            return <img {...props} alt={props.alt || ''} className="rounded-lg" />;
          },
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-bone hover:text-bone underline underline-offset-4 decoration-bone/30 hover:decoration-bone/60 transition-colors"
              target={props.href?.startsWith('http') ? '_blank' : undefined}
              rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <pre className="bg-surface border border-hair rounded-lg p-4 overflow-x-auto my-6">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-surface text-bone px-1.5 py-0.5 rounded text-sm" {...props}>
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
            <p className="leading-relaxed mb-6 text-muted-warm" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-6 text-muted-warm" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-6 text-muted-warm" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="pl-2" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-[color:var(--border-hover)] pl-6 py-2 my-6 italic text-muted-warm"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-hair my-12" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-hair bg-surface px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-hair px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
  );
};

export default MarkdownContent;

