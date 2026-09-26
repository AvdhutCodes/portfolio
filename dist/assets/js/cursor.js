/**
 * AVADH KULKARNI — BESPOKE MINIMALIST CURSOR
 * Smooth Lerp Follower, Magnetic Card Expansion
 */

(function (window, document) {
  'use strict';

  class CustomCursor {
    constructor() {
      // Don't run on touch devices
      if (window.matchMedia('(pointer: coarse)').matches) return;

      this.cursor = document.getElementById('customCursor');
      this.ring = document.getElementById('cursorRing');
      
      if (!this.cursor || !this.ring) return;

      this.mouseX = window.innerWidth / 2;
      this.mouseY = window.innerHeight / 2;
      this.ringX = this.mouseX;
      this.ringY = this.mouseY;

      this.init();
    }

    init() {
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        this.cursor.classList.add('is-active');
        this.cursor.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0)`;
      });

      // Card hover detection
      document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('.manuscript-card, .archive-item, .hud-btn, .filter-chip, .view-btn');
        if (target) {
          document.body.classList.add('is-hovering-card');
        } else {
          document.body.classList.remove('is-hovering-card');
        }
      });

      // Start animation loop for smooth trailing ring
      this.render();
    }

    render() {
      // Lerp ring towards mouse position
      this.ringX += (this.mouseX - this.ringX) * 0.16;
      this.ringY += (this.mouseY - this.ringY) * 0.16;

      this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(this.render.bind(this));
    }
  }

  window.CustomCursor = CustomCursor;
})(window, document);
