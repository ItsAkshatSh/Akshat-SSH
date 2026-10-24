/**
 * settingsStore — tiny persisted settings shared by BackgroundField (which
 * applies them) and the SettingsOverlay (which edits them).
 *
 * Shape:
 *   bgMode:     'void' | 'ocean'           (existing toggle, now here)
 *   motionLevel: 'full' | 'reduced'         ('reduced' slows the scene clock
 *                to 35% — the option decoding separately from the OS-level
 *                prefers-reduced-motion, which always wins)
 *
 * Storage: one localStorage key, single JSON blob, read once per listener
 * registration. External mutation is an explicit event, not storage watching
 * — same-tab writes fire 'storage' in no browser, so a custom event is the
 * only cross-component signal there is.
 */
import { useEffect, useState } from 'react';

export const BG_MODES = { void: 'void', ocean: 'ocean' };
export const MOTION_LEVELS = { full: 'full', reduced: 'reduced' };
export const BG_STORAGE_KEY = 'akshat:bg-settings';

// Scene-time scaling consumed by both background scenes.
// 'reduced' slows the world clock to 35% — a calm, nearly-still scene. This
// is NOT the OS-level prefers-reduced-motion mode, which always wins.
export const MOTION_SCALE = Object.freeze({ full: 1, reduced: 0.35 });

const DEFAULTS = Object.freeze({
  bgMode: BG_MODES.void,
  motionLevel: MOTION_LEVELS.full,
});

let cache = null;

function read() {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  if (cache) return cache;
  cache = { ...DEFAULTS };
  try {
    const saved = window.localStorage.getItem(BG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        if (Object.values(BG_MODES).includes(parsed.bgMode)) {
          cache.bgMode = parsed.bgMode;
        }
        if (Object.values(MOTION_LEVELS).includes(parsed.motionLevel)) {
          cache.motionLevel = parsed.motionLevel;
        }
      }
    }
  } catch {
    // corrupt or blocked storage → defaults
  }
  return cache;
}

const listeners = new Set();

function write(next) {
  cache = { ...read(), ...next };
  try {
    window.localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // blocked storage → still notify; the choice lives for the session
  }
  for (const fn of listeners) fn(cache);
}

/** Subscribe to settings changes. Returns the unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Read the whole settings object (cached). */
export function getSettings() {
  return read();
}

export function setBgMode(bgMode) {
  write({ bgMode });
}

export function setMotionLevel(motionLevel) {
  write({ motionLevel });
}

/** Reset everything back to defaults and notify. */
export function resetSettings() {
  write(DEFAULTS);
}

/** React hook — re-renders whenever any setting changes. */
export function useSettings() {
  const [settings, setLocal] = useState(() =>
    typeof window === 'undefined' ? { ...DEFAULTS } : read()
  );
  useEffect(() => {
    const unsub = subscribe(setLocal);
    // Re-read in case another tab changed storage while we were idle.
    const onStorage = (e) => {
      if (e.key === BG_STORAGE_KEY) {
        cache = null;
        setLocal(read());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      unsub();
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return settings;
}
