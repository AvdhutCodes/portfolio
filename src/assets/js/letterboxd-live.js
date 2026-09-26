/**
 * LETTERBOXD LIVE CLIENT-SIDE HYDRATION ENGINE
 * Syncs Avdhut Kulkarni's Letterboxd reviews (@avd1234) in real-time on GitHub Pages.
 */

(function () {
  'use strict';

  const RSS_FEED = 'https://letterboxd.com/avd1234/rss/';
  const PROXY_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED)}`;

  async function loadLetterboxdData() {
    // 1. First, check if pre-bundled static data exists
    // (../ fallback covers standalone /notes/*.html pages)
    let localData = null;
    for (const dataUrl of ['./data/letterboxd.json', '../data/letterboxd.json']) {
      try {
        const res = await fetch(dataUrl);
        if (res.ok) {
          localData = await res.json();
          renderLetterboxdUI(localData);
          break;
        }
      } catch (e) {
        // Try next candidate path
      }
    }

    // 2. Fetch live data asynchronously to detect brand-new watches
    try {
      const res = await fetch(PROXY_URL);
      if (!res.ok) throw new Error('Proxy returned ' + res.status);
      const data = await res.json();
      if (data && data.items && data.items.length > 0) {
        const liveParsed = parseRss2Json(data.items);
        // Live feed only carries the 10 latest diary entries: refresh the
        // reel + now-strip, but keep the SSG Top Four (curated from the
        // full 50-entry diary at build time) so it never downgrades.
        renderLetterboxdUI(liveParsed, { skipTopFour: true });
        updateLiveIndicator(true);
      }
    } catch (err) {
      console.log('Live RSS fetch fallback to bundled data:', err.message);
      if (localData) updateLiveIndicator(false);
    }
  }

  function parseRss2Json(items) {
    const reviews = [];
    items.forEach(item => {
      // Title format: "Film Title, Year - ★★★★"
      const titleMatch = item.title.match(/^(.*?)(?:,\s*(\d{4}))?(?:\s*-\s*([★½]+))?$/);
      const title = titleMatch ? titleMatch[1].trim() : item.title;
      const year = titleMatch && titleMatch[2] ? titleMatch[2] : '';
      const stars = titleMatch && titleMatch[3] ? titleMatch[3] : '';

      // Extract poster from HTML description
      const posterMatch = item.description ? item.description.match(/src="([^"]+)"/) : null;
      const poster = posterMatch ? posterMatch[1] : null;

      // Extract review snippet
      let review = '';
      if (item.description) {
        review = item.description
          .replace(/<p><img[^>]*><\/p>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
      }

      reviews.push({
        title,
        year,
        stars: stars || 'Unrated',
        rating: calculateNumericRating(stars),
        poster,
        link: item.link || 'https://letterboxd.com/avd1234/',
        review: review.length > 250 ? review.substring(0, 247) + '...' : review,
        watchedDate: parseWatchedDate(item.pubDate)
      });
    });

    const fiveStars = reviews.filter(r => r.rating === 5 && r.poster);
    const fourHalf = reviews.filter(r => r.rating === 4.5 && r.poster);
    const topFour = [...fiveStars, ...fourHalf].slice(0, 4);

    return {
      username: 'avd1234',
      profileUrl: 'https://letterboxd.com/avd1234/',
      topFour,
      recentWatches: reviews.slice(0, 16)
    };
  }

  function calculateNumericRating(stars) {
    if (!stars) return 0;
    const full = (stars.match(/★/g) || []).length;
    const half = stars.includes('½') ? 0.5 : 0;
    return full + half;
  }

  // Normalize rss2json pubDate ("2026-09-26 12:00:00") to YYYY-MM-DD
  function parseWatchedDate(pubDate) {
    if (!pubDate) return '';
    const iso = pubDate.match(/(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];
    const parsed = new Date(pubDate);
    if (isNaN(parsed.getTime())) return '';
    // Local date parts (toISOString would shift the day near midnight UTC)
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${parsed.getFullYear()}-${m}-${d}`;
  }

  function updateLiveIndicator(isLive) {
    const dot = document.getElementById('letterboxdStatusDot');
    const label = document.getElementById('letterboxdStatusLabel');
    if (dot) {
      dot.className = isLive ? 'status-dot live-pulse' : 'status-dot cached';
    }
    if (label) {
      label.textContent = isLive ? 'Live Sync Active' : 'Synced from Ledger';
    }
  }

  function renderLetterboxdUI(data, opts = {}) {
    if (!data) return;

    // 1. Update "Now" signal bar on landing page
    const nowFilmEl = document.getElementById('nowWatchingFilm');
    if (nowFilmEl && data.recentWatches && data.recentWatches.length > 0) {
      const latest = data.recentWatches[0];
      nowFilmEl.innerHTML = `
        <span class="now-chip-tag">Recently Logged</span>
        <a href="${latest.link}" target="_blank" rel="noopener" class="now-film-link">
          <strong>${latest.title}</strong> (${latest.year}) · <span class="letterboxd-stars">${latest.stars}</span>
        </a>
      `;
    }

    // 2. Render Top Four Showcase (skipped for thin live payloads)
    const topFourGrid = document.getElementById('letterboxdTopFourGrid');
    if (topFourGrid && data.topFour && !opts.skipTopFour) {
      topFourGrid.innerHTML = data.topFour.map((film, idx) => `
        <a href="${film.link}" target="_blank" rel="noopener" class="top-four-card" title="${film.title} (${film.year})">
          <div class="top-four-badge">#${idx + 1} FAVOURITE</div>
          <div class="top-four-poster-wrap">
            <img src="${film.poster || './assets/images/poster-oppenheimer.jpg'}" alt="${film.title}" class="top-four-img" loading="lazy" />
            <div class="top-four-stars">${film.stars}</div>
          </div>
          <div class="top-four-info">
            <h4 class="top-four-title">${film.title}</h4>
            <span class="top-four-year">${film.year}</span>
            ${film.review ? `<p class="top-four-review">“${film.review}”</p>` : ''}
          </div>
        </a>
      `).join('');
    }

    // 3. Render Recent Watches Grid / Reel
    const recentReel = document.getElementById('letterboxdRecentReel');
    if (recentReel && data.recentWatches) {
      recentReel.innerHTML = data.recentWatches.map((film, idx) => `
        <article class="letterboxd-film-card${idx % 5 === 4 ? ' collage-feature' : ''}">
          <div class="lb-poster-box">
            <img src="${film.poster || './assets/images/poster-oppenheimer.jpg'}" alt="${film.title}" class="lb-poster-img" loading="lazy" />
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
      `).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', loadLetterboxdData);

  window.LetterboxdLive = {
    reload: loadLetterboxdData
  };
})();
