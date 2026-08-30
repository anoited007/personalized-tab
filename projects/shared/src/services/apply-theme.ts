import { AccentColor, Theme } from '../models/models';

/**
 * Swaps the page's visual theme and accent color by setting data attributes
 * that tokens.scss keys off. The accent applies within either theme; only
 * the theme swaps out the rest (shape, blur, typography).
 */
export function applyTheme(theme: Theme, accentColor: AccentColor): void {
  const root = document.documentElement;
  if (theme === 'globetrotter') {
    root.setAttribute('data-theme', 'globetrotter');
  } else {
    root.removeAttribute('data-theme');
  }
  root.setAttribute('data-accent', accentColor);
}
