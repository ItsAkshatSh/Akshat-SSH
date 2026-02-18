import React, { useState, useEffect, useRef } from 'react';
import { Github, Instagram, Linkedin, Terminal, Cpu } from 'lucide-react';
import { X } from 'lucide-react';

import ScrambleText from './utilities/ScrambleText';
import MagneticButton from './utilities/MagneticButton';
import StaggerItem from './utilities/StaggerItem';
import InfoCard from './utilities/InfoCard';

import StarField from './StarField';
import SnakeGame from './SnakeGame';
import TerminalModal from './TerminalModal';
import BlogWindow from './blog/BlogWindow';

import ProjectsContent from './content/ProjectsContent';
import PhotographyContent from './content/PhotographyContent';
import ExperienceContent from './content/ExperienceContent';

const App = () => {
  const cursorRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const statsRef = useRef(null);
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
    width: 40,
    height: 40,
    borderRadius: '50%',
  });
  const [displayCursor, setDisplayCursor] = useState({ width: 40, height: 40, borderRadius: '50%', rotate: 45 });
  const [time, setTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (statsRef.current && Math.random() < 0.1) {
        statsRef.current.textContent = `SYS.coords: ${e.clientX}, ${e.clientY}`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest('button, a, input, .interactive');
      if (target) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setCursorState({
          active: true,
          width: rect.width + 20,
          height: rect.height + 20,
          x: centerX,
          y: centerY,
          borderRadius: getComputedStyle(target).borderRadius || '8px',
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
  }, []);

  useEffect(() => {
    setDisplayCursor({
      width: cursorState.active ? cursorState.width : 40,
      height: cursorState.active ? cursorState.height : 40,
      borderRadius: cursorState.active ? cursorState.borderRadius : '50%',
      rotate: cursorState.active ? 0 : 45,
    });
  }, [cursorState.active, cursorState.width, cursorState.height, cursorState.borderRadius]);

  useEffect(() => {
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
  }, []);



  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 overflow-hidden font-mono selection:bg-[#ffffff] selection:text-black relative cursor-none">
      
      <StarField />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(24px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        ::-webkit-scrollbar { width: 0px; }
        .scanline { background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.4) 51%); background-size: 100% 4px; }
      `}</style>

      <div className="fixed top-8 left-8 z-30 mix-blend-difference select-none pointer-events-none">
         <h1 
           className="text-3xl md:text-4xl text-white tracking-tighter opacity-90"
           style={{ fontFamily: '"Silkscreen", cursive' }}
         >
           akshat.ssh<span className="text-white-500 animate-pulse">_</span>
         </h1>
      </div>

       <div
         ref={cursorRef}
         className="fixed pointer-events-none z-[200] mix-blend-exclusion will-change-transform"
         style={{
           left: 0,
           top: 0,
           transform: 'translate(-50%, -50%)',
         }}
       >
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full transition-opacity duration-300 ease-out ${cursorState.active ? 'opacity-0' : 'opacity-100'}`} />
        <div
          className="border-[1px] border-white"
          style={{
            width: `${displayCursor.width}px`,
            height: `${displayCursor.height}px`,
            borderRadius: displayCursor.borderRadius,
            transform: `rotate(${displayCursor.rotate}deg)`,
            borderStyle: cursorState.active ? 'solid' : 'dotted',
            animation: !cursorState.active ? 'spin 8s linear infinite' : 'none',
            transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-style 0.3s ease-out',
          }}
        />
      </div>

      <main className={`relative z-10 w-full h-screen flex items-center justify-center transition-all duration-700 ease-premium ${activeSection ? 'opacity-[0.03] blur-md scale-[0.98] pointer-events-none' : 'opacity-100 blur-0 scale-100'}`}>
        
        <div className="relative w-[800px] h-[600px] max-w-full flex items-center">
          <div className="interactive relative z-10 group w-[300px] h-[400px] flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-600 ease-premium overflow-visible" onMouseEnter={() => setShowInfoCard(true)} onMouseLeave={() => setShowInfoCard(false)}>
            <div className="w-full h-full bg-[#050505] border border-white/[0.08] overflow-hidden flex items-center justify-center relative rounded-lg group-hover:border-white/20 group-hover:shadow-glow-soft transition-all duration-500">
               <img 
                  src="/images/ascii/ascii.png"
                  alt="ASCII Art" 
                  className="w-full h-full object-cover opacity-60 mix-blend-hard-light transition-opacity duration-500"
               />
               <div className="absolute inset-0 scanline opacity-20 pointer-events-none"></div>
            </div>

            <InfoCard isVisible={showInfoCard} />
          </div>

          <div className="absolute left-[280px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none">
            <svg className="absolute inset-0 w-full h-full opacity-10 animate-pulse" style={{ animationDuration: '4s' }} viewBox="0 0 400 400">
               <circle cx="200" cy="200" r="150" stroke="currentColor" fill="none" strokeWidth="0.5" />
               <circle cx="200" cy="200" r="100" stroke="currentColor" fill="none" strokeDasharray="2 4" strokeWidth="0.5" />
            </svg>

            {['Projects', 'Photography', 'Experience', 'Blog'].map((item, index) => {
               const positions = [
                  'top-[50px] left-[120px]',
                  'top-[130px] -translate-y-1/2 right-[-35px]',
                  'bottom-[50px] left-[120px]',
                  'top-[235px] -translate-y-1/2 right-[50px]'
               ];
               const isBlog = item === 'Blog';
               return (
                <MagneticButton 
                  key={item}
                  onClick={() => isBlog ? setIsBlogOpen(true) : setActiveSection(item.toLowerCase())}
                  className={`interactive pointer-events-auto absolute ${positions[index]} group flex items-center gap-4 transition-all duration-300`}
                >
                   <div className="w-2 h-2 rounded-full bg-neutral-600 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-300" />
                   <div 
                     className="text-2xl font-light tracking-tighter uppercase"
                     onMouseEnter={() => setHoveredNav(item.toLowerCase())}
                     onMouseLeave={() => setHoveredNav(null)}
                   >
                     <ScrambleText text={item} active={hoveredNav === item.toLowerCase()} />
                   </div>
                </MagneticButton>
               )
            })}
          </div>
        </div>

        <div className="fixed bottom-8 left-8 z-10 flex flex-col gap-2 text-[10px] text-neutral-500 tracking-widest font-medium">
           <button 
             onClick={() => setIsTerminalOpen(true)}
             className="interactive flex items-center gap-2.5 hover:text-accent-green transition-colors duration-300 text-left group/terminal"
           >
             <Terminal size={12} className="opacity-60 group-hover/terminal:opacity-100 transition-opacity" />
             <span ref={statsRef} className="font-mono text-neutral-600 group-hover/terminal:text-neutral-400">SYS.coords: 0, 0</span>
             <span className="ml-1 text-[9px] opacity-40 group-hover/terminal:opacity-60 transition-opacity">open shell</span>
           </button>
           <div className="flex items-center gap-2.5 text-neutral-600">
             <Cpu size={12} className="opacity-60" />
             <span className="font-mono">MEM: {Math.floor(mousePosRef.current.x / 20)} MB</span>
           </div>
        </div>
        
        <div className="fixed bottom-8 right-8 flex flex-col gap-5 z-10">
          <a href="https://github.com/ItsAkshatSh" target="_blank" rel="noopener noreferrer" className="interactive text-neutral-500 hover:text-white transition-all duration-300 opacity-80 hover:opacity-100 hover:-translate-y-0.5" aria-label="GitHub"><Github size={22} strokeWidth={1.5} /></a>
          <a href="https://www.instagram.com/akshat.ssh/" target="_blank" rel="noopener noreferrer" className="interactive text-neutral-500 hover:text-white transition-all duration-300 opacity-80 hover:opacity-100 hover:-translate-y-0.5" aria-label="Instagram"><Instagram size={22} strokeWidth={1.5} /></a>
          <a href="https://www.linkedin.com/in/akshat404/" target="_blank" rel="noopener noreferrer" className="interactive text-neutral-500 hover:text-white transition-all duration-300 opacity-80 hover:opacity-100 hover:-translate-y-0.5" aria-label="LinkedIn"><Linkedin size={22} strokeWidth={1.5} /></a>
        </div>
      </main>

      {isTerminalOpen && (
        <TerminalModal 
          onClose={() => setIsTerminalOpen(false)} 
          onNavigate={setActiveSection} 
        />
      )}

      {isBlogOpen && (
        <>
          <div 
            className="fixed inset-0 z-[99] cursor-none" 
            onClick={() => setIsBlogOpen(false)}
            aria-hidden="true"
          />
          <BlogWindow onClose={() => setIsBlogOpen(false)} />
        </>
      )}

      {activeSection && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md animate-fade-in cursor-none"
            onClick={() => setActiveSection(null)}
            aria-label="Close sidebar"
          />
          <div 
            className="fixed inset-0 z-40 flex items-center justify-end pointer-events-none"
          >
            <div 
              className="w-full md:w-3/4 lg:w-2/3 h-full bg-surface border-l border-white/[0.06] p-8 md:p-16 flex flex-col shadow-2xl pointer-events-auto"
              style={{ animation: 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex justify-between items-center mb-12 shrink-0">
              <div>
                <h2 className="text-4xl md:text-6xl font-light uppercase tracking-tighter text-neutral-100 mb-3">
                  <ScrambleText text={activeSection} active={true} />
                </h2>
                <div className="h-px w-20 bg-gradient-to-r from-cyan-500/40 to-transparent" />
              </div>
              <button 
                onClick={() => setActiveSection(null)}
                className="interactive p-3 rounded-full hover:bg-white/5 transition-all duration-300 text-neutral-400 hover:text-white hover:rotate-90"
                aria-label="Close"
              >
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>

            <div
              onScroll={syncLockPosition}
              className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-24"
            >
              {activeSection === 'projects' && <ProjectsContent />}
              {activeSection === 'photography' && <PhotographyContent selectedImg={selectedImg} onCloseImg={() => setSelectedImg(null)} onSelectImg={setSelectedImg} />}
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