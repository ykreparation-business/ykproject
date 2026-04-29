/* =========================================================
   La Goutte d'Encre — GSAP 3D Animation Engine
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Signal CSS to disable its fallback animations
  document.body.classList.add('gsap-ready');

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Always-on functional modules
  initScrollProgress();
  initNav();
  setActiveNav();
  initLightbox();
  initPortfolioFilters();
  initContactForm();

  if (reduced) {
    // Make everything visible, skip all motion
    document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    ).forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  // 3D / animation modules
  initCursorSpotlight();
  initHeroEntrance();
  initHeroParticles();
  initHeroMouseParallax();
  initScrollReveal();
  initWordSplitReveal();
  initServiceTilt();
  initWorkGrid();
  initMagneticBtns();
});

/* ─────────────────────────────────────────────
   CURSOR SPOTLIGHT
───────────────────────────────────────────── */
function initCursorSpotlight() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const spot = document.createElement('div');
  spot.className = 'spotlight';
  document.body.appendChild(spot);

  window.addEventListener('mousemove', e => {
    gsap.to(spot, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
}

/* ─────────────────────────────────────────────
   HERO ENTRANCE — replaces CSS fadeUp
───────────────────────────────────────────── */
function initHeroEntrance() {
  const logo     = document.querySelector('.hero-logo');
  const tagline  = document.querySelector('.hero-tagline');
  const location = document.querySelector('.hero-location');
  const actions  = document.querySelector('.hero-actions');
  const scroll   = document.querySelector('.hero-scroll');
  const deco     = document.querySelector('.hero-deco-word');

  // Set initial 3D states
  gsap.set([logo, tagline, location, actions, scroll], {
    autoAlpha: 0,
    y: 40,
    rotationX: 20,
    transformPerspective: 800,
  });

  if (deco) gsap.set(deco, { autoAlpha: 0, scale: 1.1 });

  const tl = gsap.timeline({ delay: 0.15 });

  // Deco word fades in first, large and ghostly
  if (deco) {
    tl.to(deco, { autoAlpha: 1, scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
  }

  tl.to(logo, {
    autoAlpha: 1, y: 0, rotationX: 0,
    duration: 1.1, ease: 'expo.out',
  }, 0.2)
  .to(tagline, {
    autoAlpha: 1, y: 0, rotationX: 0,
    duration: 1, ease: 'expo.out',
  }, 0.38)
  .to(location, {
    autoAlpha: 1, y: 0, rotationX: 0,
    duration: 0.9, ease: 'expo.out',
  }, 0.52)
  .to(actions, {
    autoAlpha: 1, y: 0, rotationX: 0,
    duration: 0.9, ease: 'expo.out',
  }, 0.64)
  .to(scroll, {
    autoAlpha: 1, y: 0, rotationX: 0,
    duration: 0.9, ease: 'expo.out',
  }, 0.95);
}

/* ─────────────────────────────────────────────
   HERO PARTICLES — floating ink drops
───────────────────────────────────────────── */
function initHeroParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  // SVG ink drop path (teardrop pointing down)
  const DROP = 'M10 24 C3 18,0 10,4 4 A6 6 0 1 1 16 4 C20 10,17 18,10 24 Z';
  const count = 22;
  const particleData = [];

  for (let i = 0; i < count; i++) {
    const el    = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path  = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const depth = Math.random() * 0.7 + 0.05;   // 0.05 → 0.75
    const size  = depth * 24 + 4;                 // 4px → 22px
    const baseX = Math.random() * 96 + 2;         // % across viewport
    const baseY = Math.random() * 96 + 2;

    el.setAttribute('viewBox', '0 0 20 26');
    el.setAttribute('width', size);
    el.setAttribute('height', size * 1.3);
    el.dataset.depth = depth;

    path.setAttribute('d', DROP);
    path.setAttribute('fill', 'oklch(54% 0.15 42)');
    el.appendChild(path);
    el.className = 'ink-particle';

    gsap.set(el, {
      position: 'absolute',
      left: baseX + '%',
      top: baseY + '%',
      opacity: depth * 0.18 + 0.02,
      rotation: Math.random() * 360,
      xPercent: -50,
      yPercent: -50,
    });

    container.appendChild(el);
    particleData.push({ el, baseX, baseY, depth });

    // Idle floating loop — each particle bobs independently
    gsap.to(el, {
      y: (Math.random() - 0.5) * 35,
      x: (Math.random() - 0.5) * 18,
      rotation: '+=' + ((Math.random() - 0.5) * 25),
      duration: 3.5 + Math.random() * 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 5,
    });
  }

  return particleData;
}

/* ─────────────────────────────────────────────
   HERO MOUSE PARALLAX
   Moves background and deco word based on cursor
───────────────────────────────────────────── */
function initHeroMouseParallax() {
  const hero    = document.querySelector('.hero');
  const bgFar   = document.querySelector('.hero-bg-far img');
  const bgMid   = document.querySelector('.hero-bg-mid');
  const content = document.querySelector('.hero-content');
  const deco    = document.querySelector('.hero-deco-word');
  if (!hero || !bgFar) return;

  // Initial background scale (parallax needs room to move)
  gsap.set(bgFar, { scale: 1.15 });

  let mx = 0, my = 0;

  // Smooth lerp via RAF
  let rafId;
  let cx = 0, cy = 0;

  const tick = () => {
    cx += (mx - cx) * 0.055;
    cy += (my - cy) * 0.055;

    // Far layer — moves most (illusion of depth)
    gsap.set(bgFar, { x: cx * 28, y: cy * 18 + window.scrollY * 0.38 });

    // Mid gradient layer — subtle
    if (bgMid) gsap.set(bgMid, { x: cx * 14, y: cy * 10 });

    // Deco word — opposite direction for depth pop
    if (deco) gsap.set(deco, { x: cx * -18, y: cy * -10 });

    // Content — very slight reactive shift
    if (content) gsap.set(content, { x: cx * -6, y: cy * -4 });

    rafId = requestAnimationFrame(tick);
  };
  tick();

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mx = (e.clientX - rect.left - rect.width  * 0.5) / (rect.width  * 0.5);
    my = (e.clientY - rect.top  - rect.height * 0.5) / (rect.height * 0.5);
  });

  hero.addEventListener('mouseleave', () => {
    mx = 0;
    my = 0;
  });

  // Scroll: only move bg vertically on scroll (keep existing scroll parallax)
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) return;
    gsap.set(bgFar, { y: cy * 18 + window.scrollY * 0.38 });
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   SCROLL REVEALS — ScrollTrigger.batch
───────────────────────────────────────────── */
function initScrollReveal() {
  // Standard reveal elements
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: batch => {
      gsap.from(batch, {
        y: 55,
        autoAlpha: 0,
        rotationX: 12,
        transformPerspective: 700,
        stagger: 0.1,
        duration: 0.95,
        ease: 'expo.out',
      });
    },
  });

  // Directional — services (replaced in initServiceTilt)
  ScrollTrigger.batch('.reveal-left', {
    start: 'top 85%',
    once: true,
    onEnter: batch => {
      gsap.from(batch, {
        x: -70,
        autoAlpha: 0,
        rotationY: -12,
        transformPerspective: 900,
        stagger: 0.12,
        duration: 1,
        ease: 'expo.out',
      });
    },
  });

  ScrollTrigger.batch('.reveal-right', {
    start: 'top 85%',
    once: true,
    onEnter: batch => {
      gsap.from(batch, {
        x: 70,
        autoAlpha: 0,
        rotationY: 12,
        transformPerspective: 900,
        stagger: 0.12,
        duration: 1,
        ease: 'expo.out',
      });
    },
  });

  // Section eyebrow lines — draw in
  document.querySelectorAll('.section-eyebrow').forEach(el => {
    gsap.to(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      '--line-w': '24px',
      duration: 1,
      ease: 'expo.out',
    });
  });
}

/* ─────────────────────────────────────────────
   WORD SPLIT 3D REVEAL — intro text
───────────────────────────────────────────── */
function initWordSplitReveal() {
  const targets = document.querySelectorAll('[data-split-words]');

  targets.forEach(el => {
    // Collect inner content, preserving <strong> tags
    const rawHtml = el.innerHTML;

    // Split into tokens (words and HTML tags)
    const tokens = [];
    let current = '';
    let inTag = false;

    for (let i = 0; i < rawHtml.length; i++) {
      const ch = rawHtml[i];
      if (ch === '<') { inTag = true; if (current) { tokens.push({ type: 'text', val: current }); current = ''; } current += ch; }
      else if (ch === '>') { inTag = false; current += ch; tokens.push({ type: 'tag', val: current }); current = ''; }
      else { current += ch; }
    }
    if (current) tokens.push({ type: 'text', val: current });

    // Re-build wrapping each word
    const html = tokens.map(t => {
      if (t.type === 'tag') return t.val;
      return t.val
        .split(/(\s+)/)
        .map(seg => {
          if (/^\s+$/.test(seg)) return seg;
          if (!seg) return '';
          return `<span class="word-wrap"><span class="word-inner">${seg}</span></span>`;
        })
        .join('');
    }).join('');

    el.innerHTML = html;

    const words = el.querySelectorAll('.word-inner');
    gsap.set(words, { y: '110%', rotationX: -70, autoAlpha: 0, transformPerspective: 400 });

    gsap.to(words, {
      y: '0%',
      rotationX: 0,
      autoAlpha: 1,
      stagger: 0.025,
      duration: 0.75,
      ease: 'back.out(1.3)',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true,
      },
    });
  });
}

/* ─────────────────────────────────────────────
   SERVICE CARDS — 3D tilt on hover
───────────────────────────────────────────── */
function initServiceTilt() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  // Entrance via ScrollTrigger
  gsap.set(cards, { autoAlpha: 0, y: 60, rotationX: 15, transformPerspective: 1000 });

  ScrollTrigger.batch(cards, {
    start: 'top 80%',
    once: true,
    onEnter: batch => {
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        rotationX: 0,
        stagger: 0.15,
        duration: 1.1,
        ease: 'expo.out',
      });
    },
  });

  // Mouse 3D tilt
  cards.forEach(card => {
    const glow = card.querySelector('.service-card-glow');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0→1
      const py = (e.clientY - rect.top)  / rect.height;

      const rx = (py - 0.5) * -14;  // rotationX: tilt top/bottom
      const ry = (px - 0.5) *  10;  // rotationY: tilt left/right

      gsap.to(card, {
        rotationX: rx,
        rotationY: ry,
        transformPerspective: 900,
        transformOrigin: 'center center',
        ease: 'power2.out',
        duration: 0.5,
      });

      // Move glow radial gradient
      if (glow) {
        glow.style.setProperty('--gx', (px * 100) + '%');
        glow.style.setProperty('--gy', (py * 100) + '%');
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.9,
        ease: 'elastic.out(1, 0.55)',
      });
    });
  });
}

/* ─────────────────────────────────────────────
   WORK GRID — staggered 3D entrance
───────────────────────────────────────────── */
function initWorkGrid() {
  const items = document.querySelectorAll('.work-item, .portfolio-item');
  if (!items.length) return;

  gsap.set(items, { autoAlpha: 0, y: 50, scale: 0.9, rotationX: 10, transformPerspective: 600 });

  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    batchMax: 6,
    interval: 0.08,
    onEnter: batch => {
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: 'expo.out',
      });
    },
  });

  // Subtle 3D tilt on hover (desktop)
  if (window.matchMedia('(hover: hover)').matches) {
    items.forEach(item => {
      item.addEventListener('mousemove', e => {
        const rect = item.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width  - 0.5;
        const py = (e.clientY - rect.top)  / rect.height - 0.5;
        gsap.to(item, {
          rotationY: px * 8,
          rotationX: py * -6,
          scale: 1.02,
          transformPerspective: 700,
          ease: 'power2.out',
          duration: 0.45,
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          rotationY: 0,
          rotationX: 0,
          scale: 1,
          duration: 0.65,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }
}

/* ─────────────────────────────────────────────
   MAGNETIC BUTTONS
───────────────────────────────────────────── */
function initMagneticBtns() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  * 0.5;
      const cy = rect.top  + rect.height * 0.5;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.55)' });
    });
  });
}

/* ─────────────────────────────────────────────
   INK DROP SCROLL PROGRESS
───────────────────────────────────────────── */
function initScrollProgress() {
  const drop = document.createElement('div');
  drop.className = 'inkdrop-progress';
  drop.setAttribute('aria-hidden', 'true');

  const PATH = 'M20 50 C6 42,2 28,6 15 A14 14 0 1 1 34 15 C38 28,34 42,20 50 Z';
  const WAVE = 'M-20 3 Q-15 -1,-10 3 Q-5 7,0 3 Q5 -1,10 3 Q15 7,20 3 Q25 -1,30 3 Q35 7,40 3 Q45 -1,50 3 L50 55 L-20 55 Z';

  drop.innerHTML = `
    <svg viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="inkdrop-clip">
          <path d="${PATH}"/>
        </clipPath>
      </defs>
      <path class="inkdrop-outline" d="${PATH}"/>
      <g clip-path="url(#inkdrop-clip)">
        <g class="inkdrop-liquid" style="transform:translateY(52px)">
          <path class="inkdrop-wave" d="${WAVE}"/>
          <rect x="-20" y="3" width="80" height="52"/>
        </g>
      </g>
    </svg>
  `;
  document.body.prepend(drop);

  const liquid = drop.querySelector('.inkdrop-liquid');

  const update = () => {
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? window.scrollY / total : 0;
    if (window.scrollY > 80) drop.classList.add('visible');
    liquid.style.transform = `translateY(${(1 - progress) * 52}px)`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

/* ─────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────── */
function initLightbox() {
  const items = document.querySelectorAll('.work-item, .portfolio-item');
  if (!items.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Vue agrandie');
  dialog.innerHTML = `
    <div class="lightbox-inner">
      <img class="lightbox-img" src="" alt="">
      <button class="lightbox-close" aria-label="Fermer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M15 5L5 15M5 5l10 10"/>
        </svg>
      </button>
    </div>
  `;
  document.body.appendChild(dialog);

  const img = dialog.querySelector('.lightbox-img');

  items.forEach(item => {
    const src = item.querySelector('img');
    if (!src) return;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Voir : ${src.alt}`);

    const open = () => {
      img.src = src.src;
      img.alt = src.alt;
      dialog.showModal();
      gsap.from(dialog.querySelector('.lightbox-inner'), {
        scale: 0.88,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'expo.out',
      });
    };

    item.addEventListener('click', open);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
}

/* ─────────────────────────────────────────────
   PORTFOLIO FILTERS
───────────────────────────────────────────── */
function initPortfolioFilters() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const cat = btn.dataset.filter;

      items.forEach((item, i) => {
        const matches = cat === 'all' || item.dataset.category === cat;
        if (matches) {
          item.classList.remove('hidden');
          gsap.fromTo(item, { autoAlpha: 0, y: 20, scale: 0.95 }, {
            autoAlpha: 1, y: 0, scale: 1,
            duration: 0.5,
            delay: i * 0.04,
            ease: 'expo.out',
          });
        } else {
          gsap.to(item, {
            autoAlpha: 0, y: -10, scale: 0.95,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => item.classList.add('hidden'),
          });
        }
      });
    });
  });
}

/* ─────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────── */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input, textarea, select');

  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.field')?.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    let valid = true;
    inputs.forEach(input => { if (!validateField(input)) valid = false; });
    if (!valid) {
      form.querySelector('.field.error input, .field.error select, .field.error textarea')?.focus();
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi…';

    await new Promise(r => setTimeout(r, 900));

    const wrap = form.closest('.contact-form-wrap');
    wrap.innerHTML = `
      <div class="form-success">
        <div class="form-success-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="4 11 9 16 18 6"/>
          </svg>
        </div>
        <p class="form-success-title">Votre demande est bien reçue.</p>
        <p class="form-success-text">Nous vous contactons sous 48h pour confirmer votre séance.</p>
      </div>
    `;
    gsap.from(wrap.querySelector('.form-success'), {
      y: 30, autoAlpha: 0, duration: 0.7, ease: 'expo.out',
    });
  });
}

function validateField(input) {
  const field = input.closest('.field');
  if (!field) return true;

  const errEl = field.querySelector('.field-error');
  const empty = !input.value.trim();

  if (input.required && empty) { setError(field, errEl, getMsg(input)); return false; }
  if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    setError(field, errEl, 'Adresse email invalide.'); return false;
  }
  clearError(field, errEl);
  return true;
}

function setError(field, errEl, msg) {
  field.classList.add('error');
  if (errEl) { errEl.textContent = msg; errEl.setAttribute('role', 'alert'); }
}

function clearError(field, errEl) {
  field.classList.remove('error');
  if (errEl) { errEl.textContent = ''; errEl.removeAttribute('role'); }
}

function getMsg(input) {
  const msgs = {
    name:    'Votre nom est nécessaire pour vous recontacter.',
    email:   'Votre email est nécessaire pour vous recontacter.',
    phone:   'Votre numéro est nécessaire.',
    service: 'Veuillez choisir un service.',
    message: 'Décrivez votre projet — même en quelques mots.',
  };
  return msgs[input.name] || 'Ce champ est requis.';
}

/* ─────────────────────────────────────────────
   ACTIVE NAV LINK
───────────────────────────────────────────── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });
}
