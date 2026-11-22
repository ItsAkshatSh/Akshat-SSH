/**
 * PhotoCursor
 * Replacement pointer for the photo strip. While a frame is hovered, the
 * native cursor is hidden and this arrow travels with the real pointer,
 * carrying that photo's place in a tinted tag. Purely visual: no pointer
 * events, no announcement (the frame's aria-label already names the photo).
 */
'use client';

import { motion } from 'framer-motion';

const MouseIcon = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={26}
    viewBox="0 0 26 31"
    fill="none"
    aria-hidden="true"
    className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]"
  >
    <g clipPath="url(#photo-cursor-clip)">
      <path
        fill={color}
        fillRule="evenodd"
        stroke="#fff"
        strokeLinecap="square"
        strokeWidth={2}
        d="M21.993 14.425 2.549 2.935l4.444 23.108 4.653-10.002z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="photo-cursor-clip">
        <path fill={color} d="M0 0h26v31H0z" />
      </clipPath>
    </defs>
  </svg>
);

const PhotoCursor = ({ x, y, color = '#22c55e', label, active = false }) => (
  <motion.div
    aria-hidden="true"
    className="pointer-events-none fixed left-0 top-0 z-tooltip"
    style={{ x, y }}
    initial={false}
    animate={{
      opacity: active ? 1 : 0,
      scale: active ? 1 : 0.6,
    }}
    transition={{ duration: 0.15, ease: 'easeInOut' }}
  >
    <MouseIcon color={color} />
    {label ? (
      <div
        className="ml-4 mt-1 w-max max-w-[13rem] truncate rounded-[5px] px-2 py-[3px] font-mono text-[10.5px] tracking-[0.04em] text-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.7)]"
        style={{
          background: `color-mix(in oklab, ${color} 55%, #16110d)`,
        }}
      >
        {label}
      </div>
    ) : null}
  </motion.div>
);

export default PhotoCursor;
