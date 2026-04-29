/* content-loader.js — charge content.json et hydrate les pages */
(async function () {
  let c;
  try {
    const res = await fetch('content.json?v=' + Date.now());
    if (!res.ok) return;
    c = await res.json();
  } catch (_) { return; }

  const page = location.pathname.split('/').pop() || 'index.html';

  if (page === 'index.html' || page === '' || page === '/') {
    hydrateHome(c);
  } else if (page === 'portfolio.html') {
    hydratePortfolio(c);
  }

  hydrateCommon(c);
})();

/* ── Données communes (footer, nav) ── */
function hydrateCommon(c) {
  const s = c.site || {};
  setText('.footer-info a[href^="mailto"]',  s.email);
  setAttr('.footer-info a[href^="mailto"]', 'href', 'mailto:' + s.email);
  setText('.footer-info a[href^="tel"]',     s.phone);
  setAttr('.footer-info a[href^="tel"]',    'href', 'tel:' + s.phone.replace(/\s/g, ''));

  const igLinks = document.querySelectorAll('a[href*="instagram.com"]');
  igLinks.forEach(a => { if (s.instagram) a.href = s.instagram; });
}

/* ── Page d'accueil ── */
function hydrateHome(c) {
  // Hero
  const h = c.hero || {};
  setText('.apple-chip',        h.badge);
  setHTML('.apple-hero-headline', nl2br(h.title));
  setText('.apple-hero-sub',    h.subtitle);
  if (h.image) {
    const img = document.querySelector('.apple-hero-media img');
    if (img) img.src = h.image;
  }
  const ctaBtns = document.querySelectorAll('.apple-hero-actions .btn');
  if (ctaBtns[0] && h.cta_primary)   ctaBtns[0].textContent = h.cta_primary;
  if (ctaBtns[1] && h.cta_secondary) ctaBtns[1].textContent = h.cta_secondary;

  // Pitch
  if (c.pitch) {
    const el = document.querySelector('.apple-pitch-text');
    if (el) {
      const highlight = el.querySelector('.apple-pitch-highlight');
      const name = highlight ? highlight.textContent : '';
      el.innerHTML = `<span class="apple-pitch-highlight">${name}</span> ${escHtml(c.pitch.replace(/^[^—]* /, ''))}`;
    }
  }

  // Stats
  if (Array.isArray(c.stats)) {
    const nums  = document.querySelectorAll('.apple-stat-number');
    const labels = document.querySelectorAll('.apple-stat-label');
    c.stats.forEach((s, i) => {
      if (nums[i])   nums[i].textContent   = s.value;
      if (labels[i]) labels[i].textContent = s.label;
    });
  }

  // Panel
  const p = c.panel || {};
  if (p.image) {
    const img = document.querySelector('.apple-panel-media img');
    if (img) { img.src = p.image; if (p.image_alt) img.alt = p.image_alt; }
  }
  setHTML('.apple-panel-headline', nl2br(p.title));
  setText('.apple-panel-desc',     p.desc);

  // Vidéo
  const v = c.video || {};
  if (v.src) {
    const vid = document.querySelector('.apple-video-player');
    if (vid) {
      const src = vid.querySelector('source');
      if (src) src.src = v.src;
      if (v.poster) vid.poster = v.poster;
      vid.load();
    }
  }

  // Galerie défilante
  if (Array.isArray(c.gallery) && c.gallery.length) {
    const track = document.querySelector('.apple-scroll-track');
    if (track) {
      track.innerHTML = c.gallery.map(item => `
        <div class="apple-scroll-item" role="listitem">
          <img src="${escAttr(item.src)}" alt="${escAttr(item.alt)}" loading="lazy">
        </div>
      `).join('');
    }
  }

  // Avis
  if (Array.isArray(c.reviews) && c.reviews.length) {
    const track = document.querySelector('#rv-carousel .rv-track');
    if (track) {
      track.innerHTML = c.reviews.map(r => {
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        return `
          <article class="rv-card">
            <div class="rv-card-top">
              <img class="rv-avatar" src="${escAttr(r.avatar)}" alt="${escAttr(r.name)}" loading="lazy"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=e8e8e8&color=555&size=44'">
              <div>
                <p class="rv-name">${escHtml(r.name)}</p>
                <p class="rv-date">${escHtml(r.date)}</p>
              </div>
            </div>
            <div class="rv-stars" aria-label="${r.rating} étoiles sur 5">${stars}</div>
            <p class="rv-text">${escHtml(r.text)}</p>
          </article>`;
      }).join('');
    }
    const rvLink = document.querySelector('.rv-cta-btn');
    if (rvLink && c.site?.google_reviews_url) rvLink.href = c.site.google_reviews_url;
  }

  // Processus
  if (Array.isArray(c.process) && c.process.length) {
    const steps = document.querySelector('.apple-process-steps');
    if (steps) {
      const delays = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3'];
      steps.innerHTML = c.process.map((s, i) => `
        <div class="apple-step reveal ${delays[i] || ''}">
          <span class="apple-step-num">${escHtml(s.step)}</span>
          <h3>${escHtml(s.title)}</h3>
          <p>${escHtml(s.desc)}</p>
        </div>
      `).join('');
    }
  }

  // Footer contact
  if (c.site) {
    const addrEl = document.querySelector('.footer-info');
    if (addrEl && c.site.address) {
      addrEl.innerHTML = `${escHtml(c.site.address)}<br>Guadeloupe, Antilles françaises<br>
        <a href="tel:${c.site.phone.replace(/\s/g,'')}">${escHtml(c.site.phone)}</a>`;
    }
    const ctaPhone = document.querySelector('.apple-cta-actions a[href^="tel"]');
    if (ctaPhone && c.site.phone) {
      ctaPhone.href        = 'tel:' + c.site.phone.replace(/\s/g, '');
      ctaPhone.textContent = c.site.phone;
    }
  }
}

/* ── Page Portfolio ── */
function hydratePortfolio(c) {
  if (!Array.isArray(c.portfolio) || !c.portfolio.length) return;

  const grid = document.querySelector('.portfolio-grid');
  if (!grid) return;

  const delays = ['', 'reveal-delay-1', 'reveal-delay-2'];
  const items  = c.portfolio.map((item, i) => `
    <article class="portfolio-item reveal ${delays[i % 3]}" data-category="${escAttr(item.category)}">
      <img src="${escAttr(item.src)}" alt="${escAttr(item.alt)}" loading="lazy">
      <div class="portfolio-item-label">${escHtml(item.label)}</div>
    </article>
  `);

  // Garder le Reel Instagram (dernier item .portfolio-item--reel) s'il existe
  const reel = grid.querySelector('.portfolio-item--reel');
  grid.innerHTML = items.join('') + (reel ? reel.outerHTML : '');
}

/* ── Helpers ── */
function setText(sel, val) {
  if (!val) return;
  const el = document.querySelector(sel);
  if (el) el.textContent = val;
}
function setHTML(sel, val) {
  if (!val) return;
  const el = document.querySelector(sel);
  if (el) el.innerHTML = val;
}
function setAttr(sel, attr, val) {
  if (!val) return;
  const el = document.querySelector(sel);
  if (el) el.setAttribute(attr, val);
}
function nl2br(str) {
  if (!str) return '';
  return escHtml(str).replace(/\n/g, '<br>');
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
