/**
 * AVDHUT KULKARNI — THE MULTI-POTENTIALITE SSG ENGINE
 * Compiles Books, Essays, Films, Audio, Work, and Archive notes into static portfolio
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const CONTENT_DIR = path.join(__dirname, 'content');
const SRC_TEMPLATES = path.join(__dirname, 'src', 'templates');
const SRC_ASSETS = path.join(__dirname, 'src', 'assets');
const DIST_DIR = path.join(__dirname, 'dist');
const ROOT_DIR = __dirname;

// Site Metadata
const SITE_CONFIG = {
  title: 'Avdhut Kulkarni · Bibliophile · Cinephile · Audiophile',
  author: 'Avdhut Kulkarni',
  bio: 'Multi-potentialite: Senior Product Designer, Bibliophile, Cinephile, and Audiophile.',
  siteUrl: 'https://avdhutkulkarni.github.io/portfolio',
  description: 'Personal multi-potentialite portfolio of Avdhut Kulkarni: writing canvas, Letterboxd film reviews, audiophile vinyl listening logs, and product design work.'
};

function ensureDirs() {
  [
    DIST_DIR,
    path.join(DIST_DIR, 'notes'),
    path.join(DIST_DIR, 'data'),
    path.join(DIST_DIR, 'assets'),
    path.join(ROOT_DIR, 'notes'),
    path.join(ROOT_DIR, 'data'),
    path.join(ROOT_DIR, 'assets')
  ].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Atomic file write (tmp + rename) so the dev server never serves torn files
function writeFileAtomic(dest, content) {
  const tmp = dest + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, dest);
}

// Process Obsidian Markdown
function processObsidianMarkdown(rawMd) {
  let content = rawMd;

  // The homepage reader is rooted at /index.html, so normalize note image
  // paths to the same ./assets path used by its generated markup.
  content = content.replace(/\.\.\/assets\//g, './assets/');

  // Highlights ==text==
  content = content.replace(/==(.*?)==/g, '<mark class="obsidian-highlight">$1</mark>');

  // Wikilinks [[slug|Label]] and [[slug]]
  content = content.replace(/\[\[(.*?)\|(.*?)\]\]/g, (match, slug, label) => {
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    return `<a href="./notes/${cleanSlug}.html" class="obsidian-link" data-slug="${cleanSlug}">${label.trim()}</a>`;
  });
  content = content.replace(/\[\[(.*?)\]\]/g, (match, slug) => {
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const label = slug.trim().replace(/-/g, ' ');
    return `<a href="./notes/${cleanSlug}.html" class="obsidian-link" data-slug="${cleanSlug}">${label}</a>`;
  });

  // Callouts > [!type] Title
  const calloutRegex = />\s*\[!(quote|note|tip|warning|info|abstract)\]\s*([^\n]*)\n((?:>.*\n?)*)/gi;
  content = content.replace(calloutRegex, (match, type, title, body) => {
    const cleanBody = body.replace(/^>\s?/gm, '').trim();
    const typeLower = type.toLowerCase();
    const renderedBody = marked.parse(cleanBody);
    const titleText = title.trim() || type.toUpperCase();

    let iconSvg = '';
    if (typeLower === 'quote') {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 0 4 1.5 6 3 8z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 0 4 1.5 6 3 8z"></path></svg>`;
    } else if (typeLower === 'tip') {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;
    } else if (typeLower === 'warning') {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    return `<aside class="obsidian-callout callout-${typeLower}">
      <div class="callout-title">${iconSvg} <span>${titleText}</span></div>
      <div class="callout-content">${renderedBody}</div>
    </aside>\n`;
  });

  return marked.parse(content);
}

// Compute organic coordinate if none supplied
function computeOrganicCoordinates(index) {
  const angle = index * 2.3999632;
  const radius = 240 + Math.sqrt(index) * 195;
  const x = Math.round(Math.cos(angle) * radius);
  const y = Math.round(Math.sin(angle) * radius);
  const rotate = ((((index * 13) % 17) - 8) * 0.65).toFixed(1);
  return { x, y, rotate };
}

// Scan all markdown files across content directories
function readAllContent() {
  const subdirs = ['books', 'essays', 'films', 'audio', 'work', 'archive'];
  const allNotes = [];

  subdirs.forEach(folder => {
    const dirPath = path.join(CONTENT_DIR, folder);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const rawContent = fs.readFileSync(fullPath, 'utf8');
      const parsed = matter(rawContent);
      const data = parsed.data || {};
      const slug = path.basename(file, '.md').toLowerCase();

      const wordCount = parsed.content.split(/\s+/).filter(Boolean).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 185));

      // Category resolution
      let category = data.category;
      if (!category) {
        if (folder === 'books' || folder === 'essays') category = 'bibliophile';
        else if (folder === 'films') category = 'cinephile';
        else if (folder === 'audio') category = 'audiophile';
        else if (folder === 'work') category = 'work';
        else if (folder === 'archive') category = 'archive';
        else category = 'bibliophile';
      }

      const htmlContent = processObsidianMarkdown(parsed.content);

      allNotes.push({
        slug,
        folder,
        category,
        title: data.title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        subtitle: data.subtitle || '',
        date: data.date ? (typeof data.date === 'string' ? data.date : data.date.toISOString().split('T')[0]) : '2026-03-01',
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [category]),
        author: data.author || SITE_CONFIG.author,
        rev: data.rev || 1,
        stamp: data.stamp || (category.toUpperCase() + ' · NOTE'),
        quote: data.quote || '',
        excerpt: data.excerpt || (parsed.content.substring(0, 160).replace(/[#*`>]/g, '').trim() + '...'),
        cardSnippet: data.cardSnippet || (parsed.content.substring(0, 120).replace(/[#*`>]/g, '').trim() + '...'),
        illustration: data.illustration || null,
        poster: data.poster || null,
        director: data.director || null,
        year: data.year || null,
        rating: data.rating || null,
        runtime: data.runtime || null,
        logline: data.logline || null,
        artist: data.artist || null,
        cover: data.cover || null,
        format: data.format || null,
        spotifyUrl: data.spotifyUrl || null,
        tracks: data.tracks || null,
        role: data.role || null,
        skills: data.skills || null,
        metrics: data.metrics || null,
        pinned: Boolean(data.pinned),
        x: data.x,
        y: data.y,
        rotate: data.rotate,
        readTime,
        htmlContent
      });
    });
  });

  return allNotes;
}

function build() {
  console.log('⚡ Starting Avdhut Kulkarni Multi-Potentialite SSG Build...');
  ensureDirs();

  // Copy assets
  copyDirSync(SRC_ASSETS, path.join(DIST_DIR, 'assets'));
  copyDirSync(SRC_ASSETS, path.join(ROOT_DIR, 'assets'));

  const indexTemplate = fs.readFileSync(path.join(SRC_TEMPLATES, 'index.html'), 'utf8');
  const noteTemplate = fs.readFileSync(path.join(SRC_TEMPLATES, 'note.html'), 'utf8');

  const notes = readAllContent();
  console.log(`📖 Processed ${notes.length} total notes across books, essays, films, audio, work, and archive.`);

  // 1. Separate notes by category
  const biblioNotes = notes.filter(n => n.category === 'bibliophile');
  const cineNotes = notes.filter(n => n.category === 'cinephile');
  const audioNotes = notes.filter(n => n.category === 'audiophile');
  const workNotes = notes.filter(n => n.category === 'work');
  const archiveNotes = notes.filter(n => n.category === 'archive');

  // Sort notes by date descending
  notes.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build Manuscript Cards for Bibliophile Desk Canvas
  const biblioCardsHtml = biblioNotes.map((note, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const tagList = note.tags.join(',');
    const isAttachLeft = idx % 2 !== 0;
    const attachmentNote = note.quote ? note.quote.split('—')[0].replace(/"/g, '').trim().substring(0, 48) + '...' : `Folio #${num}`;
    
    const defaultCoords = computeOrganicCoordinates(idx);
    const x = note.x !== undefined ? note.x : defaultCoords.x;
    const y = note.y !== undefined ? note.y : defaultCoords.y;
    const rotate = note.rotate !== undefined ? note.rotate : defaultCoords.rotate;

    note.x = x;
    note.y = y;
    note.rotate = rotate;

    return `
      <a class="manuscript-card" 
         id="card-${note.slug}"
         style="--card-x: ${x}; --card-y: ${y}; --card-r: ${rotate}deg;"
         data-slug="${note.slug}" 
         data-tags="${tagList}"
         href="./notes/${note.slug}.html"
         title="${note.title}">
        
        <!-- SVG Paper Clip -->
        <svg class="paper-clip" viewBox="0 0 14 36" aria-hidden="true">
          <path d="M4 10 L4 26 A5 5 0 0 0 14 26 L14 6 A7 7 0 0 0 0 6 L0 28 A9 9 0 0 0 18 28"/>
        </svg>

        <!-- Attached Slip -->
        <div class="card-attachment ${isAttachLeft ? 'attach-left' : ''}">
          <span class="attach-tag">#${note.tags[0] || 'Almanac'}</span>
          <span class="attach-text">${attachmentNote}</span>
        </div>

        <!-- Meta Header -->
        <div class="card-meta-head">
          <span>Draft · Essay ${num}</span>
          <span class="card-rev">Rev ${note.rev}</span>
        </div>

        <h3 class="card-title">${note.title}</h3>

        <div class="card-body">
          ${note.cardSnippet}
        </div>

        ${note.quote ? `<div class="card-quote-preview">${note.quote}</div>` : ''}

        <span class="card-stamp">${note.stamp}</span>
        <p class="card-page-num">— 1 —</p>
      </a>
    `;
  }).join('\n');

  // Build Cinephile Film Cards (Letterboxd Posters with Projection Beam)
  const filmCardsHtml = cineNotes.map((film) => {
    return `
      <article class="film-card" data-slug="${film.slug}">
        <div class="film-poster-wrap">
          <div class="film-projection-beam"></div>
          <div class="film-grain-layer"></div>
          <img class="film-poster-img" src="${film.poster || './assets/images/poster-oppenheimer.jpg'}" alt="${film.title} Poster" loading="lazy" />
          <div class="film-rating-stars">${film.rating || '★★★★★'}</div>
        </div>
        <div class="film-meta">
          <span class="film-director-year">${film.director} · ${film.year}</span>
          <h3 class="film-title">${film.title.split('(')[0].trim()}</h3>
          <p class="film-logline">${film.logline || film.excerpt}</p>
          <button class="film-review-btn" data-slug="${film.slug}">Read Letterboxd Review →</button>
        </div>
      </article>
    `;
  }).join('\n');

  // Build Audiophile Vinyl Cards (With Grooves, Spotify Embed link)
  const audioCardsHtml = audioNotes.map((audio) => {
    return `
      <article class="audio-card" data-slug="${audio.slug}">
        <div class="turntable-deck">
          <div class="turntable-platter">
            <div class="spinning-vinyl-disc">
              <div class="vinyl-groove-rings"></div>
              <div class="vinyl-center-label">
                <span class="vinyl-label-artist">${audio.artist}</span>
                <span class="vinyl-label-title">${audio.title.split('—')[0].trim()}</span>
                <span class="vinyl-label-rpm">33⅓ RPM</span>
              </div>
              <div class="vinyl-spindle-hole"></div>
            </div>
            <div class="turntable-tonearm">
              <div class="tonearm-pivot"></div>
              <div class="tonearm-arm"></div>
              <div class="tonearm-cartridge"></div>
            </div>
          </div>
          <!-- Animated Frequency Equalizer Waves -->
          <div class="audio-equalizer-bars">
            <span class="eq-bar bar-1"></span>
            <span class="eq-bar bar-2"></span>
            <span class="eq-bar bar-3"></span>
            <span class="eq-bar bar-4"></span>
            <span class="eq-bar bar-5"></span>
            <span class="eq-bar bar-6"></span>
            <span class="eq-bar bar-7"></span>
          </div>
        </div>
        <div class="audio-info">
          <span class="audio-format-badge">${audio.format || 'Vinyl LP · High-Fidelity Master'}</span>
          <h3 class="audio-title">${audio.title.split('—')[0].trim()}</h3>
          <p class="audio-artist-line">By <strong>${audio.artist}</strong> (${audio.year})</p>
          <p class="audio-quote">${audio.quote}</p>
          <div class="audio-btn-row">
            ${audio.spotifyUrl ? `
              <a href="${audio.spotifyUrl}" target="_blank" rel="noopener" class="spotify-link-btn" title="Open in Spotify">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                <span>Listen on Spotify</span>
              </a>` : ''}
            <button class="audio-notes-btn" data-slug="${audio.slug}">Listening Log →</button>
          </div>
        </div>
      </article>
    `;
  }).join('\n');

  // Build Work Section HTML
  const workItem = workNotes.find(w => w.slug === 'overview') || workNotes[0] || {
    title: 'Avdhut Kulkarni — Work & Craft',
    role: 'Senior Product Designer & Systems Thinker',
    excerpt: 'Designing software with extreme leverage and calm clarity.'
  };

  const workCaseStudies = workNotes.filter(w => w.slug !== 'overview');
  const workSectionHtml = `
    <div class="work-studio-container">
      <div class="work-hero-box">
        <span class="work-label-pill">Senior Product Designer &amp; Builder</span>
        <h2 class="work-headline">I build calm, high-leverage software architectures that move real business metrics.</h2>
        <p class="work-subtext">Over 6 years of end-to-end product design and design system engineering across fintech, developer tooling, and global digital products.</p>
        <div class="work-metrics-grid">
          <div class="metric-card">
            <span class="metric-number">+65%</span>
            <span class="metric-desc">Design System Velocity</span>
          </div>
          <div class="metric-card">
            <span class="metric-number">-28%</span>
            <span class="metric-desc">Support Query Reduction</span>
          </div>
          <div class="metric-card">
            <span class="metric-number">30+</span>
            <span class="metric-desc">Production Systems Shipped</span>
          </div>
        </div>
      </div>

      <div class="work-cases-list">
        <h3 class="work-section-subhead">Selected Case Studies &amp; Systems</h3>
        ${workCaseStudies.map(cs => `
          <div class="case-study-card" data-slug="${cs.slug}">
            <div class="case-card-body">
              <span class="case-tag">Case Study · ${cs.tags[0] || 'Design System'}</span>
              <h4 class="case-title">${cs.title}</h4>
              <p class="case-excerpt">${cs.excerpt}</p>
              <button class="case-read-btn" data-slug="${cs.slug}">View Case Study →</button>
            </div>
          </div>
        `).join('\n')}
      </div>
    </div>
  `;

  // Build Separate Archive Items HTML (From content/archive/)
  const archiveItemsHtml = archiveNotes.map((note) => {
    return `
      <div class="archive-item" data-slug="${note.slug}" data-tags="${note.tags.join(',')}">
        <div class="archive-item-left">
          <span class="archive-item-title">${note.title}</span>
          <p class="archive-item-snippet">${note.excerpt}</p>
        </div>
        <div class="archive-item-right">
          <span class="archive-tag">#${note.tags[0] || 'Archive'}</span>
          <span>${note.readTime} min read</span>
          <span>${note.date}</span>
        </div>
      </div>
    `;
  }).join('\n');

  // Load Letterboxd Data
  let letterboxdData = { topFour: [], recentWatches: [] };
  const lbJsonPath = path.join(__dirname, 'data', 'letterboxd.json');
  if (fs.existsSync(lbJsonPath)) {
    try {
      letterboxdData = JSON.parse(fs.readFileSync(lbJsonPath, 'utf8'));
    } catch (e) {}
  }

  // Pre-render Top Four Showcase
  const topFourHtml = (letterboxdData.topFour || []).map((film, idx) => `
    <a href="${film.link}" target="_blank" rel="noopener" class="top-four-card" title="${film.title} (${film.year})">
      <div class="top-four-badge">#${idx + 1} FAVOURITE</div>
      <div class="top-four-poster-wrap">
        <img src="${film.poster || './assets/images/poster-oppenheimer.jpg'}" alt="${film.title}" class="top-four-img" loading="lazy" onerror="this.hidden=true;this.parentElement.classList.add('poster-unavailable');this.nextElementSibling.hidden=false" />
        <span class="poster-unavailable-label" aria-hidden="true" hidden>Poster unavailable</span>
        <div class="top-four-stars">${film.stars}</div>
      </div>
      <div class="top-four-info">
        <h4 class="top-four-title">${film.title}</h4>
        <span class="top-four-year">${film.year}</span>
        ${film.review ? `<p class="top-four-review">“${film.review}”</p>` : ''}
      </div>
    </a>
  `).join('\n');

  // Pre-render Recent Letterboxd Reel
  const recentReelHtml = (letterboxdData.recentWatches || []).map((film, idx) => `
    <article class="letterboxd-film-card${idx % 5 === 4 ? ' collage-feature' : ''}">
      <div class="lb-poster-box">
        <img src="${film.poster || './assets/images/poster-oppenheimer.jpg'}" alt="${film.title}" class="lb-poster-img" loading="lazy" onerror="this.hidden=true;this.parentElement.classList.add('poster-unavailable');this.nextElementSibling.hidden=false" />
        <span class="poster-unavailable-label" aria-hidden="true" hidden>Poster unavailable</span>
        <div class="lb-stars-badge">${film.stars}</div>
        ${film.rewatch ? `<span class="lb-rewatch-icon" title="Rewatch">↺</span>` : ''}
      </div>
      <div class="lb-film-body">
        <div class="lb-head-row">
          <span class="lb-year">${film.year}</span>
          <span class="lb-date">${film.watchedDate || 'Recently'}</span>
        </div>
        <h4 class="lb-title"><a href="${film.link}" target="_blank" rel="noopener">${film.title}</a></h4>
        ${film.review ? `<p class="lb-review-text">${film.review}</p>` : ''}
        <div class="lb-footer-row">
          <a href="${film.link}" target="_blank" rel="noopener" class="lb-open-btn">
            <span>Letterboxd Review</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      </div>
    </article>
  `).join('\n');

  // Pre-render Latest Watch for Now Strip
  const latestWatch = (letterboxdData.recentWatches || [])[0];
  const nowWatchingHtml = latestWatch ? `
    <span class="now-chip-tag">Recently Logged</span>
    <a href="${latestWatch.link}" target="_blank" rel="noopener" class="now-film-link">
      <strong>${latestWatch.title}</strong> (${latestWatch.year}) · <span class="letterboxd-stars">${latestWatch.stars}</span>
    </a>
  ` : `
    <span class="now-chip-tag">Letterboxd</span>
    <a href="https://letterboxd.com/avd1234/" target="_blank" rel="noopener" class="now-film-link">
      <strong>Open profile for recent watches</strong>
    </a>
  `;

  // Replace into template
  const finalIndexHtml = indexTemplate
    .replace('<!-- {{BIBLIO_CARDS}} -->', biblioCardsHtml)
    .replace('<!-- {{FILM_POSTERS}} -->', filmCardsHtml)
    .replace('<!-- {{AUDIO_CARDS}} -->', audioCardsHtml)
    .replace('<!-- {{WORK_SECTION}} -->', workSectionHtml)
    .replace('<!-- {{ARCHIVE_ITEMS}} -->', archiveItemsHtml)
    .replace('<!-- {{NOW_WATCHING_FILM}} -->', nowWatchingHtml)
    .replace('<!-- {{LETTERBOXD_TOP_FOUR}} -->', topFourHtml)
    .replace('<!-- {{LETTERBOXD_RECENT_REEL}} -->', recentReelHtml)
    .replace('<!-- {{NOTES_DATA_JSON}} -->', JSON.stringify(notes));

  writeFileAtomic(path.join(DIST_DIR, 'index.html'), finalIndexHtml, 'utf8');
  writeFileAtomic(path.join(ROOT_DIR, 'index.html'), finalIndexHtml, 'utf8');

  writeFileAtomic(path.join(DIST_DIR, 'data', 'notes.json'), JSON.stringify(notes, null, 2), 'utf8');
  writeFileAtomic(path.join(ROOT_DIR, 'data', 'notes.json'), JSON.stringify(notes, null, 2), 'utf8');

  // Build Individual Standalone Note Pages
  notes.forEach(note => {
    const stampHtml = note.stamp ? `<span class="reader-stamp-tag">${note.stamp}</span>` : '';
    const subtitleHtml = note.subtitle ? `<p class="reader-subtitle">${note.subtitle}</p>` : '';
    const tagsHtml = note.tags.map(t => `<span class="reader-tag">#${t}</span>`).join('');
    const standaloneBodyHtml = note.htmlContent
      .replace(/href="\.\/notes\//g, 'href="../notes/')
      .replace(/src="\.\/assets\//g, 'src="../assets/');

    const pageHtml = noteTemplate
      .replace(/{{NOTE_TITLE}}/g, note.title)
      .replace(/{{NOTE_EXCERPT}}/g, note.excerpt)
      .replace(/{{NOTE_DATE}}/g, note.date)
      .replace(/{{NOTE_READ_TIME}}/g, note.readTime)
      .replace(/{{NOTE_STAMP_HTML}}/g, stampHtml)
      .replace(/{{NOTE_SUBTITLE_HTML}}/g, subtitleHtml)
      .replace(/{{NOTE_TAGS_HTML}}/g, tagsHtml)
      .replace(/{{NOTE_BODY_HTML}}/g, standaloneBodyHtml);

    writeFileAtomic(path.join(DIST_DIR, 'notes', `${note.slug}.html`), pageHtml, 'utf8');
    writeFileAtomic(path.join(ROOT_DIR, 'notes', `${note.slug}.html`), pageHtml, 'utf8');
  });

  // Build RSS Feed
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${SITE_CONFIG.title}</title>
  <link>${SITE_CONFIG.siteUrl}</link>
  <description>${SITE_CONFIG.description}</description>
  <language>en-us</language>
  ${notes.map(note => `
  <item>
    <title><![CDATA[${note.title}]]></title>
    <link>${SITE_CONFIG.siteUrl}/notes/${note.slug}.html</link>
    <description><![CDATA[${note.excerpt}]]></description>
    <pubDate>${new Date(note.date).toUTCString()}</pubDate>
    <guid>${SITE_CONFIG.siteUrl}/notes/${note.slug}.html</guid>
  </item>`).join('\n')}
</channel>
</rss>`;

  writeFileAtomic(path.join(DIST_DIR, 'rss.xml'), rssXml, 'utf8');
  writeFileAtomic(path.join(ROOT_DIR, 'rss.xml'), rssXml, 'utf8');

  // Build Sitemap
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_CONFIG.siteUrl}/index.html</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ${notes.map(note => `
  <url>
    <loc>${SITE_CONFIG.siteUrl}/notes/${note.slug}.html</loc>
    <lastmod>${note.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  writeFileAtomic(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  writeFileAtomic(path.join(ROOT_DIR, 'sitemap.xml'), sitemapXml, 'utf8');

  console.log(`✅ Multi-potentialite build completed! Generated index.html, ${notes.length} standalone pages, RSS & Sitemap.`);
}

build();

module.exports = { build };
