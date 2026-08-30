import { AccentColor, Theme } from '../models/models';

/**
 * Swaps the page's whole visual theme (or, within the Terminal theme, just
 * its accent color) by setting data attributes that tokens.scss keys off.
 * Globetrotter is a fully separate palette/typography/shape treatment — see
 * the `[data-theme='globetrotter']` block in tokens.scss — so `data-accent`
 * is cleared while it's active rather than left pointing at an unrelated
 * Terminal sub-accent.
 */
export function applyTheme(theme: Theme, accentColor: AccentColor): void {
  const root = document.documentElement;
  if (theme === 'globetrotter') {
    root.setAttribute('data-theme', 'globetrotter');
    root.removeAttribute('data-accent');
  } else {
    root.removeAttribute('data-theme');
    root.setAttribute('data-accent', accentColor);
  }
}
