import React, { useState, useEffect, useRef } from 'react';
import SnakeGame from './SnakeGame';

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (isSnakeActive) setIsSnakeActive(false);
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSnakeActive, onClose]);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-sm h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white/[0.04] px-4 py-3 flex items-center justify-between border-b border-white/[0.06] select-none flex-shrink-0">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500/60 cursor-none hover:bg-red-500 transition-colors duration-200" onClick={onClose} />
             <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
             <div className="w-3 h-3 rounded-full bg-green-500/60" />
           </div>
           <div className="text-neutral-500 text-xs font-medium">user@akshat.ssh:~</div>
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

export default TerminalModal;
