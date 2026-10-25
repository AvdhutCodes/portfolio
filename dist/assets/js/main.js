/**
 * AVDHUT KULKARNI — THE MULTI-POTENTIALITE PORTFOLIO
 * Main Controller: 3D Book Codex, 4 Personas, Theme Shifts, Audio & Live Signals
 */

(function (window, document) {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize components
    const desk = new window.InfiniteDesk();
    const reader = new window.EssayReader();

    // Expose the live reader instance for Omnibar + Mind Graph callers
    window.ReaderModal = reader;

    // 2. Initialize Persona Sections Switcher & 3D Book
    initPersonaSwitching();
    init3DBook();
    initSiteFooter();
    initBrandReset();

    // 3. Initialize Tag Filtering on Bibliophile Desk
    initTagFiltering(desk);

    // 4. Initialize Theme Toggle (Dark / Light)
    initThemeToggle();

    // 5. Initialize Direct Click Handlers for Films, Audio, and Work
    initCardReaders(reader);

    // 8. Start Local Time Ticker
    startTimeTicker();
  });

  // Persona Switching (Landing Codex, Bibliophile, Cinephile, Audiophile, Work)
  // Single-site navigation: footer buttons are the only section nav.
  function initPersonaSwitching() {
    const sectionViews = document.querySelectorAll('.persona-section-view');
    const personaLabel = document.getElementById('personaLabel');

    const personaLabelsMap = {
      'landing': 'Codex',
      'bibliophile': 'Bibliophile',
      'cinephile': 'Cinephile',
      'audiophile': 'Audiophile',
      'work': 'Software Craftsman'
    };

    window.switchPersonaSection = function (targetSection) {
      // Update footer nav buttons
      document.querySelectorAll('.site-footer-nav button').forEach(b => {
        b.classList.toggle('active', b.dataset.section === targetSection);
      });

      // Update active section
      sectionViews.forEach(view => {
        view.classList.toggle('active', view.id === `section-${targetSection}`);
      });

      // Update persona label under Avdhut Kulkarni
      if (personaLabel && personaLabelsMap[targetSection]) {
        personaLabel.textContent = personaLabelsMap[targetSection];
      }

      // Apply theme mood to body
      document.body.classList.remove('persona-landing', 'persona-bibliophile', 'persona-cinephile', 'persona-audiophile', 'persona-work');
      document.body.classList.add(`persona-${targetSection}`);

      if (window.AudioFX) {
        window.AudioFX.playClick(850);
      }
    };
  }

  // Interactive 3D Opening Book
  function init3DBook() {
    const tome = document.getElementById('main3DTome');
    const chapterLinks = document.querySelectorAll('.chapter-row-link');

    if (tome) {
      tome.addEventListener('click', (e) => {
        if (e.target.closest('.chapter-row-link')) return;
        tome.classList.toggle('is-open');
        const isOpen = tome.classList.contains('is-open');
        const wrap = tome.closest('.landing-book-wrapper');
        if (wrap) wrap.classList.toggle('is-open', isOpen);
        // Swap the hint so it never reads stale ("open" while already open)
        const hint = document.querySelector('.book-hint-desktop');
        if (hint) hint.textContent = isOpen ? 'Click the book to close the codex' : 'Click the book to open the codex';
        if (window.AudioFX) {
          window.AudioFX.playPageTurn();
        }
      });
    }

    chapterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        if (window.AudioFX) {
          window.AudioFX.playPageTurn();
        }
        if (target && window.switchPersonaSection) {
          window.switchPersonaSection(target);
        }
      });
    });
  }

  function initSiteFooter() {
    document.querySelectorAll('.site-footer-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.switchPersonaSection) window.switchPersonaSection(btn.dataset.section);
      });
    });
  }

  // Brand corner resets the whole site: landing section, closed book,
  // closed modals, top of page. Keyboard accessible.
  function initBrandReset() {
    const brand = document.querySelector('.brand-wrap');
    if (!brand) return;
    brand.setAttribute('role', 'button');
    brand.setAttribute('tabindex', '0');
    brand.setAttribute('title', 'Back to Codex (reset view)');

    const reset = () => {
      if (window.switchPersonaSection) window.switchPersonaSection('landing');
      if (window.ReaderModal) window.ReaderModal.close();
      if (window.Omnibar) window.Omnibar.close();
      if (window.closeMindGraph) window.closeMindGraph();
      const tome = document.getElementById('main3DTome');
      if (tome) {
        tome.classList.remove('is-open');
        const wrap = tome.closest('.landing-book-wrapper');
        if (wrap) wrap.classList.remove('is-open');
        const hint = document.querySelector('.book-hint-desktop');
        if (hint) hint.textContent = 'Click the book to open the codex';
      }
      window.scrollTo(0, 0);
    };

    brand.addEventListener('click', reset);
    brand.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        reset();
      }
    });
  }

  // Bibliophile Tag Filtering
  function initTagFiltering(deskInstance) {
    const filterChips = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.manuscript-card');

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const tag = chip.dataset.tag.toLowerCase();

        cards.forEach(card => {
          const cardTags = (card.dataset.tags || '').toLowerCase().split(',');
          if (tag === 'all' || cardTags.includes(tag)) {
            card.classList.remove('is-filtered-out');
          } else {
            card.classList.add('is-filtered-out');
          }
        });

        if (deskInstance) {
          deskInstance.updateCardLighting();
        }
        if (window.AudioFX) window.AudioFX.playClick(950);
      });
    });
  }

  // Theme Toggle: Respect stored preference, default to nocturnal dark mode
  function initThemeToggle() {
    const btnTheme = document.getElementById('btnThemeToggle');
    if (!btnTheme) return;

    const ICON_MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>';
    const ICON_SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>';

    function paintThemeIcon(theme) {
      btnTheme.innerHTML = theme === 'dark' ? ICON_MOON : ICON_SUN;
      btnTheme.setAttribute('title', theme === 'dark' ? 'Switch to Light (Paper)' : 'Switch to Dark (Nocturnal)');
    }

    const stored = localStorage.getItem('avdhut-theme');
    const attrTheme = document.documentElement.getAttribute('data-theme');
    const initial = stored === 'light' || stored === 'dark' ? stored : (attrTheme === 'light' ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', initial);
    localStorage.setItem('avdhut-theme', initial);
    paintThemeIcon(initial);

    btnTheme.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('avdhut-theme', next);
      paintThemeIcon(next);
      if (window.AudioFX) window.AudioFX.playClick(1050);
    });
  }

  // Card Clicks on Film, Audio, and Work Sections
  function initCardReaders(readerInstance) {
    if (!readerInstance) return;

    document.addEventListener('click', (e) => {
      const filmBtn = e.target.closest('.film-review-btn');
      const filmCard = e.target.closest('.film-card');
      if (filmBtn && filmBtn.dataset.slug) {
        e.preventDefault();
        readerInstance.open(filmBtn.dataset.slug);
      } else if (filmCard && filmCard.dataset.slug && !e.target.closest('a')) {
        e.preventDefault();
        readerInstance.open(filmCard.dataset.slug);
      }

      const audioBtn = e.target.closest('.audio-notes-btn');
      const audioCard = e.target.closest('.audio-card');
      if (audioBtn && audioBtn.dataset.slug) {
        e.preventDefault();
        if (window.AudioFX) window.AudioFX.playVinylNeedle();
        readerInstance.open(audioBtn.dataset.slug);
      } else if (audioCard && audioCard.dataset.slug && !e.target.closest('a')) {
        e.preventDefault();
        if (window.AudioFX) window.AudioFX.playVinylNeedle();
        readerInstance.open(audioCard.dataset.slug);
      }

      const caseBtn = e.target.closest('.case-read-btn');
      const caseCard = e.target.closest('.case-study-card');
      if (caseBtn && caseBtn.dataset.slug) {
        e.preventDefault();
        readerInstance.open(caseBtn.dataset.slug);
      } else if (caseCard && caseCard.dataset.slug) {
        e.preventDefault();
        readerInstance.open(caseCard.dataset.slug);
      }
    });
  }

  // Local Time Ticker
  function startTimeTicker() {
    const timeEl = document.getElementById('liveLocalTime');
    if (!timeEl) return;

    function updateTime() {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        timeEl.textContent = `${timeStr} IST`;
      } catch (e) {
        timeEl.textContent = 'Active';
      }
    }
    updateTime();
    setInterval(updateTime, 10000);
  }

})(window, document);
