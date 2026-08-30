import { Component, OnInit, effect, inject } from '@angular/core';
import { SettingsService } from '@shared/services/settings.service';
import { applyTheme } from '@shared/services/apply-theme';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly settingsService = inject(SettingsService);
  protected readonly settings = this.settingsService.settings;

  constructor() {
    effect(() => applyTheme(this.settings().theme, this.settings().accentColor));
  }

  ngOnInit(): void {
    this.settingsService.load();
  }

  openNewTab(): void {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({});
      return;
    }
    window.open('/', '_blank');
  }

  openSettings(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  }
}
