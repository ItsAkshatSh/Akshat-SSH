/**
 * SectionOverlay
 * Shared full-screen panel used by portfolio sections. Handles backdrop,
 * corner brackets, animated header, scroll region, and keyboard focus trap.
 */
import { useRef } from 'react';
import useFocusTrap from '../utilities/useFocusTrap';

export const SectionCorner = ({ position }) => {
  const anchor = {
    tl: 'top-3 left-3 sm:top-6 sm:left-6',
    tr: 'top-3 right-3 sm:top-6 sm:right-6 rotate-90',
    bl: 'bottom-3 left-3 sm:bottom-6 sm:left-6 -rotate-90',
    br: 'bottom-3 right-3 sm:bottom-6 sm:right-6 rotate-180',
  }[position];

  return (
    <div
      aria-hidden="true"
      className={`absolute w-4 h-4 pointer-events-none ${anchor}`}
      style={{
        borderTop: '1px solid rgba(255,255,255,0.25)',
        borderLeft: '1px solid rgba(255,255,255,0.25)',
        opacity: 0,
        animation: 'sectionBackdrop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s',
      }}
    />
  );
};

const overlayButtonClass =
  'interactive h-10 px-4 rounded-full border border-white/[0.14] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300 text-[11px] tracking-[0.25em] uppercase';

export const OverlayButton = ({ children, className = '', ...props }) => (
  <button type="button" className={`${overlayButtonClass} ${className}`.trim()} {...props}>
    {children}
  </button>
);

export default function SectionOverlay({
  ariaLabel,
  onClose,
  onBackdropClose,
  title,
  headerActions,
  children,
  contentKey,
  variant = 'default',
  zIndex = 40,
  showVignettes = true,
  titleClassName = 'text-4xl sm:text-5xl md:text-6xl font-medium text-white tracking-[-0.02em] capitalize leading-none',
}) {
  const dialogRef = useRef(null);
  const isFullPage = variant === 'fullpage';

  useFocusTrap(dialogRef, true);

  const handleBackdropClose = onBackdropClose ?? onClose;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label={`Close ${ariaLabel}`}
        onClick={handleBackdropClose}
        className="absolute inset-0 w-full h-full bg-[#060a10]/55 backdrop-blur-2xl cursor-default"
        tabIndex={-1}
        style={{
          opacity: 0,
          animation: 'sectionBackdrop 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}
      />

      {showVignettes && !isFullPage && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#060a10]/80 to-transparent pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#060a10]/90 via-[#060a10]/45 to-transparent pointer-events-none"
          />
        </>
      )}

      <div
        className={`relative flex flex-col h-full w-full pointer-events-none ${
          isFullPage ? '' : 'readable-on-blur max-w-5xl mx-auto'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <SectionCorner position="tl" />
        <SectionCorner position="tr" />
        <SectionCorner position="bl" />
        <SectionCorner position="br" />

        {isFullPage ? (
          <OverlayButton
            onClick={onClose}
            className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50 pointer-events-auto"
            aria-label="Close"
            style={{
              opacity: 0,
              animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s',
            }}
          >
            Close
          </OverlayButton>
        ) : (
          <div className="relative flex justify-between items-start gap-4 px-6 sm:px-10 md:px-14 pt-16 md:pt-20 pb-6 md:pb-8 shrink-0 pointer-events-auto">
            <div className="min-w-0 flex-1">
              <h2
                className={titleClassName}
                style={{
                  opacity: 0,
                  animation: 'sectionTitleEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s',
                }}
              >
                {title}
              </h2>
            </div>
            <div
              className="flex items-center gap-2 shrink-0 mt-2"
              style={{
                opacity: 0,
                animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s',
              }}
            >
              {headerActions}
              <OverlayButton onClick={onClose} aria-label="Close">
                Close
              </OverlayButton>
            </div>
          </div>
        )}

        <div
          className={
            isFullPage
              ? 'relative flex-1 min-h-0 overflow-hidden pointer-events-auto'
              : 'relative flex-1 overflow-y-auto px-6 sm:px-10 md:px-14 pt-8 md:pt-10 pb-24 md:pb-28 custom-scrollbar pointer-events-auto'
          }
          style={
            isFullPage
              ? undefined
              : {
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 40px), transparent 100%)',
                  maskImage:
                    'linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 40px), transparent 100%)',
                }
          }
        >
          <div
            key={contentKey}
            className={isFullPage ? 'absolute inset-0' : undefined}
            style={{
              opacity: 0,
              animation: 'sectionBodyEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
