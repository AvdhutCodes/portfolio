/**
 * AVADH KULKARNI — ZERO-DEPENDENCY DEV SERVER
 * Live Obsidian File Watcher & Local Development Server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { build } = require('./build.js');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// File watcher for Obsidian notes & templates
let debounceTimer = null;
function triggerRebuild(event, filename) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`\n📝 Change detected (${event}: ${filename}). Rebuilding static site...`);
    try {
      build();
      console.log('✨ Live reload updated.\n');
    } catch (e) {
      console.error('❌ Build error during watch:', e);
    }
  }, 150);
}

// Watch directories
const watchDirs = [
  path.join(__dirname, 'content'),
  path.join(__dirname, 'src', 'templates'),
  path.join(__dirname, 'src', 'assets')
];

watchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.watch(dir, { recursive: true }, triggerRebuild);
  }
});

server.listen(PORT, () => {
  console.log(`
============================================================
  🏛️  AVDHUT KULKARNI — MULTI-POTENTIALITE PORTFOLIO
============================================================
  Local Server:  http://localhost:${PORT}
  Watching:      ./content/**/* (Obsidian Vault: Books, Essays, Films, Audio, Work, Archive)
  
  Write or paste notes in Obsidian and they will
  automatically update your live portfolio!
============================================================
  `);
});
