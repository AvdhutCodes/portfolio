/**
 * AVADH KULKARNI — THE BIBLIOPHILE'S PORTFOLIO
 * Main Controller: Views, Filtering, Clock, Theme
 */

(function (window, document) {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const desk = new window.InfiniteDesk();
    const reader = new window.EssayReader();
    const cursor = new window.CustomCursor();

    // Clock
    initClock();

    // View Switching (Canvas vs Archive List)
    initViewSwitching();

    // Tag Filtering
    initTagFiltering(desk);

    // Theme Toggle
    initThemeToggle();

    // Ambient Book & Character Carousel
    initBookCarousel(reader);
  });

  function initClock() {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      clockEl.textContent = `${timeStr}`;
    }

    update();
    setInterval(update, 30000);
  }

  function initViewSwitching() {
    const btnCanvas = document.getElementById('viewCanvasBtn');
    const btnArchive = document.getElementById('viewArchiveBtn');
    const deskViewport = document.getElementById('deskViewport');
    const archiveView = document.getElementById('archiveView');
    const bottomBar = document.getElementById('bottomBar');
    const canvasHud = document.getElementById('canvasHud');
    const canvasHint = document.getElementById('canvasHint');

    if (!btnCanvas || !btnArchive || !deskViewport || !archiveView) return;

    btnCanvas.addEventListener('click', () => {
      btnCanvas.classList.add('active');
      btnArchive.classList.remove('active');
      archiveView.classList.remove('active');
      deskViewport.style.display = 'block';
      if (bottomBar) bottomBar.style.display = 'flex';
      if (canvasHud) canvasHud.style.display = 'flex';
      if (canvasHint) canvasHint.style.display = 'flex';
    });

    btnArchive.addEventListener('click', () => {
      btnArchive.classList.add('active');
      btnCanvas.classList.remove('active');
      archiveView.classList.add('active');
      deskViewport.style.display = 'none';
      if (canvasHud) canvasHud.style.display = 'none';
      if (canvasHint) canvasHint.style.display = 'none';
    });
  }

  function initTagFiltering(deskInstance) {
    const filterChips = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.manuscript-card');
    const archiveItems = document.querySelectorAll('.archive-item');

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const tag = chip.dataset.tag.toLowerCase();

        // Filter cards
        cards.forEach(card => {
          const cardTags = (card.dataset.tags || '').toLowerCase().split(',');
          if (tag === 'all' || cardTags.includes(tag)) {
            card.classList.remove('is-filtered-out');
          } else {
            card.classList.add('is-filtered-out');
          }
        });

        // Filter archive list
        archiveItems.forEach(item => {
          const itemTags = (item.dataset.tags || '').toLowerCase().split(',');
          if (tag === 'all' || itemTags.includes(tag)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });

        if (deskInstance) {
          deskInstance.updateCardLighting();
        }
      });
    });
  }

  function initThemeToggle() {
    const btnTheme = document.getElementById('btnThemeToggle');
    if (!btnTheme) return;

    btnTheme.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      btnTheme.title = next === 'light' ? 'Switch to Night Torch' : 'Switch to Day Paper';
    });
  }

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
    let autoTimer = null;

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    function prevSlide() {
      showSlide(currentIndex - 1);
    }

    function startAutoTimer() {
      stopAutoTimer();
      autoTimer = setInterval(() => {
        if (!wrap.classList.contains('is-spotlight')) {
          nextSlide();
        }
      }, 7500);
    }

    function stopAutoTimer() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    // Toggle spotlight
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        const isOpen = wrap.classList.contains('is-spotlight');
        if (isOpen) {
          wrap.classList.remove('is-spotlight');
          btnToggle.classList.remove('active');
        } else {
          wrap.classList.add('is-spotlight');
          btnToggle.classList.add('active');
        }
      });
    }

    // Close button
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        wrap.classList.remove('is-spotlight');
        if (btnToggle) btnToggle.classList.remove('active');
      });
    }

    // Prev / Next buttons
    if (btnPrev) btnPrev.addEventListener('click', prevSlide);
    if (btnNext) btnNext.addEventListener('click', nextSlide);

    // Dots
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => showSlide(idx));
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrap.classList.contains('is-spotlight')) {
        wrap.classList.remove('is-spotlight');
        if (btnToggle) btnToggle.classList.remove('active');
      }
    });

    // Read essay button inside slide
    document.querySelectorAll('.slide-read-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.slug;
        wrap.classList.remove('is-spotlight');
        if (btnToggle) btnToggle.classList.remove('active');
        if (readerInstance && slug) {
          readerInstance.open(slug);
        }
      });
    });

    startAutoTimer();
  }

})(window, document);

