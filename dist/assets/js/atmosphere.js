/**
 * ATMOSPHERE & PARTICLES ENGINE
 * - Dynamic cursor-tracking focal spotlight with smooth lerp physics
 * - Interactive twinkling star constellation canvas with proximity lines
 * - Floating glowing floral / geometric doodles based on current section
 * - 35mm film grain overlay
 */

(function () {
  'use strict';

  // --- 1. DYNAMIC FOCAL SPOTLIGHT ---
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;

  const spotlightEl = document.createElement('div');
  spotlightEl.className = 'focal-spotlight-layer';
  document.body.appendChild(spotlightEl);

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function updateSpotlight() {
    curX += (mouseX - curX) * 0.08;
    curY += (mouseY - curY) * 0.08;
    spotlightEl.style.setProperty('--spot-x', `${curX}px`);
    spotlightEl.style.setProperty('--spot-y', `${curY}px`);
    requestAnimationFrame(updateSpotlight);
  }
  requestAnimationFrame(updateSpotlight);

  // --- 2. 35MM PROCEDURAL FILM GRAIN OVERLAY ---
  if (!document.getElementById('filmGrainOverlay')) {
    const grainEl = document.createElement('div');
    grainEl.id = 'filmGrainOverlay';
    grainEl.className = 'film-grain-overlay';
    document.body.appendChild(grainEl);
  }

  // --- 3. CONSTELLATION & GLITTER CANVAS ---
  const canvas = document.createElement('canvas');
  canvas.id = 'atmosphereCanvas';
  canvas.className = 'atmosphere-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  const STAR_COUNT = Math.min(85, Math.floor((width * height) / 14000));
  let stars = [];

  class Star {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5 + 0.5;
      this.baseAlpha = Math.random() * 0.5 + 0.2;
      this.alpha = this.baseAlpha;
      this.twinkleSpeed = Math.random() * 0.02 + 0.008;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      this.twinklePhase += this.twinkleSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.25;
      if (this.alpha < 0.1) this.alpha = 0.1;
      if (this.alpha > 0.85) this.alpha = 0.85;
    }
    draw() {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Floating Floral / Sacred Geometry Doodles
  class FloralDoodle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = 28 + Math.random() * 24;
      this.petals = 6 + Math.floor(Math.random() * 3) * 2; // 6, 8, 10
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.003;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15;
      this.alpha = 0.15 + Math.random() * 0.15;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      if (this.x < -50) this.x = width + 50;
      if (this.x > width + 50) this.x = -50;
      if (this.y < -50) this.y = height + 50;
      if (this.y > height + 50) this.y = -50;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.35})`;
      ctx.lineWidth = 0.75;

      // Draw delicate rosette / geometric flower
      for (let i = 0; i < this.petals; i++) {
        const angle = (i * Math.PI * 2) / this.petals;
        const px = Math.cos(angle) * (this.size * 0.5);
        const py = Math.sin(angle) * (this.size * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, this.size * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  let florals = [];

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(new Star());
    }
    florals = [];
    for (let i = 0; i < 4; i++) {
      florals.push(new FloralDoodle());
    }
  }
  initStars();

  function renderAtmosphere() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw and update florals
    florals.forEach(f => {
      f.update();
      f.draw();
    });

    // 2. Update and draw stars
    stars.forEach(s => {
      s.update();
      s.draw();
    });

    // 3. Draw constellation connections between nearby stars
    const maxDist = 95;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }

      // Constellation to mouse cursor
      const mdx = stars[i].x - curX;
      const mdy = stars[i].y - curY;
      const mdist = Math.hypot(mdx, mdy);
      if (mdist < 140) {
        const mAlpha = (1 - mdist / 140) * 0.28;
        ctx.strokeStyle = `rgba(255, 255, 255, ${mAlpha})`;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(curX, curY);
        ctx.stroke();
      }
    }

    requestAnimationFrame(renderAtmosphere);
  }
  requestAnimationFrame(renderAtmosphere);

})();
