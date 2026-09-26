/**
 * AVADH KULKARNI — THE BIBLIOPHILE'S SSG ENGINE
 * Zero-Config Obsidian to GitHub Pages Static Site Generator
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const NOTES_DIR = path.join(__dirname, 'content', 'notes');
const SRC_TEMPLATES = path.join(__dirname, 'src', 'templates');
const SRC_ASSETS = path.join(__dirname, 'src', 'assets');
const DIST_DIR = path.join(__dirname, 'dist');
const ROOT_DIR = __dirname;

// Site Metadata
const SITE_CONFIG = {
  title: 'Avadh Kulkarni · The Bibliophile\'s Desk & Almanac',
  author: 'Avadh Kulkarni',
  bio: 'Bibliophile, thinker, collector of ideas. Inspired by Naval Ravikant\'s Almanac and timeless philosophy.',
  siteUrl: 'https://avadhkulkarni.github.io/portfolio', // Can be customized by user
  description: 'Infinite floating manuscript canvas and personal essays on leverage, specific knowledge, books, and mental models.'
};

// Ensure directories exist
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

// Copy directory recursively
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

// Obsidian Markdown Custom Processor
function processObsidianMarkdown(rawMd) {
  let content = rawMd;

  // 1. Obsidian Highlights: ==text== -> <mark class="obsidian-highlight">text</mark>
  content = content.replace(/==(.*?)==/g, '<mark class="obsidian-highlight">$1</mark>');

  // 2. Obsidian Wikilinks: [[slug|Title]] and [[slug]]
  content = content.replace(/\[\[(.*?)\|(.*?)\]\]/g, (match, slug, label) => {
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    return `<a href="./notes/${cleanSlug}.html" class="obsidian-link" data-slug="${cleanSlug}">${label.trim()}</a>`;
  });
  content = content.replace(/\[\[(.*?)\]\]/g, (match, slug) => {
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const label = slug.trim().replace(/-/g, ' ');
    return `<a href="./notes/${cleanSlug}.html" class="obsidian-link" data-slug="${cleanSlug}">${label}</a>`;
  });

  // 3. Obsidian Callouts:
  // > [!quote] Title
  // > Quote body
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

  // Standard markdown parsing
  return marked.parse(content);
}

// Compute organic coordinate if none supplied in frontmatter
function computeOrganicCoordinates(index) {
  // Golden spiral dispersion
  const angle = index * 2.3999632;
  const radius = 240 + Math.sqrt(index) * 195;
  const x = Math.round(Math.cos(angle) * radius);
  const y = Math.round(Math.sin(angle) * radius);
  const rotate = ((((index * 13) % 17) - 8) * 0.65).toFixed(1);
  return { x, y, rotate };
}

// Build Static Site
function build() {
  console.log('⚡ Starting Avadh Kulkarni Bibliophile SSG Build...');
  ensureDirs();

  // Copy assets
  copyDirSync(SRC_ASSETS, path.join(DIST_DIR, 'assets'));
  copyDirSync(SRC_ASSETS, path.join(ROOT_DIR, 'assets'));

  // Read templates
  const indexTemplate = fs.readFileSync(path.join(SRC_TEMPLATES, 'index.html'), 'utf8');
  const noteTemplate = fs.readFileSync(path.join(SRC_TEMPLATES, 'note.html'), 'utf8');

  // Read all markdown notes
  const noteFiles = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'));
  console.log(`📖 Found ${noteFiles.length} Obsidian notes in content/notes/`);

  const notes = [];

  noteFiles.forEach((file, index) => {
    const rawContent = fs.readFileSync(path.join(NOTES_DIR, file), 'utf8');
    const parsed = matter(rawContent);
    const data = parsed.data || {};
    const slug = path.basename(file, '.md').toLowerCase();

    // Calculate reading time
    const wordCount = parsed.content.split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 185));

    // Coordinates
    const defaultCoords = computeOrganicCoordinates(index);
    const x = data.x !== undefined ? data.x : defaultCoords.x;
    const y = data.y !== undefined ? data.y : defaultCoords.y;
    const rotate = data.rotate !== undefined ? data.rotate : defaultCoords.rotate;

    // Process markdown with Obsidian features
    const htmlContent = processObsidianMarkdown(parsed.content);

    const noteObj = {
      slug,
      title: data.title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      subtitle: data.subtitle || '',
      date: data.date ? (typeof data.date === 'string' ? data.date : data.date.toISOString().split('T')[0]) : '2026-03-01',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : ['Note']),
      author: data.author || SITE_CONFIG.author,
      rev: data.rev || 1,
      stamp: data.stamp || 'NOTE · ALMANAC',
      quote: data.quote || '',
      excerpt: data.excerpt || (parsed.content.substring(0, 160).replace(/[#*`>]/g, '').trim() + '...'),
      cardSnippet: data.cardSnippet || (parsed.content.substring(0, 120).replace(/[#*`>]/g, '').trim() + '...'),
      pinned: Boolean(data.pinned),
      x,
      y,
      rotate,
      readTime,
      htmlContent
    };

    notes.push(noteObj);
  });

  // Sort notes by date descending
  notes.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build Manuscript Cards HTML
  const manuscriptCardsHtml = notes.map((note, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const tagList = note.tags.join(',');
    const isAttachLeft = idx % 2 !== 0;
    const attachmentNote = note.quote ? note.quote.split('—')[0].replace(/"/g, '').trim().substring(0, 48) + '...' : `Folio #${num}`;

    return `
      <a class="manuscript-card" 
         id="card-${note.slug}"
         style="--card-x: ${note.x}; --card-y: ${note.y}; --card-r: ${note.rotate}deg;"
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

        <!-- Title -->
        <h3 class="card-title">${note.title}</h3>

        <!-- Card Snippet -->
        <div class="card-body">
          ${note.cardSnippet}
        </div>

        <!-- Quote Preview -->
        ${note.quote ? `<div class="card-quote-preview">${note.quote}</div>` : ''}

        <!-- Vintage Stamp -->
        <span class="card-stamp">${note.stamp}</span>

        <!-- Page -->
        <p class="card-page-num">— 1 —</p>
      </a>
    `;
  }).join('\n');

  // Build Archive Items HTML
  const archiveItemsHtml = notes.map((note) => {
    return `
      <div class="archive-item" data-slug="${note.slug}" data-tags="${note.tags.join(',')}">
        <div class="archive-item-left">
          <span class="archive-item-title">${note.title}</span>
          <p class="archive-item-snippet">${note.excerpt}</p>
        </div>
        <div class="archive-item-right">
          <span class="archive-tag">#${note.tags[0] || 'Essay'}</span>
          <span>${note.readTime} min read</span>
          <span>${note.date}</span>
        </div>
      </div>
    `;
  }).join('\n');

  // Render Index HTML
  const finalIndexHtml = indexTemplate
    .replace('<!-- {{MANUSCRIPT_CARDS}} -->', manuscriptCardsHtml)
    .replace('<!-- {{ARCHIVE_ITEMS}} -->', archiveItemsHtml)
    .replace('<!-- {{NOTES_DATA_JSON}} -->', JSON.stringify(notes));

  // Write Index to both dist and root
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), finalIndexHtml, 'utf8');
  fs.writeFileSync(path.join(ROOT_DIR, 'index.html'), finalIndexHtml, 'utf8');

  // Write Data JSON
  fs.writeFileSync(path.join(DIST_DIR, 'data', 'notes.json'), JSON.stringify(notes, null, 2), 'utf8');
  fs.writeFileSync(path.join(ROOT_DIR, 'data', 'notes.json'), JSON.stringify(notes, null, 2), 'utf8');

  // Build Individual Standalone Note Pages
  notes.forEach(note => {
    const stampHtml = note.stamp ? `<span class="reader-stamp-tag">${note.stamp}</span>` : '';
    const subtitleHtml = note.subtitle ? `<p class="reader-subtitle">${note.subtitle}</p>` : '';
    const tagsHtml = note.tags.map(t => `<span class="reader-tag">#${t}</span>`).join('');

    const pageHtml = noteTemplate
      .replace(/{{NOTE_TITLE}}/g, note.title)
      .replace(/{{NOTE_EXCERPT}}/g, note.excerpt)
      .replace(/{{NOTE_DATE}}/g, note.date)
      .replace(/{{NOTE_READ_TIME}}/g, note.readTime)
      .replace(/{{NOTE_STAMP_HTML}}/g, stampHtml)
      .replace(/{{NOTE_SUBTITLE_HTML}}/g, subtitleHtml)
      .replace(/{{NOTE_TAGS_HTML}}/g, tagsHtml)
      .replace(/{{NOTE_BODY_HTML}}/g, note.htmlContent);

    fs.writeFileSync(path.join(DIST_DIR, 'notes', `${note.slug}.html`), pageHtml, 'utf8');
    fs.writeFileSync(path.join(ROOT_DIR, 'notes', `${note.slug}.html`), pageHtml, 'utf8');
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

  fs.writeFileSync(path.join(DIST_DIR, 'rss.xml'), rssXml, 'utf8');
  fs.writeFileSync(path.join(ROOT_DIR, 'rss.xml'), rssXml, 'utf8');

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

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), sitemapXml, 'utf8');

  console.log(`✅ Build completed successfully! Generated index.html, ${notes.length} standalone note pages, RSS & Sitemap.`);
}

build();

module.exports = { build };
