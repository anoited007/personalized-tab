import { Component, inject } from '@angular/core';
import { SettingsService } from '../services/settings.service';

/** The blinking terminal "_" cursor — a single toggleable place to render it. */
@Component({
  selector: 'app-cursor',
  imports: [],
  template: `@if (settings.settings().enableCursor) {
    <span class="cursor">_</span>
  }`,
})
export class CursorComponent {
  protected readonly settings = inject(SettingsService);
}
