# Veyra Studio — veyra-studio.github.io

The multilingual home of **Veyra Studio** and the **Veyra** creative web experience engine.

- English: **https://veyra-studio.github.io/**
- فارسی: **https://veyra-studio.github.io/fa/**
- العربية: **https://veyra-studio.github.io/ar/**
- Türkçe: **https://veyra-studio.github.io/tr/**

The site introduces the engine and its philosophy, runs the engine live (every demo on the page is Veyra Core at work), features the [Abali showcase](https://veyra-studio.github.io/abali/), links to the [engine source](https://github.com/veyra-studio/veyra-core), and takes commissions: [itsmetti@proton.me](mailto:itsmetti@proton.me).

## Design

- **Concept — the veil.** The hero wordmark is woven: a warp of fine threads (spring chains on Veyra's frame loop) passes over and under the letters, which are drawn from the real HTML heading via `drawElementText`. Threads comb aside under the pointer and ripple with scroll velocity.
- **Two scripts, four languages, designed separately.** English and Turkish set Instrument Serif with Geist; Persian and Arabic set Markazi Text with Vazirmatn — larger optical sizes, looser leading, no letter-spacing, RTL composition. Each language writes numbers its own way: Persian digits (۰۱۲) and Arabic-Indic digits (٠١٢) with «٫», the Turkish decimal comma. Copy is written for each language, not machine-paired.
- **Language switching** — a four-way switch (EN · فا · ع · TR) using cross-document View Transitions: the new language wipes in along its own reading direction and the wordmark morphs between «ویرا», «فيرا» and “Veyra”. Browsers without support navigate normally. Visitors whose browser prefers another of the four languages get a one-line hint.
- **New in 0.2 — a row that travels.** The engine's 0.2 capabilities sit in a horizontal section (itself `horizontal()`): vertical scrolling moves seven panels sideways — leftward in English and Turkish, rightward in Persian and Arabic so they arrive in reading order — and settles on a panel. Each panel is a live demo: kashida stretching Persian words, a draggable carousel, a FLIP grid, a magnetic link and a tilt card, script-aware scrambling, and a WebGL2 shader built from `@veyra/core/glsl`. A marquee band follows, running in the reading direction. Under reduced motion nothing in it moves on its own.
- **Commissions.** Before the footer, a section in each language says what the studio makes and gives the address in large type — a mail link with a subject in the page's language, a copy button that says it copied, a magnetic lean toward the pointer. The nav links to it; the footer repeats the address.
- **Restraint.** Paper, ink and one signal color; motion that explains (the engine demos) rather than decorates.

## Develop

```bash
npm install
npm run dev                 # http://localhost:4321  (English), /fa/, /ar/, /tr/
VEYRA_CORE_SRC=../veyra-core npm run dev   # live-develop the engine too
npm run build               # astro check + static build into dist/
npm run preview
npm run verify              # Playwright checks of the production build → verify-output/
npm run engine:update       # move to the newest engine release
```

## Structure

```
src/i18n/content.ts        all copy: English, Persian, Arabic, Turkish
src/i18n/numerals.ts       digits and decimal separators per language
src/components/Page.astro  the page, rendered once per language
src/layouts/Base.astro     <html lang/dir>, meta, hreflang, fonts
src/pages/index.astro      /      (English)
src/pages/fa/index.astro   /fa/   (Persian)
src/pages/ar/index.astro   /ar/   (Arabic)
src/pages/tr/index.astro   /tr/   (Turkish)
src/pages/404.astro        not-found page in all four languages
src/scripts/main.ts        stage, nav, statement, language transitions
src/scripts/veil.ts        the woven hero
src/scripts/demos.ts       live engine demos
src/scripts/next.ts        the "New in 0.2" row and its demos
src/styles/global.css      design system for both scripts
scripts/                   verify.mjs (browser checks), engine-stamp.mjs (writes dist/engine.json)
```

## Deploy

GitHub Actions builds and deploys `dist/` on every push to `main` (`.github/workflows/deploy.yml`), always with the newest engine: the site depends on `"@veyra/core": "github:veyra-studio/veyra-core#release"`, the branch veyra-core's CI publishes from every green build, and records what it shipped in `/engine.json`. When the engine changes the site redeploys on its own — immediately on veyra-core's `engine-updated` dispatch (needs its optional `SITES_DISPATCH_TOKEN`), otherwise within the hour through a scheduled check. If a new engine breaks the build, the current site stays live.

**One-time setup:** Settings → Pages → Build and deployment → Source: **GitHub Actions**. (As an organization `*.github.io` repository it defaults to "Deploy from a branch", which would publish the raw repository.)

## Credits

Fonts: Instrument Serif, Geist, Geist Mono, Markazi Text, Vazirmatn — SIL Open Font License. MIT © Veyra Studio.
