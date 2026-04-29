document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNav();
  initCustomCursor();
  initParticleHero();
  init3DReveal();
  init3DTilt();
  initDragScroll();
  initCounters();
  initHeroParallax();
  initLightbox();
  initPortfolioFilters();
  initContactForm();
  setActiveNav();
  initScrollProgress();
});

/* ── Preloader ── */
function initPreloader() {
  const el = document.getElementById('preloader');
  if (!el) return;
  window.addEventListener('load', () => {
    setTimeout(() => el.classList.add('done'), 1400);
  });
  setTimeout(() => el.classList.add('done'), 3000);
}

/* ── Ink drop scroll progress ── */
function initScrollProgress() {
  const drop = document.createElement('div');
  drop.className = 'inkdrop-progress';
  drop.setAttribute('aria-hidden', 'true');
  const PATH = 'M20 50 C6 42,2 28,6 15 A14 14 0 1 1 34 15 C38 28,34 42,20 50 Z';
  const WAVE = 'M-20 3 Q-15 -1,-10 3 Q-5 7,0 3 Q5 -1,10 3 Q15 7,20 3 Q25 -1,30 3 Q35 7,40 3 Q45 -1,50 3 L50 55 L-20 55 Z';
  drop.innerHTML = `
    <svg viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="inkdrop-clip"><path d="${PATH}"/></clipPath></defs>
      <path class="inkdrop-outline" d="${PATH}"/>
      <g clip-path="url(#inkdrop-clip)">
        <g class="inkdrop-liquid" style="transform:translateY(52px)">
          <path class="inkdrop-wave" d="${WAVE}"/>
          <rect x="-20" y="3" width="80" height="52"/>
        </g>
      </g>
    </svg>`;
  document.body.prepend(drop);
  const liquid = drop.querySelector('.inkdrop-liquid');
  const update = () => {
    const p = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (window.scrollY > 80) drop.classList.add('visible');
    liquid.style.transform = `translateY(${(1 - p) * 52}px)`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Navigation ── */
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
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ── Custom ink cursor ── */
function initCustomCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let cx = -100, cy = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

  (function loop() {
    dot.style.left  = cx + 'px';
    dot.style.top   = cy + 'px';
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
}

/* ── Canvas 2D particle hero ── */
function initParticleHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, mx, my;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    mx = W / 2; my = H / 2;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  const COLORS = ['#d4691e', '#e8830a', '#f0ebe4', '#8a7d6e', '#b05a18'];
  const N = 220;

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x     = Math.random() * (W || 1920);
      this.y     = init ? Math.random() * (H || 1080) : (Math.random() < .5 ? -10 : (H || 1080) + 10);
      this.z     = Math.random() * 2 + 0.2;
      this.baseR = (Math.random() * 1.8 + 0.3) * this.z;
      this.vx    = (Math.random() - 0.5) * 0.25 * this.z;
      this.vy    = (Math.random() - 0.5) * 0.25 * this.z;
      this.alpha = (Math.random() * 0.45 + 0.08) * this.z;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.5 + 0.3;
    }
    update(t) {
      const parallaxX = (mx - W / 2) * 0.00015 * this.z;
      const parallaxY = (my - H / 2) * 0.00015 * this.z;
      this.x += this.vx + parallaxX;
      this.y += this.vy + parallaxY;
      this.r  = this.baseR * (0.8 + 0.2 * Math.sin(t * this.speed + this.phase));
      if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: N }, () => new Particle());

  let then = 0;
  (function loop(ts) {
    requestAnimationFrame(loop);
    const t = ts * 0.001;
    const dt = t - then; then = t;
    if (dt > 0.1) return;

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    particles.forEach(p => { p.update(t); p.draw(); });
  })(0);
}

/* ── Hero parallax ── */
function initHeroParallax() {
  const bg = document.getElementById('hero-bg');
  if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    bg.style.transform = `scale(1.08) translateY(${y * 0.25}px)`;
  }, { passive: true });
}

/* ── 3D Reveal on scroll ── */
function init3DReveal() {
  const classes = '.reveal-3d, .reveal-left, .reveal-right, .reveal-scale';
  const els = document.querySelectorAll(classes);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ── 3D Tilt on [data-tilt] elements ── */
function init3DTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.style.transition = 'transform 0.1s ease';
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform =
        `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale3d(1.02,1.02,1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      el.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    });
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.1s ease';
    });
  });
}

/* ── Counter animation ── */
function initCounters() {
  const counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el      = e.target;
      const target  = parseFloat(el.dataset.target);
      const decimal = parseInt(el.dataset.decimal || '0');
      const dur     = 1800;
      const start   = performance.now();

      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * ease).toFixed(decimal);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimal);
      })(start);

      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

/* ── Drag scroll gallery ── */
function initDragScroll() {
  const tracks = document.querySelectorAll('.gallery-track, .apple-scroll-track');
  tracks.forEach(track => {
    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown',  e => { isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; track.style.cursor = 'grabbing'; });
    track.addEventListener('mouseleave', ()  => { isDown = false; track.style.cursor = ''; });
    track.addEventListener('mouseup',    ()  => { isDown = false; track.style.cursor = ''; });
    track.addEventListener('mousemove',  e => {
      if (!isDown) return;
      e.preventDefault();
      track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.5;
    });
  });
}

/* ── Lightbox ── */
function initLightbox() {
  const items = document.querySelectorAll('.gallery-item, .portfolio-item');
  if (!items.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Vue agrandie');
  dialog.innerHTML = `
    <div class="lightbox-inner">
      <img class="lightbox-img" src="" alt="">
      <button class="lightbox-close" aria-label="Fermer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M15 5L5 15M5 5l10 10"/>
        </svg>
      </button>
    </div>`;
  document.body.appendChild(dialog);
  const img = dialog.querySelector('.lightbox-img');

  items.forEach(item => {
    const src = item.querySelector('img');
    if (!src) return;
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Voir : ${src.alt}`);
    const open = () => { img.src = src.src; img.alt = src.alt; dialog.showModal(); };
    item.addEventListener('click', open);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
}

/* ── Portfolio filters ── */
function initPortfolioFilters() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
      const cat = btn.dataset.filter;
      items.forEach((item, i) => {
        const show = cat === 'all' || item.dataset.category === cat;
        item.classList.toggle('hidden', !show);
        if (show) item.style.transitionDelay = `${i * 60}ms`;
      });
    });
  });
}

/* ── Contact form ── */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => { if (input.closest('.field')?.classList.contains('error')) validateField(input); });
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;
    inputs.forEach(i => { if (!validateField(i)) valid = false; });
    if (!valid) { form.querySelector('.field.error input, .field.error select, .field.error textarea')?.focus(); return; }
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'Envoi…';
    await new Promise(r => setTimeout(r, 900));
    form.closest('.contact-form-wrap').innerHTML = `
      <div class="form-success">
        <div class="form-success-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="4 11 9 16 18 6"/>
          </svg>
        </div>
        <p class="form-success-title">Votre demande est bien reçue.</p>
        <p class="form-success-text">Nous vous contactons sous 48h pour confirmer votre séance.</p>
      </div>`;
  });
}

function validateField(input) {
  const field = input.closest('.field');
  if (!field) return true;
  const errEl = field.querySelector('.field-error');
  if (input.required && !input.value.trim()) { setError(field, errEl, getMsg(input)); return false; }
  if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { setError(field, errEl, 'Adresse email invalide.'); return false; }
  clearError(field, errEl);
  return true;
}
function setError(f, e, m) { f.classList.add('error'); if (e) { e.textContent = m; e.setAttribute('role','alert'); } }
function clearError(f, e) { f.classList.remove('error'); if (e) { e.textContent = ''; e.removeAttribute('role'); } }
function getMsg(input) {
  return { name:'Votre nom est nécessaire.', email:'Votre email est nécessaire.', phone:'Votre numéro est nécessaire.', service:'Veuillez choisir un service.', message:'Décrivez votre projet.' }[input.name] || 'Ce champ est requis.';
}

/* ── Active nav ── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page || (page === '' && a.getAttribute('href') === 'index.html'));
  });
}
