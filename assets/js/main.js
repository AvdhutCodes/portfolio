/**
 * AVDHUT KULKARNI — THE MULTI-POTENTIALITE PORTFOLIO
 * Main Controller: 3D Book Codex, 4 Personas, Theme Shifts, Archive Drawer, Audio & Live Signals
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

    // 3. Initialize Archive Drawer
    initArchiveDrawer();

    // 4. Initialize Tag Filtering on Bibliophile Desk
    initTagFiltering(desk);

    // 5. Initialize Theme Toggle (Dark / Light)
    initThemeToggle();

    // 6. Initialize Ambient Book & Character Carousel
    initBookCarousel(reader);

    // 7. Initialize Direct Click Handlers for Films, Audio, and Work
    initCardReaders(reader);

    // 8. Start Local Time Ticker
    startTimeTicker();
  });

  // Persona Switching (Landing Codex, Bibliophile, Cinephile, Audiophile, Work)
  function initPersonaSwitching() {
    const personaButtons = document.querySelectorAll('.persona-nav-btn');
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
      // Update nav buttons
      personaButtons.forEach(b => {
        if (b.dataset.section === targetSection) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Update active section
      sectionViews.forEach(view => {
        if (view.id === `section-${targetSection}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
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

    personaButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        window.switchPersonaSection(btn.dataset.section);
      });
    });
  }

  // Interactive 3D Opening Book
  function init3DBook() {
    const tome = document.getElementById('main3DTome');
    const chapterLinks = document.querySelectorAll('.chapter-row-link');

    if (tome) {
      tome.addEventListener('click', (e) => {
        if (e.target.closest('.chapter-row-link')) return;
        tome.classList.toggle('is-open');
        const wrap = tome.closest('.landing-book-wrapper');
        if (wrap) wrap.classList.toggle('is-open', tome.classList.contains('is-open'));
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
        } else if (link.dataset.drawer === 'archive') {
          const btn = document.getElementById('btnToggleArchive');
          if (btn) btn.click();
        }
      });
    });
  }

  // Separate Archive Drawer
  function initArchiveDrawer() {
    const drawer = document.getElementById('archiveDrawer');
    const btnToggle = document.getElementById('btnToggleArchive');
    const btnClose = document.getElementById('btnCloseArchive');

    if (!drawer || !btnToggle) return;

    btnToggle.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('active');
      if (isOpen) {
        drawer.classList.remove('active');
        btnToggle.classList.remove('active');
      } else {
        drawer.classList.add('active');
        btnToggle.classList.add('active');
      }
      if (window.AudioFX) window.AudioFX.playClick(900);
    });

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        drawer.classList.remove('active');
        btnToggle.classList.remove('active');
        if (window.AudioFX) window.AudioFX.playClick(750);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('active')) {
        drawer.classList.remove('active');
        btnToggle.classList.remove('active');
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
    const initial = stored === 'light' || stored === 'dark' ? stored : 'dark';
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
      if (audioBtn && audioBtn.dataset.slug) {
        e.preventDefault();
        if (window.AudioFX) window.AudioFX.playVinylNeedle();
        readerInstance.open(audioBtn.dataset.slug);
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

  // Ambient Favorite Books & Heroes Carousel
  function initBookCarousel(readerInstance) {
    const wrap = document.getElementById('ambientCarousel');
    const btnToggle = document.getElementById('btnToggleBooksCarousel');
    const btnClose = document.getElementById('btnCloseCarousel');
    const btnPrev = document.getElementById('btnPrevSlide');
    const btnNext = document.getElementById('btnNextSlide');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.carousel-dot'));

    if (!wrap || !slides.length) return;

    let currentIndex = 0;

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
        dot.setAttribute('aria-pressed', String(i === currentIndex));
      });

      if (window.AudioFX) window.AudioFX.playPageTurn();
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    function prevSlide() {
      showSlide(currentIndex - 1);
    }

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        const isOpen = wrap.classList.contains('is-spotlight');
        if (isOpen) {
          wrap.classList.remove('is-spotlight');
          wrap.setAttribute('aria-hidden', 'true');
          btnToggle.classList.remove('active');
        } else {
          wrap.classList.add('is-spotlight');
          wrap.setAttribute('aria-hidden', 'false');
          btnToggle.classList.add('active');
        }
        if (window.AudioFX) window.AudioFX.playPageTurn();
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        wrap.classList.remove('is-spotlight');
        wrap.setAttribute('aria-hidden', 'true');
        if (btnToggle) btnToggle.classList.remove('active');
        if (window.AudioFX) window.AudioFX.playClick(750);
      });
    }

    if (btnPrev) btnPrev.addEventListener('click', prevSlide);
    if (btnNext) btnNext.addEventListener('click', nextSlide);

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => showSlide(idx));
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrap.classList.contains('is-spotlight')) {
        wrap.classList.remove('is-spotlight');
        wrap.setAttribute('aria-hidden', 'true');
        if (btnToggle) btnToggle.classList.remove('active');
      }
    });

    document.querySelectorAll('.slide-read-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.slug;
        wrap.classList.remove('is-spotlight');
        wrap.setAttribute('aria-hidden', 'true');
        if (btnToggle) btnToggle.classList.remove('active');
        if (readerInstance && slug) {
          readerInstance.open(slug);
        }
      });
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
