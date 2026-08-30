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

export interface Settings {
  enableGreeting: boolean;
  enableFeed: boolean;
  enableClock: boolean;
  enableReligiousQuote: boolean;
  enableFamousQuote: boolean;
  enableTodo: boolean;
  greeting: string | null;
  feedToDisplay: FeedCategory;
  /** Raw comma-separated custom feed URLs, exactly as entered in Settings. */
  feed: string;
  timezones: Timezone[];
}

export const DEFAULT_SETTINGS: Settings = {
  enableGreeting: true,
  enableFeed: true,
  enableClock: true,
  enableReligiousQuote: true,
  enableFamousQuote: true,
  enableTodo: true,
  greeting: null,
  feedToDisplay: 'all',
  feed: '',
  timezones: [],
};
