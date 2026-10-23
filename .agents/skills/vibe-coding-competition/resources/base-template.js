/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHADE — Vibe Coding Competition Base JavaScript
 * Drop-in utilities for scroll animations, state, API calls, and interactivity.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ── Scroll Reveal (IntersectionObserver) ──────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the animation for multiple elements entering at once
          entry.target.style.transitionDelay = `${index * 100}ms`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// ── Smooth Scroll for Anchor Links ────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── Navbar Scroll Effect ──────────────────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      nav.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
      nav.style.background = 'rgba(10, 10, 15, 0.8)';
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

// ── Reactive Store ────────────────────────────────────────────────────────
function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    getState: () => ({ ...state }),
    setState(update) {
      const prev = { ...state };
      state = { ...state, ...(typeof update === 'function' ? update(state) : update) };
      listeners.forEach((fn) => fn(state, prev));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

// ── API Helper ────────────────────────────────────────────────────────────
async function api(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return { data: await res.json(), error: null };
  } catch (err) {
    console.error(`API Error [${url}]:`, err.message);
    return { data: null, error: err.message };
  }
}

// ── Debounce ──────────────────────────────────────────────────────────────
function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ── Throttle ──────────────────────────────────────────────────────────────
function throttle(fn, ms = 300) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

// ── DOM Helpers ───────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'class') el.className = val;
    else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
    else el.setAttribute(key, val);
  });
  children.forEach((child) => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  });
  return el;
}

// ── Typewriter Effect ─────────────────────────────────────────────────────
function typewriter(element, text, speed = 50) {
  return new Promise((resolve) => {
    let i = 0;
    element.textContent = '';
    const interval = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

// ── Particle Background (Lightweight) ─────────────────────────────────────
function initParticles(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { count = 50, color = 'rgba(108, 92, 231, 0.3)', maxSize = 3, speed = 0.5 } = options;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * maxSize + 1,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  animate();
}

// ── Counter Animation ─────────────────────────────────────────────────────
function animateCounter(element, target, duration = 2000) {
  const start = performance.now();
  const initial = parseInt(element.textContent) || 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(initial + (target - initial) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ── Local Storage Helpers ─────────────────────────────────────────────────
const storage = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

// ── Initialize Everything ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initSmoothScroll();
  initNavScroll();

  // Add 'reveal' class to animated elements that aren't already using CSS animations
  // $$('.feature-card, .demo-container').forEach(el => el.classList.add('reveal'));
});
