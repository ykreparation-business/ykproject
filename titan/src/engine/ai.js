// TITAN INTELLIGENCE — moteur de SIMULATION déterministe (aucun modèle d'IA réel n'est appelé).
// Les documents importés sont des DONNÉES NON FIABLES : ils ne sont jamais interprétés comme des instructions.
import { DAY, isoDate, fmtMoney, toMinor } from './util.js';
import { CHANNELS } from './data.js';

export const AI_PROVIDERS = [
  { id: 'local', name: 'Moteur déterministe local', status: 'actif dans le simulateur', note: 'Règles et gabarits ; aucune donnée ne quitte le navigateur.' },
  { id: 'provA', name: 'Fournisseur LLM A (emplacement)', status: 'non connecté', note: 'Adaptateur prévu, désactivé dans le prototype.' },
  { id: 'provB', name: 'Fournisseur LLM B (emplacement)', status: 'non connecté', note: 'Adaptateur prévu, désactivé dans le prototype.' },
  { id: 'sovereign', name: 'Modèle hébergé souverain (emplacement)', status: 'non connecté', note: 'Option d’hébergement dédié envisagée.' },
];

const INJECTION_PATTERNS = [
  /ignore[sz]?\s+(toutes\s+)?(les\s+)?(instructions|consignes)/i,
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /(marque|marquer|mark)\s+(cette|this)\s+(facture|invoice)\s+(comme|as)\s+(payée|paid)/i,
  /system\s*prompt|you are now|tu es maintenant|désactive\s+(les\s+)?règles/i,
  /<\s*script/i,
];
const IBAN_RE = /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\s?[A-Z0-9]{0,4}\b/;

function parseAmount(s) {
  const m = s.replace(/\s/g, '').replace(/ /g, '').match(/(\d+(?:[.,]\d{1,2})?)/);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

/** Analyse documentaire simulée : extraction, incohérences, doublons, injection. */
export function analyzeDocument(text, model) {
  const lines = text.split(/\r?\n/);
  const findings = [];
  const extracted = {};
  const grab = (key, re, lineFilter) => {
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(re);
      if (m && (!lineFilter || lineFilter(lines[i]))) { extracted[key] = { value: m[1].trim(), line: i + 1 }; return; }
    }
  };
  grab('invoiceNo', /(?:facture|invoice)\s*n[°o]?\s*[:\-]?\s*([A-Z0-9\-]+)/i);
  grab('issuer', /(?:émetteur|emetteur|issuer)\s*:\s*(.+)/i);
  grab('client', /(?:client|débiteur|debtor)\s*:\s*(.+)/i);
  grab('issueDate', /(?:date d'émission|date d’émission|issue date)\s*:\s*(\d{4}-\d{2}-\d{2})/i);
  grab('dueDate', /(?:date d'échéance|date d’échéance|due date)\s*:\s*(\d{4}-\d{2}-\d{2})/i);
  grab('total', /total[^:]*:\s*([\d\s.,]+)/i);
  grab('currency', /\b(EUR|USD|GBP|CHF|XOF|JPY)\b/);
  const lineItems = [];
  lines.forEach((l, i) => { if (/^ligne\s*\d+/i.test(l.trim())) { const a = parseAmount(l.split(/\.{2,}|:/).pop() || ''); if (a != null) lineItems.push({ line: i + 1, amount: a }); } });

  // Injection de consignes : traitée comme donnée, signalée, jamais exécutée
  const injections = [];
  lines.forEach((l, i) => INJECTION_PATTERNS.forEach(re => { if (re.test(l)) injections.push({ line: i + 1, text: l.trim() }); }));
  if (injections.length) findings.push({ level: 'critique', code: 'PROMPT_INJECTION', text: `${injections.length} consigne(s) suspecte(s) détectée(s) dans le document. Elles sont traitées comme du texte et ignorées.`, lines: injections.map(x => x.line) });

  const ibanLine = lines.findIndex(l => IBAN_RE.test(l));
  if (ibanLine >= 0) findings.push({ level: 'attention', code: 'BANK_DETAILS', text: 'Coordonnées bancaires détectées : elles ne sont ni extraites ni stockées (politique du simulateur).', lines: [ibanLine + 1] });

  const required = ['invoiceNo', 'issuer', 'client', 'issueDate', 'dueDate', 'total'];
  const labels = { invoiceNo: 'numéro de facture', issuer: 'émetteur', client: 'client', issueDate: 'date d’émission', dueDate: 'date d’échéance', total: 'montant total' };
  const missing = required.filter(k => !extracted[k]);
  if (missing.length) findings.push({ level: 'attention', code: 'MISSING_FIELDS', text: `Informations manquantes : ${missing.map(k => labels[k]).join(', ')}.` });

  if (extracted.issueDate && extracted.dueDate && extracted.dueDate.value < extracted.issueDate.value)
    findings.push({ level: 'critique', code: 'DATE_INCOHERENCE', text: `L’échéance (${extracted.dueDate.value}) précède la date d’émission (${extracted.issueDate.value}).`, lines: [extracted.issueDate.line, extracted.dueDate.line] });

  const total = extracted.total ? parseAmount(extracted.total.value) : null;
  if (total != null && lineItems.length) {
    const sum = Math.round(lineItems.reduce((s, x) => s + x.amount, 0) * 100) / 100;
    if (Math.abs(sum - total) > 0.009) findings.push({ level: 'critique', code: 'TOTAL_MISMATCH', text: `La somme des lignes (${sum.toFixed(2)}) ne correspond pas au total déclaré (${total.toFixed(2)}).`, lines: [extracted.total.line, ...lineItems.map(x => x.line)] });
  }
  if (extracted.invoiceNo && model) {
    const dup = model.cases.find(c => c.invoiceNo === extracted.invoiceNo.value);
    if (dup) findings.push({ level: 'attention', code: 'DUPLICATE', text: `Numéro de facture déjà présent dans le dossier ${dup.id}.` });
  }
  const docsMissing = [];
  if (!/contrat|bon de commande|devis/i.test(text)) docsMissing.push('contrat ou bon de commande');
  if (!/livraison|réception|procès-verbal/i.test(text)) docsMissing.push('preuve de livraison ou de réalisation');
  if (docsMissing.length) findings.push({ level: 'info', code: 'MISSING_DOCS', text: `Pièces justificatives recommandées absentes : ${docsMissing.join(', ')}.` });

  const critical = findings.filter(f => f.level === 'critique').length;
  const confidence = Math.max(0.15, Math.min(0.97, 0.95 - missing.length * 0.09 - critical * 0.18 - (injections.length ? 0.1 : 0)));
  const summary = [
    extracted.invoiceNo ? `Facture ${extracted.invoiceNo.value}` : 'Document sans numéro identifiable',
    extracted.issuer ? `émise par ${extracted.issuer.value}` : null,
    extracted.client ? `pour ${extracted.client.value}` : null,
    total != null ? `d’un total déclaré de ${total.toFixed(2)} ${extracted.currency?.value || ''}`.trim() : null,
  ].filter(Boolean).join(' ') + '.';
  return {
    extracted, lineItems, findings, injections, confidence, summary,
    requiresHuman: critical > 0 || confidence < 0.7,
    traceability: { engine: 'Moteur déterministe local v1 (simulation)', at: Date.now(), inputChars: text.length, rule: 'Chaque valeur extraite cite sa ligne source ; aucune valeur n’est déduite sans source.' },
  };
}

/* --------------------- Génération de messages --------------------- */
const FORBIDDEN = [/menac/i, /prison/i, /poursuites?\s+immédiates?/i, /huissier\s+demain/i, /saisie\s+imminente/i, /dernier\s+avertissement/i, /honte/i, /voisins|employeur|famille/i];
export function guardrailCheck(text) {
  const hits = FORBIDDEN.filter(re => re.test(text)).map(re => re.source);
  return { ok: hits.length === 0, hits };
}

const TEMPLATES = {
  fr: {
    soft: (x) => `Bonjour ${x.name},\nNous vous informons qu’une facture ${x.invoice} de ${x.amount} émise par ${x.org} reste à régler depuis le ${x.due}. Si vous avez déjà payé, merci de ne pas tenir compte de ce message. Vous pouvez consulter les justificatifs, contester ou demander un échéancier sur votre portail sécurisé.\nMessage automatisé — un interlocuteur humain reste joignable à tout moment.`,
    firm: (x) => `Bonjour ${x.name},\nMalgré notre précédent message, le solde de ${x.amount} (facture ${x.invoice}, ${x.org}) demeure impayé. Nous vous proposons de régulariser ou de convenir d’un échéancier adapté depuis votre portail. Vous pouvez aussi contester cette créance : les relances seront alors suspendues.\nMessage automatisé — contact humain disponible.`,
    plan: (x) => `Bonjour ${x.name},\nVotre échéancier pour la facture ${x.invoice} est confirmé. Prochaine échéance : ${x.next}. Aucune autre relance ne vous sera adressée tant que l’échéancier est respecté.\nMessage automatisé.`,
  },
  en: {
    soft: (x) => `Hello ${x.name},\nInvoice ${x.invoice} for ${x.amount} issued by ${x.org} has been outstanding since ${x.due}. If you have already paid, please disregard this message. You can review documents, dispute or request a payment plan on your secure portal.\nAutomated message — a human contact is available at any time.`,
    firm: (x) => `Hello ${x.name},\nThe balance of ${x.amount} (invoice ${x.invoice}, ${x.org}) remains unpaid. You may settle it or agree a suitable payment plan on your portal. You can also dispute this debt, which suspends reminders.\nAutomated message — human contact available.`,
    plan: (x) => `Hello ${x.name},\nYour payment plan for invoice ${x.invoice} is confirmed. Next instalment: ${x.next}.\nAutomated message.`,
  },
  es: {
    soft: (x) => `Hola ${x.name},\nLa factura ${x.invoice} por ${x.amount} emitida por ${x.org} está pendiente desde el ${x.due}. Si ya la ha pagado, ignore este mensaje. Puede consultar los justificantes, impugnar o solicitar un plan de pagos en su portal seguro.\nMensaje automatizado — puede contactar con una persona en cualquier momento.`,
    firm: (x) => `Hola ${x.name},\nEl saldo de ${x.amount} (factura ${x.invoice}, ${x.org}) sigue pendiente. Puede regularizarlo o acordar un plan de pagos en su portal. También puede impugnar esta deuda, lo que suspende los recordatorios.\nMensaje automatizado.`,
    plan: (x) => `Hola ${x.name},\nSu plan de pagos para la factura ${x.invoice} está confirmado. Próximo pago: ${x.next}.\nMensaje automatizado.`,
  },
  de: {
    soft: (x) => `Guten Tag ${x.name},\nDie Rechnung ${x.invoice} über ${x.amount} von ${x.org} ist seit dem ${x.due} offen. Falls Sie bereits bezahlt haben, betrachten Sie diese Nachricht bitte als gegenstandslos. Belege, Widerspruch und Ratenzahlung finden Sie in Ihrem sicheren Portal.\nAutomatisierte Nachricht — ein Mensch ist jederzeit erreichbar.`,
    firm: (x) => `Guten Tag ${x.name},\nDer Betrag von ${x.amount} (Rechnung ${x.invoice}, ${x.org}) ist weiterhin offen. Sie können ihn begleichen oder eine Ratenzahlung vereinbaren. Ein Widerspruch setzt die Erinnerungen aus.\nAutomatisierte Nachricht.`,
    plan: (x) => `Guten Tag ${x.name},\nIhr Ratenplan für Rechnung ${x.invoice} ist bestätigt. Nächste Rate: ${x.next}.\nAutomatisierte Nachricht.`,
  },
  ar: {
    soft: (x) => `مرحباً ${x.name}،\nالفاتورة ${x.invoice} بمبلغ ${x.amount} الصادرة عن ${x.org} مستحقة منذ ${x.due}. إذا كنتم قد سددتم المبلغ، يرجى تجاهل هذه الرسالة. يمكنكم الاطلاع على المستندات أو الاعتراض أو طلب جدول سداد عبر البوابة الآمنة.\nرسالة آلية — يمكن التواصل مع موظف في أي وقت.`,
    firm: (x) => `مرحباً ${x.name}،\nلا يزال رصيد ${x.amount} (الفاتورة ${x.invoice}) غير مسدد. يمكنكم السداد أو الاتفاق على جدول مناسب عبر البوابة، أو الاعتراض على هذا الدين مما يوقف التذكيرات.\nرسالة آلية.`,
    plan: (x) => `مرحباً ${x.name}،\nتم تأكيد جدول السداد للفاتورة ${x.invoice}. القسط التالي: ${x.next}.\nرسالة آلية.`,
  },
  ja: {
    soft: (x) => `${x.name} 様\n${x.org} が発行した請求書 ${x.invoice}（${x.amount}）が ${x.due} より未払いとなっております。既にお支払い済みの場合は本メッセージを破棄してください。安全なポータルで書類の確認、異議申立て、分割払いの申請ができます。\n自動送信メッセージ — 担当者にいつでも連絡できます。`,
    firm: (x) => `${x.name} 様\n請求書 ${x.invoice}（${x.org}）の残高 ${x.amount} が未払いです。ポータルでお支払いまたは分割払いのご相談が可能です。異議申立てを行うと督促は停止されます。\n自動送信メッセージ。`,
    plan: (x) => `${x.name} 様\n請求書 ${x.invoice} の分割払いが確定しました。次回：${x.next}。\n自動送信メッセージ。`,
  },
};
export function langOf(locale) { const l = (locale || 'fr').slice(0, 2); return TEMPLATES[l] ? l : 'en'; }

export function generateMessage(model, c, channel, tone = 'soft', lang) {
  const debtor = model.debtorById.get(c.debtorId);
  const org = model.orgById.get(c.orgId);
  const jur = model.jurByCode.get(c.jurisdiction);
  const L = lang || langOf(debtor.language);
  const balance = c.principalMinor + c.feesMinor - c.paidMinor;
  const next = c.plan?.installments.find(i => !i.paid);
  const x = {
    name: debtor.name, invoice: c.invoiceNo, org: org.name,
    amount: fmtMoney(balance, c.currency, jur?.locale || 'fr-FR'),
    due: new Intl.DateTimeFormat(jur?.locale || 'fr-FR', { dateStyle: 'medium', timeZone: 'UTC' }).format(c.dueDate),
    next: next ? new Intl.DateTimeFormat(jur?.locale || 'fr-FR', { dateStyle: 'medium', timeZone: 'UTC' }).format(next.due) : '—',
  };
  let text = TEMPLATES[L][tone](x);
  if (channel === 'sms' || channel === 'whatsapp') text = text.split('\n').slice(0, 2).join(' ').slice(0, 300);
  const guard = guardrailCheck(text);
  return { lang: L, text, guard, channel, rtl: L === 'ar' };
}

/* -------------------- Traduction simulée (glossaire) -------------------- */
const GLOSSARY = {
  en: { 'facture': 'invoice', 'échéance': 'due date', 'montant': 'amount', 'paiement': 'payment', 'contestation': 'dispute', 'échéancier': 'payment plan', 'créance': 'claim', 'relance': 'reminder', 'total': 'total', 'client': 'customer', 'émetteur': 'issuer', 'prestation': 'service', 'fournitures': 'supplies', "main d'œuvre": 'labour', 'date': 'date' },
  es: { 'facture': 'factura', 'échéance': 'vencimiento', 'montant': 'importe', 'paiement': 'pago', 'contestation': 'impugnación', 'échéancier': 'plan de pagos', 'créance': 'crédito', 'relance': 'recordatorio', 'client': 'cliente', 'émetteur': 'emisor', 'prestation': 'servicio', 'fournitures': 'suministros', "main d'œuvre": 'mano de obra' },
};
export function translateGlossary(text, target) {
  const g = GLOSSARY[target];
  if (!g) return { text, note: 'Langue non couverte par le glossaire de démonstration.' };
  let out = text;
  Object.entries(g).sort((a, b) => b[0].length - a[0].length).forEach(([k, v]) => { out = out.replace(new RegExp(k, 'gi'), v); });
  return { text: out, note: 'Traduction SIMULÉE par glossaire terminologique : elle ne remplace pas une traduction professionnelle.' };
}

/* ---------------- Analyse des réponses du débiteur ---------------- */
const INTENTS = [
  { id: 'dispute', label: 'Contestation', re: /(conteste|pas d[ée]bit|jamais re[çc]u|erreur|pas ma dette|dispute|not mine|ne reconnais)/i, action: 'Suspendre les relances et transmettre à un humain' },
  { id: 'hardship', label: 'Difficulté financière', re: /(difficult|ch[ôo]mage|maladie|ne peux pas payer|perdu mon emploi|hardship|can'?t afford)/i, action: 'Basculer vers le parcours d’accompagnement humain' },
  { id: 'paid', label: 'Déjà payé', re: /(d[ée]j[àa] pay|d[ée]j[àa] r[ée]gl|already paid|virement effectu)/i, action: 'Vérifier le rapprochement avant toute nouvelle relance' },
  { id: 'plan', label: 'Demande d’échéancier', re: /(plusieurs fois|[ée]ch[ée]ancier|mensualit|payment plan|instal)/i, action: 'Proposer un échéancier autorisé' },
  { id: 'promise', label: 'Promesse de paiement', re: /(je paierai|je vais payer|d'ici|avant le|will pay)/i, action: 'Enregistrer la promesse et suspendre la cadence' },
  { id: 'stop', label: 'Demande d’arrêt des contacts', re: /(arr[êe]tez|stop|ne plus me contacter|unsubscribe)/i, action: 'Retirer le consentement du canal et prévenir un humain' },
  { id: 'third', label: 'Tiers / mauvais destinataire', re: /(pas moi|mauvais num[ée]ro|wrong number|ne connais pas)/i, action: 'Bloquer le canal, marquer l’identité à vérifier' },
];
export function analyzeReply(text) {
  const hits = INTENTS.filter(i => i.re.test(text));
  const injection = INJECTION_PATTERNS.some(re => re.test(text));
  return { intents: hits.length ? hits : [{ id: 'unknown', label: 'Intention non déterminée', action: 'Revue humaine' }], injection, requiresHuman: hits.length === 0 || hits.some(h => ['dispute', 'hardship', 'third', 'stop'].includes(h.id)) || injection };
}

/* ------------------ Résumé et stratégie de dossier ------------------ */
export function summarizeCase(model, c, at) {
  const balance = c.principalMinor + c.feesMinor - c.paidMinor;
  const overdue = Math.max(0, Math.floor((at - c.dueDate) / DAY));
  const comms = model.comms.filter(m => m.caseId === c.id);
  const sent = comms.filter(m => m.status === 'envoyé').length;
  const blocked = comms.length - sent;
  const missing = Object.entries(c.documents).filter(([, v]) => !v).map(([k]) => ({ facture: 'facture', contrat: 'contrat', bonLivraison: 'bon de livraison', preuveRelance: 'preuve de relance antérieure' }[k]));
  const parts = [
    `Créance ${c.invoiceNo} — solde ${fmtMoney(balance, c.currency)} sur ${fmtMoney(c.principalMinor + c.feesMinor, c.currency)}.`,
    overdue ? `Échue depuis ${overdue} jours.` : 'Pas encore échue.',
    `${sent} communication(s) envoyée(s), ${blocked} bloquée(s) par le moteur juridique.`,
    missing.length ? `Pièces manquantes : ${missing.join(', ')}.` : 'Dossier documentaire complet.',
  ];
  let strategy;
  if (['paye', 'clos'].includes(c.status)) strategy = { label: 'Aucune action', why: 'Créance soldée ou close.' };
  else if (c.status === 'conteste') strategy = { label: 'Revue humaine de la contestation', why: 'Les relances restent suspendues jusqu’à décision.' };
  else if (c.flags.hardship || c.flags.vulnerable) strategy = { label: 'Accompagnement humain', why: 'Signal de difficulté : pas d’automatisation.' };
  else if (!c.documents.facture) strategy = { label: 'Compléter le dossier', why: 'Facture manquante : aucune relance avant complétude.' };
  else if (overdue > 90 && balance > 0) strategy = { label: 'Proposition d’échéancier + appel humain', why: 'Ancienneté élevée : privilégier une solution négociée.' };
  else if (overdue > 30) strategy = { label: 'Relance ferme et courtoise multicanale', why: 'Cadence standard autorisée par la juridiction.' };
  else strategy = { label: 'Relance douce par e-mail', why: 'Retard récent : rappel informatif.' };
  return { text: parts.join(' '), strategy, missing, overdue, confidence: missing.length ? 0.78 : 0.9, engine: 'Gabarits déterministes (simulation)' };
}
