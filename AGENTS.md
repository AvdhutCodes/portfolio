# AGENTS.md — Portfolio Repo Conventions

## Commands

- `npm run dev` — serve repo root on `:3000` (`$env:PORT=3001` to override),
  watches `content/`, `src/templates/`, `src/assets` and rebuilds on change.
  Rebuild-only: no browser auto-refresh.
- `node build.js` — deterministic offline build (no Letterboxd fetch).
  `npm run build` = Letterboxd sync + build.
- `npm test` — `node --check` on `build.js`, `dev-server.js`,
  `scripts/sync-letterboxd.js`. No test framework; add real tests before
  claiming coverage.
- `node scripts/sync-letterboxd.js` — refreshes `data/letterboxd.json` +
  `dist/data/letterboxd.json` from the Letterboxd RSS feed.

## Build outputs (committed!)

`build.js` writes every artifact twice: `dist/` (GitHub Pages deploys this)
and repo root (dev-server document root). After editing anything under `src/`,
`content/`, or `build.js`, run `node build.js` and expect diffs in BOTH trees
(`assets/`, `index.html`, `notes/`, `data/notes.json`, `rss.xml`,
`sitemap.xml` × root + `dist/`). Writes are atomic (tmp + rename).

## Hard rules (learned from real bugs)

1. **Closed overlays must be inert.** Any `position:fixed; inset:0` modal needs
   `visibility:hidden` + `pointer-events:none` when closed, and NO child may
   re-enable `pointer-events` outside the open state. An invisible
   `#mindGraphModal` header once ate all navbar clicks. Verify with
   `elementFromPoint`, not just opacity.
2. **SSG + live renderer lockstep.** `build.js` templates and
   `src/assets/js/letterboxd-live.js#renderLetterboxdUI` must emit identical
   card markup (Top Four grid, recent reel). If you change one, change both —
   hydration replaces SSG HTML at runtime.
3. **Live feed is thin.** The rss2json proxy returns ~10 recent items; the SSG
   bundle holds the full 50-entry diary. Never let live data downgrade curated
   sections (Top Four renders SSG-only; live refreshes reel + now-strip).
4. **Theme via vars, reviewed per surface.** Dark-first design; brand-dark
   surfaces (Letterboxd cards, vinyl, codex, carousel) stay dark in light mode
   by decision. New styles must use `var(--bg-*)` / `var(--text-*)` / borders
   and be checked in BOTH themes. Canvas/JS-drawn colors must read
   `data-theme` (see `graph-view.js#categoryColor`, `cursor.js#draw`).
5. **No new runtime deps** without asking. Zero-dependency frontend (Web Audio
   FX, hand-rolled canvas); only gray-matter + marked in Node.

## Verification standard

- `npm test` + clean `node build.js` after every change.
- Behavior changes: exercise against `localhost:3000` in a real browser
  (section switching, modals, both themes). Hard-reload or cache-bust —
  the dev server sends `no-cache` but test browsers still hold stale CSS.
- Screenshots need a focused, visible window; they can lie in background
  tabs (frozen transitions). Computed styles are the reliable fallback.

## Git

- Branch `main`, remote `origin` (AvdhutCodes/portfolio). Site deploys from
  `./dist` via Actions on push.
- Keep responses short, technical, no emojis unless asked. Reference code as
  `path:line`.
- Do not push unless the user explicitly asks.
