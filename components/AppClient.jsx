import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, X, Github, Instagram, Linkedin, Mail, Terminal, Cpu, Maximize2, ChevronRight } from 'lucide-react';

// --- UTILITIES ---

// Scramble Text Component
const ScrambleText = ({ text, active, speed = 30 }) => {
  const [display, setDisplay] = useState(text);
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~';
  
  useEffect(() => {
    let interval;
    let iteration = 0;
    
    if (active) {
      interval = setInterval(() => {
        setDisplay(
          text
            .split('')
            .map((letter, index) => {
              if (index < iteration) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );
        
        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, speed);
    } else {
      setDisplay(text);
    }
    return () => clearInterval(interval);
  }, [active, text, speed]);

  return <span>{display}</span>;
};

// Magnetic Button Component
const MagneticButton = ({ children, className, onClick }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className={className}
    >
      {children}
    </button>
  );
};

// Fade In Stagger Wrapper
const StaggerItem = ({ children, index, className }) => (
  <div 
    className={`transform transition-all duration-700 ease-out ${className}`}
    style={{
      opacity: 0,
      animation: `slideUpFade 0.6s ease-out forwards ${index * 0.1 + 0.3}s`
    }}
  >
    {children}
  </div>
);

// --- SNAKE GAME COMPONENT (FIXED) ---
const SnakeGame = ({ onExit }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    
    // FIX: Calculate X and Y tile counts separately for rectangular canvas
    const tileCountX = Math.floor(canvas.width / gridSize);
    const tileCountY = Math.floor(canvas.height / gridSize);
    
    let velocity = { x: 0, y: 0 };
    let trail = [];
    let tail = 5;
    
    let player = { x: 10, y: 10 };
    let apple = { x: 15, y: 10 }; // Adjusted safe spawn
    
    let gameInterval;

    const keyDownEvent = (e) => {
      // Prevent default scrolling
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }

      switch(e.key) {
        case 'ArrowLeft': 
          if(velocity.x !== 1) { velocity = { x: -1, y: 0 }; setGameStarted(true); }
          break;
        case 'ArrowUp': 
          if(velocity.y !== 1) { velocity = { x: 0, y: -1 }; setGameStarted(true); }
          break;
        case 'ArrowRight': 
          if(velocity.x !== -1) { velocity = { x: 1, y: 0 }; setGameStarted(true); }
          break;
        case 'ArrowDown': 
          if(velocity.y !== -1) { velocity = { x: 0, y: 1 }; setGameStarted(true); }
          break;
        case 'Escape': 
          onExit(); 
          break;
        default:
          break;
      }
    };

    const update = () => {
      if (gameOver) return;

      player.x += velocity.x;
      player.y += velocity.y;

      // FIX: Wrap around logic using correct dimensions
      if(player.x < 0) player.x = tileCountX - 1;
      if(player.x > tileCountX - 1) player.x = 0;
      if(player.y < 0) player.y = tileCountY - 1;
      if(player.y > tileCountY - 1) player.y = 0;

      // Draw Background
      ctx.fillStyle = '#0c0c0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Apple
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);

      // Draw Snake
      ctx.fillStyle = '#4ade80';
      for(let i = 0; i < trail.length; i++) {
        ctx.fillRect(trail[i].x * gridSize, trail[i].y * gridSize, gridSize - 2, gridSize - 2);
        
        // Collision check
        if ((velocity.x !== 0 || velocity.y !== 0) && 
            trail[i].x === player.x && trail[i].y === player.y) {
          setGameOver(true);
          return;
        }
      }

      trail.push({ x: player.x, y: player.y });
      while(trail.length > tail) {
        trail.shift();
      }

      // Apple Collision
      if(apple.x === player.x && apple.y === player.y) {
        tail++;
        setScore(s => s + 1);
        // FIX: Spawn apple within valid Y bounds
        apple.x = Math.floor(Math.random() * tileCountX);
        apple.y = Math.floor(Math.random() * tileCountY);
      }
    };

    document.addEventListener('keydown', keyDownEvent);
    gameInterval = setInterval(update, 1000/15);

    return () => {
      clearInterval(gameInterval);
      document.removeEventListener('keydown', keyDownEvent);
    };
  }, [gameOver, onExit]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center h-full w-full bg-black/50 relative outline-none"
      tabIndex="0"
    >
      <div className="absolute top-2 right-4 text-green-500 font-mono">SCORE: {score}</div>
      <div className="absolute top-2 left-4 text-neutral-500 font-mono text-xs">[ESC] TO QUIT</div>
      
      <canvas 
        ref={canvasRef} 
        width="400" 
        height="300" 
        className="border border-neutral-800 bg-[#0c0c0c] shadow-lg"
      />

      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10 pointer-events-none">
           <p className="text-white animate-pulse font-mono">PRESS ARROW KEYS TO START</p>
        </div>
      )}
      
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <h3 className="text-red-500 text-xl mb-2 font-bold">GAME OVER</h3>
          <p className="text-white mb-4">Final Score: {score}</p>
          <button 
            onClick={onExit}
            className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors font-mono text-xs cursor-pointer"
          >
            EXIT TO SHELL
          </button>
        </div>
      )}
    </div>
  );
};

// --- TERMINAL COMPONENT ---
const TerminalModal = ({ onClose, onNavigate }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'Connected to akshat.ssh session...' },
    { type: 'system', content: 'Type "help" for available commands.' },
  ]);
  const [isSnakeActive, setIsSnakeActive] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isSnakeActive && inputRef.current) inputRef.current.focus();
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [history, isSnakeActive]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const rawCmd = input.trim();
      const args = rawCmd.split(' ');
      const cmd = args[0].toLowerCase();
      
      const newHistory = [...history, { type: 'user', content: rawCmd }];
      
      switch (cmd) {
        case 'help':
          newHistory.push({ type: 'output', content: `Available commands:
  ls        - List sections
  cd [dir]  - Navigate to section
  whoami    - User info
  snake     - Play Snake Game
  date      - Show system date
  uptime    - Session duration
  sudo      - Admin privileges?
  clear     - Clear screen
  exit      - Close terminal` });
          break;
        case 'ls':
          newHistory.push({ type: 'output', content: 'drwx------ projects\ndrwx------ photography\ndrwx------ experience' });
          break;
        case 'cd':
          const target = args[1];
          if (['projects', 'photography', 'experience'].includes(target)) {
             newHistory.push({ type: 'output', content: `Navigating to /${target}...` });
             setTimeout(() => {
                onNavigate(target);
                onClose();
             }, 800);
          } else if (!target) {
             newHistory.push({ type: 'error', content: 'Usage: cd [directory]' });
          } else {
             newHistory.push({ type: 'error', content: `Directory not found: ${target}` });
          }
          break;
        case 'whoami':
          newHistory.push({ type: 'output', content: 'User: Visitor\nRole: Guest\nAccess: Read-Only' });
          break;
        case 'date':
           newHistory.push({ type: 'output', content: new Date().toString() });
           break;
        case 'uptime':
           const diff = Math.floor((Date.now() - startTime) / 1000);
           const mins = Math.floor(diff / 60);
           const secs = diff % 60;
           newHistory.push({ type: 'output', content: `Session uptime: ${mins}m ${secs}s` });
           break;
        case 'sudo':
           newHistory.push({ type: 'error', content: `visitor is not in the sudoers file. This incident will be reported.` });
           break;
        case 'snake':
           setIsSnakeActive(true);
           newHistory.push({ type: 'system', content: 'Launching /bin/snake...' });
           break;
        case 'clear':
          setHistory([]);
          setInput('');
          return;
        case 'exit':
          onClose();
          return;
        case '':
          break;
        default:
          newHistory.push({ type: 'error', content: `Command not found: ${cmd}` });
      }

      setHistory(newHistory);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[#0c0c0c] border border-neutral-800 rounded-md shadow-2xl overflow-hidden flex flex-col font-mono text-sm h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-neutral-900 p-2 flex items-center justify-between border-b border-neutral-800 select-none flex-shrink-0">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500/50 cursor-pointer hover:bg-red-500" onClick={onClose} />
             <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
             <div className="w-3 h-3 rounded-full bg-green-500/50" />
           </div>
           <div className="text-neutral-500 text-xs">user@akshat.ssh:~</div>
           <div className="w-10" />
        </div>

        {isSnakeActive ? (
          <SnakeGame onExit={() => setIsSnakeActive(false)} />
        ) : (
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-neutral-300" onClick={() => inputRef.current?.focus()}>
            {history.map((line, i) => (
              <div key={i} className={`mb-1 whitespace-pre-wrap ${line.type === 'error' ? 'text-red-400' : line.type === 'user' ? 'text-white' : 'text-green-400/80'}`}>
                 {line.type === 'user' && <span className="text-pink-500 mr-2">$</span>}
                 {line.content}
              </div>
            ))}
            
            <div className="flex items-center text-white">
              <span className="text-pink-500 mr-2">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleCommand}
                className="bg-transparent border-none outline-none flex-1 font-mono text-white caret-white"
                autoFocus
                spellCheck="false"
              />
            </div>
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Star/Grain Particle System ---
const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000); 
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 1.2,
          alpha: Math.random() * 0.5 + 0.1,
          pulseSpeed: 0.02 
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen" />;
};

// --- SUB-CONTENT COMPONENTS ---

const ProjectsContent = () => {
  const projects = [
    {
      id: 1,
      title: "Custom Macropad (9-key + Rotary Encoder)",
      date: "Jun 2025",
      link: "https://github.com/ItsAkshatSh/Macropad",
      stack: ["Hardware", "PCB Design", "KMK Firmware"],
      desc: "Designed and built a custom 9-switch macro pad with rotary encoder and 3D printed case. Created PCB schematic and layout, wired components, and developed firmware using KMK."
    },
    {
      id: 2,
      title: "Sylvoria – Adventure Game",
      date: "Jan 2025 - Apr 2025",
      link: "https://github.com/ItsAkshatSh/Sylvoria",
      stack: ["Game Development", "Python", "Networking"],
      desc: "Developed Sylvoria as part of the Juice HackClub event, committing ~100 hours of development time. Earned travel to China (all expenses paid) by meeting the event's development milestone. Built core game mechanics, user interface, networking, and game systems."
    },
    {
      id: 3,
      title: "J.A.R.V.I.S – Desktop Voice Assistant",
      date: "Oct 2024 - Nov 2024",
      link: "https://github.com/ItsAkshatSh/J.A.R.V.I.S",
      stack: ["Python", "Speech Recognition", "NLP"],
      desc: "Built a Python-based desktop voice assistant inspired by Siri. Integrated speech recognition, text-to-speech, and natural language processing to perform tasks like opening apps, fetching information, and playing music."
    },
    {
      id: 4,
      title: "Emotion Recognition",
      date: "Jun 2024",
      link: "https://github.com/ItsAkshatSh/Emotion-recognition",
      stack: ["Python", "OpenCV", "TensorFlow", "Deep Learning"],
      desc: "Built a facial emotion recognition system using deep learning (computer vision). Used face detection with OpenCV to isolate faces and applied CNN models to classify emotions with real-time prediction capabilities."
    }
  ];

  return (
    <div className="space-y-6">
      {projects.map((project, i) => (
        <StaggerItem key={project.id} index={i}>
          <div className="interactive group border-l-2 border-neutral-700 hover:border-green-400 transition-colors px-6 py-6 bg-neutral-900/20 hover:bg-neutral-900/40 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl text-neutral-200 font-light group-hover:text-white transition-colors">
                  {project.title}
                </h3>
                <p className="text-neutral-600 text-xs">{project.date}</p>
              </div>
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 text-xs hover:text-green-300 whitespace-nowrap ml-4 font-mono"
              >
                github ↗
              </a>
            </div>

            <p className="text-neutral-400 leading-relaxed mb-4 font-light text-sm">
              {project.desc}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.stack.map(tech => (
                <span 
                  key={tech} 
                  className="text-[10px] border border-neutral-700 bg-neutral-900/60 px-2 py-1 text-neutral-300 font-mono uppercase hover:border-neutral-500 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </StaggerItem>
      ))}
    </div>
  );
};

const PhotographyContent = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  // Image files located in public/images/photography
  const photos = [
    'imag1.JPG',
    'IMG_4793.JPG',
    'IMG_5043.JPG',
    'IMG_5058.JPG',
    'IMG_5135.JPG',
    'IMG_5175.JPG',
    'IMG_5220.JPG',
    'IMG_5227.JPG',
    'IMG_5395.JPG'
  ];

  return (
    <>
      <div className="columns-1 md:columns-2 gap-4 space-y-4">
        {photos.map((file, i) => (
          <StaggerItem key={file} index={i} className="break-inside-avoid">
            <div 
              className="interactive relative group overflow-hidden cursor-pointer"
              onClick={() => setSelectedImg(file)}
            >
              <div className="w-full aspect-[3/4] bg-neutral-900 border border-neutral-800 group-hover:border-white/50 transition-colors duration-500 flex items-center justify-center relative overflow-hidden">
                 <img
                   src={`/images/photography/${file}`}
                   alt={file}
                   className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 brightness-110"
                 />

                 {/* Hover HUD Overlay */}
                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] text-white font-mono">
                       <span>[ RAW ]</span>
                       <span className="text-xs">{file}</span>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 flex items-center justify-center">
                       <div className="w-1 h-1 bg-white/50"></div>
                    </div>
                    <div className="flex justify-between items-end text-[10px] text-white font-mono">
                       <span className="text-xs">Click to expand</span>
                       <Maximize2 size={14} />
                    </div>
                 </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setSelectedImg(null)}
        >
          <div className="max-w-[90vw] max-h-[90vh]">
            <img src={`/images/photography/${selectedImg}`} alt={selectedImg} className="w-full h-full object-contain rounded shadow-xl" />
            <div className="mt-3 text-center text-neutral-300 text-sm">{selectedImg}</div>
          </div>
          <button className="absolute top-6 right-6 text-neutral-400 hover:text-white" aria-label="Close" onClick={() => setSelectedImg(null)}>
            <X size={22} />
          </button>
        </div>
      )}
    </>
  );
};

const ExperienceContent = () => {
  const [expanded, setExpanded] = useState({});

  const education = [
    { level: "Senior Secondary (XII), Science", school: "Indian International School, Dubai", board: "CBSE", year: "2026" }
  ];

  const jobs = [
    { 
      role: "Event Organizer – Hackathon/Game Jam", 
      company: "Hackclub, Dubai", 
      time: "Oct 2024 - Nov 2024 (2 months)", 
      type: "Internship",
      bullets: [
        "Hosted a Game Jam/Hackathon in downtown Dubai with 30+ participants.",
        "Coordinated event logistics, participant engagement, and technical support.",
        "Collaborated with HackClub to deliver an impactful community-driven coding event.",
        "Gained hands-on experience in event management, leadership, and community building."
      ]
    }
  ];

  const projects = [
    {
      title: "Custom Macropad (9-key + Rotary Encoder)",
      date: "Jun 2025",
      link: "https://github.com/ItsAkshatSh/Macropad",
      desc: "Designed and built a custom 9-switch macro pad with rotary encoder and 3D printed case. Created PCB schematic and layout, wired components, and developed firmware using KMK."
    },
    {
      title: "Sylvoria – Adventure Game",
      date: "Jan 2025 - Apr 2025",
      link: "https://github.com/ItsAkshatSh/Sylvoria",
      desc: "Developed Sylvoria as part of the Juice HackClub event, committing ~100 hours of development time. Earned travel to China (all expenses paid) by meeting the event's development milestone. Built core game mechanics, user interface, networking, and game systems."
    },
    {
      title: "J.A.R.V.I.S – Desktop Voice Assistant",
      date: "Oct 2024 - Nov 2024",
      link: "https://github.com/ItsAkshatSh/J.A.R.V.I.S",
      desc: "Built a Python-based desktop voice assistant inspired by Siri. Integrated speech recognition, text-to-speech, and natural language processing to perform tasks like opening apps, fetching information, and playing music."
    },
    {
      title: "Emotion Recognition",
      date: "Jun 2024",
      link: "https://github.com/ItsAkshatSh/Emotion-recognition",
      desc: "Built a facial emotion recognition system using deep learning (computer vision). Used face detection with OpenCV to isolate faces and applied CNN models to classify emotions with real-time prediction capabilities."
    }
  ];

  const skills = ["Python", "JavaScript", "React", "Node.js", "Flask", "HTML5", "CSS3", "OpenCV", "TensorFlow", "Game Development", "PCB Design", "Git", "GitHub", "Problem Solving", "Leadership"];

  const accomplishments = [
    "Won an international hackathon by developing an innovative project under time-bound constraints, competing with students from multiple countries",
    "Secured 1st place in a national-level coding competition with my team, outperforming participants from across the country",
    "Won a state-level coding competition, demonstrating advanced problem-solving and programming skills",
    "Attended workshops at the American University of Sharjah, gaining advanced exposure to computer science concepts and practical applications",
    "Completed Harvard's CS50 course, acquiring strong foundational skills in computer science and programming",
    "Represented Sky Sports as an IPC delegate at the F1CC Committee, earning an Honorable Mention for outstanding participation and contributions"
  ];

  const socials = [
    { label: "GitHub", url: "https://github.com/ItsAkshatSh" },
    { label: "Instagram", url: "https://www.instagram.com/akshat.ssh/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/akshat404/" }
  ];

  return (
    <div className="relative space-y-12">
      {/* Education */}
      <section>
        <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-6 border-b border-neutral-700 pb-3">Education</h3>
        {education.map((edu, i) => (
          <StaggerItem key={i} index={i} className="mb-6">
            <div className="interactive group">
              <h4 className="text-xl text-neutral-200 font-light group-hover:text-white transition-colors">{edu.level}</h4>
              <p className="text-neutral-500 text-sm">{edu.school} • {edu.board}</p>
              <p className="text-neutral-600 text-xs">Expected: {edu.year}</p>
            </div>
          </StaggerItem>
        ))}
      </section>

      {/* Work Experience */}
      <section>
        <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-6 border-b border-neutral-700 pb-3">Work Experience</h3>
        {jobs.map((job, i) => (
          <StaggerItem key={i} index={i} className="mb-8">
            <div className="interactive group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xl text-neutral-200 font-light group-hover:text-white transition-colors">{job.role}</h4>
                  <p className="text-neutral-500 text-sm">{job.company} • {job.type}</p>
                </div>
                <span className="text-neutral-600 text-xs whitespace-nowrap ml-4">{job.time}</span>
              </div>
              <ul className="text-neutral-400 text-sm space-y-2 mt-3 ml-4">
                {job.bullets.map((bullet, bi) => (
                  <li key={bi} className="flex gap-3">
                    <span className="text-green-400 flex-shrink-0">→</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </section>

      {/* Skills */}
      <section>
        <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-6 border-b border-neutral-700 pb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="text-[11px] border border-neutral-600 bg-neutral-900/50 px-3 py-1 text-neutral-300 font-mono hover:border-neutral-400 transition-colors">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Accomplishments */}
      <section>
        <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-6 border-b border-neutral-700 pb-3">Accomplishments</h3>
        <ul className="space-y-4">
          {accomplishments.map((acc, i) => (
            <StaggerItem key={i} index={i}>
              <li className="flex gap-3 text-neutral-400 text-sm leading-relaxed group interactive">
                <span className="text-green-400 flex-shrink-0 mt-1">✦</span>
                <span className="group-hover:text-neutral-300 transition-colors">{acc}</span>
              </li>
            </StaggerItem>
          ))}
        </ul>
      </section>

      {/* Links */}
      <section className="border-t border-neutral-800 pt-8">
        <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-6">Links</h3>
        <div className="space-y-2">
          {socials.map((social, i) => (
            <a 
              key={i}
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-green-400 hover:text-green-300 text-sm transition-colors"
            >
              {social.label} ↗
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    document.addEventListener('mouseover', handleMouseOver);
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

      <div className="fixed top-8 left-8 z-30 mix-blend-difference pointer-events-none select-none">
         <h1 
           className="text-3xl md:text-4xl text-white tracking-tighter opacity-90"
           style={{ fontFamily: '"Silkscreen", cursive' }}
         >
           akshat.ssh<span className="text-white-500 animate-pulse">_</span>
         </h1>
      </div>

      <div
        className="fixed pointer-events-none z-50 transition-all duration-100 ease-out mix-blend-exclusion"
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
          <div className="interactive relative z-10 group w-[300px] h-[400px] flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
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

            {['Projects', 'Photography', 'Experience'].map((item, index) => {
               const positions = [
                  'top-[50px] left-[120px]',
                  'top-[180px] -translate-y-1/2 right-[40px]',
                  'bottom-[50px] left-[120px]'
               ];
               return (
                <MagneticButton 
                  key={item}
                  onClick={() => setActiveSection(item.toLowerCase())}
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
