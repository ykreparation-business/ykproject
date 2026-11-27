// Modèle central du simulateur : état, actions métier, permissions, journal d'audit chaîné, simulation du temps.
import { DAY, HOUR, makeRand, toEURMinor, isoDate, startOfDayUTC, pad, fmtMoney, CURRENCIES } from './util.js';
import { generateDataset, START_CLOCK, ROLES, USERS, PERMISSIONS, CHANNELS, ORG_TYPES } from './data.js';
import { evaluateContact, jurisdictionState, VALIDATION_LEVELS } from './legal.js';
import { generateMessage, summarizeCase } from './ai.js';
import { sha256 } from './sha256.js';

export class PermissionError extends Error {
  constructor(perm, user) { super(`Action refusée : ${user.name} (${ROLES[user.role].label}) ne dispose pas de la permission « ${PERMISSIONS[perm] || perm} ».`); this.perm = perm; }
}
export class BusinessError extends Error {}

const AUDIT_CAP = 20000;
const COMMS_CAP = 40000;

export class Model {
  constructor(seed = 20261127) { this.reset(seed); }

  reset(seed = this.seed || 20261127) {
    this.seed = seed;
    this.R = makeRand(seed ^ 0x5eed);
    const d = generateDataset(seed, START_CLOCK);
    Object.assign(this, d);
    this.clock = START_CLOCK;
    this.killSwitch = false;
    this.paused = false;
    this.currentUserId = 'u1';
    this.users = USERS.map(u => ({ ...u, active: true, sessions: 1 }));
    this.breakGlass = [];
    this.bankRequests = [];
    this.publicTitles = [];
    this.apiKeys = [{ id: 'key_1', label: 'Clé sandbox par défaut', prefix: 'titan_test_', last4: 'a1f9', createdAt: START_CLOCK - 20 * DAY, revoked: false }];
    this.webhooks = [{ id: 'wh_1', url: 'https://exemple.invalid/webhooks/titan', events: ['payment.succeeded', 'case.disputed'], active: true }];
    this.integrationLog = [];
    this.aiReviews = [];
    this.regAlertsAck = new Set();
    this.agents = [
      { id: 'planner', name: 'Agent Relances', enabled: true, actions: 0, desc: 'Examine les dossiers chaque jour et propose les relances au moteur juridique.' },
      { id: 'docs', name: 'Agent Analyse documentaire', enabled: true, actions: 0, desc: 'Extrait et contrôle les pièces importées (données non fiables).' },
      { id: 'voice', name: 'Agent Vocal', enabled: true, actions: 0, desc: 'Conduit des appels simulés, annonce sa nature automatisée.' },
      { id: 'fraud', name: 'Agent Fraude', enabled: true, actions: 0, desc: 'Signale des anomalies, sans jamais conclure à une fraude.' },
      { id: 'reporter', name: 'Agent Rapports', enabled: true, actions: 0, desc: 'Rédige des synthèses explicatives à valider.' },
    ];
    this.stats = { sent: 0, blocked: 0, byChannel: {}, blockReasons: {}, autoCancelled: 0, simDays: 0, calls: 0 };
    this.notifications = [];
    this.index();
    this.contactsByDebtor = new Map();
    for (const m of this.comms) if (m.status === 'envoyé') { this.pushContact(m.debtorId, m.at); const c = this.caseById.get(m.caseId); c.sentCount = (c.sentCount || 0) + 1; }
    this.audit = [];
    this.auditAnchor = { seq: 0, hash: '0'.repeat(64) };
    this.detectFraud(true);
    this.log('système', 'init', 'plateforme', `Initialisation du simulateur (graine ${seed}) — ${this.cases.length} dossiers fictifs`);
    this.version = (this.version || 0) + 1;
  }

  index() {
    this.caseById = new Map(this.cases.map(c => [c.id, c]));
    this.debtorById = new Map(this.debtors.map(d => [d.id, d]));
    this.orgById = new Map(this.orgs.map(o => [o.id, o]));
    this.jurByCode = new Map(this.jurisdictions.map(j => [j.code, j]));
  }
  pushContact(debtorId, at) {
    let a = this.contactsByDebtor.get(debtorId);
    if (!a) { a = []; this.contactsByDebtor.set(debtorId, a); }
    a.push(at);
    if (a.length > 40) a.splice(0, a.length - 40);
  }

  /* ----------------------------- Identité ----------------------------- */
  get user() { return this.users.find(u => u.id === this.currentUserId); }
  userById(id) { return this.users.find(u => u.id === id) || { id, name: id, role: 'superadmin' }; }
  can(perm, userId = this.currentUserId) {
    const u = this.users.find(x => x.id === userId);
    if (!u || !u.active) return false;
    if (ROLES[u.role].perms.includes(perm)) return true;
    if (perm === 'pii.read') return this.breakGlass.some(b => b.userId === u.id && b.status === 'actif' && b.expiresAt > Date.now());
    return false;
  }
  require(perm) {
    if (!this.can(perm)) {
      this.log(this.currentUserId, 'accès refusé', perm, `Tentative refusée : permission « ${PERMISSIONS[perm] || perm} » absente`, 'refus');
      throw new PermissionError(perm, this.user);
    }
  }
  setUser(id) { const prev = this.currentUserId; this.currentUserId = id; this.log(id, 'changement de session', 'utilisateur', `Session ouverte (simulée) — précédent : ${prev}`); this.bump(); }
  asUser(id, fn) { const prev = this.currentUserId; this.currentUserId = id; try { return fn(); } finally { this.currentUserId = prev; } }

  /* ------------------------- Journal d'audit ------------------------- */
  log(actor, action, target, detail, level = 'info') {
    const prev = this.audit.length ? this.audit[this.audit.length - 1].hash : this.auditAnchor.hash;
    const seq = (this.audit.length ? this.audit[this.audit.length - 1].seq : this.auditAnchor.seq) + 1;
    const u = this.users?.find(x => x.id === actor);
    const e = { seq, at: this.clock, real: Date.now(), actor, role: u ? u.role : actor, action, target, detail, level, prev };
    e.hash = sha256(auditPayload(e));
    this.audit.push(e);
    if (this.audit.length > AUDIT_CAP) {
      const cut = this.audit.splice(0, this.audit.length - AUDIT_CAP);
      this.auditAnchor = { seq: cut[cut.length - 1].seq, hash: cut[cut.length - 1].hash };
    }
    return e;
  }
  verifyAudit() {
    let prev = this.auditAnchor.hash;
    for (const e of this.audit) {
      if (e.prev !== prev) return { ok: false, at: e.seq, reason: 'Rupture de chaînage (empreinte précédente différente)' };
      if (sha256(auditPayload(e)) !== e.hash) return { ok: false, at: e.seq, reason: 'Contenu modifié (empreinte recalculée différente)' };
      prev = e.hash;
    }
    return { ok: true, count: this.audit.length, anchor: this.auditAnchor };
  }
  tamperAuditDemo() {
    const e = this.audit[Math.max(0, this.audit.length - 5)];
    if (e) e.detail = e.detail + ' [MODIFIÉ FRAUDULEUSEMENT — démonstration]';
    return e?.seq;
  }
  repairAuditDemo() {
    // Ne « répare » pas la chaîne : la reconstruit depuis l'ancre et consigne l'opération, comme le ferait une restauration depuis sauvegarde.
    for (const e of this.audit) e.detail = e.detail.replace(' [MODIFIÉ FRAUDULEUSEMENT — démonstration]', '');
    this.log(this.currentUserId, 'restauration', 'journal', 'Restauration du journal depuis la sauvegarde simulée après test d’altération', 'alerte');
  }
  bump() { this.version++; }
  notify(text, tone = 'info') { this.notifications.unshift({ id: Math.random().toString(36).slice(2), text, tone, at: this.clock }); this.notifications.length = Math.min(this.notifications.length, 50); }

  /* ----------------------------- Dossiers ----------------------------- */
  balance(c) { return c.principalMinor + c.feesMinor - c.paidMinor; }
  event(c, type, text, actor = this.currentUserId) { c.events.push({ at: this.clock, type, text, actor }); }

  createCase(input) {
    this.require('case.create');
    const org = this.orgById.get(input.orgId);
    if (!org) throw new BusinessError('Choisissez une organisation créancière.');
    if (org.status !== 'actif') throw new BusinessError('Cette organisation est suspendue : création impossible.');
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new BusinessError('Le montant doit être un nombre positif.');
    if (!input.debtorName?.trim()) throw new BusinessError('Indiquez le nom du débiteur (fictif).');
    if (!input.invoiceNo?.trim()) throw new BusinessError('Indiquez le numéro de facture.');
    const due = Date.parse(input.dueDate + 'T00:00:00Z');
    if (!Number.isFinite(due)) throw new BusinessError('Date d’échéance invalide.');
    const country = input.country || org.jurisdiction;
    const n = this.debtors.length + 1;
    const debtor = {
      id: 'DEB-' + pad(n, 4), name: input.debtorName.trim(), kind: input.debtorKind || 'particulier', country,
      email: `debiteur-${pad(n, 4)}@exemple.invalid`, phone: `+00 000 ${pad(n, 4)}`,
      identity: input.identityVerified === false ? 'non vérifiée' : 'vérifiée',
      consents: { email: true, sms: !!input.consentSms, whatsapp: false, call: !!input.consentCall },
      behavior: 0.5, portalCode: String(100000 + (n * 37) % 899999).slice(0, 6), language: this.jurByCode.get(country)?.locale || 'fr-FR',
    };
    this.debtors.push(debtor); this.debtorById.set(debtor.id, debtor);
    const dup = this.cases.find(c => c.orgId === org.id && c.invoiceNo === input.invoiceNo.trim());
    const id = 'CR-2026-' + pad(this.cases.length + 1, 5);
    const c = {
      id, orgId: org.id, debtorId: debtor.id, jurisdiction: country, debtType: input.debtType || ORG_TYPES[org.type].debt, currency: org.currency,
      principalMinor: Math.round(amount * 10 ** CURRENCIES[org.currency].dec), feesMinor: 0, paidMinor: 0,
      issueDate: due - 30 * DAY, dueDate: due, invoiceNo: input.invoiceNo.trim(), status: 'nouveau',
      documents: { facture: input.hasInvoice !== false, contrat: !!input.hasContract, bonLivraison: !!input.hasDelivery, preuveRelance: false },
      flags: { hardship: false, vulnerable: false, crossBorderReviewed: country === org.jurisdiction },
      promise: null, plan: null, dispute: null, nextActionAt: this.clock + DAY, lastContactAt: null, assignedTo: this.currentUserId,
      createdAt: this.clock, events: [], source: 'Créé dans le simulateur',
    };
    this.event(c, 'création', 'Dossier créé via le formulaire guidé');
    this.cases.push(c); this.caseById.set(id, c);
    this.log(this.currentUserId, 'création dossier', id, `Créance ${c.invoiceNo} — ${fmtMoney(c.principalMinor, c.currency)}`);
    if (dup) this.addFraud('duplicate', id, `Numéro de facture ${c.invoiceNo} déjà présent (${dup.id}) pour la même organisation.`, 'moyenne');
    this.bump();
    return c;
  }

  setStatus(c, status, why) {
    const old = c.status; c.status = status;
    this.event(c, 'statut', `${old} → ${status}${why ? ' : ' + why : ''}`);
  }

  /** Tente une relance. Le moteur juridique décide ; l'IA ne peut pas contourner. */
  attemptContact(caseId, channel, opts = {}) {
    const automated = opts.automated !== false;
    if (!automated) this.require('case.remind');
    const c = this.caseById.get(caseId);
    if (!c) throw new BusinessError('Dossier introuvable.');
    const at = opts.at ?? this.clock;
    const verdict = evaluateContact(this, c, channel, at, { automated });
    const msg = verdict.allowed ? generateMessage(this, c, channel, opts.tone || (c.lastContactAt ? 'firm' : 'soft')) : null;
    if (msg && !msg.guard.ok) { verdict.allowed = false; verdict.blockers.push('Message refusé par le garde-fou de ton : ' + msg.guard.hits.join(', ')); }
    this.stats.byChannel[channel] = this.stats.byChannel[channel] || { sent: 0, blocked: 0, converted: 0 };
    const id = 'COM-' + pad(++this.counters.commN, 6);
    const comm = { id, caseId, debtorId: c.debtorId, channel, at, status: verdict.allowed ? 'envoyé' : 'bloqué', automated, reasons: verdict.blockers, summary: msg ? msg.text.split('\n')[1]?.slice(0, 140) || msg.text.slice(0, 140) : verdict.blockers[0], text: msg?.text, lang: msg?.lang };
    this.comms.push(comm);
    if (this.comms.length > COMMS_CAP) this.comms.splice(0, this.comms.length - COMMS_CAP);
    if (verdict.allowed) {
      this.stats.sent++; this.stats.byChannel[channel].sent++;
      this.pushContact(c.debtorId, at);
      c.lastContactAt = at;
      c.sentCount = (c.sentCount || 0) + 1;
      this.event(c, 'communication', `${CHANNELS[channel].label} envoyé (simulé, aucun envoi réel)`, automated ? 'agent:planner' : this.currentUserId);
      if (automated) this.agents.find(a => a.id === (channel === 'call' ? 'voice' : 'planner')).actions++;
    } else {
      this.stats.blocked++; this.stats.byChannel[channel].blocked++;
      for (const ch of verdict.checks.filter(x => !x.ok)) this.stats.blockReasons[ch.label] = (this.stats.blockReasons[ch.label] || 0) + 1;
      this.event(c, 'blocage', `${CHANNELS[channel].label} bloqué : ${verdict.blockers[0]}`, 'moteur juridique');
    }
    this.log(automated ? 'agent:planner' : this.currentUserId, verdict.allowed ? 'communication envoyée (simulée)' : 'communication bloquée', caseId, `${CHANNELS[channel].label} — ${verdict.allowed ? 'autorisée par le moteur juridique' : verdict.blockers.join(' | ')}`, verdict.allowed ? 'info' : 'blocage');
    if (!opts.silent) this.bump();
    return { comm, verdict, msg };
  }

  recordPayment(caseId, amountMinor, method = 'carte', opts = {}) {
    if (!opts.byDebtor) this.require('case.pay.record');
    const c = this.caseById.get(caseId);
    if (!c) throw new BusinessError('Dossier introuvable.');
    const bal = this.balance(c);
    amountMinor = Math.round(amountMinor);
    if (!(amountMinor > 0)) throw new BusinessError('Le montant doit être supérieur à zéro.');
    if (amountMinor > bal) throw new BusinessError(`Le montant dépasse le solde restant (${fmtMoney(bal, c.currency)}).`);
    if (['paye', 'clos'].includes(c.status)) throw new BusinessError('Ce dossier est déjà soldé.');
    const n = ++this.counters.payN;
    const p = { id: 'PAY-' + pad(n, 6), caseId, amountMinor, currency: c.currency, at: opts.at ?? this.clock, method, status: 'confirmé (simulé)', reconciled: true, receipt: 'REC-' + pad(n, 6), payee: c.orgId };
    this.payments.push(p);
    c.paidMinor += amountMinor;
    this.event(c, 'paiement', `Paiement simulé ${fmtMoney(amountMinor, c.currency)} (${method}) — fonds dirigés vers le créancier`, opts.byDebtor ? 'débiteur' : this.currentUserId);
    if (c.plan) {
      let left = amountMinor;
      for (const i of c.plan.installments) { if (!i.paid && left >= i.amountMinor) { i.paid = true; left -= i.amountMinor; } }
    }
    let cancelled = 0;
    if (this.balance(c) === 0) {
      if (c.nextActionAt) cancelled++;
      if (c.plan) cancelled += c.plan.installments.filter(i => !i.paid).length;
      c.nextActionAt = null; c.promise = null;
      this.setStatus(c, 'paye', 'paiement intégral');
      this.stats.autoCancelled += cancelled;
      this.event(c, 'annulation', `Relances restantes annulées automatiquement (${cancelled})`, 'système');
    } else if (c.status === 'nouveau') this.setStatus(c, 'actif', 'paiement partiel');
    this.log(opts.byDebtor ? 'débiteur' : (opts.actor || this.currentUserId), 'paiement simulé', caseId, `${fmtMoney(amountMinor, c.currency)} via ${method} — reçu ${p.receipt}${this.balance(c) === 0 ? ' — dette soldée, relances annulées' : ''}`);
    this.webhookEvent('payment.succeeded', { case: caseId, amount: amountMinor, currency: c.currency });
    if (!opts.silent) this.bump();
    return p;
  }

  refund(paymentId, reason) {
    this.require('case.pay.record');
    const p = this.payments.find(x => x.id === paymentId);
    if (!p || p.status !== 'confirmé (simulé)') throw new BusinessError('Paiement introuvable ou déjà remboursé.');
    if (!reason?.trim()) throw new BusinessError('Un motif de remboursement est obligatoire.');
    const c = this.caseById.get(p.caseId);
    p.status = 'remboursé (simulé)';
    c.paidMinor -= p.amountMinor;
    if (c.status === 'paye') this.setStatus(c, 'actif', 'remboursement');
    this.event(c, 'remboursement', `Remboursement simulé ${fmtMoney(p.amountMinor, c.currency)} : ${reason}`);
    this.log(this.currentUserId, 'remboursement simulé', p.caseId, `${p.id} — ${reason}`, 'alerte');
    this.bump();
  }

  openDispute(caseId, reason, by = 'débiteur') {
    const c = this.caseById.get(caseId);
    if (!c) throw new BusinessError('Dossier introuvable.');
    if (['paye', 'clos'].includes(c.status)) throw new BusinessError('Un dossier soldé ne peut pas être contesté ici ; contactez un interlocuteur humain.');
    c.dispute = { at: this.clock, reason: reason || 'Motif non précisé', by, state: 'ouverte' };
    c.nextActionAt = null;
    this.setStatus(c, 'conteste', 'contestation reçue');
    this.event(c, 'contestation', `Contestation (${by}) : ${c.dispute.reason}. Relances suspendues automatiquement.`, by);
    this.log(by === 'débiteur' ? 'débiteur' : this.currentUserId, 'contestation', caseId, `${c.dispute.reason} — relances suspendues, revue humaine requise`, 'alerte');
    this.webhookEvent('case.disputed', { case: caseId });
    this.bump();
  }
  resolveDispute(caseId, outcome) {
    this.require('case.dispute.handle');
    const c = this.caseById.get(caseId);
    if (!c?.dispute) throw new BusinessError('Aucune contestation ouverte.');
    c.dispute.state = outcome;
    c.dispute.resolvedBy = this.currentUserId;
    if (outcome === 'annulée') { c.feesMinor = 0; c.principalMinor = c.paidMinor; this.setStatus(c, 'clos', 'créance annulée après contestation'); }
    else if (outcome === 'corrigée') { c.feesMinor = 0; this.setStatus(c, 'actif', 'montant corrigé (frais retirés)'); c.nextActionAt = this.clock + 3 * DAY; }
    else { this.setStatus(c, 'actif', 'créance maintenue après examen humain'); c.nextActionAt = this.clock + 3 * DAY; }
    this.log(this.currentUserId, 'décision contestation', caseId, `Issue : ${outcome}`);
    this.bump();
  }

  createPlan(caseId, n, opts = {}) {
    if (!opts.byDebtor) this.require('case.edit');
    const c = this.caseById.get(caseId);
    if (!c) throw new BusinessError('Dossier introuvable.');
    if (['paye', 'clos', 'conteste'].includes(c.status)) throw new BusinessError(`Échéancier impossible : dossier ${c.status}.`);
    n = Math.round(n);
    if (n < 2 || n > 24) throw new BusinessError('Le nombre d’échéances doit être compris entre 2 et 24.');
    const bal = this.balance(c);
    const per = Math.floor(bal / n);
    const start = startOfDayUTC(this.clock) + 7 * DAY;
    c.plan = { installments: Array.from({ length: n }, (_, k) => ({ due: start + k * 30 * DAY, amountMinor: k === n - 1 ? bal - per * (n - 1) : per, paid: false })), createdAt: this.clock, approvedBy: opts.byDebtor ? 'demande débiteur (auto-acceptée, plafond démo 24 mois)' : this.currentUserId };
    c.nextActionAt = null; c.promise = null;
    this.setStatus(c, 'echeancier', `${n} échéances`);
    this.log(opts.byDebtor ? 'débiteur' : this.currentUserId, 'échéancier', caseId, `${n} échéances de ${fmtMoney(per, c.currency)}`);
    this.bump();
    return c.plan;
  }
  recordPromise(caseId, days, by = 'débiteur') {
    const c = this.caseById.get(caseId);
    if (!c || ['paye', 'clos', 'conteste'].includes(c.status)) throw new BusinessError('Promesse impossible pour ce dossier.');
    c.promise = { date: startOfDayUTC(this.clock) + days * DAY, amountMinor: this.balance(c), createdAt: this.clock };
    c.nextActionAt = c.promise.date + DAY;
    this.setStatus(c, 'promesse', `paiement promis sous ${days} j`);
    this.log(by, 'promesse de paiement', caseId, `Échéance promise ${isoDate(c.promise.date)}`);
    this.bump();
  }
  suspendCase(caseId, why) { this.require('case.edit'); const c = this.caseById.get(caseId); c.nextActionAt = null; this.setStatus(c, 'suspendu', why || 'suspension manuelle'); this.log(this.currentUserId, 'suspension', caseId, why || 'suspension manuelle'); this.bump(); }
  releaseHumanQueue(caseId, note) { this.require('case.edit'); const c = this.caseById.get(caseId); c.humanQueue = null; c.nextActionAt = this.clock + DAY; this.event(c, 'revue humaine', note || 'Revue humaine effectuée, dossier remis dans le circuit'); this.log(this.currentUserId, 'revue humaine', caseId, note || ''); this.bump(); }
  resumeCase(caseId) { this.require('case.edit'); const c = this.caseById.get(caseId); if (c.status !== 'suspendu') throw new BusinessError('Seul un dossier suspendu peut être repris.'); this.setStatus(c, 'actif', 'reprise'); c.nextActionAt = this.clock + DAY; this.log(this.currentUserId, 'reprise', caseId, 'Reprise du dossier'); this.bump(); }
  setFlag(caseId, flag, value) { this.require('case.edit'); const c = this.caseById.get(caseId); c.flags[flag] = value; this.event(c, 'indicateur', `${flag} = ${value}`); this.log(this.currentUserId, 'indicateur dossier', caseId, `${flag} = ${value}`); this.bump(); }
  setDocument(caseId, doc, value) { this.require('case.edit'); const c = this.caseById.get(caseId); c.documents[doc] = value; this.event(c, 'pièce', `${doc} ${value ? 'ajouté' : 'retiré'}`); this.log(this.currentUserId, 'pièce justificative', caseId, `${doc} = ${value}`); this.bump(); }
  setIdentity(debtorId, value) { this.require('case.edit'); const d = this.debtorById.get(debtorId); d.identity = value; this.log(this.currentUserId, 'identité débiteur', debtorId, `Identité : ${value}`); this.bump(); }

  /* ------------------------- Pilotage & sécurité ------------------------- */
  setKillSwitch(on, why) {
    this.require('killswitch');
    this.killSwitch = on;
    this.log(this.currentUserId, on ? 'ARRÊT D’URGENCE' : 'levée arrêt d’urgence', 'automatisations', why || (on ? 'Toutes les automatisations sont stoppées' : 'Reprise contrôlée des automatisations'), 'alerte');
    this.notify(on ? 'Arrêt d’urgence activé : aucune communication automatisée ne peut partir.' : 'Arrêt d’urgence levé.', on ? 'danger' : 'ok');
    this.bump();
  }
  setPaused(on) { this.require('sim.run'); this.paused = on; this.log(this.currentUserId, on ? 'pause automatisations' : 'reprise automatisations', 'automatisations', ''); this.bump(); }
  setAgent(id, enabled) { this.require('admin.users'); const a = this.agents.find(x => x.id === id); a.enabled = enabled; this.log(this.currentUserId, enabled ? 'agent activé' : 'agent désactivé', id, a.name, 'alerte'); this.bump(); }
  setOrgStatus(orgId, status, why) {
    this.require('admin.orgs');
    const o = this.orgById.get(orgId); o.status = status;
    this.log(this.currentUserId, status === 'suspendu' ? 'suspension organisation' : 'réactivation organisation', orgId, why || '', 'alerte');
    this.bump();
  }
  setUserActive(userId, active) {
    this.require('admin.users');
    if (userId === this.currentUserId && !active) throw new BusinessError('Vous ne pouvez pas révoquer votre propre session.');
    const u = this.users.find(x => x.id === userId); u.active = active; u.sessions = active ? 1 : 0;
    this.log(this.currentUserId, active ? 'réactivation accès' : 'révocation immédiate', userId, u.name, 'alerte');
    this.bump();
  }
  incidentAction(id, status) {
    this.require('security.manage');
    const i = this.incidents.find(x => x.id === id); const old = i.status; i.status = status;
    this.log(this.currentUserId, 'incident', id, `${old} → ${status}`, 'alerte');
    this.bump();
  }
  raiseIncident(title, severity, category, source) {
    const id = 'INC-' + pad(100 + this.incidents.length + 1, 4);
    this.incidents.unshift({ id, title, severity, category, status: 'nouveau', at: this.clock, source });
    this.log('système', 'incident détecté', id, title, 'alerte');
    this.notify(`Incident ${id} : ${title}`, 'danger');
    return id;
  }

  /* --------------------------- Accès exceptionnel --------------------------- */
  requestBreakGlass(justification, minutes) {
    this.require('breakglass.request');
    if (!justification || justification.trim().length < 20) throw new BusinessError('La justification doit comporter au moins 20 caractères.');
    if (!(minutes >= 5 && minutes <= 60)) throw new BusinessError('Durée autorisée : 5 à 60 minutes.');
    const b = { id: 'BG-' + pad(this.breakGlass.length + 1, 3), userId: this.currentUserId, justification: justification.trim(), minutes, status: 'en attente', requestedAt: Date.now(), expiresAt: 0, approver: null };
    this.breakGlass.unshift(b);
    this.log(this.currentUserId, 'demande accès exceptionnel', b.id, `${minutes} min — ${b.justification}`, 'alerte');
    this.bump();
    return b;
  }
  decideBreakGlass(id, approve) {
    this.require('breakglass.approve');
    const b = this.breakGlass.find(x => x.id === id);
    if (!b || b.status !== 'en attente') throw new BusinessError('Demande introuvable ou déjà traitée.');
    if (b.userId === this.currentUserId) throw new BusinessError('Contrôle indépendant : le demandeur ne peut pas approuver sa propre demande.');
    b.status = approve ? 'actif' : 'refusé'; b.approver = this.currentUserId;
    if (approve) b.expiresAt = Date.now() + b.minutes * 60000;
    this.log(this.currentUserId, approve ? 'accès exceptionnel approuvé' : 'accès exceptionnel refusé', id, `Demandeur ${b.userId}`, 'alerte');
    this.bump();
  }
  revealPII(debtorId) {
    this.require('pii.read');
    const viaBG = !ROLES[this.user.role].perms.includes('pii.read');
    this.log(this.currentUserId, 'consultation données personnelles', debtorId, viaBG ? 'Via accès exceptionnel (journalisé)' : 'Accès habituel au titre du rôle', viaBG ? 'alerte' : 'info');
    this.bump();
    return this.debtorById.get(debtorId);
  }

  /* ------------------------------ Juridique ------------------------------ */
  validateJurisdiction(code, level) {
    this.require('legal.validate');
    const lvl = VALIDATION_LEVELS.find(l => l.key === level);
    const u = this.user;
    if (u.role !== lvl.role) throw new BusinessError(`${lvl.label} doit être signé par le rôle « ${ROLES[lvl.role].label} ».`);
    const j = this.jurByCode.get(code);
    const signedByMe = Object.values(j.validations).some(v => v && v.by === u.id);
    if (signedByMe) throw new BusinessError('Séparation des fonctions : un même utilisateur ne peut signer qu’un seul niveau.');
    if (level !== 'juriste' && !j.validations.juriste) throw new BusinessError('Le niveau 1 (juriste) doit être signé en premier.');
    if (level === 'direction' && !j.validations.conformite) throw new BusinessError('Le niveau 2 (conformité) doit précéder le niveau 3.');
    j.validations[level] = { by: u.id, date: isoDate(this.clock) };
    const st = jurisdictionState(j, this.clock);
    if (Object.values(j.validations).every(Boolean)) {
      const act = st.ruleset; if (act && act.status !== 'validé' && Object.values(j.validations).every(Boolean)) { act.status = 'validé'; act.history.push({ date: isoDate(this.clock), by: u.id, change: 'Validation à trois niveaux complète' }); }
    }
    this.log(u.id, 'validation juridiction', code, lvl.label);
    this.bump();
  }
  editRule(code, param, value, note) {
    this.require('legal.edit');
    const j = this.jurByCode.get(code);
    const st = jurisdictionState(j, this.clock);
    const base = st.ruleset || j.rulesets[j.rulesets.length - 1];
    const [maj, min] = base.version.split('.').map(x => parseInt(x, 10) || 0);
    const version = `${maj}.${min + 1}.0`;
    const today = isoDate(this.clock);
    // L'ancienne version expire la veille ; la nouvelle est un brouillon à revalider.
    const yesterday = isoDate(this.clock - DAY);
    j.rulesets.forEach(r => { if (!r.effectiveTo || r.effectiveTo >= today) r.effectiveTo = yesterday; });
    const nr = { ...base, id: `${code}-v${version}`, version, effectiveFrom: today, effectiveTo: null, status: 'brouillon', params: { ...base.params, [param]: value }, history: [...base.history, { date: today, by: this.currentUserId, change: `${param} modifié → ${JSON.stringify(value)}${note ? ' — ' + note : ''}` }], source: base.source.replace(/v[\d.]+/, 'v' + version) };
    j.rulesets.push(nr);
    j.validations = { juriste: null, conformite: null, direction: null };
    this.log(this.currentUserId, 'modification règle', code, `${param} → ${JSON.stringify(value)} : nouvelle version ${version} en brouillon, validations réinitialisées`, 'alerte');
    this.notify(`${j.name} : nouvelle version ${version} en brouillon. Les relances y sont bloquées jusqu’à revalidation.`, 'warn');
    this.bump();
  }
  regulatoryAlerts() {
    const out = [];
    for (const j of this.jurisdictions) {
      const st = jurisdictionState(j, this.clock);
      st.issues.forEach((t, k) => out.push({ id: `REG-${j.code}-${k}`, jur: j.code, level: 'critique', text: `${j.name} : ${t}. Actions bloquées automatiquement.` }));
      if (st.ok && Date.parse(st.ruleset.reviewDate) < this.clock) out.push({ id: `REG-${j.code}-rev`, jur: j.code, level: 'attention', text: `${j.name} : date de révision ${st.ruleset.reviewDate} dépassée — revue juridique à planifier.` });
      else if (st.ok && st.reviewSoon) out.push({ id: `REG-${j.code}-rev`, jur: j.code, level: 'attention', text: `${j.name} : date de révision ${st.ruleset.reviewDate} dans moins de 60 jours.` });
    }
    const near = this.cases.filter(c => !['paye', 'clos'].includes(c.status) && (() => { const j = this.jurByCode.get(c.jurisdiction); const p = (jurisdictionState(j, this.clock).ruleset || j.rulesets[0]).params; const end = c.dueDate + p.prescriptionYears * 365 * DAY; return end > this.clock && end - this.clock < 180 * DAY; })());
    if (near.length) out.push({ id: 'REG-presc', level: 'attention', text: `${near.length} dossier(s) atteindront le délai de prescription de démonstration dans moins de 6 mois.` });
    const presc = this.cases.filter(c => !['paye', 'clos'].includes(c.status) && (() => { const j = this.jurByCode.get(c.jurisdiction); const p = (jurisdictionState(j, this.clock).ruleset || j.rulesets[0]).params; return c.dueDate + p.prescriptionYears * 365 * DAY < this.clock; })());
    if (presc.length) out.push({ id: 'REG-presc-past', level: 'critique', text: `${presc.length} dossier(s) au-delà du délai de prescription de démonstration : toute relance est bloquée.` });
    return out.map(a => ({ ...a, ack: this.regAlertsAck.has(a.id) }));
  }

  /* ------------------------------- Fraude ------------------------------- */
  addFraud(kind, ref, text, severity = 'moyenne') {
    const id = 'FRD-' + pad(this.fraudAlerts.length + 1, 4);
    this.fraudAlerts.unshift({ id, kind, ref, text, severity, status: 'nouveau', at: this.clock, notes: [] });
    this.agents.find(a => a.id === 'fraud').actions++;
    return id;
  }
  detectFraud(initial = false) {
    const seen = new Map();
    for (const c of this.cases) {
      const k = c.orgId + '|' + c.invoiceNo;
      if (seen.has(k)) this.addFraud('duplicate', c.id, `Créance potentiellement dupliquée : ${c.invoiceNo} existe déjà (${seen.get(k)}).`, 'moyenne'); else seen.set(k, c.id);
    }
    for (const o of this.orgs) if (o.bankDetailsChangedAt) this.addFraud('bank_change', o.id, `Changement récent de coordonnées bancaires de ${o.name} : vérification hors bande recommandée.`, 'élevée');
    const byOrg = new Map();
    for (const c of this.cases) { const a = byOrg.get(c.orgId) || []; a.push(c.principalMinor); byOrg.set(c.orgId, a); }
    for (const c of this.cases) {
      const arr = byOrg.get(c.orgId).slice().sort((a, b) => a - b);
      const med = arr[Math.floor(arr.length / 2)];
      if (arr.length >= 5 && c.principalMinor > med * 6) this.addFraud('amount', c.id, `Montant inhabituel : ${fmtMoney(c.principalMinor, c.currency)}, plus de 6 fois la médiane de l’organisation.`, 'faible');
    }
    const incoh = this.debtors.filter(d => d.identity === 'incohérente').slice(0, 8);
    incoh.forEach(d => this.addFraud('identity', d.id, `Identité incohérente pour ${d.id} : informations divergentes entre pièces.`, 'moyenne'));
    if (!initial) this.bump();
  }
  setFraudStatus(id, status, note) {
    this.require('fraud.manage');
    const f = this.fraudAlerts.find(x => x.id === id);
    f.status = status; if (note) f.notes.push({ at: this.clock, by: this.currentUserId, text: note });
    this.log(this.currentUserId, 'alerte fraude', id, `Statut : ${status}${note ? ' — ' + note : ''}`);
    this.bump();
  }

  /* ---------------------------- Banque (4 yeux) ---------------------------- */
  requestRestructure(caseId, months, rateCut, why) {
    this.require('bank.request');
    const c = this.caseById.get(caseId);
    if (!c || c.debtType !== 'banking') throw new BusinessError('Restructuration réservée aux créances bancaires.');
    if (['paye', 'clos'].includes(c.status)) throw new BusinessError('Dossier soldé.');
    const r = { id: 'RST-' + pad(this.bankRequests.length + 1, 4), caseId, months, rateCut, why, requestedBy: this.currentUserId, at: this.clock, status: 'en attente' };
    this.bankRequests.unshift(r);
    this.log(this.currentUserId, 'demande restructuration', caseId, `${months} mois — ${why}`);
    this.bump();
    return r;
  }
  decideRestructure(id, approve) {
    this.require('bank.approve');
    const r = this.bankRequests.find(x => x.id === id);
    if (r.status !== 'en attente') throw new BusinessError('Demande déjà traitée.');
    if (r.requestedBy === this.currentUserId) throw new BusinessError('Double validation : le demandeur ne peut pas approuver sa propre demande.');
    r.status = approve ? 'approuvée' : 'refusée'; r.decidedBy = this.currentUserId;
    if (approve) {
      const c = this.caseById.get(r.caseId);
      const fees = c.feesMinor; c.feesMinor = 0;
      this.asUser(this.currentUserId, () => {
        const bal = this.balance(c); const per = Math.floor(bal / r.months); const start = startOfDayUTC(this.clock) + 30 * DAY;
        c.plan = { installments: Array.from({ length: r.months }, (_, k) => ({ due: start + k * 30 * DAY, amountMinor: k === r.months - 1 ? bal - per * (r.months - 1) : per, paid: false })), createdAt: this.clock, approvedBy: this.currentUserId };
        c.nextActionAt = null;
        this.setStatus(c, 'echeancier', `restructuration ${r.id} (frais retirés : ${fmtMoney(fees, c.currency)})`);
      });
    }
    this.log(this.currentUserId, approve ? 'restructuration approuvée' : 'restructuration refusée', r.caseId, `${r.id} — demandeur ${r.requestedBy}`);
    this.bump();
  }

  /* ------------------------- Collectivités ------------------------- */
  submitTitle(orgId, label, amount, service) {
    this.require('public.submit');
    const o = this.orgById.get(orgId);
    if (!o?.public) throw new BusinessError('Circuit réservé aux organisations publiques.');
    if (!(amount > 0)) throw new BusinessError('Montant invalide.');
    const t = { id: 'TR-' + pad(this.publicTitles.length + 1, 4), orgId, label, amountMinor: Math.round(amount * 10 ** CURRENCIES[o.currency].dec), currency: o.currency, service, steps: [{ step: 'saisie', by: this.currentUserId, at: this.clock }], status: 'à valider (chef de service)' };
    this.publicTitles.unshift(t);
    this.log(this.currentUserId, 'titre de recette soumis', t.id, `${label} — ${service}`);
    this.bump();
    return t;
  }
  advanceTitle(id, approve) {
    const t = this.publicTitles.find(x => x.id === id);
    if (t.status.startsWith('à valider')) { this.require('public.validate'); t.steps.push({ step: approve ? 'validation service' : 'rejet service', by: this.currentUserId, at: this.clock }); t.status = approve ? 'à décider (comptable public)' : 'rejeté'; }
    else if (t.status.startsWith('à décider')) { this.require('public.accountant'); t.steps.push({ step: approve ? 'prise en charge comptable' : 'refus comptable', by: this.currentUserId, at: this.clock }); t.status = approve ? 'pris en charge — relances amiables possibles' : 'refusé par le comptable'; }
    else throw new BusinessError('Ce titre n’attend plus de décision.');
    this.log(this.currentUserId, 'circuit titre de recette', id, t.status);
    this.bump();
  }

  /* ------------------------------ Intégrations ------------------------------ */
  webhookEvent(type, payload) {
    for (const w of this.webhooks) if (w.active && w.events.includes(type)) this.integrationLog.unshift({ at: this.clock, kind: 'webhook', ok: true, text: `${type} → ${w.url} (simulé, non envoyé)`, payload });
    if (this.integrationLog.length > 300) this.integrationLog.length = 300;
  }
  createApiKey(label) {
    this.require('integration.manage');
    const rnd = Array.from({ length: 4 }, () => '0123456789abcdef'[Math.floor(this.R.next() * 16)]).join('');
    const k = { id: 'key_' + (this.apiKeys.length + 1), label: label || 'Clé sandbox', prefix: 'titan_test_', last4: rnd, createdAt: this.clock, revoked: false };
    this.apiKeys.unshift(k);
    this.log(this.currentUserId, 'création clé API fictive', k.id, label || '');
    this.bump();
    return k;
  }
  revokeApiKey(id) { this.require('integration.manage'); const k = this.apiKeys.find(x => x.id === id); k.revoked = true; this.log(this.currentUserId, 'révocation clé API', id, k.label, 'alerte'); this.bump(); }
  sandboxRequest(method, path, body) {
    const t0 = performance.now();
    let status = 200, res;
    const m = path.match(/^\/v1\/(cases|organizations|jurisdictions)(?:\/([\w-]+))?(?:\/(evaluate))?$/);
    if (!this.apiKeys.some(k => !k.revoked)) { status = 401; res = { error: 'Aucune clé sandbox active' }; }
    else if (!m) { status = 404; res = { error: 'Route inconnue' }; }
    else if (method !== 'GET' && !(method === 'POST' && m[3])) { status = 405; res = { error: 'Méthode non disponible dans la sandbox (lecture seule)' }; }
    else if (m[1] === 'cases' && m[2]) {
      const c = this.caseById.get(m[2]);
      if (!c) { status = 404; res = { error: 'Dossier introuvable' }; }
      else if (m[3]) { const v = evaluateContact(this, c, body?.channel || 'email', this.clock); res = { allowed: v.allowed, blockers: v.blockers, ruleset: v.ruleset?.id || null, fictitious_rules: true }; }
      else res = { id: c.id, organization: c.orgId, debtor: '[masqué]', jurisdiction: c.jurisdiction, currency: c.currency, principal_minor: c.principalMinor, paid_minor: c.paidMinor, balance_minor: this.balance(c), status: c.status, due_date: isoDate(c.dueDate) };
    } else if (m[1] === 'cases') res = { data: this.cases.slice(0, 5).map(c => ({ id: c.id, status: c.status, balance_minor: this.balance(c), currency: c.currency })), total: this.cases.length, page_size: 5 };
    else if (m[1] === 'organizations') res = m[2] ? (this.orgById.get(m[2]) || (status = 404, { error: 'Introuvable' })) : { data: this.orgs.slice(0, 5).map(o => ({ id: o.id, name: o.name, type: o.type })), total: this.orgs.length };
    else res = { data: this.jurisdictions.map(j => ({ code: j.code, name: j.name, validated: jurisdictionState(j, this.clock).ok, real_use: false })) };
    const ms = Math.round((performance.now() - t0) * 100) / 100;
    this.integrationLog.unshift({ at: this.clock, kind: 'sandbox', ok: status < 400, text: `${method} ${path} → ${status} (${ms} ms)` });
    this.bump();
    return { status, body: res, ms };
  }
  importCSV(text) {
    this.require('case.create');
    const rows = text.trim().split(/\r?\n/).map(l => l.split(/[;,]/).map(s => s.trim()));
    const head = rows.shift().map(h => h.toLowerCase());
    const need = ['organisation', 'debiteur', 'facture', 'montant', 'echeance'];
    const miss = need.filter(n => !head.includes(n));
    if (miss.length) throw new BusinessError(`Colonnes manquantes : ${miss.join(', ')}. Attendu : ${need.join(';')}`);
    const res = { ok: [], errors: [] };
    rows.forEach((r, i) => {
      const o = Object.fromEntries(head.map((h, k) => [h, r[k]]));
      try {
        const c = this.createCase({ orgId: o.organisation, debtorName: o.debiteur, invoiceNo: o.facture, amount: parseFloat((o.montant || '').replace(',', '.')), dueDate: o.echeance, hasContract: true });
        res.ok.push(c.id);
      } catch (e) { res.errors.push(`Ligne ${i + 2} : ${e.message}`); }
    });
    this.integrationLog.unshift({ at: this.clock, kind: 'import', ok: res.errors.length === 0, text: `Import CSV : ${res.ok.length} créé(s), ${res.errors.length} erreur(s)` });
    this.log(this.currentUserId, 'import CSV', 'dossiers', `${res.ok.length} créé(s), ${res.errors.length} rejeté(s)`);
    this.bump();
    return res;
  }
  exportCSV(cases) {
    const head = 'id;organisation;juridiction;devise;principal;paye;solde;statut;echeance';
    const lines = cases.map(c => [c.id, c.orgId, c.jurisdiction, c.currency, c.principalMinor / 10 ** CURRENCIES[c.currency].dec, c.paidMinor / 10 ** CURRENCIES[c.currency].dec, this.balance(c) / 10 ** CURRENCIES[c.currency].dec, c.status, isoDate(c.dueDate)].join(';'));
    this.log(this.currentUserId, 'export CSV', 'dossiers', `${cases.length} ligne(s), coordonnées des débiteurs exclues`);
    return [head, ...lines].join('\n');
  }

  reviewAI(kind, ref, decision, note) {
    this.require('ai.validate');
    this.aiReviews.unshift({ at: this.clock, kind, ref, decision, note, by: this.currentUserId });
    this.log(this.currentUserId, 'validation humaine IA', ref, `${kind} : ${decision}${note ? ' — ' + note : ''}`);
    this.bump();
  }

  /* ------------------------------ Simulation du temps ------------------------------ */
  cadenceGap(c) {
    const overdue = (this.clock - c.dueDate) / DAY;
    if (overdue < 30) return 7; if (overdue < 90) return 10; return 21;
  }
  pickChannel(c) {
    const d = this.debtorById.get(c.debtorId);
    const sentCount = c.sentCount || 0;
    const ladder = ['email', 'sms', 'email', 'call', 'courrier', 'portail'];
    let ch = ladder[sentCount % ladder.length];
    if ((ch === 'sms' || ch === 'whatsapp') && !d.consents[ch]) ch = 'email';
    if (ch === 'call' && !d.consents.call) ch = 'courrier';
    return ch;
  }

  /** Simule un jour : examen quotidien des dossiers, relances via le moteur juridique, réponses simulées. */
  advanceDay() {
    const R = this.R;
    const day0 = startOfDayUTC(this.clock) + DAY;
    this.clock = day0 + 9.5 * HOUR;
    this.stats.simDays++;
    let sent = 0, blocked = 0, paid = 0, disputes = 0;
    // Index rapide des communications envoyées par dossier, pour la cadence
    for (const c of this.cases) {
      if (['paye', 'clos', 'suspendu', 'conteste'].includes(c.status)) continue;
      const jur = this.jurByCode.get(c.jurisdiction);
      const d = this.debtorById.get(c.debtorId);
      // Échéancier
      if (c.plan && c.status === 'echeancier') {
        for (const i of c.plan.installments) {
          if (!i.paid && i.due <= this.clock && i.due > this.clock - DAY) {
            if (R.chance(0.55 + d.behavior * 0.4)) { { const amt = Math.min(i.amountMinor, this.balance(c)); if (amt > 0) this.recordPayment(c.id, amt, 'virement', { byDebtor: true, silent: true }); else i.paid = true; } paid++; }
            else { this.event(c, 'échéance manquée', `Échéance du ${isoDate(i.due)} non honorée`, 'système'); this.setStatus(c, 'actif', 'échéance manquée'); c.nextActionAt = this.clock + 2 * DAY; }
          }
        }
        continue;
      }
      // Promesse
      if (c.status === 'promesse' && c.promise && c.promise.date <= this.clock) {
        if (R.chance(0.45 + d.behavior * 0.45)) { this.recordPayment(c.id, this.balance(c), 'carte', { byDebtor: true, silent: true }); paid++; continue; }
        this.setStatus(c, 'actif', 'promesse non tenue'); c.promise = null; c.nextActionAt = this.clock;
      }
      if (c.status === 'nouveau' && c.dueDate < this.clock) this.setStatus(c, 'actif', 'échéance dépassée');
      if (c.status !== 'actif' || c.humanQueue) continue;
      if (c.nextActionAt == null) c.nextActionAt = this.clock;
      if (c.nextActionAt > this.clock) continue;
      // Calendrier intelligent : tentative à 10h locale dans la juridiction du dossier
      const at = day0 + (10 * 60 - (jur?.tz || 0)) * 60000;
      const ch = this.pickChannel(c);
      let r = this.attemptContact(c.id, ch, { automated: true, at, silent: true });
      const failed = () => r.verdict.checks.filter(x => !x.ok).map(x => x.id);
      if (!r.verdict.allowed && ch !== 'email' && failed().every(id => ['channel', 'consent', 'autoCall', 'hours'].includes(id))) {
        r = this.attemptContact(c.id, 'email', { automated: true, at, silent: true }); // repli sur un canal autorisé
      }
      if (r.verdict.allowed) {
        sent++;
        c.nextActionAt = this.clock + this.cadenceGap(c) * DAY;
        // Réaction simulée du débiteur (aucun profilage sensible : seule la propension simulée intervient)
        const x = R.next();
        const b = d.behavior;
        if (x < 0.05 + b * 0.08) { this.recordPayment(c.id, this.balance(c), R.pick(['carte', 'virement', 'mobile_money']), { byDebtor: true, silent: true }); paid++; this.stats.byChannel[ch].converted++; }
        else if (x < 0.10 + b * 0.10) { this.recordPayment(c.id, Math.max(1, Math.round(this.balance(c) * 0.3)), 'carte', { byDebtor: true, silent: true }); this.stats.byChannel[ch].converted++; }
        else if (x < 0.15 + b * 0.10) { c.promise = { date: this.clock + R.int(3, 14) * DAY, amountMinor: this.balance(c), createdAt: this.clock }; this.setStatus(c, 'promesse', 'promesse simulée'); this.stats.byChannel[ch].converted++; }
        else if (x < 0.165 + b * 0.10) { this.openDisputeSilent(c, 'Contestation simulée par le débiteur'); disputes++; }
      } else {
        blocked++;
        const f = failed();
        if (f.every(id => ['calendar', 'frequency', 'hours'].includes(id))) c.nextActionAt = this.clock + DAY; // cause temporaire : nouvel examen demain
        else { c.nextActionAt = null; c.humanQueue = r.verdict.blockers[0]; this.event(c, 'file humaine', 'Cause structurelle : dossier placé en file de traitement humain', 'système'); }
      }
    }
    // Nouvelles créances simulées entrant en portefeuille : aucune (portefeuille fermé, pour la lisibilité)
    if (this.R.chance(0.04)) this.raiseIncident('Connexion inhabituelle détectée (simulation)', 'moyenne', 'Identité', 'Détection simulée');
    this.log('agent:planner', 'examen quotidien', isoDate(this.clock), `${sent} envoyée(s), ${blocked} bloquée(s), ${paid} paiement(s), ${disputes} contestation(s)`);
    return { sent, blocked, paid, disputes };
  }
  openDisputeSilent(c, reason) {
    c.dispute = { at: this.clock, reason, by: 'débiteur', state: 'ouverte' };
    c.nextActionAt = null;
    this.setStatus(c, 'conteste', 'contestation reçue');
    this.log('débiteur', 'contestation', c.id, `${reason} — relances suspendues`, 'alerte');
  }
  advanceDays(n) {
    this.require('sim.run');
    const tot = { sent: 0, blocked: 0, paid: 0, disputes: 0 };
    for (let i = 0; i < n; i++) { const r = this.advanceDay(); for (const k in tot) tot[k] += r[k]; }
    this.log(this.currentUserId, 'simulation', 'horloge virtuelle', `Avance de ${n} jour(s) — ${tot.sent} envoyée(s), ${tot.blocked} bloquée(s), ${tot.paid} paiement(s)`);
    this.bump();
    return tot;
  }

  /* ------------------------------ Statistiques ------------------------------ */
  computeStats(filter = {}) {
    const now = this.clock;
    const cases = this.cases.filter(c => (!filter.jur || c.jurisdiction === filter.jur) && (!filter.group || this.orgById.get(c.orgId).group === filter.group));
    const ids = new Set(cases.map(c => c.id));
    let total = 0, paid = 0, outstanding = 0;
    const aging = [0, 0, 0, 0, 0];
    const agingLabels = ['0–30 j', '31–60 j', '61–90 j', '91–180 j', '> 180 j'];
    const byStatus = {};
    const byJur = {};
    const byOrg = new Map();
    let dsoSum = 0, dsoN = 0;
    for (const c of cases) {
      const t = toEURMinor(c.principalMinor + c.feesMinor, c.currency);
      const p = toEURMinor(c.paidMinor, c.currency);
      total += t; paid += p;
      const bal = t - p;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      const j = byJur[c.jurisdiction] || (byJur[c.jurisdiction] = { count: 0, outstanding: 0, paid: 0 });
      j.count++; j.paid += p;
      const o = byOrg.get(c.orgId) || { total: 0, paid: 0, count: 0 };
      o.total += t; o.paid += p; o.count++; byOrg.set(c.orgId, o);
      if (!['paye', 'clos'].includes(c.status) && bal > 0) {
        outstanding += bal; j.outstanding += bal;
        const od = (now - c.dueDate) / DAY;
        aging[od <= 30 ? 0 : od <= 60 ? 1 : od <= 90 ? 2 : od <= 180 ? 3 : 4] += bal;
      }
    }
    const pays = this.payments.filter(p => ids.has(p.caseId) && p.status === 'confirmé (simulé)');
    const caseLastPay = new Map();
    for (const p of pays) caseLastPay.set(p.caseId, Math.max(caseLastPay.get(p.caseId) || 0, p.at));
    for (const c of cases) if (c.status === 'paye' && caseLastPay.has(c.id)) { dsoSum += Math.max(0, (caseLastPay.get(c.id) - c.issueDate) / DAY); dsoN++; }
    // Série quotidienne sur 120 jours : encaissements et communications
    const days = 120;
    const start = startOfDayUTC(now) - (days - 1) * DAY;
    const series = Array.from({ length: days }, (_, i) => ({ day: start + i * DAY, collected: 0, sent: 0, blocked: 0 }));
    for (const p of pays) { const i = Math.floor((startOfDayUTC(p.at) - start) / DAY); if (i >= 0 && i < days) series[i].collected += toEURMinor(p.amountMinor, p.currency); }
    for (const m of this.comms) { if (!ids.has(m.caseId)) continue; const i = Math.floor((startOfDayUTC(m.at) - start) / DAY); if (i >= 0 && i < days) series[i][m.status === 'envoyé' ? 'sent' : 'blocked']++; }
    const commsIn = this.comms.filter(m => ids.has(m.caseId));
    const byChannel = {};
    let cost = 0;
    for (const m of commsIn) { const b = byChannel[m.channel] || (byChannel[m.channel] = { sent: 0, blocked: 0 }); b[m.status === 'envoyé' ? 'sent' : 'blocked']++; if (m.status === 'envoyé') cost += CHANNELS[m.channel].cost; }
    // Prévision 6 mois : échéanciers + promesses + taux historique appliqué au solde actif
    const forecast = Array.from({ length: 6 }, (_, k) => ({ month: k, plan: 0, promise: 0, base: 0 }));
    for (const c of cases) {
      if (c.plan && c.status === 'echeancier') for (const i of c.plan.installments) { const k = Math.floor((i.due - now) / (30 * DAY)); if (!i.paid && k >= 0 && k < 6) forecast[k].plan += toEURMinor(i.amountMinor, c.currency); }
      if (c.status === 'promesse' && c.promise) { const k = Math.max(0, Math.floor((c.promise.date - now) / (30 * DAY))); if (k < 6) forecast[k].promise += toEURMinor(c.promise.amountMinor, c.currency) * 0.65; }
    }
    const last90 = series.slice(-90).reduce((s, d) => s + d.collected, 0);
    const activeOutstanding = cases.filter(c => c.status === 'actif').reduce((s, c) => s + toEURMinor(this.balance(c), c.currency), 0);
    const monthlyRate = outstanding > 0 ? Math.min(0.25, (last90 / 3) / Math.max(1, outstanding + last90)) : 0;
    forecast.forEach((f, k) => { f.base = Math.round(activeOutstanding * monthlyRate * Math.pow(0.93, k)); });
    const counts = {
      active: cases.filter(c => ['actif', 'nouveau', 'promesse', 'echeancier'].includes(c.status)).length,
      disputed: byStatus.conteste || 0,
      plans: byStatus.echeancier || 0,
      promises: byStatus.promesse || 0,
    };
    const topOrgs = [...byOrg.entries()].map(([id, o]) => ({ id, name: this.orgById.get(id).name, ...o, rate: o.total ? o.paid / o.total : 0 })).sort((a, b) => b.total - a.total);
    return {
      total, paid, outstanding, rate: total ? paid / total : 0, dso: dsoN ? dsoSum / dsoN : 0,
      aging, agingLabels, byStatus, byJur, byChannel, series, forecast, monthlyRate, counts, cost, topOrgs,
      sentTotal: commsIn.filter(m => m.status === 'envoyé').length, blockedTotal: commsIn.filter(m => m.status === 'bloqué').length,
      caseCount: cases.length,
    };
  }
}

function auditPayload(e) { return [e.seq, e.at, e.real, e.actor, e.action, e.target, e.detail, e.level, e.prev].join('|'); }
