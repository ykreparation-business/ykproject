// Tests du moteur : juridique, permissions, cohérence financière, audit, IA simulée.
// Lancer : node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Model, PermissionError, BusinessError } from '../src/engine/model.js';
import { evaluateContact, jurisdictionState } from '../src/engine/legal.js';
import { analyzeDocument, guardrailCheck, analyzeReply } from '../src/engine/ai.js';
import { SAMPLE_DOC } from '../src/engine/data.js';
import { sha256 } from '../src/engine/sha256.js';

const DAY = 86400000;
// Heure de contact sûre : mardi 10h locale (Valdoria UTC+1)
const SAFE_AT = Date.parse('2026-12-01T09:00:00Z');

function fresh() { return new Model(42); }
function eligibleCase(m, jur = 'XA-VAL') {
  const c = m.cases.find(x => x.jurisdiction === jur && x.status === 'actif' && x.documents.facture && !x.flags.hardship && !x.flags.vulnerable
    && m.debtorById.get(x.debtorId).identity === 'vérifiée' && m.debtorById.get(x.debtorId).country === m.orgById.get(x.orgId).jurisdiction
    && m.orgById.get(x.orgId).authorizations.includes(x.debtType) && x.dueDate > SAFE_AT - 4 * 365 * DAY);
  m.contactsByDebtor.set(c.debtorId, []);
  return c;
}

test('SHA-256 : vecteur de référence', () => {
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('un dossier éligible peut être relancé par e-mail', () => {
  const m = fresh(); const c = eligibleCase(m);
  const v = evaluateContact(m, c, 'email', SAFE_AT);
  assert.equal(v.allowed, true, v.blockers.join(' | '));
});

test('une dette payée ne peut pas déclencher de relance', () => {
  const m = fresh(); const c = eligibleCase(m);
  m.recordPayment(c.id, m.balance(c), 'carte');
  assert.equal(c.status, 'paye');
  assert.equal(evaluateContact(m, c, 'email', SAFE_AT).allowed, false);
});

test('une dette contestée ne peut pas déclencher de relance et sort de la cadence', () => {
  const m = fresh(); const c = eligibleCase(m);
  m.openDispute(c.id, 'Montant contesté');
  assert.equal(c.nextActionAt, null);
  assert.equal(evaluateContact(m, c, 'email', SAFE_AT).allowed, false);
  const before = m.comms.filter(x => x.caseId === c.id).length;
  m.advanceDays(10);
  assert.equal(m.comms.filter(x => x.caseId === c.id).length, before);
});

test('identité non vérifiée : contact interdit', () => {
  const m = fresh(); const c = eligibleCase(m);
  m.debtorById.get(c.debtorId).identity = 'non vérifiée';
  const v = evaluateContact(m, c, 'email', SAFE_AT);
  assert.equal(v.allowed, false);
  assert.ok(v.checks.find(x => x.id === 'identity' && !x.ok));
});

test('juridictions non validée, expirée et contradictoire : blocage automatique', () => {
  const m = fresh();
  for (const code of ['XF-QAM', 'XG-MER', 'XH-ISL']) {
    assert.equal(jurisdictionState(m.jurByCode.get(code), SAFE_AT).ok, false, code);
    const c = m.cases.find(x => x.jurisdiction === code && x.status === 'actif');
    if (c) assert.equal(evaluateContact(m, c, 'email', SAFE_AT).allowed, false, code);
  }
  assert.match(jurisdictionState(m.jurByCode.get('XG-MER'), SAFE_AT).issues.join(), /Aucune version/);
  assert.match(jurisdictionState(m.jurByCode.get('XH-ISL'), SAFE_AT).issues.join(), /Contradiction/);
});

test('fréquence dépassée : comptée sur tous les canaux et tous les dossiers', () => {
  const m = fresh(); const c = eligibleCase(m);
  const max = jurisdictionState(m.jurByCode.get('XA-VAL'), SAFE_AT).ruleset.params.maxContactsPer7d;
  m.contactsByDebtor.set(c.debtorId, Array.from({ length: max }, (_, i) => SAFE_AT - (i + 1) * 3600000));
  const v = evaluateContact(m, c, 'email', SAFE_AT);
  assert.equal(v.allowed, false);
  assert.ok(v.checks.find(x => x.id === 'frequency' && !x.ok));
});

test('horaires et jours fériés respectés', () => {
  const m = fresh(); const c = eligibleCase(m);
  m.debtorById.get(c.debtorId).consents.sms = true;
  assert.equal(evaluateContact(m, c, 'sms', Date.parse('2026-12-01T22:30:00Z')).allowed, false); // 23h30 locale
  assert.equal(evaluateContact(m, c, 'email', Date.parse('2026-12-25T10:00:00Z')).allowed, false); // férié démo
});

test('arrêt d’urgence : aucune communication automatisée', () => {
  const m = fresh(); const c = eligibleCase(m);
  m.setKillSwitch(true, 'test');
  assert.equal(evaluateContact(m, c, 'email', SAFE_AT).allowed, false);
  const r = m.advanceDays(3);
  assert.equal(r.sent, 0);
});

test('paiement intégral : statut payé et relances restantes annulées', () => {
  const m = fresh(); const c = eligibleCase(m);
  c.nextActionAt = SAFE_AT + DAY;
  m.recordPayment(c.id, m.balance(c), 'virement');
  assert.equal(m.balance(c), 0);
  assert.equal(c.nextActionAt, null);
  assert.equal(c.status, 'paye');
});

test('paiement supérieur au solde refusé ; montant nul refusé', () => {
  const m = fresh(); const c = eligibleCase(m);
  assert.throws(() => m.recordPayment(c.id, m.balance(c) + 1), BusinessError);
  assert.throws(() => m.recordPayment(c.id, 0), BusinessError);
});

test('cohérence financière après un an de simulation', () => {
  const m = fresh();
  m.advanceDays(365);
  const sums = new Map();
  for (const p of m.payments) if (p.status === 'confirmé (simulé)') sums.set(p.caseId, (sums.get(p.caseId) || 0) + p.amountMinor);
  for (const c of m.cases) {
    assert.equal(c.paidMinor, sums.get(c.id) || 0, c.id);
    assert.ok(m.balance(c) >= 0, c.id);
    if (c.status === 'paye') assert.equal(m.balance(c), 0, c.id);
  }
  // Aucune communication envoyée pour un dossier après son paiement intégral
  for (const c of m.cases.filter(x => x.status === 'paye')) {
    const lastPay = Math.max(...m.payments.filter(p => p.caseId === c.id).map(p => p.at));
    assert.ok(!m.comms.some(x => x.caseId === c.id && x.status === 'envoyé' && x.at > lastPay + DAY), c.id);
  }
  assert.equal(m.verifyAudit().ok, true);
});

test('permissions : un analyste ne peut pas créer de dossier', () => {
  const m = fresh(); m.setUser('u3');
  assert.throws(() => m.createCase({ orgId: 'ORG-001', debtorName: 'X', invoiceNo: 'F1', amount: 10, dueDate: '2026-10-01' }), PermissionError);
  assert.ok(m.audit.some(e => e.action === 'accès refusé'));
});

test('super administrateur : pas d’accès aux données personnelles sans accès exceptionnel approuvé par un tiers', () => {
  const m = fresh();
  assert.equal(m.can('pii.read'), false);
  const b = m.requestBreakGlass('Contrôle qualité sur réclamation client référencée', 15);
  assert.throws(() => m.decideBreakGlass(b.id, true)); // ni permission ni auto-approbation
  m.setUser('u5');
  m.decideBreakGlass(b.id, true);
  m.setUser('u1');
  assert.equal(m.can('pii.read'), true);
});

test('double validation bancaire : le demandeur ne peut pas approuver', () => {
  const m = fresh();
  const c = m.cases.find(x => x.debtType === 'banking' && x.status === 'actif');
  m.setUser('u7');
  const r = m.requestRestructure(c.id, 12, 0, 'Difficulté temporaire documentée');
  assert.throws(() => m.decideRestructure(r.id, true), PermissionError);
  m.setUser('u8');
  m.decideRestructure(r.id, true);
  assert.equal(c.status, 'echeancier');
});

test('circuit public : seul le comptable public décide', () => {
  const m = fresh();
  const org = m.orgs.find(o => o.public);
  m.setUser('u9'); const t = m.submitTitle(org.id, 'Redevance démo', 120, 'Eau');
  assert.throws(() => m.advanceTitle(t.id, true), PermissionError);
  m.setUser('u10'); m.advanceTitle(t.id, true);
  assert.throws(() => m.advanceTitle(t.id, true), PermissionError);
  m.setUser('u11'); m.advanceTitle(t.id, true);
  assert.match(t.status, /pris en charge/);
});

test('validation juridique : séparation des fonctions et blocage après modification de règle', () => {
  const m = fresh();
  m.setUser('u4');
  m.editRule('XA-VAL', 'maxContactsPer7d', 2, 'test');
  assert.equal(jurisdictionState(m.jurByCode.get('XA-VAL'), m.clock).ok, false);
  m.validateJurisdiction('XA-VAL', 'juriste');
  assert.throws(() => m.validateJurisdiction('XA-VAL', 'juriste'));
  m.setUser('u5'); m.validateJurisdiction('XA-VAL', 'conformite');
  m.setUser('u1'); m.validateJurisdiction('XA-VAL', 'direction');
  assert.equal(jurisdictionState(m.jurByCode.get('XA-VAL'), m.clock).ok, true);
});

test('journal d’audit : altération détectée', () => {
  const m = fresh();
  m.advanceDays(2);
  assert.equal(m.verifyAudit().ok, true);
  m.tamperAuditDemo();
  assert.equal(m.verifyAudit().ok, false);
});

test('IA : document importé traité comme donnée non fiable', () => {
  const r = analyzeDocument(SAMPLE_DOC, fresh());
  const codes = r.findings.map(f => f.code);
  assert.ok(codes.includes('PROMPT_INJECTION'));
  assert.ok(codes.includes('TOTAL_MISMATCH'));
  assert.ok(codes.includes('DATE_INCOHERENCE'));
  assert.ok(codes.includes('BANK_DETAILS'));
  assert.equal(r.requiresHuman, true);
  assert.equal(JSON.stringify(r.extracted).includes('XX00'), false); // IBAN non extrait
});

test('IA : garde-fou de ton et analyse de réponse', () => {
  assert.equal(guardrailCheck('Vous irez en prison si vous ne payez pas').ok, false);
  assert.equal(guardrailCheck('Merci de régulariser via votre portail.').ok, true);
  assert.ok(analyzeReply('Je conteste cette facture, jamais reçu').intents.some(i => i.id === 'dispute'));
});
