/**
 * NowPlayingLoop
 * The hero's listening line: the one track Spotify played most recently.
 * The text flips between the song, who it is (the artist), and whether it is
 * playing right now; hovering
 * the line hides the native pointer and brings that album cover up centred on
 * the cursor. Data is read once a minute from /api/spotify/now-playing (which
 * falls back to the Spotify source behind the GitHub profile GIF and serves
 * the 640px cover). Renders nothing when there is nothing to show.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useSpring } from 'framer-motion';
import { Music } from 'lucide-react';

const REFRESH_MS = 60 * 1000;
const COVER_SIZE = 128;
// How long each face of the flip stays up. Long enough to read a name, short
// enough that the line never looks frozen.
const FLIP_MS = 3200;

const flipSpring = { type: 'spring', stiffness: 150, damping: 19, mass: 1.2 };

const NowPlayingLoop = ({ className = '' }) => {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hovering, setHovering] = useState(false);
  // 0 = song, 1 = artist, 2 = status.
  const [face, setFace] = useState(0);
  const timerRef = useRef(null);

  const springX = useSpring(-999, { stiffness: 320, damping: 30, mass: 0.4 });
  const springY = useSpring(-999, { stiffness: 320, damping: 30, mass: 0.4 });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/spotify/now-playing');
        if (!response.ok) throw new Error(`Spotify request failed (${response.status})`);
        const data = await response.json();
        if (cancelled) return;
        setTrack(Array.isArray(data.tracks) && data.tracks[0]?.title ? data.tracks[0] : null);
        setIsPlaying(Boolean(data.isPlaying));
      } catch {
        if (!cancelled) setTrack(null);
        if (!cancelled) setIsPlaying(false);
      } finally {
        if (!cancelled) timerRef.current = setTimeout(load, REFRESH_MS);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const faces = [
    track?.title,
    track?.artist,
    track ? (isPlaying ? 'Listening now' : 'Recently played') : '',
  ].filter(Boolean);

  useEffect(() => {
    // A new track starts on the song again.
    setFace(0);
  }, [track?.artist, track?.title]);

  useEffect(() => {
    if (faces.length < 2) return undefined;
    const id = window.setInterval(
      () => setFace((current) => (current + 1) % faces.length),
      FLIP_MS
    );
    return () => window.clearInterval(id);
  }, [faces.length]);

  if (!track) return null;

  const cover = track.albumArt;
  const activeFace = faces[face % faces.length] || faces[0] || '';
  const direction = face % faces.length === 0 ? -1 : 1;
  const label = (
    <>
      <Music size={13} className="shrink-0 opacity-60" aria-hidden="true" />
      {/* One line tall, clipped: the faces roll up and out through the edge
          like a split-flap, instead of sliding across the copy below. */}
      <span
        className="relative flex min-w-0 flex-1 overflow-hidden"
        style={{ perspective: 500 }}
        aria-hidden="true"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={activeFace}
            className="block truncate"
            initial={{ y: -direction * 20, rotateX: -direction * 90, opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, rotateX: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -direction * 20, rotateX: -direction * 90, opacity: 0, filter: 'blur(4px)' }}
            transition={flipSpring}
            style={{ transformOrigin: 'center center' }}
          >
            {activeFace}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );

  return (
    <div
      className={`flex min-w-0 w-full items-center ${className}`.trim()}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse' || !cover) return;
        // Jump the spring onto the pointer first so the cover opens there
        // instead of flying in from wherever it was left.
        springX.jump(event.clientX);
        springY.jump(event.clientY);
        setHovering(true);
      }}
      onPointerMove={(event) => {
        springX.set(event.clientX);
        springY.set(event.clientY);
      }}
      onPointerLeave={() => setHovering(false)}
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-2 font-sans text-[15px] leading-snug text-muted-warm"
        style={{ cursor: cover ? 'none' : 'auto' }}
      >
        <span className="sr-only">
          Recently played on Spotify: {track.artist ? `${track.artist}, ` : ''}
          {track.title}
        </span>
        {track.url ? (
          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 truncate transition-colors hover:text-bone"
            aria-label={`${track.artist} — ${track.title} on Spotify`}
          >
            {label}
          </a>
        ) : (
          <span className="flex min-w-0 items-center gap-2 truncate">{label}</span>
        )}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {hovering && cover && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none fixed left-0 top-0 z-tooltip"
                style={{ x: springX, y: springY }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="overflow-hidden rounded-[8px] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/15"
                  style={{ width: COVER_SIZE, height: COVER_SIZE }}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt=""
                    draggable={false}
                    className="block h-full w-full object-cover"
                  />
                </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default NowPlayingLoop;
