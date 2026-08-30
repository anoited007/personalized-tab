export type FeedCategory = 'security' | 'ai' | 'custom' | 'all';

export interface FeedSource {
  url: string;
  category: 'security' | 'ai' | 'custom';
  /** Shown as a fallback source label before the feed's own <title> loads. */
  label: string;
}

export interface FeedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
}

export interface ParsedFeed {
  sourceTitle: string;
  sourceLink?: string;
  category: FeedCategory;
  items: FeedItem[];
}

export interface Timezone {
  timezone: string;
  abbreviation: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export interface Quote {
  text: string;
  author: string;
}

export type Theme = 'globetrotter' | 'terminal';

export const THEMES: { id: Theme; label: string; description: string; swatch: [string, string] }[] = [
  {
    id: 'globetrotter',
    label: 'Globetrotter',
    description: 'Red & black, mid-century travel-poster noir.',
    swatch: ['#0d0a09', '#d7263d'],
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Dark glass with a terminal accent.',
    swatch: ['#07080a', '#8bffc2'],
  },
];

/** Sub-accent, only meaningful within the Terminal theme. */
export type AccentColor = 'mint' | 'azure' | 'amber';

export const ACCENT_COLORS: { id: AccentColor; label: string; swatch: string }[] = [
  { id: 'mint', label: 'Mint', swatch: '#8bffc2' },
  { id: 'azure', label: 'Azure', swatch: '#5ea1ff' },
  { id: 'amber', label: 'Amber', swatch: '#ffb84d' },
];

export interface Settings {
  enableGreeting: boolean;
  enableFeed: boolean;
  enableClock: boolean;
  enableReligiousQuote: boolean;
  enableFamousQuote: boolean;
  enableTodo: boolean;
  enableRipple: boolean;
  /** 0 (barely there) to 1 (strong) — how much the ripple effect distorts/reacts. */
  rippleIntensity: number;
  enableTypingEffect: boolean;
  enableCursor: boolean;
  greeting: string | null;
  feedToDisplay: FeedCategory;
  /** Raw comma-separated custom feed URLs, exactly as entered in Settings. */
  feed: string;
  timezones: Timezone[];
  theme: Theme;
  accentColor: AccentColor;
}

export const DEFAULT_SETTINGS: Settings = {
  enableGreeting: true,
  enableFeed: true,
  enableClock: true,
  enableReligiousQuote: true,
  enableFamousQuote: true,
  enableTodo: true,
  enableRipple: true,
  rippleIntensity: 0.35,
  enableTypingEffect: true,
  enableCursor: true,
  greeting: null,
  feedToDisplay: 'all',
  feed: '',
  timezones: [],
  theme: 'globetrotter',
  accentColor: 'mint',
};
