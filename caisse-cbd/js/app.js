'use strict';

/* ============================================================
   Natirèl CBD — Caisse
   Application autonome (localStorage), sans dépendance externe.
   ============================================================ */

const STORAGE_KEY = 'natirel_caisse_v1';
const TAUX_TVA = [2.1, 8.5];

const defaultState = () => ({
  settings: {
    nom: 'Natirèl CBD',
    adresse: "Lot Naty ZAC de Fort Île",
    ville: '97128 Goyave, France',
    tva: 'FR79982206955',
    siret: '98220695500000',
    naf: '4637Z',
    fondCaisseInitial: 0,
  },
  products: [],
  sales: [],
  cart: [], // [{productId, qty}]
  remise: 0,
});

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed, {
      settings: Object.assign(defaultState().settings, parsed.settings || {}),
    });
  } catch (e) {
    console.error('Erreur de lecture des données, réinitialisation.', e);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------------------------- Utils ---------------------------- */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const eur = (n) => (Math.round((n + Number.EPSILON) * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const ht = (ttc, taux) => ttc / (1 + taux / 100);
const tvaMontant = (ttc, taux) => ttc - ht(ttc, taux);

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-FR');
}
function fmtDateTime(d) {
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
// Regroupe par date/mois calendaire LOCAL (fuseau de l'iPad, ex. Guadeloupe UTC-4) :
// une vente enregistrée en soirée locale ne doit pas basculer sur le jour UTC suivant.
function localDateStr(iso) {
  const d = new Date(iso);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function isSameDay(iso, dateStr) {
  return localDateStr(iso) === dateStr;
}
function isSameMonth(iso, monthStr) {
  return localDateStr(iso).slice(0, 7) === monthStr;
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.querySelector('.msg').textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ============================================================
   Navigation entre vues
   ============================================================ */

const views = ['vente', 'produits', 'rapports', 'reglages'];

function switchView(name) {
  views.forEach((v) => {
    document.getElementById('view-' + v).classList.toggle('active', v === name);
    document.getElementById('tab-' + v).classList.toggle('active', v === name);
  });
  if (name === 'vente') renderVente();
  if (name === 'produits') renderProduits();
  if (name === 'rapports') renderRapports();
  if (name === 'reglages') renderReglages();
}

/* ============================================================
   VENTE — catalogue + panier
   ============================================================ */

let categorieActive = 'Toutes';

function produitsActifs() {
  return state.products.filter((p) => !p.deleted);
}

function categoriesDisponibles() {
  const set = new Set(produitsActifs().map((p) => p.categorie || 'Autres'));
  return ['Toutes', ...Array.from(set).sort()];
}

function renderVente() {
  renderCategories();
  renderGrille();
  renderTicket();
}

function renderCategories() {
  const wrap = document.getElementById('categories');
  const cats = categoriesDisponibles();
  if (!cats.includes(categorieActive)) categorieActive = 'Toutes';
  wrap.innerHTML = cats
    .map((c) => `<button class="chip ${c === categorieActive ? 'active' : ''}" data-cat="${escapeAttr(c)}">${escapeHtml(c)}</button>`)
    .join('');
  wrap.querySelectorAll('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      categorieActive = btn.dataset.cat;
      renderCategories();
      renderGrille();
    });
  });
}

function renderGrille() {
  const grid = document.getElementById('product-grid');
  const empty = document.getElementById('catalogue-empty');

  const list = produitsActifs().filter((p) => categorieActive === 'Toutes' || (p.categorie || 'Autres') === categorieActive);

  if (produitsActifs().length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }
  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  grid.innerHTML = list
    .map(
      (p) => `
    <button class="product-card" data-id="${p.id}">
      <span class="nom">${escapeHtml(p.nom)}</span>
      <span class="cat">${escapeHtml(p.categorie || 'Autres')}</span>
      <span class="prix">${eur(p.prixTTC)}</span>
    </button>`
    )
    .join('');

  grid.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', () => addToCart(card.dataset.id));
  });
}

function addToCart(productId) {
  const line = state.cart.find((l) => l.productId === productId);
  if (line) line.qty += 1;
  else state.cart.push({ productId, qty: 1 });
  saveState();
  renderTicket();
}

function setQty(productId, qty) {
  if (qty <= 0) {
    state.cart = state.cart.filter((l) => l.productId !== productId);
  } else {
    const line = state.cart.find((l) => l.productId === productId);
    if (line) line.qty = qty;
  }
  saveState();
  renderTicket();
}

function clearCart() {
  state.cart = [];
  state.remise = 0;
  saveState();
  renderTicket();
}

function cartLinesResolved() {
  return state.cart
    .map((l) => {
      const p = state.products.find((pr) => pr.id === l.productId);
      if (!p) return null;
      return { product: p, qty: l.qty };
    })
    .filter(Boolean);
}

function cartSousTotal() {
  return cartLinesResolved().reduce((sum, l) => sum + l.product.prixTTC * l.qty, 0);
}

function cartTotal() {
  return Math.max(0, cartSousTotal() - (Number(state.remise) || 0));
}

function renderTicket() {
  const linesWrap = document.getElementById('ticket-lines');
  const emptyWrap = document.getElementById('ticket-empty');
  const lines = cartLinesResolved();

  document.getElementById('ticket-count').textContent = lines.reduce((s, l) => s + l.qty, 0) + ' article' + (lines.reduce((s, l) => s + l.qty, 0) > 1 ? 's' : '');

  if (lines.length === 0) {
    linesWrap.classList.add('hidden');
    emptyWrap.classList.remove('hidden');
  } else {
    linesWrap.classList.remove('hidden');
    emptyWrap.classList.add('hidden');
    linesWrap.innerHTML = lines
      .map(
        (l) => `
      <div class="ticket-line" data-id="${l.product.id}">
        <div class="info">
          <div class="nom">${escapeHtml(l.product.nom)}</div>
          <div class="pu">${eur(l.product.prixTTC)} / unité</div>
        </div>
        <div class="qty-stepper">
          <button class="qty-dec" aria-label="Diminuer">−</button>
          <span class="qty">${l.qty}</span>
          <button class="qty-inc" aria-label="Augmenter">+</button>
        </div>
        <div class="ligne-total">${eur(l.product.prixTTC * l.qty)}</div>
        <button class="remove" aria-label="Retirer">✕</button>
      </div>`
      )
      .join('');

    linesWrap.querySelectorAll('.ticket-line').forEach((row) => {
      const id = row.dataset.id;
      const line = state.cart.find((l) => l.productId === id);
      row.querySelector('.qty-inc').addEventListener('click', () => setQty(id, line.qty + 1));
      row.querySelector('.qty-dec').addEventListener('click', () => setQty(id, line.qty - 1));
      row.querySelector('.remove').addEventListener('click', () => setQty(id, 0));
    });
  }

  document.getElementById('remise-input').value = state.remise || '';
  document.getElementById('total-valeur').textContent = eur(cartTotal());

  const disabled = lines.length === 0;
  document.getElementById('btn-especes').disabled = disabled;
  document.getElementById('btn-cb').disabled = disabled;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('remise-input').addEventListener('input', (e) => {
    state.remise = Math.max(0, Number(e.target.value) || 0);
    saveState();
    document.getElementById('total-valeur').textContent = eur(cartTotal());
  });
  document.getElementById('ticket-clear-btn').addEventListener('click', () => {
    if (state.cart.length === 0) return;
    if (confirm('Vider le panier ?')) clearCart();
  });
  document.getElementById('btn-especes').addEventListener('click', () => openPaiement('especes'));
  document.getElementById('btn-cb').addEventListener('click', () => openPaiement('cb'));
});

/* ============================================================
   Paiement (modale)
   ============================================================ */

let paiementMode = null;

function openPaiement(mode) {
  paiementMode = mode;
  const total = cartTotal();
  document.getElementById('modal-paiement-titre').textContent = mode === 'especes' ? 'Paiement espèces' : 'Paiement carte bancaire';
  document.getElementById('modal-a-payer').textContent = eur(total);
  document.getElementById('bloc-especes').classList.toggle('hidden', mode !== 'especes');
  document.getElementById('montant-recu').value = '';
  updateRendu();
  document.getElementById('overlay-paiement').classList.remove('hidden');
  document.getElementById('btn-confirmer-paiement').disabled = mode === 'especes';
}

function closePaiement() {
  document.getElementById('overlay-paiement').classList.add('hidden');
  paiementMode = null;
}

function updateRendu() {
  const total = cartTotal();
  const recu = Number(document.getElementById('montant-recu').value) || 0;
  const rendu = recu - total;
  const row = document.getElementById('rendu-row');
  document.getElementById('rendu-valeur').textContent = eur(Math.abs(rendu));
  row.classList.toggle('negatif', rendu < 0);
  document.getElementById('btn-confirmer-paiement').disabled = paiementMode === 'especes' && recu < total;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('montant-recu').addEventListener('input', updateRendu);
  document.getElementById('overlay-paiement').addEventListener('click', (e) => {
    if (e.target.id === 'overlay-paiement') closePaiement();
  });
  document.getElementById('btn-annuler-paiement').addEventListener('click', closePaiement);
  document.querySelectorAll('.quick-amounts button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const total = cartTotal();
      const val = btn.dataset.exact === '1' ? total : Number(btn.dataset.amount);
      document.getElementById('montant-recu').value = val;
      updateRendu();
    });
  });
  document.getElementById('btn-confirmer-paiement').addEventListener('click', validerVente);
});

function validerVente() {
  const lines = cartLinesResolved();
  if (lines.length === 0) return;
  const total = cartTotal();
  const montantRecu = paiementMode === 'especes' ? Number(document.getElementById('montant-recu').value) || 0 : null;

  const sale = {
    id: uid(),
    dateISO: new Date().toISOString(),
    items: lines.map((l) => ({ productId: l.product.id, nom: l.product.nom, prixTTC: l.product.prixTTC, tauxTVA: l.product.tauxTVA, qty: l.qty })),
    remise: Number(state.remise) || 0,
    paymentMethod: paiementMode,
    montantRecu,
    total,
    voided: false,
    dirty: true,
  };

  state.sales.push(sale);
  state.cart = [];
  state.remise = 0;
  saveState();

  closePaiement();
  renderTicket();
  printTicketVente(sale);
  toast('Vente enregistrée · ticket envoyé à l’impression');
  requestSync();
}

/* ============================================================
   PRODUITS
   ============================================================ */

function renderProduits() {
  const wrap = document.getElementById('produits-liste');
  const empty = document.getElementById('produits-empty');

  const actifs = produitsActifs();

  if (actifs.length === 0) {
    wrap.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }
  wrap.classList.remove('hidden');
  empty.classList.add('hidden');

  const groupes = {};
  actifs.forEach((p) => {
    const cat = p.categorie || 'Autres';
    (groupes[cat] = groupes[cat] || []).push(p);
  });

  wrap.innerHTML = Object.keys(groupes)
    .sort()
    .map(
      (cat) => `
    <div class="produits-groupe">
      <h3>${escapeHtml(cat)}</h3>
      ${groupes[cat]
        .map(
          (p) => `
        <div class="produit-row" data-id="${p.id}">
          <span class="nom">${escapeHtml(p.nom)}</span>
          <span class="tva">TVA ${p.tauxTVA}%</span>
          <span class="prix">${eur(p.prixTTC)}</span>
          <button class="icon-btn edit" aria-label="Modifier">✎</button>
          <button class="icon-btn del" aria-label="Supprimer">🗑</button>
        </div>`
        )
        .join('')}
    </div>`
    )
    .join('');

  wrap.querySelectorAll('.produit-row').forEach((row) => {
    const id = row.dataset.id;
    row.querySelector('.edit').addEventListener('click', () => openProduitForm(id));
    row.querySelector('.del').addEventListener('click', () => {
      const p = state.products.find((pr) => pr.id === id);
      if (confirm(`Supprimer « ${p.nom} » du catalogue ?`)) {
        p.deleted = true;
        p.dirty = true;
        saveState();
        renderProduits();
        requestSync();
      }
    });
  });
}

let tauxSelectionne = TAUX_TVA[0];

function openProduitForm(id) {
  const p = id ? state.products.find((pr) => pr.id === id) : null;
  document.getElementById('produit-form-titre').textContent = p ? 'Modifier le produit' : 'Nouveau produit';
  document.getElementById('produit-id').value = p ? p.id : '';
  document.getElementById('produit-nom').value = p ? p.nom : '';
  document.getElementById('produit-categorie').value = p ? p.categorie || '' : '';
  document.getElementById('produit-prix').value = p ? p.prixTTC : '';
  tauxSelectionne = p ? p.tauxTVA : TAUX_TVA[0];
  renderTauxChoix();
  document.getElementById('overlay-produit').classList.remove('hidden');
  document.getElementById('produit-nom').focus();
}

function renderTauxChoix() {
  document.querySelectorAll('.taux-choix button').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.taux) === tauxSelectionne);
  });
}

function closeProduitForm() {
  document.getElementById('overlay-produit').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-nouveau-produit').addEventListener('click', () => openProduitForm(null));
  document.getElementById('btn-nouveau-produit-empty').addEventListener('click', () => openProduitForm(null));
  document.getElementById('overlay-produit').addEventListener('click', (e) => {
    if (e.target.id === 'overlay-produit') closeProduitForm();
  });
  document.getElementById('btn-annuler-produit').addEventListener('click', closeProduitForm);
  document.querySelectorAll('.taux-choix button').forEach((btn) => {
    btn.addEventListener('click', () => {
      tauxSelectionne = Number(btn.dataset.taux);
      renderTauxChoix();
    });
  });
  document.getElementById('form-produit').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('produit-id').value;
    const nom = document.getElementById('produit-nom').value.trim();
    const categorie = document.getElementById('produit-categorie').value.trim() || 'Autres';
    const prixTTC = Number(document.getElementById('produit-prix').value);
    if (!nom || !(prixTTC > 0)) return;

    if (id) {
      const p = state.products.find((pr) => pr.id === id);
      Object.assign(p, { nom, categorie, prixTTC, tauxTVA: tauxSelectionne, dirty: true });
    } else {
      state.products.push({ id: uid(), nom, categorie, prixTTC, tauxTVA: tauxSelectionne, deleted: false, dirty: true });
    }
    saveState();
    closeProduitForm();
    renderProduits();
    toast('Produit enregistré');
    requestSync();
  });
});

/* ============================================================
   RAPPORTS — Ticket Z (jour) / Ticket X (mois)
   ============================================================ */

let rapportMode = 'jour';
let rapportDate = todayISO();
let rapportMois = todayISO().slice(0, 7);

function salesForDay(dateStr) {
  return state.sales.filter((s) => isSameDay(s.dateISO, dateStr));
}
function salesForMonth(monthStr) {
  return state.sales.filter((s) => isSameMonth(s.dateISO, monthStr));
}

function computeAgregat(sales) {
  const valides = sales.filter((s) => !s.voided);
  const annulees = sales.filter((s) => s.voided);

  const parPaiement = { especes: { n: 0, total: 0 }, cb: { n: 0, total: 0 } };
  const parTVA = {};
  TAUX_TVA.forEach((t) => (parTVA[t] = { ttc: 0, ht: 0, tva: 0 }));

  let totalRemises = 0;
  let totalHT = 0;
  let totalTVA = 0;
  let totalTTC = 0;

  valides.forEach((s) => {
    parPaiement[s.paymentMethod].n += 1;
    parPaiement[s.paymentMethod].total += s.total;
    totalRemises += s.remise || 0;
    totalTTC += s.total;
    s.items.forEach((it) => {
      const itTTC = it.prixTTC * it.qty;
      const itHT = ht(itTTC, it.tauxTVA);
      const itTVA = itTTC - itHT;
      parTVA[it.tauxTVA].ttc += itTTC;
      parTVA[it.tauxTVA].ht += itHT;
      parTVA[it.tauxTVA].tva += itTVA;
      totalHT += itHT;
      totalTVA += itTVA;
    });
  });

  const totalAnnulations = annulees.reduce((s, v) => s + v.total, 0);

  return {
    commandes: valides.length,
    clients: valides.length,
    ticketMoyen: valides.length ? totalTTC / valides.length : 0,
    parPaiement,
    parTVA,
    totalHT,
    totalTVA,
    totalTTC,
    totalRemises,
    totalAnnulations,
    nbAnnulations: annulees.length,
  };
}

function renderRapports() {
  document.querySelectorAll('.rapport-toggle button').forEach((b) => b.classList.toggle('active', b.dataset.mode === rapportMode));
  document.getElementById('rapport-jour-picker').classList.toggle('hidden', rapportMode !== 'jour');
  document.getElementById('rapport-mois-picker').classList.toggle('hidden', rapportMode !== 'mois');
  document.getElementById('input-date-jour').value = rapportDate;
  document.getElementById('input-date-mois').value = rapportMois;

  const sales = rapportMode === 'jour' ? salesForDay(rapportDate) : salesForMonth(rapportMois);
  const agr = computeAgregat(sales);

  document.getElementById('rapport-titre').textContent =
    rapportMode === 'jour' ? `Journée du ${fmtDate(rapportDate)}` : `Mois de ${new Date(rapportMois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;

  document.getElementById('stat-commandes').textContent = agr.commandes;
  document.getElementById('stat-clients').textContent = agr.clients;
  document.getElementById('stat-moyen').textContent = eur(agr.ticketMoyen);
  document.getElementById('stat-total').textContent = eur(agr.totalTTC);

  document.getElementById('detail-paiements').innerHTML = `
    <div class="detail-row"><span>${agr.parPaiement.especes.n} · Espèces</span><span class="valeur">${eur(agr.parPaiement.especes.total)}</span></div>
    <div class="detail-row"><span>${agr.parPaiement.cb.n} · Carte bancaire</span><span class="valeur">${eur(agr.parPaiement.cb.total)}</span></div>
  `;

  document.getElementById('detail-tva').innerHTML =
    TAUX_TVA.map(
      (t) => `<div class="detail-row"><span>TVA ${t}%</span><span class="valeur">${eur(agr.parTVA[t].tva)} <span style="color:var(--encre-doux); font-weight:500;">(HT ${eur(agr.parTVA[t].ht)})</span></span></div>`
    ).join('') +
    `<div class="detail-row total"><span>Total HT</span><span class="valeur">${eur(agr.totalHT)}</span></div>
     <div class="detail-row total"><span>TOTAL TTC</span><span class="valeur">${eur(agr.totalTTC)}</span></div>`;

  document.getElementById('detail-remises').innerHTML = `
    <div class="detail-row"><span>Total remises</span><span class="valeur">${eur(agr.totalRemises)}</span></div>
    <div class="detail-row"><span>Annulations (${agr.nbAnnulations})</span><span class="valeur">${eur(agr.totalAnnulations)}</span></div>
  `;

  window._rapportCourant = { mode: rapportMode, sales, agr, label: rapportMode === 'jour' ? fmtDate(rapportDate) : rapportMois };
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.rapport-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      rapportMode = btn.dataset.mode;
      renderRapports();
    });
  });
  document.getElementById('input-date-jour').addEventListener('change', (e) => {
    rapportDate = e.target.value;
    renderRapports();
  });
  document.getElementById('input-date-mois').addEventListener('change', (e) => {
    rapportMois = e.target.value;
    renderRapports();
  });
  document.getElementById('btn-imprimer-rapport').addEventListener('click', () => {
    if (rapportMode === 'jour') printTicketZ(rapportDate);
    else printTicketX(rapportMois);
  });
});

/* ============================================================
   RÉGLAGES
   ============================================================ */

function renderReglages() {
  const s = state.settings;
  document.getElementById('reg-nom').value = s.nom;
  document.getElementById('reg-adresse').value = s.adresse;
  document.getElementById('reg-ville').value = s.ville;
  document.getElementById('reg-tva').value = s.tva;
  document.getElementById('reg-siret').value = s.siret;
  document.getElementById('reg-naf').value = s.naf;
  document.getElementById('reg-fond').value = s.fondCaisseInitial;

  document.getElementById('sync-url').value = syncConfig.apiUrl || '';
  document.getElementById('sync-key').value = syncConfig.apiKey || '';
  renderSyncStatus();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form-reglages').addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings = {
      nom: document.getElementById('reg-nom').value.trim(),
      adresse: document.getElementById('reg-adresse').value.trim(),
      ville: document.getElementById('reg-ville').value.trim(),
      tva: document.getElementById('reg-tva').value.trim(),
      siret: document.getElementById('reg-siret').value.trim(),
      naf: document.getElementById('reg-naf').value.trim(),
      fondCaisseInitial: Number(document.getElementById('reg-fond').value) || 0,
    };
    saveState();
    toast('Réglages enregistrés');
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `natirel-caisse-sauvegarde-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('input-import').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!confirm('Importer ces données remplacera le catalogue et l’historique actuels. Continuer ?')) return;
        state = Object.assign(defaultState(), data);
        saveState();
        renderVente();
        renderReglages();
        toast('Données importées');
      } catch (err) {
        alert('Fichier invalide.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('form-sync').addEventListener('submit', (e) => {
    e.preventDefault();
    syncConfig.apiUrl = document.getElementById('sync-url').value.trim();
    syncConfig.apiKey = document.getElementById('sync-key').value.trim();
    saveSyncConfig();
    toast('Identifiants de synchronisation enregistrés');
    requestSync(true);
  });

  document.getElementById('btn-sync-now').addEventListener('click', () => requestSync(true));
});

/* ============================================================
   SYNCHRONISATION — base de données distante (Hostinger MySQL)
   Les identifiants (URL + clé API) sont stockés à part, jamais dans
   l'export/import de sauvegarde, pour ne pas les exposer par erreur.
   ============================================================ */

const SYNC_KEY = 'natirel_caisse_sync_v1';

function loadSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? Object.assign({ apiUrl: '', apiKey: '', lastSync: null }, JSON.parse(raw)) : { apiUrl: '', apiKey: '', lastSync: null };
  } catch (e) {
    return { apiUrl: '', apiKey: '', lastSync: null };
  }
}
function saveSyncConfig() {
  localStorage.setItem(SYNC_KEY, JSON.stringify(syncConfig));
}

let syncConfig = loadSyncConfig();
let syncing = false;
let syncStatusState = 'idle'; // idle | sync | ok | erreur

function renderSyncStatus() {
  const dot = document.getElementById('sync-status-dot');
  const txt = document.getElementById('sync-status-text');
  if (!dot || !txt) return;
  dot.className = 'sync-dot ' + syncStatusState;
  if (syncStatusState === 'sync') {
    txt.textContent = 'Synchronisation en cours…';
  } else if (!syncConfig.apiUrl || !syncConfig.apiKey) {
    txt.textContent = 'Non configurée';
  } else if (syncStatusState === 'erreur') {
    txt.textContent = 'Échec — nouvel essai automatique. Dernière réussite : ' + (syncConfig.lastSync ? fmtDateTime(syncConfig.lastSync) : 'jamais');
  } else if (syncConfig.lastSync) {
    txt.textContent = 'Dernière synchronisation : ' + fmtDateTime(syncConfig.lastSync);
  } else {
    txt.textContent = 'Jamais synchronisé';
  }
}

function setSyncStatus(s) {
  syncStatusState = s;
  renderSyncStatus();
}

async function requestSync(manual) {
  if (!syncConfig.apiUrl || !syncConfig.apiKey) {
    if (manual) toast('Renseignez d’abord l’URL et la clé API de synchronisation.');
    return;
  }
  if (syncing) return;
  syncing = true;
  setSyncStatus('sync');

  const produitsAEnvoyer = state.products.filter((p) => p.dirty);
  const ventesAEnvoyer = state.sales.filter((s) => s.dirty);

  try {
    const res = await fetch(syncConfig.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': syncConfig.apiKey },
      body: JSON.stringify({
        produits: produitsAEnvoyer,
        ventes: ventesAEnvoyer,
        reglages: state.settings,
      }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    const idsProduitsEnvoyes = new Set(produitsAEnvoyer.map((p) => p.id));
    const idsVentesEnvoyees = new Set(ventesAEnvoyer.map((s) => s.id));

    (data.produits || []).forEach((serverP) => {
      const local = state.products.find((p) => p.id === serverP.id);
      if (!local) {
        state.products.push(Object.assign({}, serverP, { dirty: false }));
      } else if (!local.dirty || idsProduitsEnvoyes.has(local.id)) {
        Object.assign(local, serverP, { dirty: false });
      }
    });

    (data.ventes || []).forEach((serverS) => {
      const local = state.sales.find((s) => s.id === serverS.id);
      if (!local) {
        state.sales.push(Object.assign({}, serverS, { dirty: false }));
      } else if (!local.dirty || idsVentesEnvoyees.has(local.id)) {
        Object.assign(local, serverS, { dirty: false });
      }
    });

    if (data.reglages) {
      Object.assign(state.settings, data.reglages);
    }

    syncConfig.lastSync = data.serverTime || new Date().toISOString();
    saveSyncConfig();
    saveState();
    setSyncStatus('ok');
    if (manual) toast('Synchronisation réussie');
    if (document.getElementById('view-vente').classList.contains('active')) renderVente();
    if (document.getElementById('view-reglages').classList.contains('active')) renderReglages();
  } catch (err) {
    console.error('Erreur de synchronisation', err);
    setSyncStatus('erreur');
    if (manual) toast('Échec de la synchronisation — nouvel essai automatique plus tard');
  } finally {
    syncing = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  requestSync(false);
  setInterval(() => requestSync(false), 5 * 60 * 1000);
});

/* ============================================================
   Impression — ticket de vente / Ticket Z / Ticket X
   Rendu via une zone dédiée + window.print() (AirPrint depuis l'iPad).
   ============================================================ */

function enteteEntreprise() {
  const s = state.settings;
  return `
    <h1>${escapeHtml(s.nom)}</h1>
    <p class="p-center p-small">${escapeHtml(s.adresse)}</p>
    <p class="p-center p-small">${escapeHtml(s.ville)}</p>
  `;
}

function piedLegal() {
  const s = state.settings;
  return `
    <div class="p-rule"></div>
    <p class="p-center p-small">TVA : ${escapeHtml(s.tva)}</p>
    <p class="p-center p-small">SIRET : ${escapeHtml(s.siret)}</p>
    <p class="p-center p-small">NAF : ${escapeHtml(s.naf)}</p>
  `;
}

function printTicketVente(sale) {
  const area = document.getElementById('print-area');
  const linesHtml = sale.items
    .map(
      (it) => `
    <div class="p-item">
      <div class="p-row"><span>${it.qty} x ${escapeHtml(it.nom)}</span><span>${eur(it.prixTTC * it.qty)}</span></div>
      <div class="p-row p-small"><span>${eur(it.prixTTC)} / u · TVA ${it.tauxTVA}%</span><span></span></div>
    </div>`
    )
    .join('');

  const sousTotal = sale.items.reduce((s, it) => s + it.prixTTC * it.qty, 0);

  area.innerHTML = `
    ${enteteEntreprise()}
    <p class="p-center p-small">${fmtDateTime(sale.dateISO)}</p>
    <div class="p-rule"></div>
    ${linesHtml}
    <div class="p-rule"></div>
    ${sale.remise > 0 ? `<div class="p-row"><span>Sous-total</span><span>${eur(sousTotal)}</span></div><div class="p-row"><span>Remise</span><span>-${eur(sale.remise)}</span></div>` : ''}
    <div class="p-row p-total"><span>TOTAL</span><span>${eur(sale.total)}</span></div>
    <div class="p-row p-small"><span>Mode de paiement</span><span>${sale.paymentMethod === 'especes' ? 'Espèces' : 'Carte bancaire'}</span></div>
    ${
      sale.paymentMethod === 'especes'
        ? `<div class="p-row p-small"><span>Reçu</span><span>${eur(sale.montantRecu)}</span></div>
           <div class="p-row p-small"><span>Rendu</span><span>${eur(sale.montantRecu - sale.total)}</span></div>`
        : ''
    }
    ${piedLegal()}
    <p class="p-center p-small" style="margin-top:8px;">Merci de votre visite</p>
  `;
  window.print();
}

function printTicketZ(dateStr) {
  const sales = salesForDay(dateStr);
  const agr = computeAgregat(sales);
  const s = state.settings;
  const area = document.getElementById('print-area');

  area.innerHTML = `
    <h1>Ticket Z</h1>
    ${enteteEntreprise()}
    <div class="p-rule"></div>
    <div class="p-row p-small"><span>Date</span><span>${fmtDate(dateStr)}</span></div>
    <div class="p-row p-small"><span>Impression</span><span>${fmtDateTime(new Date())}</span></div>
    <div class="p-row"><span>Commandes</span><span>${agr.commandes}</span></div>
    <div class="p-row"><span>Clients</span><span>${agr.clients}</span></div>
    <div class="p-row"><span>Ticket moyen</span><span>${eur(agr.ticketMoyen)}</span></div>
    <div class="p-rule"></div>
    <p class="p-bold p-small">Paiements</p>
    <div class="p-row"><span>${agr.parPaiement.especes.n} Espèces</span><span>${eur(agr.parPaiement.especes.total)}</span></div>
    <div class="p-row"><span>${agr.parPaiement.cb.n} Carte Bancaire</span><span>${eur(agr.parPaiement.cb.total)}</span></div>
    <div class="p-rule"></div>
    <p class="p-bold p-small">TVA</p>
    ${TAUX_TVA.map((t) => `<div class="p-row p-small"><span>TVA ${t}%</span><span>${eur(agr.parTVA[t].ttc)} / ${eur(agr.parTVA[t].ht)} / ${eur(agr.parTVA[t].tva)}</span></div>`).join('')}
    <div class="p-row"><span>Total HT</span><span>${eur(agr.totalHT)}</span></div>
    <div class="p-rule"></div>
    <div class="p-row p-total"><span>TOTAL</span><span>${eur(agr.totalTTC)}</span></div>
    <div class="p-rule"></div>
    <p class="p-bold p-small">Remises / Annulations</p>
    <div class="p-row p-small"><span>Total remises</span><span>${eur(agr.totalRemises)}</span></div>
    <div class="p-row p-small"><span>Total annulations</span><span>${eur(agr.totalAnnulations)}</span></div>
    <div class="p-rule"></div>
    <div class="p-row p-small"><span>Fond de caisse initial</span><span>${eur(s.fondCaisseInitial)}</span></div>
    <div class="p-row p-small"><span>Fond de caisse final</span><span>${eur(s.fondCaisseInitial + agr.parPaiement.especes.total)}</span></div>
    ${piedLegal()}
  `;
  window.print();
}

function printTicketX(monthStr) {
  const sales = salesForMonth(monthStr);
  const agr = computeAgregat(sales);
  const s = state.settings;
  const area = document.getElementById('print-area');
  const joursTravailles = new Set(sales.filter((v) => !v.voided).map((v) => localDateStr(v.dateISO))).size;
  const libelleMois = new Date(monthStr + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  area.innerHTML = `
    <h1>Ticket X mensuel</h1>
    <p class="p-center p-bold">${escapeHtml(libelleMois)}</p>
    ${enteteEntreprise()}
    <div class="p-rule"></div>
    <div class="p-row p-small"><span>Date impression</span><span>${fmtDateTime(new Date())}</span></div>
    <div class="p-row p-small"><span>Jours travaillés</span><span>${joursTravailles}</span></div>
    <div class="p-row"><span>Commandes</span><span>${agr.commandes}</span></div>
    <div class="p-row"><span>Clients</span><span>${agr.clients}</span></div>
    <div class="p-row"><span>Ticket moyen</span><span>${eur(agr.ticketMoyen)}</span></div>
    <div class="p-rule"></div>
    <p class="p-bold p-small">Paiements</p>
    <div class="p-row"><span>${agr.parPaiement.especes.n} Espèces</span><span>${eur(agr.parPaiement.especes.total)}</span></div>
    <div class="p-row"><span>${agr.parPaiement.cb.n} Carte Bancaire</span><span>${eur(agr.parPaiement.cb.total)}</span></div>
    <div class="p-rule"></div>
    <p class="p-bold p-small">TVA</p>
    ${TAUX_TVA.map((t) => `<div class="p-row p-small"><span>TVA ${t}%</span><span>${eur(agr.parTVA[t].ttc)} / ${eur(agr.parTVA[t].ht)} / ${eur(agr.parTVA[t].tva)}</span></div>`).join('')}
    <div class="p-row"><span>Total HT</span><span>${eur(agr.totalHT)}</span></div>
    <div class="p-rule"></div>
    <div class="p-row p-total"><span>TOTAL TTC</span><span>${eur(agr.totalTTC)}</span></div>
    <div class="p-row p-total"><span>TOTAL POUR ${escapeHtml(libelleMois.toUpperCase())}</span><span>${eur(agr.totalTTC)}</span></div>
    <div class="p-rule"></div>
    <p class="p-bold p-small">Remises / Annulations</p>
    <div class="p-row p-small"><span>Total remises</span><span>${eur(agr.totalRemises)}</span></div>
    <div class="p-row p-small"><span>Total annulations</span><span>${eur(agr.totalAnnulations)}</span></div>
    ${piedLegal()}
  `;
  window.print();
}

/* ---------------------------- Échappement HTML ---------------------------- */

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}

/* ============================================================
   Horloge + init
   ============================================================ */

function tickClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

document.addEventListener('DOMContentLoaded', () => {
  views.forEach((v) => {
    document.getElementById('tab-' + v).addEventListener('click', () => switchView(v));
  });
  tickClock();
  setInterval(tickClock, 15000);
  renderVente();
});
