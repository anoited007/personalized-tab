import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '@shared/services/settings.service';
import { DEFAULT_SETTINGS, FeedCategory, Settings } from '@shared/models/models';
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
  protected readonly draft = signal<Settings>(DEFAULT_SETTINGS);
  protected readonly status = signal('');

  async ngOnInit(): Promise<void> {
    const settings = await this.settingsService.load();
    this.draft.set(settings);
  }

  patch(partial: Partial<Settings>): void {
    this.draft.set({ ...this.draft(), ...partial });
  }

  async save(): Promise<void> {
    await this.settingsService.save(this.draft());
    this.flashStatus('Settings saved.');
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
