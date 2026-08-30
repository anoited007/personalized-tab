import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
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
