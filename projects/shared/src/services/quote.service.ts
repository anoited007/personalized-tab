import { Injectable, signal } from '@angular/core';
import { RuntimeFetchService } from './runtime-fetch.service';
import { Quote } from '../models/models';

interface OurMannaResponse {
  verse: { details: { text: string; reference: string; version: string } };
}

interface DummyJsonQuote {
  quote: string;
  author: string;
}

const FALLBACK_VERSE: Quote = {
  text: 'The LORD is my shepherd, I lack nothing.',
  author: 'Psalm 23:1 NIV',
};

const FALLBACK_FAMOUS_QUOTE: Quote = {
  text: 'The only way to do great work is to love what you do.',
  author: 'Steve Jobs',
};

@Injectable({ providedIn: 'root' })
export class QuoteService {
  readonly religiousQuote = signal<Quote | null>(null);
  readonly famousQuote = signal<Quote | null>(null);

  constructor(private readonly runtimeFetch: RuntimeFetchService) {}

  async loadReligiousQuote(): Promise<void> {
    try {
      const data = await this.runtimeFetch.fetch<OurMannaResponse>(
        'https://beta.ourmanna.com/api/v1/get?format=json&order=daily',
        'JSON',
      );
      this.religiousQuote.set({
        text: data.verse.details.text,
        author: `${data.verse.details.reference} ${data.verse.details.version}`,
      });
    } catch {
      this.religiousQuote.set(FALLBACK_VERSE);
    }
  }

  async loadFamousQuote(): Promise<void> {
    try {
      const data = await this.runtimeFetch.fetch<DummyJsonQuote>('https://dummyjson.com/quotes/random', 'JSON');
      this.famousQuote.set({ text: data.quote, author: data.author });
    } catch {
      this.famousQuote.set(FALLBACK_FAMOUS_QUOTE);
    }
  }
}
