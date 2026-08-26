import React, { useState, useEffect } from 'react';

const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~';

/**
 * Scramble-in text effect. By default uses a fixed interval (`speed`).
 * Pass `duration` to finish within a target time regardless of length —
 * useful for long blog titles.
 */
const ScrambleText = ({ text, active, speed = 30, duration }) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let interval;
    let iteration = 0;

    if (active) {
      const tickMs = duration ? 16 : speed;
      const step = duration
        ? text.length / Math.max(1, duration / tickMs)
        : 1 / 3;

      interval = setInterval(() => {
        setDisplay(
          text
            .split('')
            .map((letter, index) => {
              if (letter === ' ') return ' ';
              if (index < iteration) return text[index];
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            })
            .join('')
        );

        if (iteration >= text.length) clearInterval(interval);
        iteration += step;
      }, tickMs);
    } else {
      setDisplay(text);
    }

    return () => clearInterval(interval);
  }, [active, text, speed, duration]);

  return <span>{display}</span>;
};

export default ScrambleText;
