/**
 * OBSIDIAN MIND GRAPH VIEW (2D KNOWLEDGE NETWORK)
 * Interactive physics-based node graph of Avdhut's intellectual vault.
 */

(function () {
  'use strict';

  let modalEl = null;
  let canvasEl = null;
  let ctx = null;
  let animId = null;
  let nodes = [];
  let links = [];
  let isRunning = false;
  let draggedNode = null;
  let hoveredNode = null;

  let panX = 0;
  let panY = 0;
  let zoom = 1.0;
  let pixelRatio = 1;
  let downWorldX = 0;
  let downWorldY = 0;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;

  const CATEGORY_COLORS_DARK = {
    bibliophile: '#ffffff',
    cinephile: '#00e054', // Letterboxd Green
    audiophile: '#f59e0b', // Vinyl Amber
    work: '#3b82f6',       // Cobalt Systems
    archive: '#a855f7'     // Archive Purple
  };

  const CATEGORY_COLORS_LIGHT = {
    bibliophile: '#1d1a14',
    cinephile: '#009444',
    audiophile: '#b45309',
    work: '#1d4ed8',
    archive: '#7e22ce'
  };

  function isLightTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function categoryColor(category) {
    const palette = isLightTheme() ? CATEGORY_COLORS_LIGHT : CATEGORY_COLORS_DARK;
    return palette[category] || palette.bibliophile;
  }

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

  function initGraphData() {
    const rawNotes = getNotesData();
    const w = canvasEl.clientWidth || canvasEl.width;
    const h = canvasEl.clientHeight || canvasEl.height;

    nodes = rawNotes.map((n, i) => {
      const angle = (i / rawNotes.length) * Math.PI * 2;
      const radius = window.innerWidth <= 600
        ? 55 + Math.random() * 105
        : 120 + Math.random() * 180;
      return {
        id: n.slug,
        title: n.title,
        category: n.category || 'bibliophile',
        readTime: n.readTime || 3,
        tags: n.tags || [],
        x: w / 2 + Math.cos(angle) * radius,
        y: h / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 6 + Math.min(8, (n.readTime || 2) * 1.5)
      };
    });

    // Generate links based on shared category and tags
    links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const sharedTags = n1.tags.filter(t => n2.tags.includes(t));
        const sameCategory = n1.category === n2.category;

        if (sharedTags.length > 0 || sameCategory) {
          links.push({
            source: n1,
            target: n2,
            strength: sharedTags.length > 0 ? 0.08 : 0.03,
            length: sharedTags.length > 0 ? 70 : 130
          });
        }
      }
    }
  }

  function updatePhysics() {
    // 1. Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);
        if (dist < 220) {
          const force = (220 - dist) / dist * 0.18;
          n1.vx -= dx * force * 0.5;
          n1.vy -= dy * force * 0.5;
          n2.vx += dx * force * 0.5;
          n2.vy += dy * force * 0.5;
        }
      }
    }

    // 2. Spring links
    for (const l of links) {
      const dx = l.target.x - l.source.x;
      const dy = l.target.y - l.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const diff = dist - l.length;
      const force = diff * l.strength * 0.1;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      l.source.vx += fx;
      l.source.vy += fy;
      l.target.vx -= fx;
      l.target.vy -= fy;
    }

    // 3. Center gravity & damping
    const cx = (canvasEl.clientWidth || canvasEl.width) / 2;
    const cy = (canvasEl.clientHeight || canvasEl.height) / 2;
    for (const n of nodes) {
      if (n === draggedNode) continue;
      const gdx = cx - n.x;
      const gdy = cy - n.y;
      n.vx += gdx * 0.0015;
      n.vy += gdy * 0.0015;

      n.vx *= 0.88;
      n.vy *= 0.88;
      n.x += n.vx;
      n.y += n.vy;
    }
  }

  function drawGraph() {
    const cssW = canvasEl.clientWidth || canvasEl.width;
    const cssH = canvasEl.clientHeight || canvasEl.height;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const light = isLightTheme();
    const linkIdle = light ? 'rgba(29, 26, 20, 0.12)' : 'rgba(255, 255, 255, 0.07)';
    const linkHi = light ? 'rgba(29, 26, 20, 0.5)' : 'rgba(255, 255, 255, 0.45)';
    const labelIdle = light ? 'rgba(29, 26, 20, 0.75)' : 'rgba(255, 255, 255, 0.7)';
    const labelHi = light ? '#000000' : '#ffffff';

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // Draw links
    for (const l of links) {
      const isHighlighted = hoveredNode && (l.source === hoveredNode || l.target === hoveredNode);
      ctx.strokeStyle = isHighlighted ? linkHi : linkIdle;
      ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(l.source.x, l.source.y);
      ctx.lineTo(l.target.x, l.target.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const n of nodes) {
      const isHovered = n === hoveredNode;
      const color = categoryColor(n.category);

      // Glow ring on hover
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      if (isHovered || zoom > 0.85) {
        ctx.fillStyle = isHovered ? labelHi : labelIdle;
        ctx.font = isHovered ? 'bold 12px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.title, n.x, n.y + n.radius + 14);
      }
    }

    ctx.restore();
  }

  function graphLoop() {
    if (!isRunning) return;
    updatePhysics();
    drawGraph();
    animId = requestAnimationFrame(graphLoop);
  }

  function openGraphModal() {
    modalEl = document.getElementById('mindGraphModal');
    canvasEl = document.getElementById('mindGraphCanvas');
    if (!modalEl || !canvasEl) return;

    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
    pixelRatio = Math.min(2, window.devicePixelRatio || 1);
    const cssW = modalEl.clientWidth;
    const cssH = modalEl.clientHeight;
    canvasEl.width = Math.floor(cssW * pixelRatio);
    canvasEl.height = Math.floor(cssH * pixelRatio);
    canvasEl.style.width = cssW + 'px';
    canvasEl.style.height = cssH + 'px';
    ctx = canvasEl.getContext('2d');

    panX = 0;
    panY = 0;
    zoom = window.innerWidth <= 600 ? 0.72 : 1.0;
    if (zoom < 1) {
      panX = (1 - zoom) * cssW / 2;
      panY = (1 - zoom) * cssH / 2;
    }
    initGraphData();
    isRunning = true;
    graphLoop();

    if (window.AudioFX) window.AudioFX.playClick(850);
  }

  function closeGraphModal() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  }

  // Mouse interaction
  function getGraphMousePos(e) {
    const rect = canvasEl.getBoundingClientRect();
    const mouseScreenX = e.clientX - rect.left;
    const mouseScreenY = e.clientY - rect.top;
    const worldX = (mouseScreenX - panX) / zoom;
    const worldY = (mouseScreenY - panY) / zoom;
    return { worldX, worldY, mouseScreenX, mouseScreenY };
  }

  function findNodeAt(worldX, worldY) {
    for (const n of nodes) {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      if (Math.hypot(dx, dy) <= n.radius + 5) {
        return n;
      }
    }
    return null;
  }

  document.addEventListener('DOMContentLoaded', () => {
    modalEl = document.getElementById('mindGraphModal');
    canvasEl = document.getElementById('mindGraphCanvas');
    const openBtn = document.getElementById('btnOpenMindGraph');
    const closeBtn = document.getElementById('btnCloseMindGraph');

    if (openBtn) openBtn.addEventListener('click', openGraphModal);
    if (closeBtn) closeBtn.addEventListener('click', closeGraphModal);

    if (canvasEl) {
      canvasEl.addEventListener('pointerdown', (e) => {
        canvasEl.setPointerCapture(e.pointerId);
        const { worldX, worldY, mouseScreenX, mouseScreenY } = getGraphMousePos(e);
        const node = findNodeAt(worldX, worldY);
        downWorldX = worldX;
        downWorldY = worldY;
        if (node) {
          draggedNode = node;
        } else {
          isPanning = true;
          startPanX = mouseScreenX - panX;
          startPanY = mouseScreenY - panY;
        }
      });

      window.addEventListener('pointermove', (e) => {
        if (!isRunning) return;
        const { worldX, worldY, mouseScreenX, mouseScreenY } = getGraphMousePos(e);

        if (draggedNode) {
          draggedNode.x = worldX;
          draggedNode.y = worldY;
          draggedNode.vx = 0;
          draggedNode.vy = 0;
        } else if (isPanning) {
          panX = mouseScreenX - startPanX;
          panY = mouseScreenY - startPanY;
        } else {
          hoveredNode = findNodeAt(worldX, worldY);
          canvasEl.style.cursor = hoveredNode ? 'pointer' : 'grab';
        }
      });

      const finishPointer = (e) => {
        if (draggedNode) {
          // If barely moved since mousedown, treat as click to open note
          const { worldX, worldY } = getGraphMousePos(e);
          const dist = Math.hypot(downWorldX - worldX, downWorldY - worldY);
          if (dist < 5) {
            const targetId = draggedNode.id;
            closeGraphModal();
            if (window.ReaderModal) {
              window.ReaderModal.open(targetId);
            } else {
              window.location.href = `./notes/${targetId}.html`;
            }
          }
          draggedNode = null;
        }
        isPanning = false;
      };
      window.addEventListener('pointerup', finishPointer);
      window.addEventListener('pointercancel', finishPointer);

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEl.classList.contains('open')) closeGraphModal();
      });

      canvasEl.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        zoom = Math.max(0.4, Math.min(2.5, zoom * zoomFactor));
      }, { passive: false });
    }
  });

  window.openMindGraph = openGraphModal;
  window.closeMindGraph = closeGraphModal;
})();
