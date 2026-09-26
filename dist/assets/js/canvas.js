/**
 * AVADH KULKARNI — INFINITE DESK CANVAS ENGINE
 * Smooth 2D Pan, Zoom Toward Pointer, Touch Inertia & Proximity Lighting
 */

(function (window, document) {
  'use strict';

  class InfiniteDesk {
    constructor() {
      this.viewport = document.getElementById('deskViewport');
      this.stage = document.getElementById('deskStage');
      this.cards = Array.from(document.querySelectorAll('.manuscript-card'));
      
      if (!this.viewport || !this.stage) return;

      // Transform state
      this.panX = 0;
      this.panY = 0;
      this.scale = 1;
      this.minScale = 0.55;
      this.maxScale = 1.45;

      // Dragging state
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.lastX = 0;
      this.lastY = 0;
      this.velocityX = 0;
      this.velocityY = 0;
      this.dragDistance = 0;
      this.rafInertia = null;

      // Touch pinch
      this.touchDistance = 0;

      // Cursor torch coordinates in screen space
      this.torchX = window.innerWidth / 2;
      this.torchY = window.innerHeight / 2;

      this.init();
    }

    init() {
      this.bindEvents();
      this.updateTransform();
      this.updateCardLighting();
      
      // Window resize
      window.addEventListener('resize', () => {
        this.updateCardLighting();
      });
    }

    bindEvents() {
      const v = this.viewport;

      // Pointer / Mouse Dragging
      v.addEventListener('pointerdown', this.onPointerDown.bind(this));
      window.addEventListener('pointermove', this.onPointerMove.bind(this));
      window.addEventListener('pointerup', this.onPointerUp.bind(this));
      window.addEventListener('pointercancel', this.onPointerUp.bind(this));

      // Mouse Wheel Zoom
      v.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

      // HUD buttons
      const btnReset = document.getElementById('btnResetCanvas');
      const btnZoomIn = document.getElementById('btnZoomIn');
      const btnZoomOut = document.getElementById('btnZoomOut');

      if (btnReset) btnReset.addEventListener('click', () => this.resetView());
      if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.zoomBy(0.2));
      if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.zoomBy(-0.2));

      // Prevent click on cards if user dragged canvas
      this.cards.forEach(card => {
        card.addEventListener('click', (e) => {
          if (this.dragDistance > 6) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      });
    }

    onPointerDown(e) {
      // Don't drag if clicking buttons, links or reader
      if (e.target.closest('button') || e.target.closest('.site-header') || e.target.closest('.bottom-bar')) {
        return;
      }

      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.velocityX = 0;
      this.velocityY = 0;
      this.dragDistance = 0;

      if (this.rafInertia) {
        cancelAnimationFrame(this.rafInertia);
        this.rafInertia = null;
      }

      this.viewport.classList.add('is-dragging');
      document.body.classList.add('is-dragging-canvas');
    }

    onPointerMove(e) {
      // Always track torch coordinate
      this.torchX = e.clientX;
      this.torchY = e.clientY;
      document.documentElement.style.setProperty('--torch-x', `${this.torchX}px`);
      document.documentElement.style.setProperty('--torch-y', `${this.torchY}px`);

      if (!this.isDragging) {
        this.updateCardLighting();
        return;
      }

      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;

      this.panX += dx;
      this.panY += dy;

      this.velocityX = dx * 0.8;
      this.velocityY = dy * 0.8;

      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.dragDistance += Math.hypot(dx, dy);

      this.updateTransform();
      this.updateCardLighting();
    }

    onPointerUp(e) {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.viewport.classList.remove('is-dragging');
      document.body.classList.remove('is-dragging-canvas');

      // Apply inertia momentum
      if (Math.abs(this.velocityX) > 1 || Math.abs(this.velocityY) > 1) {
        this.applyInertia();
      }
    }

    applyInertia() {
      const step = () => {
        this.panX += this.velocityX;
        this.panY += this.velocityY;
        this.velocityX *= 0.92;
        this.velocityY *= 0.92;

        this.updateTransform();
        this.updateCardLighting();

        if (Math.abs(this.velocityX) > 0.3 || Math.abs(this.velocityY) > 0.3) {
          this.rafInertia = requestAnimationFrame(step);
        } else {
          this.rafInertia = null;
        }
      };
      this.rafInertia = requestAnimationFrame(step);
    }

    onWheel(e) {
      e.preventDefault();

      // Zoom toward cursor position
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newScale = Math.min(Math.max(this.scale * zoomFactor, this.minScale), this.maxScale);

      if (newScale === this.scale) return;

      const mouseX = e.clientX - window.innerWidth / 2;
      const mouseY = e.clientY - window.innerHeight / 2;

      // Adjust pan so the point under cursor remains invariant
      this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
      this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
      this.scale = newScale;

      this.updateTransform();
      this.updateCardLighting();
    }

    zoomBy(delta) {
      const targetScale = Math.min(Math.max(this.scale + delta, this.minScale), this.maxScale);
      this.scale = targetScale;
      this.updateTransform();
      this.updateCardLighting();
    }

    resetView() {
      this.panX = 0;
      this.panY = 0;
      this.scale = 1;
      this.updateTransform();
      this.updateCardLighting();
    }

    updateTransform() {
      this.stage.style.transform = `translate3d(${this.panX}px, ${this.panY}px, 0) scale(${this.scale})`;
    }

    updateCardLighting() {
      // Calculate proximity between the torch light and each manuscript card
      const torchX = this.torchX;
      const torchY = this.torchY;
      const lightRadius = 340; // Pixels in screen space

      this.cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const distance = Math.hypot(torchX - cardCenterX, torchY - cardCenterY);

        if (distance < lightRadius) {
          card.classList.add('is-lit');
        } else {
          card.classList.remove('is-lit');
        }
      });
    }
  }

  // Export to window
  window.InfiniteDesk = InfiniteDesk;
})(window, document);
