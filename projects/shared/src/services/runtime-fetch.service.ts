import { Injectable } from '@angular/core';

export type FetchFormat = 'JSON' | 'TEXT';

/**
 * Routes network requests through the background service worker (which holds
 * the host_permissions needed to bypass CORS for arbitrary feed URLs).
 *
 * When there's no extension runtime — i.e. previewing with `ng serve` — falls
 * back to a direct same-context fetch. That direct fetch will fail for feeds
 * without permissive CORS headers; callers should treat a rejection as
 * "unavailable in preview mode" rather than a real feature failure.
 */
@Injectable({ providedIn: 'root' })
export class RuntimeFetchService {
  private readonly hasExtensionRuntime = typeof chrome !== 'undefined' && !!chrome.runtime?.sendMessage;

  async fetch<T = unknown>(url: string, format: FetchFormat): Promise<T> {
    if (this.hasExtensionRuntime) {
      return new Promise<T>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'FETCH_DATA', url, format }, (response: T | undefined) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response as T);
        });
      });
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request to ${url} failed with ${response.status}`);
    return (format === 'JSON' ? response.json() : response.text()) as Promise<T>;
  }
}
