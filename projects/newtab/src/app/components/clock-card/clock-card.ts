import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { ClockService } from '@shared/services/clock.service';
import { SettingsService } from '@shared/services/settings.service';

@Component({
  selector: 'app-clock-card',
  imports: [],
  templateUrl: './clock-card.html',
  styleUrl: './clock-card.scss',
})
export class ClockCard implements OnInit, OnDestroy {
  private readonly clock = inject(ClockService);
  private readonly settings = inject(SettingsService);

  protected readonly readings = this.clock.readings;
  protected readonly primary = computed(() => this.readings()[0]);
  protected readonly secondary = computed(() => this.readings().slice(1));

  ngOnInit(): void {
    this.clock.start(this.settings.settings().timezones);
  }

  ngOnDestroy(): void {
    this.clock.stop();
  }
}
