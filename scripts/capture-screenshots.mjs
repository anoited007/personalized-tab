#!/usr/bin/env node
// One-off dev tool: drives the local `ng serve` dev servers with the system
// Chrome to capture pixel-exact 1280x800 PNGs for the Chrome Web Store
// listing. Not part of the shipped extension.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'images', 'store');
mkdirSync(outDir, { recursive: true });

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DEMO_SYNC = {
  enableGreeting: true,
  enableFeed: true,
  enableClock: true,
  enableReligiousQuote: true,
  enableFamousQuote: true,
  enableTodo: true,
  greeting: 'Kwesi',
  feedToDisplay: 'all',
  feed: '',
  theme: 'globetrotter',
  accentColor: 'mint',
  enableRipple: true,
  rippleIntensity: 0.35,
  enableTypingEffect: true,
  enableCursor: true,
  timezones: [
    { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, abbreviation: 'Local' },
    { timezone: 'Asia/Tokyo', abbreviation: 'JST' },
    { timezone: 'America/New_York', abbreviation: 'EST' },
  ],
};

const DEMO_LOCAL = {
  todos: [
    { id: '1', text: 'Ship the Angular rewrite', done: true },
    { id: '2', text: 'Write the Chrome Web Store listing', done: false },
    { id: '3', text: 'Take fresh screenshots', done: false },
  ],
};

// Canned RSS so every feed source renders for the screenshot even though
// most of these hosts don't send CORS headers a plain browser tab can read
// (the real extension bypasses that via host_permissions — see FeedService).
// Headlines here are original placeholder copy, not real article titles.
function rssFor(title, items) {
  const xmlItems = items
    .map(
      (headline, i) => `<item><title>${headline}</title><link>https://example.com/${i}</link><pubDate>Sun, 30 Aug 2026 12:00:00 GMT</pubDate></item>`,
    )
    .join('');
  return `<?xml version="1.0"?><rss version="2.0"><channel><title>${title}</title><link>https://example.com</link>${xmlItems}</channel></rss>`;
}

const CANNED_FEEDS = {
  'feeds.feedburner.com': rssFor('WeLiveSecurity', [
    'New phishing kit spotted targeting cloud login pages',
    'Patch roundup: critical fixes shipped this week',
    'How ransomware crews are recruiting affiliates',
  ]),
  'securityaffairs.com': rssFor('Security Affairs', [
    'Threat actor group expands infrastructure across three continents',
    'Zero-day in popular VPN appliance actively exploited',
  ]),
  'darkreading.com': rssFor('Dark Reading', [
    'Enterprises rethink identity strategy after agentic AI rollout',
    'Bug bounty payouts climb as attack surface grows',
  ]),
  'openai.com': rssFor('OpenAI News', [
    'New reasoning benchmarks published alongside model update',
    'Expanded tool-use documentation for developers',
  ]),
  'deepmind.google': rssFor('Google DeepMind', [
    'Research team publishes new results on protein folding',
    'Progress update on world-model research',
  ]),
  'huggingface.co': rssFor('Hugging Face', [
    'Community leaderboard adds new evaluation track',
    'New transformer checkpoint trends on the Hub',
  ]),
  'export.arxiv.org': rssFor('arXiv', [
    'A survey of efficient attention mechanisms for long context',
    'Scaling laws revisited for mixture-of-experts transformers',
  ]),
  'spectrum.ieee.org': rssFor('IEEE Spectrum Robotics', [
    'Warehouse robots take on more delicate picking tasks',
    'Startup unveils new actuator design for humanoids',
  ]),
  'robohub.org': rssFor('Robohub', [
    'Field notes from this year’s robotics research showcase',
    'Open-source manipulation stack hits 1.0',
  ]),
};

async function seedAndGoto(page, url) {
  // Seed localStorage before the app's first script runs.
  await page.evaluateOnNewDocument(
    (sync, local, feeds) => {
      localStorage.setItem('personalized-tab:sync', JSON.stringify(sync));
      localStorage.setItem('personalized-tab:local', JSON.stringify(local));

      const realFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const requestUrl = typeof input === 'string' ? input : input.url;
        const host = Object.keys(feeds).find((h) => requestUrl.includes(h));
        if (host) {
          return Promise.resolve(new Response(feeds[host], { status: 200 }));
        }
        return realFetch(input, init);
      };
    },
    DEMO_SYNC,
    DEMO_LOCAL,
    CANNED_FEEDS,
  );
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
  });

  try {
    const page = await browser.newPage();

    // 1. Main dashboard
    await seedAndGoto(page, 'http://localhost:4300');
    await new Promise((r) => setTimeout(r, 4500)); // let feed/quote fetches + typewriter settle
    await page.screenshot({ path: join(outDir, '1-dashboard.png') });

    // 2. AI & Robotics feed tab
    const tabs = await page.$$('.feed-tab');
    for (const tab of tabs) {
      const label = await tab.evaluate((el) => el.textContent.trim());
      if (label.includes('AI')) {
        await tab.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: join(outDir, '2-ai-robotics-feed.png') });

    // 3 & 4. Options / settings page — top (greeting/feed/timezones) and
    // bottom (feature toggles + save/reset) as two separate shots.
    const optionsPage = await browser.newPage();
    await optionsPage.setViewport({ width: 1280, height: 800 });
    await optionsPage.goto('http://localhost:4301', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));
    await optionsPage.screenshot({ path: join(outDir, '3-settings-top.png') });

    await optionsPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 300));
    await optionsPage.screenshot({ path: join(outDir, '4-settings-toggles.png') });

    console.log('✔ Screenshots written to', outDir);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
