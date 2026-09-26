/**
 * AVADH KULKARNI — OBSIDIAN ESSAY READER
 * Book-Grade In-Page Drawer, Reading Progress, Wikilinks & Deep Link Routing
 */

(function (window, document) {
  'use strict';

  class EssayReader {
    constructor() {
      this.modal = document.getElementById('readerModal');
      this.container = document.getElementById('readerContainer');
      this.progressBar = document.getElementById('readerProgressBar');
      this.btnClose = document.getElementById('btnReaderClose');
      this.btnPrev = document.getElementById('btnReaderPrev');
      this.btnNext = document.getElementById('btnReaderNext');
      
      this.currentSlug = null;
      this.notesData = [];

      this.init();
    }

    init() {
      // Load notes data from embedded JSON script tag
      const dataScript = document.getElementById('notesDataJson');
      if (dataScript) {
        try {
          this.notesData = JSON.parse(dataScript.textContent);
        } catch (e) {
          console.error('Failed to parse notesDataJson', e);
        }
      }

      this.bindEvents();
      this.checkUrlHash();
    }

    bindEvents() {
      // Close button
      if (this.btnClose) {
        this.btnClose.addEventListener('click', () => this.close());
      }

      // Close on backdrop click
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) {
            this.close();
          }
        });
      }

      // Card clicks on desk
      document.addEventListener('click', (e) => {
        const card = e.target.closest('.manuscript-card, .archive-item, .obsidian-link');
        if (card && card.dataset.slug) {
          e.preventDefault();
          this.open(card.dataset.slug);
        }
      });

      // Previous / Next buttons
      if (this.btnPrev) {
        this.btnPrev.addEventListener('click', () => this.navigateStep(-1));
      }
      if (this.btnNext) {
        this.btnNext.addEventListener('click', () => this.navigateStep(1));
      }

      // Keyboard navigation
      window.addEventListener('keydown', (e) => {
        if (!this.isOpen()) return;

        if (e.key === 'Escape') {
          this.close();
        } else if (e.key === 'ArrowLeft') {
          this.navigateStep(-1);
        } else if (e.key === 'ArrowRight') {
          this.navigateStep(1);
        }
      });

      // Scroll progress tracking
      if (this.modal) {
        this.modal.addEventListener('scroll', () => {
          this.updateProgress();
        });
      }

      // Hash change routing
      window.addEventListener('hashchange', () => {
        this.checkUrlHash();
      });
    }

    checkUrlHash() {
      const hash = window.location.hash;
      const match = hash.match(/#\/?notes?\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        this.open(match[1], false);
      } else if (!hash && this.isOpen()) {
        this.close(false);
      }
    }

    isOpen() {
      return this.modal && this.modal.classList.contains('is-open');
    }

    open(slug, updateHash = true) {
      const note = this.notesData.find(n => n.slug === slug);
      if (!note) {
        // Fallback to searching by filename
        console.warn('Note not found for slug:', slug);
        return;
      }

      this.currentSlug = slug;

      // Populate reader template
      const headerEl = document.getElementById('readerHeader');
      const bodyEl = document.getElementById('readerBody');
      const metaSnippetEl = document.getElementById('readerMetaSnippet');

      if (metaSnippetEl) {
        metaSnippetEl.textContent = `${note.readTime} min read · Rev ${note.rev || 1}`;
      }

      if (headerEl) {
        headerEl.innerHTML = `
          ${note.stamp ? `<span class="reader-stamp-tag">${note.stamp}</span>` : ''}
          <h1 class="reader-title">${note.title}</h1>
          ${note.subtitle ? `<p class="reader-subtitle">${note.subtitle}</p>` : ''}
          <div class="reader-details">
            <span>By ${note.author || 'Avadh Kulkarni'}</span>
            <span>·</span>
            <span>${note.date}</span>
            <span>·</span>
            <span>${note.readTime} min read</span>
            <div class="reader-tags">
              ${(note.tags || []).map(t => `<span class="reader-tag">#${t}</span>`).join('')}
            </div>
          </div>
        `;
      }

      if (bodyEl) {
        bodyEl.innerHTML = note.htmlContent || note.excerpt;
      }

      // Reset scroll position
      this.modal.scrollTop = 0;
      if (this.progressBar) this.progressBar.style.width = '0%';

      this.modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      if (updateHash) {
        window.history.pushState(null, '', `#/notes/${slug}`);
      }
    }

    close(updateHash = true) {
      if (!this.isOpen()) return;

      this.modal.classList.remove('is-open');
      document.body.style.overflow = '';
      this.currentSlug = null;

      if (updateHash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }

    navigateStep(direction) {
      if (!this.currentSlug || !this.notesData.length) return;
      const currentIndex = this.notesData.findIndex(n => n.slug === this.currentSlug);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex + direction;
      if (nextIndex < 0) nextIndex = this.notesData.length - 1;
      if (nextIndex >= this.notesData.length) nextIndex = 0;

      const nextNote = this.notesData[nextIndex];
      if (nextNote) {
        this.open(nextNote.slug, true);
      }
    }

    updateProgress() {
      if (!this.modal || !this.progressBar) return;
      const scrollY = this.modal.scrollTop;
      const totalScroll = this.modal.scrollHeight - this.modal.clientHeight;
      const percentage = totalScroll > 0 ? (scrollY / totalScroll) * 100 : 0;
      this.progressBar.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
    }
  }

  window.EssayReader = EssayReader;
})(window, document);
