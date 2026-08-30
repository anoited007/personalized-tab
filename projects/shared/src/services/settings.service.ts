import { Injectable, signal } from '@angular/core';
import { ChromeStorageService } from './chrome-storage.service';
import { DEFAULT_SETTINGS, Settings } from '../models/models';

function defaultTimezone(): Settings['timezones'][number] {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const abbreviation = timezoneAbbreviation(timezone);
  return { timezone, abbreviation };
}

export function timezoneAbbreviation(timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' }).formatToParts(
    new Date(),
  );
  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timezone;
}

/** Loads/saves the extension's settings object from chrome.storage.sync. */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<Settings>(DEFAULT_SETTINGS);
  readonly loaded = signal(false);

  constructor(private readonly storage: ChromeStorageService) {}

  async load(): Promise<Settings> {
    const stored = await this.storage.get<Settings>('sync', null);
    const merged: Settings = {
      ...DEFAULT_SETTINGS,
      ...stored,
      timezones: stored.timezones?.length ? stored.timezones : [defaultTimezone()],
    };
    this.settings.set(merged);
    this.loaded.set(true);
    return merged;
  }

  async save(patch: Partial<Settings>): Promise<Settings> {
    const merged = { ...this.settings(), ...patch };
    await this.storage.set('sync', merged);
    this.settings.set(merged);
    return merged;
  }

  async reset(): Promise<Settings> {
    const reset: Settings = { ...DEFAULT_SETTINGS, timezones: [defaultTimezone()] };
    await this.storage.set('sync', reset);
    this.settings.set(reset);
    return reset;
  }
}
