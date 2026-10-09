# Veyra Studio — veyra-studio.github.io

The bilingual home of **Veyra Studio** and the **Veyra** creative web experience engine.

- English: **https://veyra-studio.github.io/**
- فارسی: **https://veyra-studio.github.io/fa/**

The site introduces the engine and its philosophy, runs the engine live (every demo on the page is Veyra Core at work), features the [Abali showcase](https://veyra-studio.github.io/abali/), and links to the [engine source](https://github.com/veyra-studio/veyra-core).

## Design

- **Concept — the veil.** The hero wordmark is woven: a warp of fine threads (spring chains on Veyra's frame loop) passes over and under the letters, which are drawn from the real HTML heading via `drawElementText`. Threads comb aside under the pointer and ripple with scroll velocity.
- **Two scripts, designed separately.** English sets Instrument Serif with Geist; Persian sets Markazi Text with Vazirmatn — larger optical sizes, looser leading, no letter-spacing, Persian digits and decimal separator, RTL composition. Copy is written for each language, not machine-paired.
- **Language switching** uses cross-document View Transitions: the new language wipes in along its own reading direction and the wordmark morphs between «ویرا» and “Veyra”. Browsers without support navigate normally.
- **Restraint.** Paper, ink and one signal color; motion that explains (the engine demos) rather than decorates.

## Develop

```bash
npm install
npm run dev                 # http://localhost:4321  (English) and /fa/
VEYRA_CORE_SRC=../veyra-core npm run dev   # live-develop the engine too
npm run build               # astro check + static build into dist/
npm run preview
npm run verify              # Playwright checks of the production build → verify-output/
npm run engine:update       # vendor the latest ../veyra-core release
```

## Structure

```
src/i18n/content.ts        all copy, English and Persian
src/components/Page.astro  the page, rendered once per language
src/layouts/Base.astro     <html lang/dir>, meta, hreflang, fonts
src/pages/index.astro      /      (English)
src/pages/fa/index.astro   /fa/   (Persian)
src/pages/404.astro        bilingual not-found page
src/scripts/main.ts        stage, nav, statement, language transitions
src/scripts/veil.ts        the woven hero
src/scripts/demos.ts       live engine demos
src/styles/global.css      design system for both scripts
vendor/veyra-core/         vendored Veyra Core release (see VENDORED.json)
```

## Deploy

GitHub Actions builds and deploys `dist/` on every push to `main` (`.github/workflows/deploy.yml`).

**One-time setup:** Settings → Pages → Build and deployment → Source: **GitHub Actions**. (As an organization `*.github.io` repository it defaults to "Deploy from a branch", which would publish the raw repository.)

## Credits

Fonts: Instrument Serif, Geist, Geist Mono, Markazi Text, Vazirmatn — SIL Open Font License. MIT © Veyra Studio.
