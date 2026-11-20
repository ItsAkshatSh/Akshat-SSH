'use client';

import React from 'react';

const FALLBACK_STYLES =
  'flex flex-col items-center justify-center min-h-[60vh] text-center px-4';

function Fallback() {
  return (
    <div className={FALLBACK_STYLES}>
      <h2 className="font-display text-2xl md:text-3xl text-bone mb-3">
        Something broke
      </h2>
      <p className="text-muted-warm max-w-md">
        This post encountered an error. Check back soon.
      </p>
      <a
        href="/blog"
        className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-accent hover:text-bone underline"
      >
        ← All writing
      </a>
    </div>
  );
}

class PostErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errored: false };
  }

  static getDerivedStateFromError() {
    return { errored: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PostErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.errored) {
      return <Fallback />;
    }
    return this.props.children;
  }
}

export default PostErrorBoundary;
