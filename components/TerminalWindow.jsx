import React, { useState, useEffect, useRef } from 'react';
import { X, Minus } from 'lucide-react';
import SnakeGame from './SnakeGame';

const TerminalWindow = ({ onClose, onNavigate }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'Connected to akshat.ssh session...' },
    { type: 'system', content: 'Type "help" for available commands.' },
  ]);
  const [isSnakeActive, setIsSnakeActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const centerX = (window.innerWidth - 760) / 2;
      const centerY = (window.innerHeight - 520) / 2;
      setPosition({ x: Math.max(20, centerX), y: Math.max(20, centerY) });
    }
  }, []);

  useEffect(() => {
    if (!isSnakeActive && !isMinimized && inputRef.current) inputRef.current.focus();
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [history, isSnakeActive, isMinimized]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (isSnakeActive) setIsSnakeActive(false);
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSnakeActive, onClose]);

  const handleMouseDown = (e) => {
    if (isMobile) return;
    if (e.target.closest('.window-drag-handle')) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
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
      case 'cd': {
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
      }
      case 'whoami':
        newHistory.push({ type: 'output', content: 'User: Visitor\nRole: Guest\nAccess: Read-Only' });
        break;
      case 'date':
        newHistory.push({ type: 'output', content: new Date().toString() });
        break;
      case 'uptime': {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        newHistory.push({ type: 'output', content: `Session uptime: ${mins}m ${secs}s` });
        break;
      }
      case 'sudo':
        newHistory.push({ type: 'error', content: 'visitor is not in the sudoers file. This incident will be reported.' });
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
  };

  if (isMinimized && !isMobile) {
    return (
      <div
        className="fixed bg-surface-elevated border border-white/[0.08] rounded-t-lg shadow-2xl z-[100] cursor-pointer hover:bg-white/[0.04] transition-colors"
        style={{ left: `${position.x}px`, bottom: 0, width: '220px', height: '32px' }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="window-drag-handle h-full flex items-center px-4 text-xs text-neutral-300 font-mono">
          Shell — user@akshat.ssh
        </div>
      </div>
    );
  }

  const frameStyle = isMobile
    ? { left: 0, top: 0, width: '100vw', height: '100dvh' }
    : {
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '760px',
        height: '520px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: 'calc(100vh - 40px)',
      };

  return (
    <div
      className={`fixed bg-surface-elevated border border-white/[0.08] shadow-2xl z-[100] flex flex-col overflow-hidden font-mono text-sm ${isMobile ? '' : 'rounded-xl'}`}
      style={frameStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
    >
      <div
        className={`window-drag-handle bg-white/[0.04] h-11 md:h-9 flex items-center justify-between px-4 select-none border-b border-white/[0.06] ${isMobile ? '' : 'cursor-move'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="w-3.5 h-3.5 md:w-3 md:h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff4747] transition-colors flex items-center justify-center"
              aria-label="Close terminal"
            >
              <X size={8} className="opacity-0 hover:opacity-100" />
            </button>
            {!isMobile && (
              <button
                onClick={() => setIsMinimized(true)}
                className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffa700] transition-colors"
                aria-label="Minimize terminal"
              >
                <Minus size={8} className="opacity-0 hover:opacity-100" />
              </button>
            )}
            <div className="w-3.5 h-3.5 md:w-3 md:h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-neutral-400 ml-4">Shell</span>
        </div>
        <span className="text-[11px] text-neutral-500 hidden sm:inline">user@akshat.ssh:~</span>
        {isMobile && (
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white" aria-label="Close terminal">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
        {isSnakeActive ? (
          <SnakeGame onExit={() => setIsSnakeActive(false)} />
        ) : (
          <div
            className="flex-1 p-4 overflow-y-auto custom-scrollbar text-neutral-300"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((line, i) => (
              <div
                key={i}
                className={`mb-1 whitespace-pre-wrap leading-relaxed ${
                  line.type === 'error' ? 'text-red-400' : line.type === 'user' ? 'text-neutral-100' : 'text-accent-green/80'
                }`}
              >
                {line.type === 'user' && <span className="text-accent-green mr-2">$</span>}
                {line.content}
              </div>
            ))}

            <div className="flex items-center text-neutral-100 mt-1">
              <span className="text-accent-green mr-2">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleCommand}
                className="bg-transparent border-none outline-none flex-1 font-mono text-neutral-100 caret-accent-green"
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

export default TerminalWindow;
