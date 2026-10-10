# Veyra Studio site — working notes for Claude Code

Bilingual (EN `/`, FA `/fa/`) Astro static site for Veyra Studio and the Veyra engine. The master plan and progress tracker for all Veyra repositories is `docs/PLAN.md` in [veyra-core](https://github.com/veyra-studio/veyra-core).

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

- All copy lives in `src/i18n/content.ts`; write each language natively (Persian: ZWNJ, Persian digits, «٫», «»).
- One `Page.astro` renders both languages; direction-specific design goes in CSS via `:root:lang(fa)` — never ship a mirrored-only layout.
- Use logical properties (`inset-inline-*`, `margin-inline-*`). Exception: elements with a vertical `writing-mode` resolve logical insets against their own axes — position a horizontal wrapper instead.
- Keep `[hidden]` working on anything given a `display` value (`.x[hidden] { display: none }`).
- The engine comes from veyra-core's `release` branch on GitHub; never patch it here. Engine changes reach this site on their own after they merge in veyra-core (dispatch or hourly check).
- `public/work/abali-hero.webp` and `public/og-*.png` are captures of the real sites (regenerate after visual changes).
