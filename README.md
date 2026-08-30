# Personalized New Tab

![Personalized New Tab dashboard](images/screenshot.png)

A fully customizable Chrome new-tab replacement: a live security and AI/robotics
research feed, a world clock, a to-do list, and daily quotes — all optional,
all toggleable, on top of your own background photo.

Built with **Angular** (a multi-app workspace: `newtab`, `options`, `popup`)
on **Manifest V3**.

## Features

- **Feed** — Security news (WeLiveSecurity, Security Affairs, Dark Reading) and
  an **AI & Robotics research** category (OpenAI, Google DeepMind, Hugging
  Face, arXiv cs.AI/cs.LG/cs.RO, IEEE Spectrum Robotics, Robohub), plus any
  custom RSS/Atom feed URLs you add. Fetched directly by the background
  service worker — no third-party CORS proxy involved.
- **Clock** — a live clock across as many timezones as you want to track.
- **Quotes** — a daily Bible verse and a random famous quote, each independently
  toggleable.
- **To-do list** — a simple, locally-saved task list.
- **Greeting** — an editable name or mantra on every new tab.
- **Settings** — every widget above can be turned on or off, and the feed
  category, custom feeds, and timezones are all configurable from the options
  page.

## Install from source

1. `npm install`
2. `npm run build` — builds all three apps and assembles `dist-extension/`.
3. Open `chrome://extensions`, enable **Developer mode**, click **Load
   unpacked**, and select the `dist-extension/` folder.

## Development

```bash
npm start              # ng serve newtab  → http://localhost:4300
npm run start:options  # ng serve options → http://localhost:4301
npm run start:popup    # ng serve popup   → http://localhost:4302
```

Outside the extension, `chrome.storage` isn't available — the app falls back
to `localStorage` automatically (see
[`ChromeStorageService`](projects/shared/src/services/chrome-storage.service.ts)),
so the dev servers above are enough to iterate on the UI. Live feed fetches
will mostly fail in that mode (plain browser tabs don't get the
`host_permissions` CORS bypass the real extension has) — that's expected;
`npm run build` + **Load unpacked** is how to test feeds for real.

### Project layout

```
projects/
  newtab/     new-tab dashboard (feed, clock, quotes, to-do, greeting)
  options/    settings page
  popup/      toolbar popup
  shared/     services, models, and design tokens shared by all three
background/   MV3 service worker (feed/quote fetches, install defaults)
manifest.json
scripts/build-extension.mjs   assembles dist-extension/ after `ng build`
```

## Chrome Web Store listing

**Short description** (132 char max):
> Turn your new tab into a personal dashboard: live security & AI/robotics feeds, a clock, quotes, and a to-do list.

**Detailed description**:
> Personalized New Tab replaces Chrome's new tab page with a calm, customizable
> dashboard built around what you actually want to see first thing.
>
> - **Stay current** — a live feed of security news and AI & robotics research
>   (OpenAI, DeepMind, Hugging Face, arXiv, IEEE Spectrum Robotics, and more),
>   plus room to add your own RSS feeds.
> - **Stay on time** — a live clock across every timezone you care about.
> - **Stay grounded** — a daily Bible verse and a random famous quote, each
>   optional.
> - **Stay organized** — a lightweight to-do list, saved locally, right on
>   your new tab.
> - **Make it yours** — every widget above can be switched on or off from the
>   settings page, and the feed, timezones, and greeting are all yours to set.
>
> No accounts, no tracking. Settings sync via your Chrome profile
> (`chrome.storage.sync`); everything else — your to-do list, cached feed
> data — stays on your device.

## Contributing

We welcome contributions from the community to make this extension even better.

1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/my-feature` or `git checkout -b bugfix/issue-number`.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your fork: `git push origin feature/my-feature`.
5. Open a pull request on this repository, explaining your changes and the problem they solve.

## Contact

If you have any questions, suggestions, or issues, please feel free to [open an issue](https://github.com/anoited007/personalized-tab/issues) on this repository.
