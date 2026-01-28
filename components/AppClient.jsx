import React, { useState, useEffect, useRef } from 'react';
import { Github, Instagram, Linkedin, Terminal, Cpu } from 'lucide-react';
import { X } from 'lucide-react';

// Utilities
import ScrambleText from './utilities/ScrambleText';
import MagneticButton from './utilities/MagneticButton';
import StaggerItem from './utilities/StaggerItem';
import InfoCard from './utilities/InfoCard';

// Components
import StarField from './StarField';
import SnakeGame from './SnakeGame';
import TerminalModal from './TerminalModal';
import BlogWindow from './blog/BlogWindow';

// Content
import ProjectsContent from './content/ProjectsContent';
import PhotographyContent from './content/PhotographyContent';
import ExperienceContent from './content/ExperienceContent';


// --- MAIN APP COMPONENT ---

const App = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState({
    active: false,
    width: 40,
    height: 40,
    borderRadius: '50%',
  });
  const [time, setTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let rafId;
    const handleMouseMove = (e) => {
      rafId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest('button, a, input, .interactive');
      if (target) {
        const rect = target.getBoundingClientRect();
        setCursorState({
          active: true,
          width: rect.width + 20,
          height: rect.height + 20,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          borderRadius: getComputedStyle(target).borderRadius || '8px',
        });
      } else {
        setCursorState((prev) => ({ ...prev, active: false }));
      }
    };
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    return () => document.removeEventListener('mouseover', handleMouseOver);
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
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 0px; }
        .scanline { background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 51%); background-size: 100% 4px; }
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
         className="fixed pointer-events-none z-[200] transition-all duration-100 ease-out mix-blend-exclusion"
         style={{
           left: cursorState.active ? cursorState.x : mousePos.x,
           top: cursorState.active ? cursorState.y : mousePos.y,
           transform: 'translate(-50%, -50%)',
         }}
       >
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full transition-opacity duration-300 ${cursorState.active ? 'opacity-0' : 'opacity-100'}`} />
        <div
          className="border-[1px] border-white transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
          style={{
            width: cursorState.active ? `${cursorState.width}px` : '40px',
            height: cursorState.active ? `${cursorState.height}px` : '40px',
            borderRadius: cursorState.active ? cursorState.borderRadius : '50%',
            transform: cursorState.active ? 'rotate(0deg)' : 'rotate(45deg)',
            borderStyle: cursorState.active ? 'solid' : 'dotted',
            animation: !cursorState.active ? 'spin 8s linear infinite' : 'none',
          }}
        />
      </div>

      <main className={`relative z-10 w-full h-screen flex items-center justify-center transition-opacity duration-500 ${activeSection ? 'opacity-10 blur-sm pointer-events-none' : 'opacity-100'}`}>
        
        <div className="relative w-[800px] h-[600px] max-w-full flex items-center">
          <div className="interactive relative z-10 group w-[300px] h-[400px] flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500" onMouseEnter={() => setShowInfoCard(true)} onMouseLeave={() => setShowInfoCard(false)}>
            <div className="w-full h-full bg-[#050505] border border-neutral-800 overflow-hidden flex items-center justify-center relative group-hover:border-white/20 transition-colors">
               <img 
                  src="/images/ascii/ascii.png"
                  alt="ASCII Art" 
                  className="w-full h-full object-cover opacity-60 mix-blend-hard-light transition-opacity duration-500"
               />
               <div className="absolute inset-0 scanline opacity-20 pointer-events-none"></div>
            </div>
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
                   <div className="w-2 h-2 bg-neutral-600 group-hover:bg-white transition-colors" />
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

        <div className="fixed bottom-8 left-8 z-10 flex flex-col gap-1 text-[10px] text-neutral-600 tracking-widest font-bold">
           <button 
             onClick={() => setIsTerminalOpen(true)}
             className="interactive flex items-center gap-2 hover:text-green-500 transition-colors text-left"
           >
             <Terminal size={10} />
             <span>SYS.coords: {mousePos.x}, {mousePos.y}</span>
             <span className="ml-2 opacity-50 animate-pulse">[CLICK TO OPEN SHELL]</span>
           </button>
           <div className="flex items-center gap-2">
             <Cpu size={10} />
             <span>MEM: {Math.floor(mousePos.x / 20)} MB</span>
           </div>
        </div>
        
        <div className="fixed bottom-8 right-8 flex flex-col gap-6 z-10">
          <a href="https://github.com/ItsAkshatSh" target="_blank" rel="noopener noreferrer" className="interactive text-white-400 hover:text-cyan-200 transition-all hover:scale-125 duration-300 opacity-70 hover:opacity-100"><Github size={24} strokeWidth={1.5} /></a>
          <a href="https://www.instagram.com/akshat.ssh/" target="_blank" rel="noopener noreferrer" className="interactive text-white-400 hover:text-cyan-200 transition-all hover:scale-125 duration-300 opacity-70 hover:opacity-100"><Instagram size={24} strokeWidth={1.5} /></a>
          <a href="https://www.linkedin.com/in/akshat404/" target="_blank" rel="noopener noreferrer" className="interactive text-white-400 hover:text-cyan-200 transition-all hover:scale-125 duration-300 opacity-70 hover:opacity-100"><Linkedin size={24} strokeWidth={1.5} /></a>
        </div>
      </main>

      {isTerminalOpen && (
        <TerminalModal 
          onClose={() => setIsTerminalOpen(false)} 
          onNavigate={setActiveSection} 
        />
      )}

      {isBlogOpen && (
        <BlogWindow onClose={() => setIsBlogOpen(false)} />
      )}

      <InfoCard isVisible={showInfoCard} mousePos={mousePos} />

      {activeSection && (
        <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full md:w-3/4 lg:w-2/3 h-full bg-[#0a0a0a] border-l border-neutral-800 p-8 md:p-16 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-800 to-transparent" />

            <div className="flex justify-between items-center mb-12 shrink-0">
              <div>
                <h2 className="text-5xl md:text-7xl font-thin uppercase tracking-tighter text-neutral-100 mb-2">
                  <ScrambleText text={activeSection} active={true} />
                </h2>
                <div className="h-[1px] w-24 bg-white/20" />
              </div>
              <button 
                onClick={() => setActiveSection(null)}
                className="interactive p-4 hover:rotate-90 transition-transform duration-300 text-neutral-500 hover:text-white"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-20">
              {activeSection === 'projects' && <ProjectsContent />}
              {activeSection === 'photography' && <PhotographyContent />}
              {activeSection === 'experience' && <ExperienceContent />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
