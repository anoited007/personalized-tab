// MV3 service worker. No DOM, no Angular — kept as plain JS since it's a
// handful of lines that never change shape. See js/app.js's Angular services
// for the counterpart that calls into this file via chrome.runtime.sendMessage.

function timezoneAbbreviation(timezone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' }).formatToParts(
    new Date(),
  );
  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timezone;
}

function defaultSettings() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    enableGreeting: true,
    enableFeed: true,
    enableClock: true,
    enableReligiousQuote: true,
    enableFamousQuote: true,
    enableTodo: true,
    enableRipple: true,
    rippleIntensity: 0.35,
    enableTypingEffect: true,
    enableCursor: true,
    greeting: null,
    feedToDisplay: 'all',
    feed: '',
    timezones: [{ timezone, abbreviation: timezoneAbbreviation(timezone) }],
    theme: 'globetrotter',
    accentColor: 'red',
  };
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set(defaultSettings(), () => {
      chrome.tabs.create({ url: `chrome-extension://${chrome.runtime.id}/options/index.html` });
    });
  }
});

// Fetches run here, not in the newtab/options pages, because only the
// background context has the host_permissions (see manifest.json) needed to
// read cross-origin RSS/JSON responses that don't send CORS headers of their
// own — no third-party CORS proxy required.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== 'FETCH_DATA') return false;

  fetch(message.url)
    .then((response) => (message.format === 'JSON' ? response.json() : response.text()))
    .then((data) => sendResponse(data))
    .catch((error) => {
      console.error('[personalized-tab] fetch failed for', message.url, error);
      sendResponse(undefined);
    });

  return true; // keep the message channel open for the async sendResponse above
});
