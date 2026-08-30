import { Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timezoneAbbreviation } from '@shared/services/settings.service';
import { Timezone } from '@shared/models/models';

// Every Chrome shipping MV3 supports Intl.supportedValuesOf — no network
// fetch (and no third-party API dependency) needed for the timezone list.
const ALL_TIMEZONES: string[] = (Intl as unknown as { supportedValuesOf(key: 'timeZone'): string[] }).supportedValuesOf(
  'timeZone',
);

@Component({
  selector: 'app-timezone-settings',
  imports: [FormsModule],
  templateUrl: './timezone-settings.html',
  styleUrl: './timezone-settings.scss',
})
export class TimezoneSettings {
  readonly selected = model.required<Timezone[]>();
  protected readonly query = signal('');

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? ALL_TIMEZONES.filter((tz) => tz.toLowerCase().includes(q)) : ALL_TIMEZONES;
  });

  isSelected(timezone: string): boolean {
    return this.selected().some((tz) => tz.timezone === timezone);
  }

  toggle(timezone: string): void {
    if (this.isSelected(timezone)) {
      this.selected.set(this.selected().filter((tz) => tz.timezone !== timezone));
      return;
    }
    this.selected.set([...this.selected(), { timezone, abbreviation: timezoneAbbreviation(timezone) }]);
  }
}
