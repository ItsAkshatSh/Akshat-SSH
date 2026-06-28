import React, { useState, useEffect, useRef } from 'react';
import { Github, Instagram, Linkedin, Terminal, ArrowUpRight, FolderGit2, Camera, Briefcase, PenLine, X } from 'lucide-react';

import ScrambleText from './utilities/ScrambleText';
import InfoCard from './utilities/InfoCard';

import StarField from './StarField';
import TerminalWindow from './TerminalWindow';
import BlogWindow from './blog/BlogWindow';

import ProjectsContent from './content/ProjectsContent';
import PhotographyContent from './content/PhotographyContent';
import PhotographyLightbox from './content/PhotographyLightbox';
import ExperienceContent from './content/ExperienceContent';

const NavCard = ({ item, index, onClick, hoveredKey, onHover, onLeave, compact = false }) => (
  <button
    onClick={onClick}
    onMouseEnter={() => onHover?.(item.key)}
    onMouseLeave={() => onLeave?.()}
    aria-label={`${item.label} — ${item.desc}`}
    className={`interactive group w-full text-left rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 ease-premium ${
      compact ? 'px-5 py-4 min-h-[64px]' : 'px-6 py-5 min-h-[88px]'
    }`}
    style={{
      opacity: 0,
      animation: `slideUpFade 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.07 + 0.15}s`,
    }}
  >
    <div className="flex items-center gap-4">
      <span className={`flex shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-300 group-hover:border-white/20 group-hover:text-white transition-colors duration-300 ${
        compact ? 'w-11 h-11' : 'w-12 h-12'
      }`}>
        <item.Icon size={compact ? 20 : 22} strokeWidth={1.5} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-white font-medium tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>
          <span className="text-neutral-500 font-mono text-[11px] mr-2 align-middle">{`0${index + 1}`}</span>
          <ScrambleText text={item.label} active={hoveredKey === item.key} />
        </span>
        <span className={`block text-neutral-400 mt-0.5 truncate ${compact ? 'text-[13px]' : 'text-sm'}`}>
          {item.desc}
        </span>
      </span>
      <ArrowUpRight
        size={compact ? 18 : 20}
        className="shrink-0 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
      />
    </div>
  </button>
);

const App = () => {
  const cursorRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const cursorPosRef = useRef({ x: 0, y: 0 });
  const lockCenterRef = useRef(null);
  const lockedElementRef = useRef(null);
  const rafRef = useRef(null);

  const syncLockPosition = () => {
    const el = lockedElementRef.current;
    if (el?.isConnected) {
      const rect = el.getBoundingClientRect();
      lockCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  };

  const [cursorState, setCursorState] = useState({
    active: false,
    width: 32,
    height: 32,
    borderRadius: '50%',
  });
  const [displayCursor, setDisplayCursor] = useState({ width: 32, height: 32, borderRadius: '50%' });
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [contentIn, setContentIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setContentIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (activeSection !== 'photography') setSelectedImg(null);
  }, [activeSection]);

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
      if (selectedImg) setSelectedImg(null);
      else if (isBlogOpen) setIsBlogOpen(false);
      else if (isTerminalOpen) return;
      else if (activeSection) setActiveSection(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImg, isBlogOpen, isTerminalOpen, activeSection]);

  useEffect(() => {
    if (!isFinePointer) return;
    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFinePointer]);

  useEffect(() => {
    if (!isFinePointer) return;
    const handleMouseOver = (e) => {
      const target = e.target.closest('button, a, input, .interactive');
      if (target) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setCursorState({
          active: true,
          width: rect.width + 16,
          height: rect.height + 16,
          x: centerX,
          y: centerY,
          borderRadius: getComputedStyle(target).borderRadius || '12px',
        });
        lockCenterRef.current = { x: centerX, y: centerY };
        lockedElementRef.current = target;
      } else {
        setCursorState((prev) => ({ ...prev, active: false }));
        lockCenterRef.current = null;
        lockedElementRef.current = null;
      }
    };
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, [isFinePointer]);

  useEffect(() => {
    setDisplayCursor({
      width: cursorState.active ? cursorState.width : 32,
      height: cursorState.active ? cursorState.height : 32,
      borderRadius: cursorState.active ? cursorState.borderRadius : '50%',
    });
  }, [cursorState.active, cursorState.width, cursorState.height, cursorState.borderRadius]);

  useEffect(() => {
    if (!isFinePointer) return;
    const LERP = 0.18;
    const LOCK_BLEND = 0.12;
    const ease = 1 - Math.pow(1 - LERP, 1.5);

    const animate = () => {
      const mouse = mousePosRef.current;
      const lock = lockCenterRef.current;
      const target = lock
        ? { x: lock.x + (mouse.x - lock.x) * LOCK_BLEND, y: lock.y + (mouse.y - lock.y) * LOCK_BLEND }
        : { x: mouse.x, y: mouse.y };

      const current = cursorPosRef.current;
      cursorPosRef.current = {
        x: current.x + (target.x - current.x) * ease,
        y: current.y + (target.y - current.y) * ease,
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
    {
      label: 'Projects',
      key: 'projects',
      desc: 'Software, hardware & games',
      Icon: FolderGit2,
      onClick: () => setActiveSection('projects'),
    },
    {
      label: 'Photography',
      key: 'photography',
      desc: 'Moments through my lens',
      Icon: Camera,
      onClick: () => setActiveSection('photography'),
    },
    {
      label: 'Experience',
      key: 'experience',
      desc: 'Work, education & wins',
      Icon: Briefcase,
      onClick: () => setActiveSection('experience'),
    },
    {
      label: 'Blog',
      key: 'blog',
      desc: 'Notes, stories & writing',
      Icon: PenLine,
      onClick: () => setIsBlogOpen(true),
    },
  ];

  const socials = [
    { label: 'GitHub', href: 'https://github.com/ItsAkshatSh', Icon: Github },
    { label: 'Instagram', href: 'https://www.instagram.com/akshat.ssh/', Icon: Instagram },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/akshat404/', Icon: Linkedin },
  ];

  const sectionTitle = activeSection
    ? navItems.find((n) => n.key === activeSection)?.label ?? activeSection
    : '';

  return (
    <div className={`min-h-screen bg-[#070707] text-neutral-200 overflow-x-hidden relative ${isFinePointer ? 'cursor-fine-none' : ''}`}>
      <StarField />

      {/* Ambient background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(255,255,255,0.02) 0%, transparent 50%)',
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)' }}
      />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-30 px-6 md:px-10 py-6 md:py-8 flex items-center justify-between pointer-events-none">
        <div className="select-none">
          <h1 className="font-display text-xl md:text-2xl text-white tracking-tight">
            akshat.ssh<span className="text-neutral-500 animate-pulse">_</span>
          </h1>
          <p className="hidden sm:block mt-1 text-[11px] tracking-[0.28em] uppercase text-neutral-500 font-mono">
            Developer · Dubai
          </p>
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-2">
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="interactive flex items-center justify-center w-10 h-10 rounded-xl border border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300"
            >
              <Icon size={18} strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </header>

      {/* Custom cursor */}
      {isFinePointer && (
        <div
          ref={cursorRef}
          className="fixed pointer-events-none z-[200] will-change-transform hidden lg:block"
          style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
        >
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full transition-opacity duration-300 ${cursorState.active ? 'opacity-0' : 'opacity-100'}`} />
          <div
            className="border border-white/40"
            style={{
              width: `${displayCursor.width}px`,
              height: `${displayCursor.height}px`,
              borderRadius: displayCursor.borderRadius,
              transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1), height 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: cursorState.active ? 0.9 : 0.5,
            }}
          />
        </div>
      )}

      <main
        className={`relative z-10 w-full min-h-screen flex items-center justify-center px-6 md:px-10 py-28 md:py-24 transition-all duration-500 ease-premium ${
          activeSection ? 'opacity-[0.15] blur-sm scale-[0.99] pointer-events-none' : 'opacity-100 blur-0 scale-100'
        }`}
      >
        <div
          className={`w-full max-w-6xl grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-10 lg:gap-16 xl:gap-20 items-center transition-all duration-700 ease-premium ${
            contentIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {/* Portrait column */}
          <div
            className="interactive relative mx-auto lg:mx-0 w-full max-w-[280px] lg:max-w-none group"
            onMouseEnter={() => setShowInfoCard(true)}
            onMouseLeave={() => setShowInfoCard(false)}
            style={{
              opacity: 0,
              animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.05s',
            }}
          >
            <div className="absolute -inset-8 bg-white/[0.03] blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c0c0c] shadow-card group-hover:border-white/15 group-hover:shadow-card-hover transition-all duration-500">
              <img
                src="/images/ascii/ascii.png"
                alt="Portrait of Akshat Sharma"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/60 group-hover:text-white/90 transition-colors">
                  Dubai, UAE
                </p>
              </div>
            </div>
            <InfoCard isVisible={showInfoCard} />
          </div>

          {/* Content column */}
          <div className="flex flex-col gap-8 lg:gap-10">
            <header
              style={{
                opacity: 0,
                animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s',
              }}
            >
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-[0.3em] mb-4">
                Developer & Creative
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.12] font-medium text-white tracking-tight text-balance mb-4">
                Hi, I'm Akshat Sharma.
              </h2>
              <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl text-balance">
                I build software, hardware and games — voice assistants, custom macropads,
                deep-learning projects and more.
              </p>
            </header>

            <nav aria-label="Primary" className="grid sm:grid-cols-2 gap-3">
              {navItems.map((item, index) => (
                <NavCard
                  key={item.key}
                  item={item}
                  index={index}
                  onClick={item.onClick}
                  hoveredKey={hoveredNav}
                  onHover={setHoveredNav}
                  onLeave={() => setHoveredNav(null)}
                />
              ))}
            </nav>

            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              style={{
                opacity: 0,
                animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.45s',
              }}
            >
              <button
                onClick={() => setIsTerminalOpen(true)}
                className="interactive group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-3.5 hover:border-accent-green/30 hover:bg-white/[0.04] transition-all duration-300"
              >
                <Terminal size={18} className="text-accent-green shrink-0" />
                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">Open shell</span>
                <span className="ml-auto text-[11px] text-neutral-600 font-mono hidden sm:inline">help</span>
              </button>

              <div className="flex md:hidden items-center gap-2">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="interactive flex flex-1 items-center justify-center h-12 rounded-xl border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/15 transition-all duration-300"
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 inset-x-0 z-20 px-6 md:px-10 py-5 flex items-center justify-between pointer-events-none">
        <p className="text-[11px] text-neutral-600 font-mono hidden sm:block">
          © {new Date().getFullYear()} Akshat Sharma
        </p>
        <p className="text-[11px] text-neutral-600 font-mono sm:hidden">
          Dubai, UAE
        </p>
        <p className="text-[11px] text-neutral-600 font-mono hidden md:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400">esc</kbd> to close panels
        </p>
      </footer>

      {isTerminalOpen && (
        <>
          <div className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-sm" onClick={() => setIsTerminalOpen(false)} aria-hidden="true" />
          <TerminalWindow onClose={() => setIsTerminalOpen(false)} onNavigate={setActiveSection} />
        </>
      )}

      {selectedImg && (
        <PhotographyLightbox
          selectedImg={selectedImg}
          onClose={() => setSelectedImg(null)}
          onSelect={setSelectedImg}
        />
      )}

      {isBlogOpen && (
        <>
          <div className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-sm" onClick={() => setIsBlogOpen(false)} aria-hidden="true" />
          <BlogWindow onClose={() => setIsBlogOpen(false)} />
        </>
      )}

      {activeSection && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md animate-fade-in"
            onClick={() => setActiveSection(null)}
            aria-label="Close panel"
          />
          <div className="fixed inset-0 z-40 flex items-center justify-end pointer-events-none">
            <div
              className="w-full md:w-[85%] lg:w-[72%] xl:w-[65%] h-full bg-[#0a0a0a] border-l border-white/[0.06] flex flex-col shadow-2xl pointer-events-auto"
              style={{ animation: 'slideInRight 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={sectionTitle}
            >
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

              <div className="flex justify-between items-start gap-4 px-6 sm:px-10 md:px-14 pt-8 md:pt-12 pb-6 shrink-0">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-neutral-500 mb-3">
                    {sectionTitle}
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white tracking-tight capitalize">
                    <ScrambleText text={sectionTitle} active />
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSection(null)}
                  className="interactive p-2.5 rounded-xl border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300 shrink-0 mt-1"
                  aria-label="Close"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              <div
                onScroll={syncLockPosition}
                className="flex-1 overflow-y-auto px-6 sm:px-10 md:px-14 pb-16 custom-scrollbar"
              >
                {activeSection === 'projects' && <ProjectsContent />}
                {activeSection === 'photography' && (
                  <PhotographyContent onSelectImg={setSelectedImg} />
                )}
                {activeSection === 'experience' && <ExperienceContent />}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
