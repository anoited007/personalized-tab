/**
 * Custom feed URLs point at whatever domain the user types in, which the
 * manifest's fixed host_permissions can't cover (and broad wildcard host
 * permissions is exactly what the Chrome Web Store review flags). Instead,
 * manifest.json declares optional_host_permissions for all origins, which
 * lets us ask for just the specific origin(s) a custom feed needs, at the
 * moment the user adds it — a real permission prompt, granted per-origin,
 * not blanket access.
 */

function originOf(url: string): string | null {
  try {
    return `${new URL(url).origin}/*`;
  } catch {
    return null;
  }
}

/**
 * Ensures the given feed URLs' origins are permitted, prompting the user if
 * needed. Must be called synchronously within a user gesture (e.g. a click
 * handler) — `chrome.permissions.request` requires one. Resolves `true` if
 * every origin ended up granted (already, or just now); `false` if the user
 * declined, or `chrome.permissions` isn't available (e.g. dev preview).
 */
export async function ensureFeedPermissions(urls: string[]): Promise<boolean> {
  if (typeof chrome === 'undefined' || !chrome.permissions) return true;

  const origins = [...new Set(urls.map(originOf).filter((o): o is string => o !== null))];
  if (!origins.length) return true;

  const missing: string[] = [];
  for (const origin of origins) {
    const has = await chrome.permissions.contains({ origins: [origin] });
    if (!has) missing.push(origin);
  }
  if (!missing.length) return true;

  return chrome.permissions.request({ origins: missing });
}
