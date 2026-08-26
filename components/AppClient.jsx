/**
 * AppClient
 * Root of the single-page portfolio. Owns the animated ASCII ocean
 * background, the hero, the floating menu, and overlay sections.
 */
import { useState, useEffect } from 'react';

import ScrambleText from './utilities/ScrambleText';
import SectionOverlay from './ui/SectionOverlay';
import { HERO, SOCIALS } from '../lib/siteContent';

import ASCIIField from './ascii/ASCIIField';
import ASCIICanvas from './ascii/ASCIICanvas';
import BlogWindow from './blog/BlogWindow';
import FloatingMenu from './ui/FloatingMenu';
import { SmoothCursor } from './ui/smooth-cursor';
import usePerformanceTier from './utilities/usePerformanceTier';

import ProjectsContent from './content/ProjectsContent';
import PhotographyContent from './content/PhotographyContent';
import ExperienceContent from './content/ExperienceContent';

const SOCIAL_ICONS = {
  GitHub: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.81 8.21 11.4.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.86.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.44v6.3zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
};

const App = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [contentIn, setContentIn] = useState(false);
  const tier = usePerformanceTier();

  useEffect(() => {
    const shell = document.getElementById('hero-shell');
    if (shell) shell.style.display = 'none';
    return () => {
      if (shell) shell.style.display = '';
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setContentIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setIsFinePointer(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (isBlogOpen) setIsBlogOpen(false);
      else if (activeSection) setActiveSection(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlogOpen, activeSection]);

  // Open sections from hash links in the SSR hero shell (e.g. /#projects).
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['projects', 'photography', 'experience'].includes(hash)) {
        setActiveSection(hash);
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navItems = [
    { label: 'Projects', onClick: () => setActiveSection('projects') },
    { label: 'Photography', onClick: () => setActiveSection('photography') },
    { label: 'Experience', onClick: () => setActiveSection('experience') },
    { label: 'Blog', onClick: () => setIsBlogOpen(true) },
  ];

  const sectionTitle = activeSection
    ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1)
    : '';
  const isPhotography = activeSection === 'photography';

  return (
    <div className="fixed inset-0 z-10 min-h-screen bg-[#060a10] text-slate-200 overflow-x-hidden overflow-y-auto">
      <ASCIIField paused={false} tier={tier} />

      {isFinePointer && tier !== 'low' && <SmoothCursor />}

      <main className="relative z-10 w-full min-h-screen flex items-center justify-center px-6 md:px-10 py-20 md:py-24">
        <div
          className={`w-full max-w-6xl grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-10 lg:gap-16 xl:gap-20 items-center transition-all duration-700 ease-premium ${
            contentIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div
            className="interactive relative mx-auto lg:mx-0 w-full max-w-[280px] lg:max-w-none"
            style={{
              opacity: 0,
              animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.05s',
            }}
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0f16] shadow-card">
              <ASCIICanvas
                src="/images/ascii/real_pfp.jpg"
                cellSize={tier === 'low' ? 8 : tier === 'medium' ? 6 : 4}
                preserveColor
                glitchUseSampled
                gamma={0.6}
                radius={tier === 'low' ? 70 : 100}
                displace={tier === 'low' ? 6 : 12}
                className="absolute inset-0"
                fps={tier === 'low' ? 18 : tier === 'medium' ? 24 : 30}
              />
            </div>
          </div>

          <div className="flex flex-col gap-9 lg:gap-11">
            <header
              className="max-w-xl"
              style={{
                opacity: 0,
                animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s',
              }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.02] font-medium text-white tracking-[-0.02em] mb-6">
                {HERO.nameLines[0]}
                <br />
                {HERO.nameLines[1]}
              </h2>
              <p className="text-neutral-200 text-[15px] sm:text-base leading-[1.75] max-w-md">
                {HERO.bio}
              </p>
            </header>

            <div
              className="flex items-center gap-3 pt-1"
              style={{
                opacity: 0,
                animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s',
              }}
            >
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="interactive group flex items-center justify-center w-11 h-11 rounded-full border border-white/[0.1] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300"
                >
                  <span className="w-[18px] h-[18px] block">{SOCIAL_ICONS[label]}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <FloatingMenu
        items={navItems.map((n) => ({ label: n.label, onClick: n.onClick }))}
        hidden={Boolean(activeSection || isBlogOpen)}
      />

      {isBlogOpen && <BlogWindow onClose={() => setIsBlogOpen(false)} />}

      {activeSection && (
        <SectionOverlay
          ariaLabel={sectionTitle}
          onClose={() => setActiveSection(null)}
          variant={isPhotography ? 'fullpage' : 'default'}
          showVignettes={!isPhotography}
          contentKey={activeSection}
          title={<ScrambleText text={sectionTitle} active />}
        >
          {activeSection === 'projects' && <ProjectsContent />}
          {activeSection === 'photography' && <PhotographyContent />}
          {activeSection === 'experience' && <ExperienceContent />}
        </SectionOverlay>
      )}
    </div>
  );
};

export default App;
