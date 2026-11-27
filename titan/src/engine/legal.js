// TITAN LEGAL — moteur réglementaire déterministe, indépendant de l'IA.
// Principe : toute incertitude bloque. Les règles sont FICTIVES (démonstration).
import { DAY, isoDate } from './util.js';
import { CHANNELS, DEBT_TYPES } from './data.js';

export const VALIDATION_LEVELS = [
  { key: 'juriste', label: 'Niveau 1 — Juriste', role: 'juriste' },
  { key: 'conformite', label: 'Niveau 2 — Conformité', role: 'conformite' },
  { key: 'direction', label: 'Niveau 3 — Direction', role: 'superadmin' },
];

export function activeRulesets(jur, at) {
  const d = isoDate(at);
  return jur.rulesets.filter(r => r.effectiveFrom <= d && (!r.effectiveTo || r.effectiveTo >= d));
}

export function jurisdictionState(jur, at) {
  const issues = [];
  const missing = VALIDATION_LEVELS.filter(l => !jur.validations[l.key]);
  if (missing.length) issues.push(`Validation incomplète : ${missing.map(m => m.label).join(', ')}`);
  const act = activeRulesets(jur, at);
  if (act.length === 0) issues.push('Aucune version de règles en vigueur (expirée ou future)');
  if (act.length > 1) issues.push(`Contradiction : ${act.length} versions en vigueur simultanément (${act.map(a => a.version).join(' / ')})`);
  if (act.length === 1 && act[0].status !== 'validé') issues.push(`Version ${act[0].version} au statut « ${act[0].status} »`);
  const ruleset = act.length === 1 ? act[0] : null;
  const reviewSoon = ruleset && Date.parse(ruleset.reviewDate) - at < 60 * DAY;
  return { ok: issues.length === 0, issues, ruleset, reviewSoon };
}

export function localParts(at, tz) {
  const d = new Date(at + tz * 60000);
  return { hour: d.getUTCHours() + d.getUTCMinutes() / 60, weekday: d.getUTCDay(), date: d.toISOString().slice(0, 10) };
}

/**
 * Évalue si une communication est autorisée.
 * @returns {{allowed:boolean, checks:Array<{id,label,ok,detail}>, blockers:string[], requiresHuman:boolean, ruleset:object|null}}
 */
export function evaluateContact(model, c, channel, at, opts = {}) {
  const automated = opts.automated !== false;
  const checks = [];
  const add = (id, label, ok, detail) => checks.push({ id, label, ok, detail });
  const org = model.orgById.get(c.orgId);
  const debtor = model.debtorById.get(c.debtorId);
  const jur = model.jurByCode.get(c.jurisdiction);

  add('killswitch', 'Arrêt d’urgence inactif', !model.killSwitch, model.killSwitch ? 'Arrêt d’urgence actif : toutes les automatisations sont stoppées.' : 'Aucun arrêt d’urgence.');
  if (automated) {
    add('paused', 'Automatisations en service', !model.paused, model.paused ? 'Automatisations en pause.' : 'Automatisations actives.');
    const agent = model.agents.find(a => a.id === (channel === 'call' ? 'voice' : 'planner'));
    add('agent', 'Agent IA autorisé', !!agent?.enabled, agent?.enabled ? `${agent.name} activé.` : `${agent?.name || 'Agent'} désactivé par un administrateur.`);
  }
  add('org', 'Organisation créancière active', org?.status === 'actif', org?.status === 'actif' ? `${org.name}` : `Compte ${org?.status || 'inconnu'} : aucune relance possible.`);

  const blockingStatus = { paye: 'Dette intégralement payée.', clos: 'Dossier clos.', conteste: 'Dette contestée : relances suspendues jusqu’à décision humaine.', suspendu: 'Dossier suspendu.' };
  add('status', 'Statut du dossier compatible', !blockingStatus[c.status], blockingStatus[c.status] || `Statut « ${c.status} ».`);
  const balance = c.principalMinor + c.feesMinor - c.paidMinor;
  add('balance', 'Solde restant dû positif', balance > 0, balance > 0 ? 'Solde positif.' : 'Aucun solde restant.');
  add('due', 'Échéance dépassée', c.dueDate < at, c.dueDate < at ? `Échue depuis ${Math.floor((at - c.dueDate) / DAY)} j.` : 'La créance n’est pas encore exigible.');
  add('docs', 'Justificatif principal présent', !!c.documents.facture, c.documents.facture ? 'Facture présente.' : 'Facture manquante : dossier incomplet.');
  add('identity', 'Identité du débiteur vérifiée', debtor.identity === 'vérifiée', debtor.identity === 'vérifiée' ? 'Identité vérifiée.' : `Identité ${debtor.identity} : contact interdit pour éviter de révéler la dette à un tiers.`);

  if (!jur) {
    add('jur', 'Juridiction connue', false, `Juridiction ${c.jurisdiction} inconnue.`);
    return finish(checks, null, c);
  }
  const st = jurisdictionState(jur, at);
  add('jur', `Juridiction ${jur.name} validée`, st.ok, st.ok ? `Version ${st.ruleset.version} en vigueur (règle fictive).` : st.issues.join(' · '));
  if (!st.ok) return finish(checks, null, c);
  const p = st.ruleset.params;

  add('debtType', 'Type de créance autorisé dans la juridiction', p.debtTypes.includes(c.debtType), p.debtTypes.includes(c.debtType) ? DEBT_TYPES[c.debtType] : `${DEBT_TYPES[c.debtType]} non couverte par la configuration de ${jur.name}.`);
  add('orgAuth', 'Habilitation de l’organisation', org.authorizations.includes(c.debtType), org.authorizations.includes(c.debtType) ? 'Habilitation présente.' : `L’organisation n’est pas habilitée pour : ${DEBT_TYPES[c.debtType]}.`);
  const presc = c.dueDate + p.prescriptionYears * 365 * DAY;
  add('prescription', 'Délai de prescription non écoulé', presc > at, presc > at ? `Prescription démo le ${isoDate(presc)}.` : `Délai de prescription démo (${p.prescriptionYears} ans) écoulé le ${isoDate(presc)}.`);
  const crossBorder = debtor.country !== org.jurisdiction;
  add('crossBorder', 'Revue transfrontalière', !crossBorder || c.flags.crossBorderReviewed, !crossBorder ? 'Créance nationale.' : c.flags.crossBorderReviewed ? 'Revue transfrontalière effectuée.' : `Créancier en ${org.jurisdiction}, débiteur en ${debtor.country} : revue humaine requise.`);
  add('channel', `Canal ${CHANNELS[channel].label} autorisé`, p.channels.includes(channel), p.channels.includes(channel) ? 'Canal prévu par la configuration.' : `Canal non autorisé dans ${jur.name}.`);
  if (p.consentChannels.includes(channel) || channel === 'call') {
    const okC = !!debtor.consents[channel];
    add('consent', 'Consentement du débiteur pour ce canal', okC, okC ? 'Consentement enregistré.' : 'Aucun consentement enregistré pour ce canal.');
  }
  if (channel === 'call' && automated) add('autoCall', 'Appels automatisés autorisés', p.automatedCalls, p.automatedCalls ? 'Appels automatisés prévus.' : `Appels automatisés non autorisés dans ${jur.name}.`);
  if (!['courrier', 'portail'].includes(channel)) {
    const lp = localParts(at, jur.tz);
    if (channel !== 'email') {
      const inHours = lp.hour >= p.contactHours.start && lp.hour < p.contactHours.end;
      add('hours', 'Horaires de contact', inHours, `Heure locale ${String(Math.floor(lp.hour)).padStart(2, '0')}h${String(Math.round((lp.hour % 1) * 60)).padStart(2, '0')} — plage ${p.contactHours.start}h–${p.contactHours.end}h.`);
    }
    const closed = p.closedWeekdays.includes(lp.weekday);
    const hol = p.holidays.find(h => h.date === lp.date);
    add('calendar', 'Jour ouvré et non férié', !closed && !hol, hol ? `Jour férié : ${hol.name}.` : closed ? 'Jour sans contact selon la configuration.' : 'Jour ouvré.');
  }
  const since = at - 7 * DAY;
  const n = (model.contactsByDebtor.get(debtor.id) || []).filter(t => t > since && t <= at).length;
  add('frequency', 'Fréquence de contact (tous canaux, tous dossiers)', n < p.maxContactsPer7d, `${n} contact(s) sur 7 jours glissants / maximum ${p.maxContactsPer7d}.`);
  if (automated) {
    const human = p.humanRequiredFlags.filter(f => c.flags[f]);
    add('human', 'Pas d’intervention humaine requise', human.length === 0, human.length ? `Situation sensible (${human.map(h => h === 'hardship' ? 'difficulté financière' : 'vulnérabilité').join(', ')}) : traitement humain obligatoire.` : 'Aucun signal de vulnérabilité.');
  }
  return finish(checks, st.ruleset, c);
}

function finish(checks, ruleset, c) {
  const blockers = checks.filter(x => !x.ok).map(x => x.detail);
  const requiresHuman = checks.some(x => !x.ok && ['human', 'crossBorder', 'identity', 'status', 'jur'].includes(x.id)) || c.status === 'conteste';
  return { allowed: blockers.length === 0, checks, blockers, requiresHuman, ruleset };
}

// Actions qui ne relèvent jamais de la plateforme (réservées aux professionnels/autorités habilités)
export const RESERVED_ACTIONS = [
  'Saisie ou mesure d’exécution forcée',
  'Signification d’actes judiciaires',
  'Prélèvement forcé sur compte',
  'Émission d’un titre exécutoire public',
  'Sanction administrative ou pénale',
  'Inscription à un fichier d’incidents',
];
