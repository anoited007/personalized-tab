import { Injectable, signal } from '@angular/core';
import { RuntimeFetchService } from './runtime-fetch.service';
import { parseFeedXml } from './feed-parser';
import { BUILT_IN_FEEDS } from '../models/feed-sources';
import { FeedCategory, FeedSource, ParsedFeed, Settings } from '../models/models';

function customSourcesFrom(rawCommaSeparated: string): FeedSource[] {
  return rawCommaSeparated
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({ url, category: 'custom' as const, label: new URL(url).hostname }));
}

@Injectable({ providedIn: 'root' })
export class FeedService {
  readonly feeds = signal<ParsedFeed[]>([]);
  readonly loading = signal(false);
  readonly failedSources = signal<string[]>([]);

  constructor(private readonly runtimeFetch: RuntimeFetchService) {}

  async load(settings: Pick<Settings, 'feedToDisplay' | 'feed'>): Promise<void> {
    const category: FeedCategory = settings.feedToDisplay;
    const sources = [...BUILT_IN_FEEDS, ...customSourcesFrom(settings.feed)].filter(
      (source) => category === 'all' || source.category === category,
    );

    this.loading.set(true);
    this.feeds.set([]);
    this.failedSources.set([]);

    await Promise.all(sources.map((source) => this.loadOne(source)));
    this.loading.set(false);
  }

  private async loadOne(source: FeedSource): Promise<void> {
    try {
      const raw = await this.runtimeFetch.fetch<string>(source.url, 'TEXT');
      const parsed = parseFeedXml(raw);
      if (!parsed || parsed.items.length === 0) throw new Error('Empty or unparseable feed');

      const feed: ParsedFeed = {
        sourceTitle: parsed.title || source.label,
        sourceLink: parsed.link,
        category: source.category,
        items: parsed.items.slice(0, 12),
      };
      this.feeds.update((current) => [...current, feed]);
    } catch {
      this.failedSources.update((current) => [...current, source.label]);
    }
  }
}
