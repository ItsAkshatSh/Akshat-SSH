import React, { useEffect, useState, useRef } from 'react';

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
    
    const tileCountX = Math.floor(canvas.width / gridSize);
    const tileCountY = Math.floor(canvas.height / gridSize);
    
    let velocity = { x: 0, y: 0 };
    let trail = [];
    let tail = 5;
    
    let player = { x: 10, y: 10 };
    let apple = { x: 15, y: 10 };
    
    let gameInterval;

    const keyDownEvent = (e) => {
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

      if(player.x < 0) player.x = tileCountX - 1;
      if(player.x > tileCountX - 1) player.x = 0;
      if(player.y < 0) player.y = tileCountY - 1;
      if(player.y > tileCountY - 1) player.y = 0;

      ctx.fillStyle = '#0c0c0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);

      ctx.fillStyle = '#4ade80';
      for(let i = 0; i < trail.length; i++) {
        ctx.fillRect(trail[i].x * gridSize, trail[i].y * gridSize, gridSize - 2, gridSize - 2);
        
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

      if(apple.x === player.x && apple.y === player.y) {
        tail++;
        setScore(s => s + 1);
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
            className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors font-mono text-xs cursor-none"
          >
            EXIT TO SHELL
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
