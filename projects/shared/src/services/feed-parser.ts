import { FeedItem } from '../models/models';

export interface ParsedFeedXml {
  title: string;
  link?: string;
  items: FeedItem[];
}

function text(el: Element | null | undefined): string | undefined {
  const value = el?.textContent?.trim();
  return value ? value : undefined;
}

function atomLink(entry: Element): string | undefined {
  const links = Array.from(entry.querySelectorAll('link'));
  const alternate = links.find((l) => l.getAttribute('rel') === 'alternate' || !l.getAttribute('rel'));
  return alternate?.getAttribute('href') ?? links[0]?.getAttribute('href') ?? undefined;
}

/**
 * Parses either RSS 2.0 (<channel><item>) or Atom (<feed><entry>) XML into a
 * common shape. Missing optional fields (description/pubDate — Atom feeds
 * like arXiv's don't always include them) are simply omitted rather than
 * thrown on, so one malformed item never breaks the whole source.
 */
export function parseFeedXml(rawXml: string): ParsedFeedXml | null {
  const doc = new DOMParser().parseFromString(rawXml, 'application/xml');
  if (doc.querySelector('parsererror')) return null;

  const channel = doc.querySelector('channel');
  if (channel) {
    const items: FeedItem[] = Array.from(channel.querySelectorAll('item'))
      .map((item) => ({
        title: text(item.querySelector('title')) ?? '',
        link: text(item.querySelector('link')) ?? '',
        description: text(item.querySelector('description')),
        pubDate: text(item.querySelector('pubDate')),
      }))
      .filter((item) => item.title && item.link);

    return {
      title: text(channel.querySelector('title')) ?? 'Untitled feed',
      link: text(channel.querySelector('link')),
      items,
    };
  }

  const feed = doc.querySelector('feed');
  if (feed) {
    const items: FeedItem[] = Array.from(feed.querySelectorAll('entry'))
      .map((entry) => ({
        title: text(entry.querySelector('title')) ?? '',
        link: atomLink(entry) ?? '',
        description: text(entry.querySelector('summary')) ?? text(entry.querySelector('content')),
        pubDate: text(entry.querySelector('published')) ?? text(entry.querySelector('updated')),
      }))
      .filter((item) => item.title && item.link);

    return {
      title: text(feed.querySelector('title')) ?? 'Untitled feed',
      link: atomLink(feed),
      items,
    };
  }

  return null;
}
