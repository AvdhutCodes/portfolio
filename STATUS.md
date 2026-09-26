# Project Status — Avdhut Kulkarni Portfolio

Living record of completed work, verified behavior, known issues, and remaining
tasks. Updated 2026-09-26. See `AGENTS.md` for repo conventions.

## Stack

Custom zero-dependency Obsidian SSG (`build.js`, gray-matter + marked only).
`content/` (23 markdown notes) → `src/templates/` → committed build output in
both `dist/` (GitHub Pages artifact) and repo root (dev-server document root).
Letterboxd diary syncs via `scripts/sync-letterboxd.js` at build time and via
`letterboxd-live.js` (rss2json proxy) at runtime. Deploys from `./dist` on push
to `main` (`.github/workflows/deploy.yml`, plus 6-hour Letterboxd re-sync).

## Done (verified)

**Cleanup / wiring (commit `4696c1a` and earlier session)**

- `window.ReaderModal` instance exposed (`main.js`) — Omnibar and Mind Graph
  note-opening actually work now.
- Theme preference persists across reloads (was force-dark every load).
- Mind Graph: fixed drag-release always counting as a click; DPR-aware canvas;
  theme-aware node/link/label colors.
- Letterboxd client: fixed Top Four double-counting 5★ films, fake `★★★★`
  default for unrated, `pubDate.split(' ')[0]` yielding `"Sat,"`, added
  `../data/` fallback for standalone note pages, timezone-safe date fallback.
- `package.json`: removed unused astro/tailwind devDeps (lockfile −5656 lines,
  `npm ci` clean, 11 packages); `npm test` is now non-mutating `node --check`.
- `sync-letterboxd.js` writes only `data/` + `dist/data/`; deleted stale
  `src/data/` and `public/data/` copies (nothing referenced them).
- `dev-server.js`: friendly `EADDRINUSE` message with fix instructions.

**Nav root cause (live-browser reproduced)**

- Navbar buttons did nothing because invisible `#mindGraphModal`'s header had
  unconditional `pointer-events: auto` over the header (`elementFromPoint`
  proof). Fixed by scoping header interactivity to `.open` + `visibility`
  handling on the modal. All 5 sections switch, verified in-browser.

**Paper light theme**

- `[data-theme="light"]` rewritten as true archival paper (was a second dark
  theme, which is why the toggle "did nothing").
- Brand-dark elements intentionally stay dark: Letterboxd cards, vinyl
  hardware, codex tome, carousel theater. Everything else flips via vars.
- Moon/sun toggle icon; standalone `note.html` pages respect stored theme;
  graph canvas + cursor particles theme-aware.
- Removed a corrupted orphan CSS block + duplicate `.attach-text` in `desk.css`.
- Verified per-section computed colors in both themes, live.

**Foundation book (landing codex)**

- Back board, page-edge stack, 3 staggered flutter leaves, oxblood endpaper
  inner face (required moving `backface-visibility` from cover to content),
  breathing pedestal shadow, mobile + `prefers-reduced-motion` handling.
- Verified via screenshot: leaves fanned, endpaper revealed mid-flip.

**Letterboxd collage + Canon covers**

- Top Four alternating 3D tilt, reel dense collage with featured 2-col spans
  (`collage-feature`, every 5th — added in lockstep to `build.js` and
  `letterboxd-live.js`), reduced-motion guards.
- Canon carousel: real Open Library covers (ISBNs verified against the API)
  with monochrome badge fallback via `onerror`.
- Live hydration no longer downgrades the SSG Top Four (proxy only carries 10
  recent items): live render skips Top Four, refreshes reel + now-strip.
- `build.js` writes atomically (tmp + rename) so the dev server never serves
  torn files during concurrent rebuilds.

## Loose ends (unverified, check in a real browser)

1. Canon cover pixels never observed loading in the test browser (origin
   reachable, imgs stayed `complete:false`). Confirm covers render; badge
   fallback covers failure by design.
2. `skipTopFour` guard + atomic-write fix: code-reviewed, build passes, but no
   final end-to-end pass after the last edits.
3. Test-browser caching is aggressive: always hard-reload / cache-bust (`?x=`)
   and prefer `browser.reload` before trusting computed styles or screenshots.

## Known bugs / deferred

- `build.js` dual-writes root + `dist/` (dev serves root, Pages ships dist).
  Harmless but confusing; single-output migration is the natural next cleanup.
- `public/` is an empty shell (only ever held the deleted letterboxd copy).
  Remove it or wire it into the build.
- Dev-server "live reload" is rebuild-only; no browser refresh injection.
- Mind Graph link generation (`sameCategory || sharedTags`) is near-complete
  for bibliophile notes (~100+ links, noisy) and physics is O(n²). Fine at 23
  nodes; revisit past ~100.
- rss2json free tier caps the live feed at 10 items and needs no key today;
  if it rate-limits, the SSG bundle is the fallback (status dot shows it).
- `?theme*` / `?lb*` / `?book*` cache-bust URLs were used during testing;
  reader treats unknown hashes gracefully, no cleanup needed.

## Suggested next tasks

1. Confirm loose ends 1–2 in a real browser, then close them here.
2. Decide single-output (`dist/`-only) build + dev-server serves `dist/`.
3. Graph: cap link density, add touch support.
4. Real test suite (currently only `node --check`); add a link/placeholder
   auditor over `dist/`.
