import React, { useState, useEffect } from 'react';

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

export default ScrambleText;
