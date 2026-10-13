# Veyra Studio site — working notes for Claude Code

Multilingual (EN `/`, FA `/fa/`, AR `/ar/`, TR `/tr/`) Astro static site for Veyra Studio and the Veyra engine. The master plan and progress tracker for all Veyra repositories is `docs/PLAN.md` in [veyra-core](https://github.com/veyra-studio/veyra-core).

## Commands

```bash
npm install
npm run dev            # astro dev
npm run build          # astro check + astro build → dist/
npm run verify         # Playwright checks of the production build
npm run engine:update  # move to the newest engine release (github:veyra-studio/veyra-core#release)
```

TypeScript is pinned to 6.x here because `@astrojs/check` does not support 7 yet.

## Rules

- Commissions go to one address, `email` in `src/i18n/content.ts` (itsmetti@proton.me): the «Commissions» section (`#contact`), the nav link and the footer all read it from there, with a mail subject per language (`contact.subject`).
- All copy lives in `src/i18n/content.ts`; write each language natively (Persian: ZWNJ, Persian digits, «٫», «»; Arabic: Arabic-Indic digits ٠١٢, «٫», «», ، ؛; Turkish: ı/İ, decimal comma). Numbers go through `localNumber()` in `src/i18n/numerals.ts`.
- Adding a language: add it to `Lang`, `langs`, `content`, `paths` (and `isRtl` if RTL), add `src/pages/<lang>/index.astro`, `public/og-<lang>.png`, the sitemap, the `LANGS` list in `scripts/verify.mjs` and the deploy workflow's build check.
- One `Page.astro` renders every language; Arabic-script design goes in CSS via `:root:is(:lang(fa), :lang(ar))` (Persian and Arabic share faces and settings; Turkish shares English's) — never ship a mirrored-only layout.
- Use logical properties (`inset-inline-*`, `margin-inline-*`). Exception: elements with a vertical `writing-mode` resolve logical insets against their own axes — position a horizontal wrapper instead.
- Keep `[hidden]` working on anything given a `display` value (`.x[hidden] { display: none }`).
- The engine comes from veyra-core's `release` branch on GitHub; never patch it here. Engine changes reach this site on their own after they merge in veyra-core (dispatch or hourly check).
- `public/work/*-hero.webp` (one per case, 1600×1000) and `public/og-*.png` are captures of the real sites (regenerate after visual changes). A case's copy is in each language's `work.cases`; its site, source, image and original line in `cases` (`src/i18n/content.ts`).
- Nothing draws while it can't be seen: per-frame drawing stops off screen (`whenVisible` or the section's visibility) and when nothing moves. The hero's veil is WebGL (`src/scripts/veil.ts`) — a 2D canvas of thousands of path segments a frame kept the GPU busy and the page hanging; check `canvas.veil` with a GPU trace after changing it.
