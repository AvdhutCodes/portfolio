# 📓 The Multi-Potentialite's Guide: Writing in Obsidian & Auto-Publishing

Welcome, **Avdhut Kulkarni**! This guide details how your Obsidian notes in each category (**Bibliophile**, **Cinephile**, **Audiophile**, **Work**, and **Archive**) translate seamlessly into floating manuscript cards, Letterboxd poster cards with projection lighting, vinyl listening logs, and case studies, and automatically deploy to **GitHub Pages**.

---

## ⚡ The Obsidian Folder Architecture

Open your Obsidian vault at:
`c:\Users\kulka\OneDrive\Documents\avdhut portfolio\content`

Your vault is organized into 6 dedicated realms:

```
content/
├── books/       # 📖 Curated books & character folios (Stormlight, Mistborn, Red Rising, LOTR)
├── essays/      # 🖋️ Philosophical essays & mental models (Specific Knowledge, Via Negativa, etc.)
├── films/       # 🎬 Cinephile Letterboxd movie reviews with 35mm projection beam
├── audio/       # 🎧 Audiophile vinyl listening logs with Spotify links
├── work/        # 💼 Product design case studies & systems engineering
└── archive/     # 📦 Raw chronological stream-of-consciousness & notebook scraps
```

---

## 🎬 1. Cinephile / Letterboxd Review Format

Write in `content/films/my-movie.md`:

```markdown
---
title: "Oppenheimer (2023): Fire, Theory, and the Terror of Chain Reactions"
subtitle: "Christopher Nolan's 70mm chamber drama disguised as a blockbuster"
date: 2026-03-12
category: cinephile
author: "Avdhut Kulkarni"
director: "Christopher Nolan"
year: 2023
rating: "★★★★★"
runtime: "180 min"
poster: "assets/images/poster-oppenheimer.jpg"
quote: "They won't fear it until they understand it, and they won't understand it until they've used it."
logline: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."
tags: [Cinema, Letterboxd, Christopher Nolan, 70mm]
---

> [!quote] The Trinity Test
> "We knew the world would not be the same..."

## A Symphony of Fission and Conscience
Your review prose goes here...
```

*When published, this automatically creates a Letterboxd-style 2:3 poster card that glows with projection beam lighting and film grain on hover!*

---

## 🎧 2. Audiophile / Vinyl Listening Log Format

Write in `content/audio/album-name.md`:

```markdown
---
title: "Radiohead — In Rainbows (2007): The Analog Warmth of Disconnection"
subtitle: "Tape compression, fingerpicked arpeggios, and why 15 Step redefined modern mixing"
date: 2026-03-08
category: audiophile
author: "Avdhut Kulkarni"
artist: "Radiohead"
year: 2007
format: "Vinyl LP · 45 RPM Special Edition"
cover: "assets/images/album-in-rainbows.jpg"
spotifyUrl: "https://open.spotify.com/album/7eyQXxuf2nGj9d2367Gi5f"
quote: "Because we separate like ripples on a blank shore... In rainbows."
tracks: ["15 Step", "Bodysnatchers", "Nude", "Weird Fishes/Arpeggi", "All I Need"]
tags: [Music, Audiophile, Vinyl, Radiohead, Spotify]
---

> [!quote] Acoustic Soundstage
> Notes on the physical spatialization and dynamics...
```

---

## 📖 3. Bibliophile & Essay Format

Write in `content/books/` or `content/essays/`:

```markdown
---
title: "The Architecture of Specific Knowledge"
subtitle: "Why you cannot be trained for what makes you genuinely irreplaceable"
date: 2026-03-14
category: bibliophile
tags: [Leverage, Navalism, Mental Models]
author: "Avdhut Kulkarni"
rev: 4
stamp: "LEVERAGE · ESSAY 01"
quote: "Specific knowledge cannot be taught, but it can be learned. — Naval Ravikant"
cardSnippet: "Society trains people for jobs that can be outsourced. Cultivate what feels like play to you but looks like work to others."
---
```

---

## 🚀 Live Preview & Deployment

```bash
# Start live development server with Obsidian watcher
npm run dev

# Build for production
npm run build
```

Whenever you push to GitHub, the GitHub Actions workflow automatically builds and deploys all categories to **GitHub Pages**!
