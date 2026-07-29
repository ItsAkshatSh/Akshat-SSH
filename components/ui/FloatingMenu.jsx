import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Liquid-morph floating menu.
 *
 * Collapsed: a cream pill that reads "MENU" with a small hamburger.
 * Expanded: the pill morphs into a taller rounded square while a dark
 * disc sweeps up from below and reveals the section items. Each item
 * has a character-roll hover effect (stacked twin characters translate
 * upward in a staggered wave), so the interaction feels like a subtle
 * split-flap board, which fits the monospace/ASCII aesthetic.
 *
 * Adapted from the source ref to a black-and-white monochrome palette
 * and JetBrains Mono typography so it reads as part of the ASCII world
 * rather than a splash of colour.
 */

const ease = [0.22, 1, 0.36, 1];

// The two panels: cream (collapsed) and dark (expanded reveal).
const CREAM = '#e8e6df';
const CREAM_BORDER = '#c4c1b8';
const INK = '#0a0a0a';
const INK_TEXT = '#e8e6df';

function MenuButton({ label, onClick, isOpen, index }) {
  const [hovered, setHovered] = useState(false);
  const animatingRef = useRef(false);
  const pendingLeaveRef = useRef(false);
  const chars = label.split('');
  const lockDuration = 30 * chars.length + 300;

  const handleEnter = useCallback(() => {
    pendingLeaveRef.current = false;
    if (hovered) return;
    setHovered(true);
    animatingRef.current = true;
    setTimeout(() => {
      animatingRef.current = false;
      if (pendingLeaveRef.current) {
        pendingLeaveRef.current = false;
        setHovered(false);
      }
    }, lockDuration);
  }, [hovered, lockDuration]);

  const handleLeave = useCallback(() => {
    if (animatingRef.current) {
      pendingLeaveRef.current = true;
    } else {
      setHovered(false);
    }
  }, []);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="interactive uppercase leading-none overflow-hidden"
      style={{
        color: INK_TEXT,
        fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
        fontWeight: 500,
        fontSize: '22px',
        letterSpacing: '-0.01em',
        height: '1em',
      }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{
        duration: 0.4,
        delay: isOpen ? 0.4 + 0.08 * index : 0,
        ease,
      }}
    >
      <div className="flex justify-center">
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden"
            style={{ height: '1em' }}
          >
            <span
              className="flex flex-col"
              style={{
                transitionProperty: 'transform',
                transitionDuration: hovered ? '800ms' : '0ms',
                transitionDelay: hovered ? `${30 * i}ms` : '0ms',
                transform: hovered ? 'translateY(-50%)' : 'translateY(0%)',
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <span className="block" style={{ height: '1em', lineHeight: '1em' }}>
                {char}
              </span>
              <span className="block" style={{ height: '1em', lineHeight: '1em' }} aria-hidden>
                {char}
              </span>
            </span>
          </span>
        ))}
      </div>
    </motion.button>
  );
}

export default function FloatingMenu({ items }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const menuItems = items ?? [
    { label: 'Home' },
    { label: 'Works' },
    { label: 'Contact' },
  ];

  // Grow the expanded panel to fit any number of items comfortably.
  const expandedHeight = Math.max(220, 60 + menuItems.length * 48);

  // Close when clicking outside.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Esc for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed bottom-6 left-1/2 z-[80]"
      style={{ x: '-50%', pointerEvents: 'auto' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.4 }}
    >
      <motion.div
        className="interactive relative overflow-hidden flex flex-col"
        onClick={() => {
          if (!isOpen) setIsOpen(true);
        }}
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
          letterSpacing: '-0.01em',
          cursor: isOpen ? 'default' : 'pointer',
        }}
        animate={{
          width: isOpen ? 296 : 156,
          height: isOpen ? expandedHeight : 48,
          borderRadius: isOpen ? 28 : 72,
        }}
        whileHover={isOpen ? undefined : { scale: 1.04 }}
        transition={{
          duration: 0.8,
          ease,
          height: { duration: isOpen ? 0.8 : 0.15 },
          scale: { duration: 0.25, ease },
        }}
      >
        {/* Cream background layer (always present, becomes the pill outline) */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundColor: CREAM,
            borderColor: isOpen ? CREAM : CREAM_BORDER,
          }}
          transition={{ duration: isOpen ? 0.1 : 0.3, ease }}
          style={{
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 'inherit',
          }}
        />

        {/* Dark disc expanding from bottom to reveal the menu space */}
        <motion.div
          className="absolute left-1/2"
          style={{
            width: '200%',
            height: '200%',
            borderRadius: '50%',
            x: '-50%',
            backgroundColor: INK,
          }}
          animate={{ bottom: isOpen ? '-20%' : '-200%' }}
          transition={{
            duration: 0.8,
            ease,
            delay: isOpen ? 0.1 : 0,
          }}
        />

        {/* Menu items */}
        <div
          className="relative z-10 flex flex-col gap-5 items-center justify-center"
          style={{
            pointerEvents: isOpen ? 'auto' : 'none',
            opacity: isOpen ? 1 : 0,
            flex: isOpen ? 1 : 0,
            overflow: 'hidden',
          }}
        >
          {menuItems.map((item, idx) => (
            <MenuButton
              key={item.label}
              label={item.label}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              isOpen={isOpen}
              index={idx}
            />
          ))}
        </div>

        {/* Bottom bar: MENU label + hamburger */}
        <motion.div
          className="interactive relative z-10 flex items-center justify-between w-full shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          animate={{
            paddingLeft: isOpen ? 22 : 20,
            paddingRight: isOpen ? 22 : 20,
            paddingBottom: isOpen ? 22 : 0,
            height: 48,
          }}
          transition={{ duration: 0.8, ease }}
          style={{ alignItems: 'center', cursor: 'pointer' }}
        >
          <motion.span
            className="leading-none uppercase"
            animate={{ color: isOpen ? INK_TEXT : INK }}
            transition={{ duration: 0.3, ease }}
            style={{
              fontSize: '13px',
              letterSpacing: '0.22em',
              fontWeight: 600,
            }}
          >
            Menu
          </motion.span>
          <div className="relative w-[24px] h-[24px] flex items-center justify-center">
            <motion.span
              className="absolute block w-[18px] h-[2px] rounded-full"
              animate={{
                rotate: isOpen ? 45 : 0,
                y: isOpen ? 0 : -3,
                backgroundColor: isOpen ? INK_TEXT : INK,
              }}
              transition={{ duration: 0.4, ease }}
            />
            <motion.span
              className="absolute block w-[18px] h-[2px] rounded-full"
              animate={{
                rotate: isOpen ? -45 : 0,
                y: isOpen ? 0 : 3,
                backgroundColor: isOpen ? INK_TEXT : INK,
              }}
              transition={{ duration: 0.4, ease }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
