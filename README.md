# 🏛️ Avadh Kulkarni · The Bibliophile's Desk & Almanac

An infinite floating manuscript canvas portfolio and Obsidian-powered Static Site Generator (SSG) inspired by **Vaibhav Verma's writing style**, **Naval Ravikant's Almanac**, and **Swedish minimalist design**.

Built specifically for **Avadh Kulkarni**, bibliophile, essayist, and collector of timeless ideas.

---

## 🌟 Key Highlights

- **Infinite Floating Canvas (2D Workspace)**:
  - Drag anywhere on the desk to pan smoothly with physics inertia.
  - Zoom in and out toward the cursor with mouse wheel or pinch gestures.
  - Scattered manuscript cards with organic rotations, paper textures, paper clips, and index slips.
  - Quick HUD controls: Zoom In, Zoom Out, Center/Reset Desk.
- **Atmospheric Reading Torch**:
  - A subtle luminous reading spotlight follows your cursor across the dark study desk.
  - Sweeping the light over draft cards illuminates their paper fibers and brings distressed ink stamps to life (`is-lit`).
- **Book-Grade Essay Reader**:
  - Clicking any manuscript card opens the essay right in place in an elegant, distraction-free reading drawer.
  - First-letter drop caps, Naval-style pull quotes, reading progress bar, estimated reading time, and keyboard navigation (`Esc` to close, arrow keys to navigate).
  - Also outputs standalone SEO-friendly static `.html` pages for every note for Twitter/X previews, search engines, and direct deep links.
- **Obsidian Markdown Engine (SSG)**:
  - Write notes in your favorite Obsidian vault.
  - Full support for **Obsidian Callouts** (`> [!quote]`, `> [!note]`, `> [!tip]`, `> [!warning]`), **Wikilinks** (`[[note-slug]]`), **Highlights** (`==text==`), and strikethroughs (`<s>...</s>`).
  - Automatic golden-spiral dispersion so newly added notes automatically float without overlapping.
- **Alternative Swedish Archive Index**:
  - Readers can toggle between the **Canvas** view and a clean **Archive** list view.
  - Real-time tag filtering (`#Leverage`, `#Books`, `#Mental Models`, `#Philosophy`, `#Stoicism`).
- **GitHub Pages CI/CD Included**:
  - Automatic deployment pipeline via GitHub Actions (`.github/workflows/deploy.yml`). Simply `git push` to publish!

---

## 📁 Repository Structure

```
avdhut-portfolio/
├── content/
│   └── notes/                # 📝 Your Obsidian Markdown notes live here
│       ├── specific-knowledge.md
│       ├── reading-and-retention.md
│       ├── the-judgment-trade.md
│       ├── permissionless-leverage.md
│       ├── marginalia-on-borges.md
│       ├── the-subtraction-heuristic.md
│       ├── stoic-equations-of-peace.md
│       ├── books-that-shaped-my-mind.md
│       └── calm-mind-clear-thinking.md
├── src/
│   ├── assets/
│   │   ├── css/              # base.css, desk.css, reader.css, cursor.css
│   │   └── js/               # canvas.js, reader.js, cursor.js, main.js
│   └── templates/
│       ├── index.html        # Main infinite desk template
│       └── note.html         # Standalone note SEO template
├── dist/                     # 🚀 Generated static production site
├── build.js                  # ⚡ SSG build engine (<50ms execution)
├── dev-server.js             # 🔍 Dev server with live Obsidian note watching
├── OBSIDIAN_GUIDE.md         # 📖 Comprehensive guide for Obsidian integration
└── .github/workflows/
    └── deploy.yml            # 🚢 GitHub Actions automatic deployment
```

---

## ⚡ Quick Start

### 1. Install & Build
```bash
# Install dependencies (only marked & gray-matter)
npm install

# Build the static site
npm run build
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser. Any edits in `content/notes/` will automatically rebuild and update the site!

### 3. Deploy to GitHub Pages
1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: initial bibliophile desk portfolio"
   ```
2. Create a repository on GitHub (e.g. `avdhut-portfolio` or `username.github.io`).
3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```
4. In your GitHub repository settings:
   - Go to **Settings → Pages**.
   - Under **Build and deployment**, select **GitHub Actions**.
   - That's it! GitHub will build and host your site automatically on every push.

---

## ✍️ How to Add a New Note in Obsidian

Create a new file in `content/notes/my-essay.md`:

```markdown
---
title: "The Compounding Mind"
subtitle: "Why consistency beats intermittent genius every time"
date: 2026-03-20
tags: [Mental Models, Navalism]
author: "Avadh Kulkarni"
rev: 1
stamp: "COMPOUNDING · ESSAY 10"
quote: "Compound interest is the eighth wonder of the world. — Charlie Munger"
---

> [!quote] Munger's Principle
> "The first rule of compounding: Never interrupt it unnecessarily."

## The Non-Linearity of Patience
...
```

Run `npm run build` or push to GitHub, and your note will float on your desk!

---

*“I cannot remember the books I've read any more than the meals I have eaten; even so, they have made me.” — Ralph Waldo Emerson*
