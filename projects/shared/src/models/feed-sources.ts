import { FeedSource } from './models';

/** Security news — the extension's original focus. */
export const SECURITY_FEEDS: FeedSource[] = [
  { url: 'https://feeds.feedburner.com/eset/blog', category: 'security', label: 'WeLiveSecurity' },
  { url: 'https://securityaffairs.com/wordpress/feed', category: 'security', label: 'Security Affairs' },
  { url: 'https://www.darkreading.com/rss.xml', category: 'security', label: 'Dark Reading' },
];

/** AI, robotics and ML/transformer-architecture research. */
export const AI_ROBOTICS_FEEDS: FeedSource[] = [
  { url: 'https://openai.com/news/rss.xml', category: 'ai', label: 'OpenAI News' },
  { url: 'https://deepmind.google/blog/feed/basic/', category: 'ai', label: 'Google DeepMind' },
  { url: 'https://huggingface.co/blog/feed.xml', category: 'ai', label: 'Hugging Face' },
  { url: 'https://export.arxiv.org/rss/cs.AI', category: 'ai', label: 'arXiv — cs.AI' },
  { url: 'https://export.arxiv.org/rss/cs.LG', category: 'ai', label: 'arXiv — cs.LG' },
  { url: 'https://export.arxiv.org/rss/cs.RO', category: 'ai', label: 'arXiv — cs.RO' },
  { url: 'https://spectrum.ieee.org/feeds/topic/robotics.rss', category: 'ai', label: 'IEEE Spectrum Robotics' },
  { url: 'https://robohub.org/feed/', category: 'ai', label: 'Robohub' },
];

export const BUILT_IN_FEEDS: FeedSource[] = [...SECURITY_FEEDS, ...AI_ROBOTICS_FEEDS];
