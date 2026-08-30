import { Injectable } from '@angular/core';

type StorageArea = 'sync' | 'local';

/**
 * Thin Promise wrapper around chrome.storage.{sync,local}.
 *
 * Falls back to window.localStorage (namespaced per area) when `chrome.storage`
 * isn't available — i.e. when the app is opened via `ng serve` in a plain
 * browser tab instead of as an installed extension, so the UI can still be
 * built/previewed without loading an unpacked extension.
 */
@Injectable({ providedIn: 'root' })
export class ChromeStorageService {
  private readonly hasChromeStorage =
    typeof chrome !== 'undefined' && !!chrome.storage?.sync && !!chrome.storage?.local;

  async get<T extends object>(area: StorageArea, keys: (keyof T)[] | null = null): Promise<Partial<T>> {
    if (this.hasChromeStorage) {
      return chrome.storage[area].get(keys as string[] | null) as unknown as Promise<Partial<T>>;
    }
    const all = this.readLocalFallback(area) as Partial<T>;
    if (!keys) return all;
    const subset: Partial<T> = {};
    for (const key of keys) {
      if (key in all) subset[key] = all[key];
    }
    return subset;
  }

  async set(area: StorageArea, items: object): Promise<void> {
    if (this.hasChromeStorage) {
      return chrome.storage[area].set(items);
    }
    const all = this.readLocalFallback(area);
    Object.assign(all, items);
    this.writeLocalFallback(area, all);
    return;
  }

  private fallbackKey(area: StorageArea): string {
    return `personalized-tab:${area}`;
  }

  private readLocalFallback(area: StorageArea): Record<string, unknown> {
    try {
      const raw = window.localStorage.getItem(this.fallbackKey(area));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private writeLocalFallback(area: StorageArea, value: Record<string, unknown>): void {
    try {
      window.localStorage.setItem(this.fallbackKey(area), JSON.stringify(value));
    } catch {
      // Storage unavailable (e.g. private browsing) — silently no-op like chrome.storage would rarely do.
    }
  }
}
