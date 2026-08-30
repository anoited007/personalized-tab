import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '@shared/services/settings.service';
import { ACCENT_COLORS, DEFAULT_SETTINGS, FeedCategory, Settings, THEMES } from '@shared/models/models';
import { applyTheme } from '@shared/services/apply-theme';
import { ensureFeedPermissions } from '@shared/services/feed-permissions';
import { ToggleRow } from './components/toggle-row/toggle-row';
import { TimezoneSettings } from './components/timezone-settings/timezone-settings';

const FEED_CATEGORIES: { value: FeedCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'security', label: 'Security' },
  { value: 'ai', label: 'AI & Robotics' },
  { value: 'custom', label: 'Custom only' },
];

@Component({
  imports: [FormsModule, ToggleRow, TimezoneSettings],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly settingsService = inject(SettingsService);

  protected readonly categories = FEED_CATEGORIES;
  protected readonly accentColors = ACCENT_COLORS;
  protected readonly themes = THEMES;
  protected readonly draft = signal<Settings>(DEFAULT_SETTINGS);
  protected readonly status = signal('');

  constructor() {
    // Live-preview the theme/accent as it's picked, before Save is pressed.
    effect(() => applyTheme(this.draft().theme, this.draft().accentColor));
  }

  async ngOnInit(): Promise<void> {
    const settings = await this.settingsService.load();
    this.draft.set(settings);
  }

  patch(partial: Partial<Settings>): void {
    this.draft.set({ ...this.draft(), ...partial });
  }

  protected percentOf(value: number): number {
    return Math.round(value * 100);
  }

  async save(): Promise<void> {
    // Called first (and synchronously reachable from the click) since
    // chrome.permissions.request needs a user gesture to show its prompt.
    const customUrls = this.draft()
      .feed.split(',')
      .map((url) => url.trim())
      .filter(Boolean);
    const permitted = customUrls.length ? await ensureFeedPermissions(customUrls) : true;

    await this.settingsService.save(this.draft());
    this.flashStatus(
      permitted ? 'Settings saved.' : 'Saved — but access to your custom feed was declined, so it may not load.',
    );
  }

  async reset(): Promise<void> {
    const reset = await this.settingsService.reset();
    this.draft.set(reset);
    this.flashStatus('Settings reset to defaults.');
  }

  private flashStatus(message: string): void {
    this.status.set(message);
    setTimeout(() => this.status.set(''), 1800);
  }
}
