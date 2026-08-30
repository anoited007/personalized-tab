import { Component, OnInit, inject } from '@angular/core';
import { SettingsService } from '@shared/services/settings.service';
import { QuoteService } from '@shared/services/quote.service';
import { GreetingCard } from './components/greeting-card/greeting-card';
import { ClockCard } from './components/clock-card/clock-card';
import { FeedPanel } from './components/feed-panel/feed-panel';
import { QuoteCard } from './components/quote-card/quote-card';
import { TodoPanel } from './components/todo-panel/todo-panel';

@Component({
  imports: [GreetingCard, ClockCard, FeedPanel, QuoteCard, TodoPanel],
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

  async ngOnInit(): Promise<void> {
    const settings = await this.settingsService.load();
    if (settings.enableReligiousQuote) this.quoteService.loadReligiousQuote();
    if (settings.enableFamousQuote) this.quoteService.loadFamousQuote();
  }
}
