import { Component, OnInit, effect, inject } from '@angular/core';
import { SettingsService } from '@shared/services/settings.service';
import { QuoteService } from '@shared/services/quote.service';
import { applyTheme } from '@shared/services/apply-theme';
import { RipplesDirective } from '@shared/directives/ripples.directive';
import { GreetingCard } from './components/greeting-card/greeting-card';
import { ClockCard } from './components/clock-card/clock-card';
import { FeedPanel } from './components/feed-panel/feed-panel';
import { QuoteCard } from './components/quote-card/quote-card';
import { TodoPanel } from './components/todo-panel/todo-panel';

@Component({
  imports: [GreetingCard, ClockCard, FeedPanel, QuoteCard, TodoPanel, RipplesDirective],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly settingsService = inject(SettingsService);
  protected readonly quoteService = inject(QuoteService);

  protected readonly settings = this.settingsService.settings;
  protected readonly loaded = this.settingsService.loaded;
  protected readonly religiousQuote = this.quoteService.religiousQuote;
  protected readonly famousQuote = this.quoteService.famousQuote;

  constructor() {
    effect(() => applyTheme(this.settings().theme, this.settings().accentColor));
  }

  async ngOnInit(): Promise<void> {
    const settings = await this.settingsService.load();
    if (settings.enableReligiousQuote) this.quoteService.loadReligiousQuote();
    if (settings.enableFamousQuote) this.quoteService.loadFamousQuote();
  }
}
