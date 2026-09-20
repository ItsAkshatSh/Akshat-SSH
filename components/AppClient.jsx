/**
 * AppClient
 * Root of the single-page portfolio. Owns the animated ASCII ocean
 * background, the hero, the floating menu, and overlay sections.
 */
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import ScrambleText from './utilities/ScrambleText';
import SectionOverlay from './ui/SectionOverlay';
import { HERO, SOCIALS } from '../lib/siteContent';

import ASCIIField from './ascii/ASCIIField';
import ASCIICanvas from './ascii/ASCIICanvas';
import BlogWindow from './blog/BlogWindow';
import FloatingMenu from './ui/FloatingMenu';

import ProjectsContent from './content/ProjectsContent';
import PhotographyContent from './content/PhotographyContent';
import ExperienceContent from './content/ExperienceContent';

// Hero entrance. Each element rides the same critically damped spring, offset
// by a short stagger — the stagger orders attention (portrait, then name, then
// actions) without any element appearing to wait its turn.
const HERO_STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const HERO_ITEM = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', bounce: 0, duration: 0.5 },
  },
};

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
    <div className="fixed inset-0 z-content min-h-dvh bg-[#060a10] text-slate-200 overflow-x-hidden overflow-y-auto">
      {/* The ocean is a looping animation behind a blurred scrim while a panel
          is open — nothing about it is visible then, so it stops. */}
      <ASCIIField paused={Boolean(activeSection || isBlogOpen)} />

      <main className="relative z-content w-full min-h-dvh flex items-center justify-center px-6 md:px-10 py-20 md:py-24">
        <motion.div
          className="w-full max-w-6xl grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-10 lg:gap-16 xl:gap-20 items-center"
          variants={HERO_STAGGER}
          initial="hidden"
          animate={contentIn ? 'visible' : 'hidden'}
        >
          <motion.div
            variants={HERO_ITEM}
            className="interactive relative mx-auto lg:mx-0 w-full max-w-[280px] lg:max-w-none"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0f16] shadow-card">
              <ASCIICanvas
                src="/images/ascii/real_pfp.jpg"
                cellSize={4}
                preserveColor
                glitchUseSampled
                gamma={0.6}
                radius={100}
                displace={12}
                className="absolute inset-0"
                fps={30}
              />
            </div>
          </motion.div>

          <div className="flex flex-col gap-9 lg:gap-11">
            <motion.header variants={HERO_ITEM} className="max-w-xl">
              <h2 className="text-balance text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.02] font-medium text-white tracking-[-0.02em] mb-6">
                {HERO.nameLines[0]}
                <br />
                {HERO.nameLines[1]}
              </h2>
              <p className="text-pretty text-neutral-200 text-[15px] sm:text-base leading-[1.75] max-w-md">
                {HERO.bio}
              </p>
            </motion.header>

            <motion.div variants={HERO_ITEM} className="flex items-center gap-3 pt-1">
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="interactive press group flex items-center justify-center size-11 rounded-full border border-white/[0.1] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05]"
                >
                  <span className="block size-[18px]">{SOCIAL_ICONS[label]}</span>
                </a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </main>

      <FloatingMenu
        items={navItems.map((n) => ({ label: n.label, onClick: n.onClick }))}
        hidden={Boolean(activeSection || isBlogOpen)}
      />

      <AnimatePresence>
        {isBlogOpen && <BlogWindow key="blog" onClose={() => setIsBlogOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {activeSection && (
          <SectionOverlay
            key={activeSection}
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
      </AnimatePresence>
    </div>
  );
};

export default App;
