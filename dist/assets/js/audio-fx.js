/**
 * SYNTHESIZED WEB AUDIO SOUNDSCAPE (0 KB ASSETS)
 * Pure procedural audio generated via Web Audio API.
 * Provides tactile haptic feedback: page turns, card snaps, vinyl needle, and switches.
 */

(function () {
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem('avdhut_sound_enabled') === 'true';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Synthesize soft parchment paper rustle (for 3D book & carousel)
  function playPageTurn() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.18; // 180ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/Brownish noise for paper friction
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        // Apply envelope
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] *= env * 0.28;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.18);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      // Audio not permitted or failed
    }
  }

  // Synthesize delicate tactile click / card snap
  function playClick(freq = 800) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // Synthesize vinyl needle drop / groove crackle
  function playVinylNeedle() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Soft low thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(75, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);

      // Micro crackle
      setTimeout(() => {
        playClick(1200);
      }, 60);
    } catch (e) {}
  }

  function setSoundEnabled(enable) {
    isSoundEnabled = !!enable;
    localStorage.setItem('avdhut_sound_enabled', isSoundEnabled ? 'true' : 'false');
    updateSoundButtonUI();
    if (isSoundEnabled) {
      getAudioContext();
      playClick(900);
    }
  }

  function toggleSound() {
    setSoundEnabled(!isSoundEnabled);
  }

  function updateSoundButtonUI() {
    const btn = document.getElementById('btnToggleSound');
    if (!btn) return;
    const label = btn.querySelector('.sound-btn-label');
    const icon = btn.querySelector('.sound-icon');
    if (isSoundEnabled) {
      btn.classList.add('sound-active');
      btn.setAttribute('aria-label', 'Sound Effects: Enabled');
      if (label) label.textContent = 'Audio: ON';
      if (icon) {
        icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
      }
    } else {
      btn.classList.remove('sound-active');
      btn.setAttribute('aria-label', 'Sound Effects: Muted');
      if (label) label.textContent = 'Audio: OFF';
      if (icon) {
        icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
      }
    }
  }

  // Initialize UI on load
  document.addEventListener('DOMContentLoaded', () => {
    updateSoundButtonUI();
    const btn = document.getElementById('btnToggleSound');
    if (btn) {
      btn.addEventListener('click', () => {
        toggleSound();
      });
    }
  });

  window.AudioFX = {
    playPageTurn,
    playClick,
    playVinylNeedle,
    toggleSound,
    setSoundEnabled,
    isEnabled: () => isSoundEnabled
  };
})();
