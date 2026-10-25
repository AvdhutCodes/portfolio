# Project Status — Avdhut Kulkarni Portfolio

Living record of completed work, verified behavior, known issues, and remaining
tasks. Updated 2026-09-27. See `AGENTS.md` for repo conventions.

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
- Full-paper Antimetal theme: every surface flips to paper in light mode, no
  dark islands (only intentional photo objects stay dark: poster wells, vinyl
  disc, turntable hardware). Letterboxd cards, vinyl, codex all go paper.
- Moon/sun toggle icon; standalone `note.html` pages respect stored theme;
  graph canvas + cursor particles theme-aware.
- Removed a corrupted orphan CSS block + duplicate `.attach-text` in `desk.css`.
- Verified per-section computed colors in both themes, live.

**Foundation book (landing codex)**

- Back board, page-edge stack, oxblood endpaper inner face (required moving
  `backface-visibility` from cover to content), breathing pedestal shadow,
  click-only open (hover triggers removed — they caused flicker and frozen
  mid-flip screenshots), flipped cover fades out so the memoir left page
  reads fully, mobile + `prefers-reduced-motion` handling.
- Chapter rows: uniform 60px, wrapping titles (2-line clamp), fixed-width
  chapter numbers (`min-width: 0` fix for nowrap overflow).
- Verified via screenshot in both themes: memoir page readable, all four
  chapter titles complete.

**Letterboxd collage**

- Top Four alternating 3D tilt, reel dense collage with featured 2-col spans
  (`collage-feature`, every 5th — added in lockstep to `build.js` and
  `letterboxd-live.js`), reduced-motion guards.
- Paper chips in light mode (badges, poster fallback, stars, rewatch icon);
  cyan link darkened for contrast.
- Live hydration no longer downgrades the SSG Top Four (proxy only carries 10
  recent items): live render skips Top Four, refreshes reel + now-strip.
- `build.js` writes atomically (tmp + rename) so the dev server never serves
  torn files during concurrent rebuilds.

**Canon + Archive removal, footer-only nav (commit `3cc0382` and follow-ups)**

- Removed Canon carousel (template, `carousel.css`, `initBookCarousel`,
  omnibar actions); 4 book essays stay as normal bibliophile notes.
  Re-stamped `CANON · X` → `TOME · X` across all 5 book notes.
- Removed Archive drawer idea; 2 archive notes re-homed to
  `content/essays/` as bibliophile (`ESSAY · JOURNAL 01/02`).
- New fixed site footer (`.site-footer-nav`) is the ONLY section nav;
  header holds brand + utilities. Fixed a missing `}` in `main.js` that had
  killed the entire script (total site outage — nav, theme, desk, reader).
- Memoir left page ("A Memoir in Draft — Hey, I'm Avdhut"); book hint swaps
  to close-state text when open.

## Loose ends (unverified, check in a real browser)

1. `skipTopFour` guard + atomic-write fix: code-reviewed, build passes, but no
   final end-to-end pass after the last edits.
2. Test-browser caching is aggressive: always hard-reload / cache-bust (`?x=`)
   and prefer `browser.reload` before trusting computed styles or screenshots.
3. Mobile 390px pass: header/footer fit verified by CSS math only; confirm on
   a real device (footer nav, book chapters, desk controls).

## Known bugs / deferred

- `build.js` dual-writes root + `dist/` (dev serves root, Pages ships dist).
  Harmless but confusing; single-output migration is the natural next cleanup.
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
