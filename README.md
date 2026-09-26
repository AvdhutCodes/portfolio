# 🏛️ Avdhut Kulkarni · The Multi-Potentialite Sanctuary

An infinite floating manuscript canvas, Letterboxd film review theater, vinyl listening sanctuary, and product design portfolio powered by an **Obsidian Static Site Generator (SSG)** and deployed automatically to **GitHub Pages**.

Built for **Avdhut Kulkarni**: Senior Product Designer, Bibliophile, Cinephile, and Audiophile.

---

## 🌟 The Four Core Realms

1. 📖 **Bibliophile**:
   - 2D Infinite Canvas with pan, zoom, momentum inertia, and reading torch follower.
   - Pinned fantasy/sci-fi canon (Stormlight, Mistborn, Red Rising, Lord of the Rings) with hand-drawn ink doodle art.
   - Curated philosophical essays inspired by Naval Ravikant's *Almanack*.
2. 🎬 **Cinephile**:
   - Letterboxd-style 2:3 film poster cards.
   - Hovering triggers an authentic **35mm projection beam lighting** and silver-screen film grain texture.
   - Direct modal reader for Letterboxd reviews written in Obsidian Markdown (`.md`).
3. 🎧 **Audiophile**:
   - High-fidelity vinyl crates with spinning records sliding from album sleeves on hover.
   - Embedded & linked Spotify players, acoustic notes, and listening logs.
4. 💼 **Work / Portfolio**:
   - Clean, serene Swedish design & systems engineering showcase.
   - Core metrics (+65% velocity, -28% queries, 30+ production systems), case studies, and contact.
5. 📦 **Separate Archive Drawer**:
   - Independent chronological thought stream and raw notebook fragments.

---

## 📁 Repository Structure

```
avdhut portfolio/
├── content/                  # 📓 Obsidian Vault
│   ├── books/                # 📖 Curated books & fantasy/sci-fi canon
│   ├── essays/               # 🖋️ Mental models & timeless essays
│   ├── films/                # 🎬 Cinephile Letterboxd movie reviews
│   ├── audio/                # 🎧 Audiophile vinyl listening logs
│   ├── work/                 # 💼 Case studies & professional bio
│   └── archive/              # 📦 Raw chronological thought stream
├── src/
│   ├── assets/
│   │   ├── css/              # base.css, desk.css, reader.css, cursor.css
│   │   ├── js/               # canvas.js, reader.js, cursor.js, main.js
│   │   └── images/           # Doodles, posters, album art
│   └── templates/
│       ├── index.html        # Multi-potentialite master template
│       └── note.html         # Standalone SEO note template
├── dist/                     # 🚀 Production static site
├── build.js                  # ⚡ SSG compiler (<60ms)
├── dev-server.js             # 🔍 Dev server with live Obsidian watcher
└── .github/workflows/
    └── deploy.yml            # 🚢 GitHub Actions automated deployment
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build the static site
npm run build

# 3. Start local live-reload development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser. Any edits in `content/` will automatically rebuild and update the live site!

---

*“Specialization is for insects. A human being should be able to write an essay, design a system, critique a film, listen to a frequency, and ship a product.”*
