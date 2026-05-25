export type Theme = 'auto' | 'light' | 'dark';

const STORAGE_KEY = 'claude-dashboard:theme';
const THEMES: readonly Theme[] = ['auto', 'light', 'dark'];

export function loadTheme(): Theme {
  const raw = localStorage.getItem(STORAGE_KEY);
  return THEMES.includes(raw as Theme) ? (raw as Theme) : 'auto';
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function cycleTheme(current: Theme): Theme {
  const idx = THEMES.indexOf(current);
  return THEMES[(idx + 1) % THEMES.length];
}
