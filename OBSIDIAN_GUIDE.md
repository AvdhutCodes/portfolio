# 📓 The Bibliophile's Guide: Writing in Obsidian & Auto-Publishing

Welcome, **Avadh**! This guide details how your Obsidian notes seamlessly translate into floating manuscript cards on your website and automatically deploy to **GitHub Pages**.

---

## ⚡ The 3-Step Obsidian Workflow

### Method 1: Point Obsidian directly to this folder (Recommended)
1. Open **Obsidian**.
2. Click **Open folder as vault** (the vault icon in the bottom-left of Obsidian).
3. Select `c:\Users\kulka\OneDrive\Documents\avdhut portfolio\content\notes` (or the root `avdhut portfolio` folder).
4. Whenever you create a new note in Obsidian, it is immediately recognized by your SSG.

### Method 2: Use the "Obsidian Git" Plugin (100% Mobile & Desktop Auto-Publishing)
1. In Obsidian, go to **Settings → Community Plugins**.
2. Search for and install **Obsidian Git**.
3. Enable "Auto backup after X minutes" or trigger "Git: Commit and push".
4. Every time you push, the included GitHub Actions workflow builds your portfolio and updates your live site!

---

## 🖋️ Note Format & Frontmatter Cheat Sheet

Every note is a standard Markdown file (`.md`) with YAML frontmatter at the top:

```markdown
---
title: "The Architecture of Specific Knowledge"
subtitle: "Why you cannot be trained for what makes you genuinely irreplaceable"
date: 2026-03-14
tags: [Leverage, Navalism, Mental Models]
author: "Avadh Kulkarni"
rev: 4
stamp: "LEVERAGE · ESSAY 01"
quote: "Specific knowledge cannot be taught, but it can be learned. — Naval Ravikant"
excerpt: "Specific knowledge is found much more by pursuing your innate curiosity than by chasing whatever is trending."
cardSnippet: "Society trains people for jobs that can be outsourced. Cultivate what feels like play to you but looks like work to others."
pinned: true
x: -380
y: -220
rotate: -3.8
---

> [!quote] Naval's Axiom
> "Specific knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now."

## The Mirage of Transferable Credentials

In modern academic and corporate life, we are trained to seek transferable credentials...
```

### Frontmatter Field Explanations:
| Field | Purpose | Default if Omitted |
| :--- | :--- | :--- |
| `title` | Main title of the essay or note | Derived from filename |
| `subtitle` | Secondary italicized tagline | None |
| `date` | Publication or draft date (`YYYY-MM-DD`) | Today's date |
| `tags` | Array of tags (e.g. `[Books, Philosophy]`) | `[Note]` |
| `rev` | Revision number displayed in the draft header (e.g., `Rev 3`) | `1` |
| `stamp` | Distressed ink stamp text (e.g., `FIRST EDITION`, `LEVERAGE`) | `NOTE · ALMANAC` |
| `quote` | Aphorism or pull quote highlighted on the card | None |
| `cardSnippet` | Short punchy text shown on the scattered manuscript card | Auto-extracted from first lines |
| `x`, `y` | 2D coordinates on the infinite canvas | Auto-calculated with golden spiral |
| `rotate` | Card tilt angle in degrees (e.g. `-3.5`, `4.2`) | Auto-calculated organic tilt |

> **Organic Scattering**: You do not have to worry about calculating `x`, `y`, or `rotate`. If you leave them out, the SSG automatically calculates a natural golden-spiral orbit so your drafts float gracefully without overlapping!

---

## 🎨 Supported Obsidian Features

Your site comes equipped with native parsers for your favorite Obsidian writing tools:

### 1. Obsidian Callouts
```markdown
> [!quote] Timeless Maxim
> "Desire is a contract you make with yourself to be unhappy until you get what you want."

> [!note] Marginal Note
> Cross-reference with Seneca's letters on time.

> [!tip] Rereading Axiom
> If a book isn't worth rereading, it wasn't worth reading once.

> [!warning] Fragility Heuristic
> Never mistake the map for the territory.
```

### 2. Wikilinks (`[[Link]]`)
You can link between notes using Obsidian's native bracket syntax:
- `[[reading-and-retention]]` → links to `/notes/reading-and-retention.html`
- `[[specific-knowledge|The Art of Specific Knowledge]]` → custom link text

### 3. Highlights (`==text==`)
- `==This text will have a warm golden editorial highlighter applied==`

### 4. Crossed-out Editorial Drafts
- `<s>outdated thought</s>` → rendered with authentic red editorial strikethrough

---

## 🚀 Local Preview Commands

Run these commands in your project terminal:

```bash
# Build the static site into /dist and root
npm run build

# Start live development server with Obsidian watcher
npm run dev
```

When `npm run dev` is running, visit **`http://localhost:3000`** in your browser. As you save notes in Obsidian, the dev server detects the change, rebuilds the site in milliseconds, and refreshes the canvas!
