/**
 * STARDUST & SPARKLE CURSOR ENGINE
 * Smooth magnetic cursor with trailing stardust micro-particles and click bursts.
 */

(function () {
  'use strict';

  // Only run on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('customCursor');
  const ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isHovered = false;

  // Stardust canvas
  const dustCanvas = document.createElement('canvas');
  dustCanvas.id = 'stardustCanvas';
  dustCanvas.className = 'stardust-canvas';
  document.body.appendChild(dustCanvas);
  const dustCtx = dustCanvas.getContext('2d');

  function resizeDust() {
    dustCanvas.width = window.innerWidth;
    dustCanvas.height = window.innerHeight;
  }
  resizeDust();
  window.addEventListener('resize', resizeDust);

  const particles = [];

  class StardustParticle {
    constructor(x, y, isBurst = false) {
      this.x = x;
      this.y = y;
      const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
      const speed = isBurst ? Math.random() * 3.5 + 1.2 : Math.random() * 0.8 + 0.2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (isBurst ? 0.5 : 0.2);
      this.life = 1.0;
      this.decay = isBurst ? Math.random() * 0.035 + 0.02 : Math.random() * 0.045 + 0.03;
      this.size = isBurst ? Math.random() * 2.5 + 1.2 : Math.random() * 1.6 + 0.8;
      // Stardust color: subtle diamond white or gold
      this.isGold = Math.random() > 0.7;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }
    draw() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      dustCtx.fillStyle = this.isGold
        ? (light ? `rgba(150, 110, 45, ${this.life * 0.7})` : `rgba(255, 215, 120, ${this.life * 0.8})`)
        : (light ? `rgba(60, 50, 35, ${this.life * 0.55})` : `rgba(255, 255, 255, ${this.life * 0.75})`);
      dustCtx.beginPath();
      dustCtx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      dustCtx.fill();
    }
  }

  let lastEmitTime = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

    // Spawn trailing stardust if moved sufficiently
    const now = performance.now();
    if (now - lastEmitTime > 32) {
      lastEmitTime = now;
      if (particles.length < 80) {
        particles.push(new StardustParticle(mouseX + (Math.random() - 0.5) * 6, mouseY + (Math.random() - 0.5) * 6));
      }
    }
  }, { passive: true });

  window.addEventListener('mousedown', (e) => {
    ring.classList.add('cursor-clicked');
    // Burst particles on click
    for (let i = 0; i < 14; i++) {
      particles.push(new StardustParticle(e.clientX, e.clientY, true));
    }
    if (window.AudioFX) {
      window.AudioFX.playClick(1000);
    }
  });

  window.addEventListener('mouseup', () => {
    ring.classList.remove('cursor-clicked');
  });

  // Track hoverables for magnetic cursor
  const hoverables = 'a, button, input, [role="button"], .manuscript-card, .film-card, .audio-card, .book-3d-tome, .interactive';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) {
      ring.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) {
      ring.classList.remove('cursor-hover');
    }
  });

  // Animation Loop
  function loop() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

    // Render particles
    dustCtx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

})();
