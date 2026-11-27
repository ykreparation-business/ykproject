const { useState, useMemo, useEffect, useRef } = React;
import { useApp, Card, PageHead, Table, StatusPill, Pill, Btn, Field, Drawer, Modal, Tabs, Checks, Callout, KV, Tip, money, dshort, dtime, eur, nfmt, Icon } from '../kit.jsx';
import { STATUSES, CHANNELS, DEBT_TYPES, ORG_TYPES } from '../../engine/data.js';
import { evaluateContact, jurisdictionState } from '../../engine/legal.js';
import { summarizeCase, generateMessage } from '../../engine/ai.js';
import { toEURMinor, DAY, CURRENCIES, isoDate } from '../../engine/util.js';

function loadFilters() { try { return JSON.parse(localStorage.getItem('titan.filters') || '[]'); } catch { return []; } }
function saveFilters(f) { try { localStorage.setItem('titan.filters', JSON.stringify(f)); } catch { /* stockage indisponible */ } }

export function Cases() {
  const { model: m, version, openCase, newCase, act, toast } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [jur, setJur] = useState('');
  const [type, setType] = useState('');
  const [human, setHuman] = useState(false);
  const [saved, setSaved] = useState(loadFilters);
  const [csv, setCsv] = useState(null);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return m.cases.filter(c => (!status || c.status === status) && (!jur || c.jurisdiction === jur) && (!type || c.debtType === type) && (!human || c.humanQueue)
      && (!s || c.id.toLowerCase().includes(s) || c.invoiceNo.toLowerCase().includes(s) || m.debtorById.get(c.debtorId).name.toLowerCase().includes(s) || m.orgById.get(c.orgId).name.toLowerCase().includes(s)));
  }, [version, q, status, jur, type, human]);
  const total = rows.reduce((a, c) => a + toEURMinor(m.balance(c), c.currency), 0);
  const cols = [
    { key: 'id', label: 'Dossier', render: c => <><b className="mono">{c.id}</b><div className="tiny muted">{c.invoiceNo}</div></> },
    { key: 'debtor', label: 'Débiteur', sort: c => m.debtorById.get(c.debtorId).name, render: c => <>{m.debtorById.get(c.debtorId).name}<div className="tiny muted">{m.orgById.get(c.orgId).name}</div></> },
    { key: 'jurisdiction', label: 'Juridiction', render: c => <span className="mono small">{c.jurisdiction}</span> },
    { key: 'balance', label: 'Solde', right: true, sort: c => toEURMinor(m.balance(c), c.currency), render: c => money(m.balance(c), c.currency, m.jurByCode.get(c.jurisdiction)?.locale) },
    { key: 'dueDate', label: 'Échéance', render: c => <>{dshort(c.dueDate)}<div className="tiny muted">{c.dueDate < m.clock ? `+${Math.floor((m.clock - c.dueDate) / DAY)} j` : 'à venir'}</div></> },
    { key: 'status', label: 'Statut', render: c => <div className="row" style={{ gap: 4 }}><StatusPill status={c.status} />{c.humanQueue && <Pill tone="warn" plain title={c.humanQueue}>humain</Pill>}</div> },
  ];
  const current = { q, status, jur, type, human };
  return <>
    <PageHead eyebrow="Gestion des dossiers" title="Dossiers de créances" desc={`${nfmt(rows.length)} dossier(s) affiché(s) · solde ${eur(total)} (conversion EUR démo).`} actions={<>
      <Btn icon="doc" onClick={() => setCsv(act(mm => mm.exportCSV(rows), `Export de ${rows.length} ligne(s) préparé (coordonnées exclues).`))}>Exporter CSV</Btn>
      <Btn kind="primary" icon="plus" onClick={newCase}>Nouveau dossier</Btn>
    </>} />
    <Card>
      <div className="grid g6" style={{ alignItems: 'end' }}>
        <div className="span2"><Field label="Recherche"><input id="cases-q" className="input" placeholder="N° dossier, facture, débiteur, organisation" value={q} onChange={e => setQ(e.target.value)} /></Field></div>
        <Field label="Statut"><select id="cases-status" className="input" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tous</option>{Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
        <Field label="Juridiction"><select id="cases-jur" className="input" value={jur} onChange={e => setJur(e.target.value)}><option value="">Toutes</option>{m.jurisdictions.map(j => <option key={j.code} value={j.code}>{j.name}</option>)}</select></Field>
        <Field label="Type de créance"><select id="cases-type" className="input" value={type} onChange={e => setType(e.target.value)}><option value="">Tous</option>{Object.entries(DEBT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <label className="check" style={{ height: 36 }}><input type="checkbox" checked={human} onChange={e => setHuman(e.target.checked)} /> File humaine uniquement</label>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <span className="tiny muted">Filtres mémorisés :</span>
        {saved.map((f, i) => <span key={i} className="row" style={{ gap: 2 }}><Btn size="sm" onClick={() => { setQ(f.q); setStatus(f.status); setJur(f.jur); setType(f.type); setHuman(f.human); }}>{f.name}</Btn><Btn size="sm" kind="ghost" aria-label="Supprimer le filtre" onClick={() => { const n = saved.filter((_, k) => k !== i); setSaved(n); saveFilters(n); }}>×</Btn></span>)}
        <Btn size="sm" kind="ghost" icon="plus" onClick={() => { const name = [STATUSES[status]?.label, jur, type && DEBT_TYPES[type].split(' ')[1], human && 'humain', q].filter(Boolean).join(' · ') || 'Tous'; const n = [...saved, { name, ...current }].slice(-6); setSaved(n); saveFilters(n); toast(`Filtre « ${name} » mémorisé sur cet appareil.`, 'ok'); }}>Mémoriser ce filtre</Btn>
      </div>
    </Card>
    <Card bodyClass="" className="" title={null}>
      <Table columns={cols} rows={rows} onRow={c => openCase(c.id)} pageSize={15} initialSort={{ key: 'balance', dir: 'desc' }} empty="Aucun dossier ne correspond aux filtres." />
    </Card>
    {csv && <Modal title="Export CSV" wide onClose={() => setCsv(null)} footer={<><Btn onClick={() => setCsv(null)}>Fermer</Btn><Btn kind="primary" icon="copy" onClick={() => navigator.clipboard?.writeText(csv).then(() => toast('Copié dans le presse-papiers.', 'ok'), () => toast('Copie refusée par le navigateur : sélectionnez le texte manuellement.', 'warn'))}>Copier</Btn></>}>
      <Callout>Le téléchargement de fichiers est bloqué dans un Artifact : copiez le contenu puis collez-le dans un tableur. Les coordonnées des débiteurs sont exclues de l’export.</Callout>
      <textarea id="csv-out" className="input mono" rows={12} readOnly value={csv} onFocus={e => e.target.select()} />
    </Modal>}
  </>;
}

/* ============================ Fiche dossier ============================ */
export function CaseDrawer({ id, onClose }) {
  const { model: m, version, act, confirm, toast } = useApp();
  const c = m.caseById.get(id);
  const [tab, setTab] = useState('synthese');
  if (!c) return null;
  const d = m.debtorById.get(c.debtorId), o = m.orgById.get(c.orgId), j = m.jurByCode.get(c.jurisdiction);
  const bal = m.balance(c);
  const locale = j?.locale || 'fr-FR';
  const comms = m.comms.filter(x => x.caseId === c.id).slice(-40).reverse();
  const tabs = [
    { id: 'synthese', label: 'Synthèse' }, { id: 'relance', label: 'Relancer' }, { id: 'actions', label: 'Actions' },
    { id: 'comms', label: 'Communications', count: comms.length }, { id: 'historique', label: 'Historique', count: c.events.length }, { id: 'debiteur', label: 'Débiteur' },
  ];
  return <Drawer onClose={onClose} title={<div className="stack" style={{ gap: 4 }}><div className="row"><h2 className="mono">{c.id}</h2><StatusPill status={c.status} />{c.humanQueue && <Pill tone="warn">Intervention humaine</Pill>}</div><div className="small muted">{c.invoiceNo} · {o.name} → {d.name}</div></div>}>
    <div className="grid g3">
      <div className="card kpi"><span className="eyebrow">Solde</span><span className="v">{money(bal, c.currency, locale)}</span><span className="d">≈ {eur(toEURMinor(bal, c.currency), false)}</span></div>
      <div className="card kpi"><span className="eyebrow">Payé</span><span className="v" style={{ color: 'var(--emerald)' }}>{money(c.paidMinor, c.currency, locale)}</span><span className="d">sur {money(c.principalMinor + c.feesMinor, c.currency, locale)}</span></div>
      <div className="card kpi"><span className="eyebrow">Échéance</span><span className="v" style={{ fontSize: '1.1rem' }}>{dshort(c.dueDate)}</span><span className="d">{c.dueDate < m.clock ? `en retard de ${Math.floor((m.clock - c.dueDate) / DAY)} j` : 'non échue'}</span></div>
    </div>
    {c.humanQueue && <Callout tone="warn"><b>File humaine :</b> {c.humanQueue} <Btn size="sm" style={{ marginLeft: 8 }} onClick={() => act(mm => mm.releaseHumanQueue(c.id, 'Revue humaine effectuée depuis la fiche'), 'Dossier remis dans le circuit.')}>Marquer comme revu</Btn></Callout>}
    <Tabs value={tab} tabs={tabs} onChange={setTab} />
    {tab === 'synthese' && <Synthese c={c} />}
    {tab === 'relance' && <Relance c={c} />}
    {tab === 'actions' && <Actions c={c} />}
    {tab === 'comms' && (comms.length ? <div className="stack">{comms.map(x => <div key={x.id} className="card" style={{ padding: 12 }}>
      <div className="between"><span className="row"><Pill tone={x.status === 'envoyé' ? 'ok' : 'danger'}>{x.status}</Pill><b>{CHANNELS[x.channel].label}</b>{x.automated && <span className="tiny muted">automatisé</span>}</span><span className="tiny muted mono">{dtime(x.at)}</span></div>
      {x.text ? <div className={'codebox wrap' + (x.lang === 'ar' ? ' rtl' : '')} style={{ marginTop: 8 }}>{x.text}</div> : <p className="small muted" style={{ marginTop: 6 }}>{x.summary}</p>}
      {x.reasons?.length > 0 && <ul className="small" style={{ margin: '6px 0 0', paddingLeft: 18, color: 'var(--danger)' }}>{x.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>}
    </div>)}</div> : <p className="muted">Aucune communication.</p>)}
    {tab === 'historique' && <div className="timeline">{c.events.slice().reverse().map((e, i) => <div key={i} className={'tl ' + ({ paiement: 'ok', contestation: 'warn', blocage: 'danger', annulation: 'ok' }[e.type] || '')}><div className="when">{isoDate(e.at)}</div><div className="rail" /><div className="what"><b>{e.type}</b> — {e.text}<div className="tiny muted">par {e.actor}</div></div></div>)}</div>}
    {tab === 'debiteur' && <Debiteur d={d} c={c} />}
  </Drawer>;
}

function Synthese({ c }) {
  const { model: m, act, version } = useApp();
  const o = m.orgById.get(c.orgId), j = m.jurByCode.get(c.jurisdiction), d = m.debtorById.get(c.debtorId);
  const sum = useMemo(() => summarizeCase(m, c, m.clock), [version, c.id]);
  const review = m.aiReviews.find(r => r.ref === c.id && r.kind === 'résumé');
  const docs = { facture: 'Facture', contrat: 'Contrat', bonLivraison: 'Bon de livraison', preuveRelance: 'Preuve de relance' };
  return <>
    <Card title="Synthèse Titan Intelligence" sub={`${sum.engine} · confiance ${Math.round(sum.confidence * 100)} %`} actions={<Pill tone={review ? (review.decision === 'approuvé' ? 'ok' : 'danger') : 'warn'}>{review ? `Validé humainement : ${review.decision}` : 'En attente de validation humaine'}</Pill>}>
      <p>{sum.text}</p>
      <div className="callout" style={{ marginTop: 10 }}><Icon name="ai" size={16} /><div><b>Stratégie proposée :</b> {sum.strategy.label}<div className="small muted">{sum.strategy.why} Proposition non contraignante : la décision reste humaine et le moteur juridique conserve le dernier mot.</div></div></div>
      <div className="row" style={{ marginTop: 10 }}><Btn size="sm" kind="ok" icon="check" onClick={() => act(mm => mm.reviewAI('résumé', c.id, 'approuvé'), 'Synthèse validée et journalisée.')}>Valider la synthèse</Btn><Btn size="sm" kind="danger" onClick={() => act(mm => mm.reviewAI('résumé', c.id, 'rejeté', 'Synthèse jugée inexacte'), 'Rejet journalisé : signalé pour amélioration.')}>Signaler une erreur</Btn></div>
    </Card>
    <div className="grid g2">
      <Card title="Créance"><KV items={[
        ['Organisation', <>{o.name}<div className="tiny muted">{ORG_TYPES[o.type].label} · {o.status}</div></>],
        ['Type', DEBT_TYPES[c.debtType]], ['Juridiction', <>{j.name} <span className="mono tiny">({j.code}, fictive)</span></>],
        ['Devise', `${c.currency} — ${CURRENCIES[c.currency].label}`], ['Principal', money(c.principalMinor, c.currency, j.locale)], ['Frais', money(c.feesMinor, c.currency, j.locale)],
        ['Émission', dshort(c.issueDate)], ['Prochaine action', c.nextActionAt ? dshort(c.nextActionAt) : <span className="muted">aucune programmée</span>],
        c.plan && ['Échéancier', `${c.plan.installments.filter(i => i.paid).length}/${c.plan.installments.length} échéances payées`],
        c.promise && ['Promesse', `${money(c.promise.amountMinor, c.currency, j.locale)} le ${dshort(c.promise.date)}`],
        c.dispute && ['Contestation', `${c.dispute.reason} (${c.dispute.state})`],
      ]} /></Card>
      <Card title="Pièces et indicateurs">
        <div className="stack" style={{ gap: 6 }}>{Object.entries(docs).map(([k, v]) => <label key={k} className="check"><input type="checkbox" checked={c.documents[k]} onChange={e => act(mm => mm.setDocument(c.id, k, e.target.checked))} />{v}{!c.documents[k] && <Pill tone="warn" plain>manquant</Pill>}</label>)}</div>
        <div className="sep" />
        <div className="stack" style={{ gap: 6 }}>
          <label className="check"><input type="checkbox" checked={c.flags.hardship} onChange={e => act(mm => mm.setFlag(c.id, 'hardship', e.target.checked))} />Difficulté financière signalée <Tip text="Bascule le dossier en traitement humain : aucune automatisation." /></label>
          <label className="check"><input type="checkbox" checked={c.flags.vulnerable} onChange={e => act(mm => mm.setFlag(c.id, 'vulnerable', e.target.checked))} />Situation de vulnérabilité</label>
          <label className="check"><input type="checkbox" checked={c.flags.crossBorderReviewed} disabled={d.country === o.jurisdiction} onChange={e => act(mm => mm.setFlag(c.id, 'crossBorderReviewed', e.target.checked))} />Revue transfrontalière effectuée {d.country !== o.jurisdiction && <Pill tone="info" plain>{o.jurisdiction} → {d.country}</Pill>}</label>
        </div>
      </Card>
    </div>
  </>;
}

function Relance({ c }) {
  const { model: m, act, version } = useApp();
  const [channel, setChannel] = useState('email');
  const [tone, setTone] = useState(c.lastContactAt ? 'firm' : 'soft');
  const verdict = useMemo(() => evaluateContact(m, c, channel, m.clock, { automated: false }), [version, channel, c.id]);
  const msg = useMemo(() => generateMessage(m, c, channel, tone), [version, channel, tone, c.id]);
  return <>
    <div className="grid g2">
      <Field label="Canal"><select id="rel-channel" className="input" value={channel} onChange={e => setChannel(e.target.value)}>{Object.entries(CHANNELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
      <Field label="Ton du message" tip="Le garde-fou refuse toute formulation menaçante, culpabilisante ou révélant la dette à un tiers."><select id="rel-tone" className="input" value={tone} onChange={e => setTone(e.target.value)}><option value="soft">Informatif</option><option value="firm">Ferme et courtois</option><option value="plan">Confirmation d’échéancier</option></select></Field>
    </div>
    <p className="small muted">Évaluation à l’heure virtuelle actuelle ({dtime(m.clock)} UTC). Relance manuelle par l’utilisateur connecté : le contrôle des automatisations ne s’applique pas, toutes les autres règles oui.</p>
    <Checks verdict={verdict} />
    <Card title="Aperçu du message" sub={`Langue : ${msg.lang} · garde-fou ${msg.guard.ok ? 'conforme' : 'refusé'}`}><div className={'codebox wrap' + (msg.rtl ? ' rtl' : '')}>{msg.text}</div></Card>
    <div className="row"><Btn kind="primary" icon="connect" disabled={!verdict.allowed} onClick={() => act(mm => mm.attemptContact(c.id, channel, { automated: false, tone }), r => r.verdict.allowed ? 'Relance enregistrée (simulée, aucun envoi réel).' : 'Relance bloquée et journalisée.')}>Envoyer (simulation)</Btn>
      {!verdict.allowed && <Btn onClick={() => act(mm => mm.attemptContact(c.id, channel, { automated: false, tone }), 'Tentative bloquée et journalisée.')}>Tenter quand même (sera bloqué)</Btn>}</div>
  </>;
}

function Actions({ c }) {
  const { model: m, act, confirm } = useApp();
  const j = m.jurByCode.get(c.jurisdiction);
  const dec = CURRENCIES[c.currency].dec;
  const bal = m.balance(c);
  const [amount, setAmount] = useState(String(bal / 10 ** dec));
  const [method, setMethod] = useState('carte');
  const [n, setN] = useState(6);
  const [reason, setReason] = useState('Montant contesté');
  const closed = ['paye', 'clos'].includes(c.status);
  return <div className="stack">
    <Card title="Enregistrer un paiement fictif" sub="Aucune transaction réelle. Les fonds seraient versés directement au créancier.">
      <div className="grid g3" style={{ alignItems: 'end' }}>
        <Field label={`Montant (${c.currency})`}><input id="pay-amount" className="input num" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} disabled={closed} /></Field>
        <Field label="Moyen"><select id="pay-method" className="input" value={method} onChange={e => setMethod(e.target.value)} disabled={closed}><option value="carte">Carte (simulée)</option><option value="virement">Virement (simulé)</option><option value="mobile_money">Mobile Money (simulé)</option></select></Field>
        <Btn kind="primary" disabled={closed} onClick={() => act(mm => mm.recordPayment(c.id, Math.round(parseFloat(amount.replace(',', '.')) * 10 ** dec), method), p => `Paiement ${p.id} enregistré — reçu ${p.receipt}.`)}>Enregistrer</Btn>
      </div>
      <p className="tiny muted" style={{ marginTop: 6 }}>Un paiement intégral annule automatiquement les relances restantes.</p>
    </Card>
    <div className="grid g2">
      <Card title="Échéancier">
        <Field label={`Nombre d’échéances mensuelles : ${n}`}><input id="plan-n" type="range" min="2" max="24" value={n} onChange={e => setN(+e.target.value)} /></Field>
        <p className="small muted">≈ {money(Math.floor(bal / n), c.currency, j.locale)} par mois</p>
        <Btn disabled={closed || c.status === 'conteste'} onClick={() => act(mm => mm.createPlan(c.id, n), 'Échéancier créé : relances suspendues tant qu’il est respecté.')}>Créer l’échéancier</Btn>
      </Card>
      <Card title="Contestation">
        {c.status === 'conteste' ? <><p className="small">Motif : {c.dispute?.reason}</p><div className="row" style={{ marginTop: 8 }}>
          <Btn size="sm" onClick={() => act(mm => mm.resolveDispute(c.id, 'maintenue'), 'Créance maintenue après examen.')}>Maintenir</Btn>
          <Btn size="sm" onClick={() => act(mm => mm.resolveDispute(c.id, 'corrigée'), 'Montant corrigé.')}>Corriger (retirer frais)</Btn>
          <Btn size="sm" kind="danger" onClick={() => confirm({ title: 'Annuler la créance ?', body: 'Le dossier sera clos et le solde ramené au montant déjà payé.', danger: true, ok: 'Annuler la créance', onOk: () => act(mm => mm.resolveDispute(c.id, 'annulée'), 'Créance annulée.') })}>Annuler la créance</Btn></div></>
          : <><Field label="Motif"><input id="dispute-reason" className="input" value={reason} onChange={e => setReason(e.target.value)} /></Field><Btn style={{ marginTop: 8 }} disabled={closed} onClick={() => act(mm => mm.openDispute(c.id, reason, 'gestionnaire'), 'Contestation enregistrée : relances suspendues.')}>Enregistrer une contestation</Btn></>}
      </Card>
    </div>
    <Card title="Autres actions">
      <div className="row">
        <Btn disabled={closed || c.status === 'conteste'} onClick={() => act(mm => mm.recordPromise(c.id, 7, mm.currentUserId), 'Promesse enregistrée à J+7.')}>Promesse à 7 jours</Btn>
        {c.status === 'suspendu' ? <Btn onClick={() => act(mm => mm.resumeCase(c.id), 'Dossier repris.')}>Reprendre</Btn> : <Btn disabled={closed} onClick={() => act(mm => mm.suspendCase(c.id, 'Suspension manuelle depuis la fiche'), 'Dossier suspendu.')}>Suspendre</Btn>}
        <Btn onClick={() => act(mm => mm.setIdentity(c.debtorId, 'vérifiée'), 'Identité marquée vérifiée (simulation).')}>Marquer l’identité vérifiée</Btn>
      </div>
      <div className="sep" />
      <Callout tone="warn">Saisie, acte judiciaire, prélèvement forcé ou sanction : <b>hors du périmètre de la plateforme</b>. Ces actes restent réservés aux professionnels et autorités habilités ; aucun bouton ne les déclenche.</Callout>
    </Card>
  </div>;
}

function Debiteur({ d, c }) {
  const { model: m, act, go } = useApp();
  const [shown, setShown] = useState(false);
  const can = m.can('pii.read');
  return <Card title="Débiteur (fictif)" sub="Coordonnées masquées par défaut ; toute consultation est journalisée.">
    <KV items={[
      ['Identifiant', <span className="mono">{d.id}</span>], ['Nom', d.name], ['Nature', d.kind], ['Pays', d.country],
      ['Identité', <Pill tone={d.identity === 'vérifiée' ? 'ok' : 'danger'}>{d.identity}</Pill>],
      ['E-mail', shown ? d.email : '••••••@exemple.invalid'], ['Téléphone', shown ? d.phone : '+00 ••• ••••'],
      ['Consentements', Object.entries(d.consents).filter(([, v]) => v).map(([k]) => CHANNELS[k]?.label || k).join(', ') || 'aucun'],
      ['Coordonnées bancaires', 'Jamais stockées dans le simulateur'], ['Code portail démo', <span className="mono">{d.portalCode}</span>],
    ]} />
    <div className="row" style={{ marginTop: 10 }}>
      {can ? <Btn icon="eye" onClick={() => { act(mm => mm.revealPII(d.id)); setShown(true); }}>Afficher les coordonnées</Btn>
        : <><Btn icon="lock" disabled>Coordonnées protégées</Btn><Btn kind="ghost" onClick={() => go('control')}>Demander un accès exceptionnel</Btn></>}
    </div>
    {!can && <p className="tiny muted" style={{ marginTop: 6 }}>Votre rôle ne donne pas accès aux données personnelles. Même le super administrateur doit passer par un accès exceptionnel justifié, limité dans le temps et approuvé par un tiers.</p>}
  </Card>;
}

/* ============================ Assistant de création ============================ */
export function NewCaseWizard({ onClose }) {
  const { model: m, act, openCase } = useApp();
  const t0 = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const [step, setStep] = useState(0);
  const firstOrg = m.orgs.find(o => o.jurisdiction === 'XA-VAL' && o.status === 'actif' && o.group === 'entreprise');
  const [f, setF] = useState({ orgId: firstOrg.id, debtorName: 'Société Démo Nouvelle', debtorKind: 'entreprise', country: '', invoiceNo: 'FAC-NEW-' + String(m.cases.length + 1).padStart(5, '0'), amount: '1250', dueDate: isoDate(m.clock - 20 * DAY), debtType: '', hasInvoice: true, hasContract: true, hasDelivery: false, consentSms: false, consentCall: false, identityVerified: true });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const org = m.orgById.get(f.orgId);
  const country = f.country || org.jurisdiction;
  const jur = m.jurByCode.get(country);
  const st = jurisdictionState(jur, m.clock);
  const elapsed = Math.floor((now - t0.current) / 1000);
  const errors = [];
  if (step >= 1) { if (!(parseFloat(f.amount) > 0)) errors.push('Le montant doit être positif.'); if (!f.invoiceNo.trim()) errors.push('Numéro de facture requis.'); if (!f.dueDate) errors.push('Date d’échéance requise.'); }
  if (step >= 0 && !f.debtorName.trim()) errors.push('Nom du débiteur requis.');
  const submit = () => { const c = act(mm => mm.createCase({ ...f, country, amount: parseFloat(String(f.amount).replace(',', '.')) }), cc => `Dossier ${cc.id} créé en ${Math.floor((Date.now() - t0.current) / 60000)} min ${Math.floor((Date.now() - t0.current) / 1000) % 60} s.`); if (c) { onClose(); openCase(c.id); } };
  const steps = ['Créancier et débiteur', 'Créance', 'Pièces et vérification'];
  return <Modal wide title="Nouveau dossier — formulaire guidé" onClose={onClose} footer={<>
    <span className="tiny muted" style={{ marginRight: 'auto', alignSelf: 'center' }}>Temps écoulé : <b className="num" style={{ color: elapsed < 180 ? 'var(--emerald)' : 'var(--warn)' }}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</b> · objectif &lt; 3:00</span>
    {step > 0 && <Btn onClick={() => setStep(step - 1)}>Retour</Btn>}
    {step < 2 ? <Btn kind="primary" disabled={errors.length > 0} onClick={() => setStep(step + 1)}>Continuer</Btn> : <Btn kind="primary" icon="check" disabled={errors.length > 0} onClick={submit}>Créer le dossier</Btn>}
  </>}>
    <div className="steps">{steps.map((s, i) => <i key={s} className={i <= step ? 'on' : ''} />)}</div>
    <div className="eyebrow">Étape {step + 1} sur 3 — {steps[step]}</div>
    {step === 0 && <div className="grid g2">
      <Field label="Organisation créancière" hint={`${ORG_TYPES[org.type].label} · ${org.jurisdiction} · ${org.currency}`}><select id="w-org" className="input" value={f.orgId} onChange={e => set('orgId', e.target.value)}>{m.orgs.map(o => <option key={o.id} value={o.id} disabled={o.status !== 'actif'}>{o.name}</option>)}</select></Field>
      <Field label="Nom du débiteur (fictif)" hint="N’utilisez jamais de données réelles dans le simulateur."><input id="w-debtor" className="input" value={f.debtorName} onChange={e => set('debtorName', e.target.value)} /></Field>
      <Field label="Nature du débiteur"><select id="w-kind" className="input" value={f.debtorKind} onChange={e => set('debtorKind', e.target.value)}><option value="entreprise">Entreprise</option><option value="particulier">Particulier</option></select></Field>
      <Field label="Pays du débiteur" tip="Si différent de la juridiction du créancier, une revue transfrontalière humaine sera exigée avant toute relance."><select id="w-country" className="input" value={f.country} onChange={e => set('country', e.target.value)}><option value="">Même juridiction que le créancier ({org.jurisdiction})</option>{m.jurisdictions.map(j => <option key={j.code} value={j.code}>{j.name} ({j.code})</option>)}</select></Field>
    </div>}
    {step === 1 && <div className="grid g2">
      <Field label="Numéro de facture"><input id="w-inv" className="input mono" value={f.invoiceNo} onChange={e => set('invoiceNo', e.target.value)} /></Field>
      <Field label={`Montant principal (${org.currency})`}><input id="w-amount" className="input num" inputMode="decimal" value={f.amount} onChange={e => set('amount', e.target.value)} /></Field>
      <Field label="Date d’échéance"><input id="w-due" type="date" className="input" value={f.dueDate} onChange={e => set('dueDate', e.target.value)} /></Field>
      <Field label="Type de créance" hint="Une créance publique ou bancaire exige une organisation habilitée."><select id="w-type" className="input" value={f.debtType} onChange={e => set('debtType', e.target.value)}><option value="">Par défaut pour ce créancier ({DEBT_TYPES[ORG_TYPES[org.type].debt]})</option>{Object.entries(DEBT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
    </div>}
    {step === 2 && <div className="grid g2">
      <div className="stack">
        <label className="check"><input type="checkbox" checked={f.hasInvoice} onChange={e => set('hasInvoice', e.target.checked)} />Facture jointe</label>
        <label className="check"><input type="checkbox" checked={f.hasContract} onChange={e => set('hasContract', e.target.checked)} />Contrat ou bon de commande</label>
        <label className="check"><input type="checkbox" checked={f.hasDelivery} onChange={e => set('hasDelivery', e.target.checked)} />Preuve de livraison</label>
        <div className="sep" />
        <label className="check"><input type="checkbox" checked={f.identityVerified} onChange={e => set('identityVerified', e.target.checked)} />Identité du débiteur vérifiée</label>
        <label className="check"><input type="checkbox" checked={f.consentSms} onChange={e => set('consentSms', e.target.checked)} />Consentement SMS</label>
        <label className="check"><input type="checkbox" checked={f.consentCall} onChange={e => set('consentCall', e.target.checked)} />Consentement appels</label>
      </div>
      <div className="stack">
        <div className="eyebrow">Pré-contrôle</div>
        <div className={'verdict ' + (st.ok ? 'ok' : 'ko')}>{st.ok ? `Juridiction ${jur.name} validée (règles fictives v${st.ruleset.version})` : `Juridiction ${jur.name} bloquée`}</div>
        {!st.ok && <p className="small muted">{st.issues.join(' · ')}. Le dossier sera créé mais aucune relance ne pourra partir.</p>}
        {!f.hasInvoice && <Callout tone="warn">Sans facture, le dossier est incomplet : relances bloquées.</Callout>}
        {!f.identityVerified && <Callout tone="warn">Identité non vérifiée : contact interdit pour ne pas révéler la dette à un tiers.</Callout>}
        {country !== org.jurisdiction && <Callout>Créance transfrontalière : revue humaine requise.</Callout>}
        {m.cases.some(c => c.orgId === f.orgId && c.invoiceNo === f.invoiceNo.trim()) && <Callout tone="danger">Ce numéro de facture existe déjà pour cette organisation : une alerte de doublon sera créée.</Callout>}
      </div>
    </div>}
    {errors.length > 0 && <Callout tone="danger">{errors.join(' ')}</Callout>}
  </Modal>;
}
