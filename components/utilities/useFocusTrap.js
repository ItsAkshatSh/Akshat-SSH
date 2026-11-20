import { useEffect } from 'react';

// `tabindex="-1"` elements are programmatically focusable but are not part of
// the tab order, so they must not be treated as the first stop.
const FOCUSABLE =
  'button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside an open overlay. Restores focus to the
 * previously focused element when the trap is released.
 */
export default function useFocusTrap(containerRef, active = true) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement;

    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // A dialog focuses itself first, so the announcement names the panel
    // instead of landing on the invisible full-bleed scrim close button.
    const focusFirst = () => {
      if (container.tabIndex === -1) {
        container.focus();
        return;
      }
      const nodes = getFocusable();
      if (nodes.length > 0) {
        nodes[0].focus();
      } else {
        container.focus();
      }
    };

    const raf = requestAnimationFrame(focusFirst);

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const nodes = getFocusable();
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('keydown', handleKeyDown);
      const hasRealOpener =
        previouslyFocused instanceof HTMLElement &&
        previouslyFocused.isConnected &&
        previouslyFocused !== document.body &&
        previouslyFocused !== document.documentElement;

      if (hasRealOpener) {
        previouslyFocused.focus();
        return;
      }
      // The opener may have unmounted (menu items do when a section opens).
      // Fall back to the control that owns the menu, so focus never drops to
      // <body> and the next Tab starts from the top of the page.
      const fallback = document.querySelector('[data-focus-return]');
      if (fallback instanceof HTMLElement && !fallback.closest('[inert]')) {
        fallback.focus();
      }
    };
  }, [active, containerRef]);
}
