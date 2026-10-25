/**
 * GLOBAL OMNIBAR / COMMAND PALETTE (CMD+K / CTRL+K)
 * Instant spotlight search across essays, films, vinyl logs, and navigation actions.
 */

(function () {
  'use strict';

  let modalEl = null;
  let inputEl = null;
  let resultsEl = null;
  let selectedIndex = 0;
  let currentResults = [];

  function getNotesData() {
    if (window.__ALL_NOTES__ && Array.isArray(window.__ALL_NOTES__)) {
      return window.__ALL_NOTES__;
    }
    const scriptEl = document.getElementById('notesDataJson');
    if (scriptEl && scriptEl.textContent) {
      try {
        window.__ALL_NOTES__ = JSON.parse(scriptEl.textContent);
        return window.__ALL_NOTES__;
      } catch (e) {}
    }
    return [];
  }

  const QUICK_ACTIONS = [
    { type: 'action', title: 'Chapter I: The Bibliophile', desc: 'Infinite manuscript canvas and essays', action: () => switchSection('bibliophile'), badge: 'Realm' },
    { type: 'action', title: 'Chapter II: The Cinephile', desc: 'Live Letterboxd diary, 5★ films, and review commentary', action: () => switchSection('cinephile'), badge: 'Realm' },
    { type: 'action', title: 'Chapter III: The Audiophile', desc: 'Analogue vinyl logs, Spotify tracks, and acoustic essays', action: () => switchSection('audiophile'), badge: 'Realm' },
    { type: 'action', title: 'Chapter IV: Work & Craft', desc: 'Software systems, product design, and business leverage', action: () => switchSection('work'), badge: 'Realm' },
    { type: 'action', title: 'Open Mind Graph View', desc: 'Explore the 2D interactive knowledge graph of ideas', action: () => openGraphView(), badge: 'Visual' },
    { type: 'action', title: 'Toggle Synthesized Audio FX', desc: 'Enable/disable procedural page turns and clicks', action: () => window.AudioFX && window.AudioFX.toggleSound(), badge: 'Sound' },
    { type: 'action', title: 'Surprise Me (Random Note)', desc: 'Read a randomly selected essay or critique', action: () => openRandomNote(), badge: 'Discover' },
    { type: 'action', title: 'Visit Letterboxd Profile', desc: 'letterboxd.com/avd1234', action: () => window.open('https://letterboxd.com/avd1234/', '_blank'), badge: 'External' }
  ];

  function switchSection(sectionId) {
    closeOmnibar();
    if (window.switchPersonaSection) window.switchPersonaSection(sectionId);
  }

  function openGraphView() {
    closeOmnibar();
    if (window.openMindGraph) window.openMindGraph();
  }

  function openRandomNote() {
    closeOmnibar();
    const notes = getNotesData();
    if (notes.length > 0) {
      const rand = notes[Math.floor(Math.random() * notes.length)];
      if (window.ReaderModal) {
        window.ReaderModal.open(rand.slug);
      } else {
        window.location.href = `./notes/${rand.slug}.html`;
      }
    }
  }

  function initOmnibar() {
    modalEl = document.getElementById('omnibarModal');
    inputEl = document.getElementById('omnibarInput');
    resultsEl = document.getElementById('omnibarResults');

    if (!modalEl || !inputEl || !resultsEl) return;

    // Keyboard shortcut (Cmd+K / Ctrl+K)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleOmnibar();
      } else if (e.key === 'Escape' && modalEl.classList.contains('open')) {
        closeOmnibar();
      }
    });

    const triggerBtn = document.getElementById('btnOpenOmnibar');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', openOmnibar);
    }

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeOmnibar();
    });

    inputEl.addEventListener('input', handleSearch);

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
        updateActiveItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateActiveItem();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSelectedItem();
      }
    });
  }

  function openOmnibar() {
    if (!modalEl) return;
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
    inputEl.value = '';
    selectedIndex = 0;
    renderResults(QUICK_ACTIONS.slice(0, 7));
    setTimeout(() => inputEl.focus(), 60);
    if (window.AudioFX) window.AudioFX.playClick(900);
  }

  function closeOmnibar() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    inputEl.blur();
  }

  function toggleOmnibar() {
    if (modalEl && modalEl.classList.contains('open')) {
      closeOmnibar();
    } else {
      openOmnibar();
    }
  }

  function handleSearch() {
    const q = inputEl.value.trim().toLowerCase();
    selectedIndex = 0;

    if (!q) {
      renderResults(QUICK_ACTIONS.slice(0, 7));
      return;
    }

    const notes = getNotesData();
    const matchedActions = QUICK_ACTIONS.filter(a => 
      a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)
    );

    const matchedNotes = notes.filter(n => {
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchTag = n.tags && n.tags.some(t => t.toLowerCase().includes(q));
      const matchExcerpt = n.excerpt && n.excerpt.toLowerCase().includes(q);
      return matchTitle || matchTag || matchExcerpt;
    }).map(n => ({
      type: 'note',
      slug: n.slug,
      title: n.title,
      desc: n.excerpt || `${n.category} · ${n.readTime || 3} min read`,
      badge: n.category.toUpperCase(),
      action: () => {
        closeOmnibar();
        if (window.ReaderModal) {
          window.ReaderModal.open(n.slug);
        } else {
          window.location.href = `./notes/${n.slug}.html`;
        }
      }
    }));

    renderResults([...matchedActions, ...matchedNotes].slice(0, 10));
  }

  function renderResults(results) {
    currentResults = results;
    if (results.length === 0) {
      resultsEl.innerHTML = `
        <div class="omnibar-empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p>No matching notes or actions found.</p>
        </div>`;
      return;
    }

    resultsEl.innerHTML = results.map((item, idx) => `
      <div class="omnibar-item ${idx === selectedIndex ? 'active' : ''}" data-index="${idx}">
        <div class="omnibar-item-left">
          <span class="omnibar-item-badge">${item.badge}</span>
          <div>
            <div class="omnibar-item-title">${item.title}</div>
            <div class="omnibar-item-desc">${item.desc}</div>
          </div>
        </div>
        <kbd class="omnibar-item-enter">↵</kbd>
      </div>
    `).join('');

    // Attach click listeners
    resultsEl.querySelectorAll('.omnibar-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        selectedIndex = idx;
        executeSelectedItem();
      });
      el.addEventListener('mouseenter', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        selectedIndex = idx;
        updateActiveItem();
      });
    });
  }

  function updateActiveItem() {
    resultsEl.querySelectorAll('.omnibar-item').forEach((el, idx) => {
      if (idx === selectedIndex) {
        el.classList.add('active');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('active');
      }
    });
  }

  function executeSelectedItem() {
    if (currentResults[selectedIndex] && currentResults[selectedIndex].action) {
      if (window.AudioFX) window.AudioFX.playClick(1100);
      currentResults[selectedIndex].action();
    }
  }

  document.addEventListener('DOMContentLoaded', initOmnibar);

  window.Omnibar = {
    open: openOmnibar,
    close: closeOmnibar,
    toggle: toggleOmnibar
  };
})();
