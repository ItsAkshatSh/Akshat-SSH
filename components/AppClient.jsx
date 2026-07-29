/**
 * AppClient
 * Root of the single-page portfolio. Owns the animated ASCII ocean
 * background, the hero, the floating menu, and the three overlay
 * screens (Projects / Photography / Experience) plus the Blog and the
 * photo lightbox.
 */
import { useState, useEffect, useRef } from 'react';

import ScrambleText from './utilities/ScrambleText';

import ASCIIField from './ascii/ASCIIField';
import ASCIICanvas from './ascii/ASCIICanvas';
import BlogWindow from './blog/BlogWindow';
import FloatingMenu from './ui/FloatingMenu';

import ProjectsContent from './content/ProjectsContent';
import PhotographyContent from './content/PhotographyContent';
import PhotographyLightbox from './content/PhotographyLightbox';
import ExperienceContent from './content/ExperienceContent';

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/ItsAkshatSh',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.81 8.21 11.4.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.86.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/akshat.ssh/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/akshat404/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.44v6.3zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    ),
  },
];

const SECTION_ORDER = ['projects', 'photography', 'experience'];

const App = () => {
  const cursorRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const cursorPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const [activeSection, setActiveSection] = useState(null);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [contentIn, setContentIn] = useState(false);

  // Mount fade-in.
  useEffect(() => {
    const t = setTimeout(() => setContentIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Reset lightbox when navigating away from Photography.
  useEffect(() => {
    if (activeSection !== 'photography') setSelectedImg(null);
  }, [activeSection]);

  // Only show the custom cursor on fine-pointer devices.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setIsFinePointer(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Escape closes overlays in reverse depth order.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (selectedImg) setSelectedImg(null);
      else if (isBlogOpen) setIsBlogOpen(false);
      else if (activeSection) setActiveSection(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImg, isBlogOpen, activeSection]);

  // Track raw mouse position (updated in rAF for smoothness).
  useEffect(() => {
    if (!isFinePointer) return;
    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFinePointer]);

  // Cursor follow loop.
  useEffect(() => {
    if (!isFinePointer) return;
    const LERP = 0.22;
    const ease = 1 - Math.pow(1 - LERP, 1.5);

    const animate = () => {
      const mouse = mousePosRef.current;
      const current = cursorPosRef.current;
      cursorPosRef.current = {
        x: current.x + (mouse.x - current.x) * ease,
        y: current.y + (mouse.y - current.y) * ease,
      };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorPosRef.current.x}px, ${cursorPosRef.current.y}px) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    cursorPosRef.current = { ...mousePosRef.current };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isFinePointer]);

  const navItems = [
    { label: 'Projects', onClick: () => setActiveSection('projects') },
    { label: 'Photography', onClick: () => setActiveSection('photography') },
    { label: 'Experience', onClick: () => setActiveSection('experience') },
    { label: 'Blog', onClick: () => setIsBlogOpen(true) },
  ];

  const sectionTitle = activeSection
    ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1)
    : '';

  return (
    <div className={`min-h-screen bg-[#060a10] text-slate-200 overflow-x-hidden relative ${isFinePointer ? 'cursor-fine-none' : ''}`}>
      {/* Background: ASCII ocean */}
      <ASCIIField paused={!!selectedImg} />

      {/* Custom cursor */}
      {isFinePointer && (
        <div
          ref={cursorRef}
          className="fixed pointer-events-none z-[200] will-change-transform hidden lg:block"
          style={{ left: 0, top: 0 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/85" />
        </div>
      )}

      {/* Hero */}
      <main className="relative z-10 w-full min-h-screen flex items-center justify-center px-6 md:px-10 py-20 md:py-24">
        <div
          className={`w-full max-w-6xl grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-10 lg:gap-16 xl:gap-20 items-center transition-all duration-700 ease-premium ${
            contentIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {/* Portrait */}
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
          </div>

          {/* Intro + socials */}
          <div className="flex flex-col gap-9 lg:gap-11">
            <header
              className="max-w-xl"
              style={{
                opacity: 0,
                animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s',
              }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.02] font-medium text-white tracking-[-0.02em] mb-6">
                Akshat<br />Sharma.
              </h2>

              <p className="text-neutral-200 text-[15px] sm:text-base leading-[1.75] max-w-md">
                Aspiring Computer Engineer from Dubai. Building across hardware,
                mobile, embedded systems, PCB design and games. From a home-brewed
                StreamDeck to Flutter apps that actually ship.
              </p>
            </header>

            <div
              className="flex items-center gap-3 pt-1"
              style={{
                opacity: 0,
                animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s',
              }}
            >
              {SOCIALS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="interactive group flex items-center justify-center w-11 h-11 rounded-full border border-white/[0.1] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300"
                >
                  <span className="w-[18px] h-[18px] block">{icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating navigation */}
      <FloatingMenu items={navItems.map((n) => ({ label: n.label, onClick: n.onClick }))} />

      {/* Photo lightbox */}
      {selectedImg && (
        <PhotographyLightbox
          selectedImg={selectedImg}
          onClose={() => setSelectedImg(null)}
          onSelect={setSelectedImg}
        />
      )}

      {/* Blog overlay */}
      {isBlogOpen && <BlogWindow onClose={() => setIsBlogOpen(false)} />}

      {/* Section overlay: Projects / Photography / Experience */}
      {activeSection && (
        <div
          className="fixed inset-0 z-40 flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label={sectionTitle}
          style={{ animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <button
            type="button"
            aria-label="Close section"
            onClick={() => setActiveSection(null)}
            className="absolute inset-0 w-full h-full bg-[#050810]/70 backdrop-blur-md cursor-default"
            tabIndex={-1}
          />

          <div
            className="relative flex flex-col h-full w-full max-w-5xl mx-auto pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 px-6 sm:px-10 md:px-14 pt-16 md:pt-20 pb-6 md:pb-8 shrink-0 pointer-events-auto">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-300 mb-5 flex items-center gap-3">
                  <span className="text-white">
                    {String(SECTION_ORDER.indexOf(activeSection) + 1).padStart(2, '0')}
                  </span>
                  <span className="h-px w-8 bg-neutral-600" />
                  <span>Section</span>
                </p>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium text-white tracking-[-0.02em] capitalize leading-none">
                  <ScrambleText text={sectionTitle} active />
                </h2>
              </div>
              <button
                onClick={() => setActiveSection(null)}
                className="interactive shrink-0 mt-2 h-10 px-4 rounded-full border border-white/[0.14] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300 text-[11px] tracking-[0.25em] uppercase"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 sm:px-10 md:px-14 pb-24 md:pb-28 custom-scrollbar pointer-events-auto">
              <div
                style={{
                  opacity: 0,
                  animation: 'slideUpFade 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.15s',
                }}
              >
                {activeSection === 'projects' && <ProjectsContent />}
                {activeSection === 'photography' && (
                  <PhotographyContent onSelectImg={setSelectedImg} />
                )}
                {activeSection === 'experience' && <ExperienceContent />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
