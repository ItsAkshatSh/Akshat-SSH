/**
 * PhotographyContent
 * Grid of ASCII-rendered photos. Each tile shows an ASCII rendering by
 * default. A soft "lens" around the cursor reveals the original photo,
 * with spring-follow motion, a subtle scale-up on the revealed image,
 * and a faint bright ring at the reveal edge. Clicking opens the
 * lightbox.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import StaggerItem from '../utilities/StaggerItem';
import ASCIICanvas from '../ascii/ASCIICanvas';
import { PHOTOS } from './photographyPhotos';

// Lens geometry (in px) when fully open.
const REVEAL_INNER = 80;
const REVEAL_OUTER = 160;
// Follow stiffness: higher = snappier, lower = more trailing.
const POS_LERP = 0.28;
const OPACITY_LERP = 0.16;

const PhotoTile = ({ file, index, total, span, onSelect }) => {
  const wrapRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0, hovering: false });
  const stateRef = useRef({ x: 0, y: 0, opacity: 0 });
  const rafRef = useRef(null);
  const [frame, setFrame] = useState({ x: 0, y: 0, opacity: 0 });

  const loop = useCallback(() => {
    const target = targetRef.current;
    const state = stateRef.current;

    state.x += (target.x - state.x) * POS_LERP;
    state.y += (target.y - state.y) * POS_LERP;
    const targetOpacity = target.hovering ? 1 : 0;
    state.opacity += (targetOpacity - state.opacity) * OPACITY_LERP;

    setFrame({ x: state.x, y: state.y, opacity: state.opacity });

    const settled =
      !target.hovering &&
      Math.abs(state.opacity - targetOpacity) < 0.01 &&
      Math.hypot(state.x - target.x, state.y - target.y) < 0.5;

    if (settled) {
      state.opacity = 0;
      rafRef.current = null;
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, []);

  const kick = useCallback(() => {
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  const handleEnter = useCallback(
    (e) => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetRef.current.x = x;
      targetRef.current.y = y;
      targetRef.current.hovering = true;
      // On first entry, snap the follow position to the cursor so the lens
      // doesn't sweep in from a stale location.
      if (stateRef.current.opacity < 0.02) {
        stateRef.current.x = x;
        stateRef.current.y = y;
      }
      kick();
    },
    [kick]
  );

  const handleMove = useCallback(
    (e) => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      targetRef.current.x = e.clientX - rect.left;
      targetRef.current.y = e.clientY - rect.top;
      kick();
    },
    [kick]
  );

  const handleLeave = useCallback(() => {
    targetRef.current.hovering = false;
    kick();
  }, [kick]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Radius scales with opacity so the lens opens/closes smoothly instead
  // of blinking on/off.
  const inner = REVEAL_INNER * frame.opacity;
  const outer = REVEAL_INNER + (REVEAL_OUTER - REVEAL_INNER) * frame.opacity;
  const active = frame.opacity > 0.01;

  const maskValue = active
    ? `radial-gradient(circle ${outer}px at ${frame.x}px ${frame.y}px, transparent 0, transparent ${inner}px, #000 ${outer}px)`
    : 'none';

  // Bright soft ring at the boundary of the reveal — reads as a lens edge.
  const ringValue = active
    ? `radial-gradient(circle ${outer + 24}px at ${frame.x}px ${frame.y}px,` +
      ` transparent 0,` +
      ` transparent ${outer - 6}px,` +
      ` rgba(255,255,255,${0.28 * frame.opacity}) ${outer + 2}px,` +
      ` transparent ${outer + 24}px)`
    : 'none';

  // A faint warm inner glow at the very centre — like sunlight on the lens.
  const glowValue = active
    ? `radial-gradient(circle ${inner + 40}px at ${frame.x}px ${frame.y}px,` +
      ` rgba(255,238,214,${0.08 * frame.opacity}) 0,` +
      ` transparent ${inner + 40}px)`
    : 'none';

  const photoScale = 1 + 0.06 * frame.opacity;

  return (
    <StaggerItem
      index={index}
      className={`h-full ${span || ''} ${span ? 'min-h-[320px] md:min-h-[420px]' : ''}`}
    >
      <button
        ref={wrapRef}
        type="button"
        className="interactive group relative w-full h-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0a] hover:border-white/25 transition-colors duration-300"
        onClick={() => onSelect?.(file)}
        onMouseEnter={handleEnter}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        aria-label={`View photo ${index + 1} of ${total}`}
      >
        {/* Real photo underneath, subtly zoomed on hover for a lens feel. */}
        <img
          src={`/images/photography/${file}`}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none will-change-transform"
          style={{
            transform: `scale(${photoScale})`,
            transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Soft warm glow at the lens centre (behind the mask edge). */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: glowValue }}
        />

        {/* ASCII layer, punched through only inside the lens. */}
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: maskValue,
            maskImage: maskValue,
          }}
        >
          {/* Solid backing so the ASCII is opaque even where cells are empty. */}
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <ASCIICanvas
            src={`/images/photography/${file}`}
            cellSize={8}
            radius={80}
            displace={6}
            preserveColor
            glitchUseSampled
            gamma={0.7}
            className="absolute inset-0"
            fps={30}
          />
        </div>

        {/* Bright ring at the reveal edge. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: ringValue }}
        />

        {/* Corner labels. Fade slightly under the lens so nothing competes. */}
        <div
          className="absolute top-2.5 left-2.5 text-[10px] font-mono uppercase tracking-[0.25em] text-white/70 pointer-events-none z-10 mix-blend-difference transition-opacity duration-300"
          style={{ opacity: 1 - 0.4 * frame.opacity }}
        >
          {`ph.${String(index + 1).padStart(2, '0')}`}
        </div>
        <div
          className="absolute bottom-2.5 right-2.5 text-[10px] font-mono uppercase tracking-[0.25em] text-white pointer-events-none z-10 mix-blend-difference transition-opacity duration-300"
          style={{ opacity: 0.6 + 0.4 * frame.opacity }}
        >
          [ open ↗ ]
        </div>
      </button>
    </StaggerItem>
  );
};

const PhotographyContent = ({ onSelectImg }) => (
  <>
    <div className="mb-8 pb-6 border-b border-white/[0.06]">
      <p className="text-[15px] text-neutral-200 leading-[1.7] max-w-lg">
        Moments rendered as text. Move the cursor over a tile to peek through the field, click to open the full photograph.
      </p>
      <p className="text-[11px] text-neutral-400 font-mono mt-3 uppercase tracking-[0.22em]">
        {PHOTOS.length} · ASCII · reactive
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[200px] pb-8">
      {PHOTOS.map(({ file, span }, i) => (
        <PhotoTile
          key={file}
          file={file}
          index={i}
          total={PHOTOS.length}
          span={span}
          onSelect={onSelectImg}
        />
      ))}
    </div>
  </>
);

export default PhotographyContent;
