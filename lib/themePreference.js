export const THEME_STORAGE_KEY = 'akshat-theme';
export const DEFAULT_THEME = 'ocean';
export const THEMES = ['ocean', 'signal'];

export function isTheme(value) {
  return THEMES.includes(value);
}

export function getStoredTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function storeTheme(theme) {
  if (typeof window === 'undefined' || !isTheme(theme)) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable in private browsing; the session still works.
  }
}
