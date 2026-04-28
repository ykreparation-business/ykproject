document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNav();
  initReveal();
  initHeroParallax();
  initLightbox();
  initPortfolioFilters();
  initContactForm();
  setActiveNav();
});

/* ── Ink drop scroll progress ── */
function initScrollProgress() {
  const drop = document.createElement('div');
  drop.className = 'inkdrop-progress';
  drop.setAttribute('aria-hidden', 'true');

  // Drop silhouette: tip at bottom (20,50), circle top centered (20,15) r=14
  const PATH = 'M20 50 C6 42,2 28,6 15 A14 14 0 1 1 34 15 C38 28,34 42,20 50 Z';
  // Wave: period 20px, amplitude ±3px — translateX(-20px) for seamless loop
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
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? scrolled / total : 0;
    if (scrolled > 80) drop.classList.add('visible');
    // translateY: 52 = empty (liquid below viewBox), 0 = full
    liquid.style.transform = `translateY(${(1 - progress) * 52}px)`;
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

/* ── Scroll reveals ── */
function initReveal() {
  // Upgrade service panels to directional reveals
  document.querySelector('.service--tattoo')?.classList.replace('reveal', 'reveal-left');
  document.querySelector('.service--massage')?.classList.replace('reveal', 'reveal-right');

  // Upgrade work/portfolio items to scale reveals with stagger
  document.querySelectorAll('.work-item, .portfolio-item').forEach((el, i) => {
    el.classList.add('reveal-scale');
    el.style.transitionDelay = `${i * 70}ms`;
  });

  // Observe all reveal variants
  const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const els = document.querySelectorAll(selectors);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ── Hero parallax ── */
function initHeroParallax() {
  const heroBg = document.querySelector('.hero-bg img');
  if (!heroBg) return;

  // Skip on reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  heroBg.style.willChange = 'transform';

  const onScroll = () => {
    const scrollY = window.scrollY;
    const heroH   = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
    if (scrollY > heroH) return;
    // Move bg at 40% of scroll speed = depth effect
    heroBg.style.transform = `translateY(${scrollY * 0.4}px) scale(1.15)`;
  };

  // Initial scale to prevent letterboxing during parallax
  heroBg.style.transform = 'translateY(0) scale(1.15)';
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── Lightbox ── */
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
    };

    item.addEventListener('click', open);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
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
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const cat = btn.dataset.filter;
      items.forEach((item, i) => {
        const matches = cat === 'all' || item.dataset.category === cat;
        item.classList.toggle('hidden', !matches);
        // Re-stagger visible items
        if (matches) item.style.transitionDelay = `${i * 60}ms`;
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

    form.closest('.contact-form-wrap').innerHTML = `
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
  });
}

function validateField(input) {
  const field = input.closest('.field');
  if (!field) return true;

  const errEl = field.querySelector('.field-error');
  const empty = !input.value.trim();

  if (input.required && empty) {
    setError(field, errEl, getMsg(input));
    return false;
  }

  if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    setError(field, errEl, 'Adresse email invalide.');
    return false;
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

/* ── Active nav link ── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });
}
