import { Injectable, OnDestroy, signal } from '@angular/core';
import { Timezone } from '../models/models';

export interface ClockReading {
  timezone: string;
  abbreviation: string;
  time: string;
}

const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  weekday: 'short',
  hour12: false,
};

@Injectable({ providedIn: 'root' })
export class ClockService implements OnDestroy {
  readonly readings = signal<ClockReading[]>([]);
  private intervalId?: ReturnType<typeof setInterval>;

  start(timezones: Timezone[]): void {
    this.stop();
    this.tick(timezones);
    this.intervalId = setInterval(() => this.tick(timezones), 1000);
  }

  stop(): void {
    if (this.intervalId !== undefined) clearInterval(this.intervalId);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private tick(timezones: Timezone[]): void {
    this.readings.set(
      timezones.map((tz) => ({
        timezone: tz.timezone,
        abbreviation: tz.abbreviation,
        time: new Date().toLocaleString('en-US', { timeZone: tz.timezone, ...FORMAT_OPTIONS }),
      })),
    );
  }
}
