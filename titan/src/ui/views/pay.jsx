const { useState, useMemo } = React;
import { useApp, Card, PageHead, Pill, Btn, Field, Callout, Table, Kpi, Modal, KV, Icon, StatusPill, Tabs, money, dtime, dshort, eur, nfmt } from '../kit.jsx';
import { CURRENCIES, FX_NOTE, toEURMinor, isoDate, DAY } from '../../engine/util.js';
import { DEBT_TYPES } from '../../engine/data.js';

const METHODS = { carte: 'Carte', virement: 'Virement', mobile_money: 'Mobile Money' };

export function Pay() {
  const { model: m, version, act, openCase, confirm } = useApp();
  const [receipt, setReceipt] = useState(null);
  const [refund, setRefund] = useState(null);
  const [reason, setReason] = useState('');
  const pays = useMemo(() => m.payments.slice().reverse(), [version]);
  const byMethod = useMemo(() => { const r = {}; for (const p of m.payments) { if (p.status !== 'confirmé (simulé)') continue; r[p.method] = (r[p.method] || 0) + toEURMinor(p.amountMinor, p.currency); } return r; }, [version]);
  const byCur = useMemo(() => { const r = {}; for (const p of m.payments) { if (p.status !== 'confirmé (simulé)') continue; const x = r[p.currency] || (r[p.currency] = { n: 0, minor: 0 }); x.n++; x.minor += p.amountMinor; } return r; }, [version]);
  const unrec = m.payments.filter(p => !p.reconciled && p.status === 'confirmé (simulé)');
  return <>
    <PageHead eyebrow="Titan Pay — infrastructure financière" title="Paiements simulés" desc="Aucune transaction réelle, aucune coordonnée bancaire stockée. Dans le modèle envisagé, un prestataire de paiement habilité verse les fonds directement au créancier : la plateforme ne détient jamais les fonds des débiteurs." />
    <div className="grid g4">
      {Object.entries(METHODS).map(([k, v]) => <Kpi key={k} label={v} value={eur(byMethod[k] || 0)} detail="Encaissé (EUR démo)" />)}
      <Kpi label="À rapprocher" value={nfmt(unrec.length)} detail="Paiements non rapprochés" alert={unrec.length > 0} />
    </div>
    <div className="grid g3">
      <Card className="span2" title="Historique des opérations" sub={`${nfmt(pays.length)} opérations`}>
        <Table rows={pays} pageSize={12} columns={[
          { key: 'id', label: 'Opération', render: p => <><span className="mono small">{p.id}</span><div className="tiny muted">{dtime(p.at)}</div></> },
          { key: 'caseId', label: 'Dossier', render: p => <button className="btn ghost sm mono" onClick={() => openCase(p.caseId)}>{p.caseId}</button> },
          { key: 'method', label: 'Moyen', render: p => METHODS[p.method] || p.method },
          { key: 'amountMinor', label: 'Montant', right: true, sort: p => toEURMinor(p.amountMinor, p.currency), render: p => money(p.amountMinor, p.currency) },
          { key: 'status', label: 'Statut', render: p => <div className="row" style={{ gap: 4 }}><Pill tone={p.status.startsWith('confirmé') ? 'ok' : 'warn'}>{p.status}</Pill>{!p.reconciled && <Pill tone="warn" plain>non rapproché</Pill>}</div> },
          { key: 'act', label: '', sortable: false, render: p => <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}><Btn size="sm" kind="ghost" onClick={() => setReceipt(p)}>Reçu</Btn>{p.status.startsWith('confirmé') && <Btn size="sm" kind="ghost" onClick={() => { setRefund(p); setReason(''); }}>Rembourser</Btn>}</div> },
        ]} />
      </Card>
      <div className="stack">
        <Card title="Multidevise" sub={FX_NOTE}>
          <div className="tablewrap"><table className="t"><thead><tr><th>Devise</th><th className="r">Taux → EUR</th><th className="r">Encaissé</th></tr></thead><tbody>
            {Object.entries(CURRENCIES).map(([k, c]) => <tr key={k}><td><b>{k}</b><div className="tiny muted">{c.label}</div></td><td className="r num">{c.rateToEUR < 0.01 ? c.rateToEUR.toFixed(6) : c.rateToEUR.toFixed(4)}</td><td className="r num">{byCur[k] ? money(byCur[k].minor, k) : '—'}</td></tr>)}
          </tbody></table></div>
        </Card>
        <Card title="Rapprochement comptable" sub="Simulation">
          <p className="small">{unrec.length} paiement(s) attendent un rapprochement avec le relevé (simulé) du créancier.</p>
          <Btn style={{ marginTop: 8 }} disabled={!unrec.length} onClick={() => act(mm => { let n = 0; for (const p of mm.payments) if (!p.reconciled && p.status === 'confirmé (simulé)') { p.reconciled = true; n++; } mm.log(mm.currentUserId, 'rapprochement', 'paiements', `${n} paiement(s) rapproché(s) automatiquement (montant + référence)`); mm.bump(); return n; }, n => `${n} paiement(s) rapproché(s).`)}>Rapprocher automatiquement</Btn>
        </Card>
        <Card title="Architecture de paiement envisagée">
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
            <li>Prestataire de services de paiement habilité (à sélectionner) ; flux direct débiteur → créancier.</li>
            <li>Tokenisation côté prestataire : aucune donnée de carte ne transite par la plateforme (périmètre PCI DSS réduit, objectif).</li>
            <li>Webhooks signés pour la confirmation des paiements et le rapprochement.</li>
            <li>Remboursements soumis à motif, permission dédiée et journalisation.</li>
          </ul>
        </Card>
      </div>
    </div>
    {receipt && <ReceiptModal p={receipt} onClose={() => setReceipt(null)} />}
    {refund && <Modal title={`Rembourser ${refund.id} ?`} onClose={() => setRefund(null)} footer={<><Btn onClick={() => setRefund(null)}>Annuler</Btn><Btn kind="danger solid" disabled={reason.trim().length < 5} onClick={() => { act(mm => mm.refund(refund.id, reason), 'Remboursement simulé enregistré.'); setRefund(null); }}>Rembourser (simulation)</Btn></>}>
      <p>Montant : <b>{money(refund.amountMinor, refund.currency)}</b> — dossier {refund.caseId}. Le solde du dossier sera rétabli.</p>
      <Field label="Motif obligatoire"><input id="refund-reason" className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex. paiement en double constaté" autoFocus /></Field>
    </Modal>}
  </>;
}

function ReceiptModal({ p, onClose }) {
  const { model: m, toast } = useApp();
  const c = m.caseById.get(p.caseId); const o = m.orgById.get(c.orgId); const d = m.debtorById.get(c.debtorId);
  const txt = `REÇU ${p.receipt} — SIMULATION, SANS VALEUR\nOpération : ${p.id}\nDate : ${dtime(p.at)} UTC\nCréancier : ${o.name}\nDébiteur : ${d.name}\nDossier : ${c.id} / ${c.invoiceNo}\nMontant : ${money(p.amountMinor, p.currency)}\nMoyen : ${METHODS[p.method] || p.method}\nStatut : ${p.status}\nSolde restant : ${money(m.balance(c), c.currency)}`;
  return <Modal title={`Reçu ${p.receipt}`} onClose={onClose} footer={<><Btn onClick={onClose}>Fermer</Btn><Btn kind="primary" icon="copy" onClick={() => navigator.clipboard?.writeText(txt).then(() => toast('Reçu copié.', 'ok'), () => toast('Copie refusée : sélectionnez le texte.', 'warn'))}>Copier le reçu</Btn></>}>
    <div className="codebox wrap">{txt}</div>
    <p className="tiny muted">Document généré par le simulateur : il ne constitue pas une preuve de paiement.</p>
  </Modal>;
}

/* ============================ PORTAIL DÉBITEUR ============================ */
export function Portal() {
  const { model: m, version, act, toast } = useApp();
  const demo = useMemo(() => m.cases.find(c => c.status === 'actif' && c.jurisdiction === 'XA-VAL' && m.debtorById.get(c.debtorId).identity === 'vérifiée'), []);
  const [login, setLogin] = useState({ caseId: demo.id, code: '' });
  const [session, setSession] = useState(null);
  const [err, setErr] = useState('');
  const [view, setView] = useState('home');
  const [tries, setTries] = useState(0);
  if (!session) return <>
    <PageHead eyebrow="Portail sécurisé du débiteur" title="Accéder à mon dossier" desc="Espace simple et accessible pour consulter, payer, contester ou demander de l’aide. Toutes les données sont fictives." />
    <div className="grid g2">
      <Card title="Connexion (simulée)">
        <form className="stack" onSubmit={e => { e.preventDefault(); const c = m.caseById.get(login.caseId.trim().toUpperCase()); if (tries >= 4) { setErr('Trop de tentatives : accès verrouillé 15 minutes (simulation).'); return; } if (!c || m.debtorById.get(c.debtorId).portalCode !== login.code.trim()) { setTries(t => t + 1); setErr('Référence ou code incorrect. Vérifiez le courrier reçu.'); act(mm => mm.log('anonyme', 'échec connexion portail', login.caseId, `Tentative ${tries + 1}`, 'refus')); return; } setErr(''); setSession(c.debtorId); act(mm => mm.log('débiteur', 'connexion portail', c.debtorId, 'Connexion réussie (simulée)')); }}>
          <Field label="Référence du dossier"><input id="p-case" className="input mono" value={login.caseId} onChange={e => setLogin({ ...login, caseId: e.target.value })} autoComplete="off" /></Field>
          <Field label="Code d’accès à 6 chiffres" hint={`Démo : le code de ${demo.id} est ${m.debtorById.get(demo.debtorId).portalCode}`}><input id="p-code" className="input mono" inputMode="numeric" maxLength={6} value={login.code} onChange={e => setLogin({ ...login, code: e.target.value })} autoComplete="off" /></Field>
          {err && <Callout tone="danger">{err}</Callout>}
          <Btn kind="primary" type="submit">Se connecter</Btn>
          <Btn type="button" kind="ghost" onClick={() => setLogin({ caseId: demo.id, code: m.debtorById.get(demo.debtorId).portalCode })}>Remplir avec le compte de démonstration</Btn>
        </form>
      </Card>
      <Card title="Ce que vous pouvez faire ici">
        <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
          <li>Consulter vos créances, montants et justificatifs.</li><li>Payer en une fois ou demander un échéancier.</li><li>Contester une dette : les relances sont suspendues automatiquement.</li><li>Signaler un paiement déjà effectué.</li><li>Joindre un interlocuteur humain.</li><li>Exercer vos droits sur vos données personnelles.</li>
        </ul>
        <Callout tone="ok" icon="help">En difficulté financière ? Un parcours d’accompagnement humain, sans relance automatique, est disponible après connexion.</Callout>
      </Card>
    </div>
  </>;
  const d = m.debtorById.get(session);
  const mine = m.cases.filter(c => c.debtorId === session);
  return <>
    <PageHead eyebrow="Portail sécurisé du débiteur" title={`Bonjour ${d.name}`} desc="Vous êtes connecté à un espace de démonstration. Aucun paiement réel ne sera effectué." actions={<Btn onClick={() => { setSession(null); setView('home'); }}>Se déconnecter</Btn>} />
    <Tabs value={view} onChange={setView} tabs={[{ id: 'home', label: 'Mes créances', count: mine.length }, { id: 'help', label: 'Difficultés de paiement' }, { id: 'contact', label: 'Contacter un humain' }, { id: 'rights', label: 'Mes données' }]} />
    {view === 'home' && <div className="stack">{mine.map(c => <PortalCase key={c.id} c={c} />)}</div>}
    {view === 'help' && <Card title="Accompagnement en cas de difficulté">
      <p>Si votre situation ne vous permet pas de payer, vous pouvez le signaler. Votre dossier sera confié à un conseiller humain et <b>aucune relance automatique</b> ne vous sera adressée. Vous ne serez jamais contacté chez votre employeur ou vos proches.</p>
      <div className="row" style={{ marginTop: 10 }}>{mine.filter(c => !['paye', 'clos'].includes(c.status)).map(c => <Btn key={c.id} kind="primary" onClick={() => act(mm => { c.flags.hardship = true; c.humanQueue = 'Difficulté financière déclarée sur le portail'; c.nextActionAt = null; mm.event(c, 'difficulté', 'Difficulté financière déclarée par le débiteur sur le portail', 'débiteur'); mm.log('débiteur', 'difficulté financière', c.id, 'Bascule en traitement humain'); mm.bump(); }, 'Votre demande est enregistrée. Un conseiller vous recontactera.')}>Signaler une difficulté pour {c.invoiceNo}</Btn>)}</div>
    </Card>}
    {view === 'contact' && <ContactHuman d={d} mine={mine} />}
    {view === 'rights' && <Card title="Vos droits sur vos données personnelles" sub="Parcours de démonstration — inspiré des principes de protection des données, sans valeur juridique">
      <div className="grid g2">{[['Accès', 'Recevoir une copie des données vous concernant.'], ['Rectification', 'Corriger une information inexacte.'], ['Opposition à un canal', 'Ne plus être contacté par SMS, appel ou WhatsApp.'], ['Effacement', 'Demander la suppression lorsque la loi le permet.'], ['Limitation', 'Geler le traitement pendant une vérification.'], ['Portabilité', 'Recevoir vos données dans un format structuré.']].map(([k, v]) => <div key={k} className="card" style={{ padding: 12 }}><b>{k}</b><p className="small muted">{v}</p>
        <Btn size="sm" style={{ marginTop: 8 }} onClick={() => act(mm => { if (k === 'Opposition à un canal') { d.consents.sms = false; d.consents.call = false; d.consents.whatsapp = false; } mm.log('débiteur', 'droit données personnelles', d.id, `Demande : ${k}${k === 'Opposition à un canal' ? ' — consentements SMS/appel/WhatsApp retirés' : ''}`); mm.bump(); }, k === 'Opposition à un canal' ? 'Consentements retirés : ces canaux sont désormais bloqués par le moteur juridique.' : `Demande « ${k} » enregistrée (délai de réponse démo : 30 jours).`)}>Faire la demande</Btn></div>)}</div>
    </Card>}
  </>;
}

function PortalCase({ c }) {
  const { model: m, act, toast } = useApp();
  const o = m.orgById.get(c.orgId), j = m.jurByCode.get(c.jurisdiction);
  const dec = CURRENCIES[c.currency].dec;
  const bal = m.balance(c);
  const [mode, setMode] = useState(null);
  const [amount, setAmount] = useState(String(bal / 10 ** dec));
  const [method, setMethod] = useState('carte');
  const [reason, setReason] = useState('');
  const [n, setN] = useState(6);
  const [receipt, setReceipt] = useState(null);
  const closed = ['paye', 'clos'].includes(c.status);
  const docs = Object.entries(c.documents).filter(([, v]) => v).map(([k]) => ({ facture: 'Facture', contrat: 'Contrat', bonLivraison: 'Bon de livraison', preuveRelance: 'Relance antérieure' }[k]));
  return <Card title={<>{o.name} <span className="mono muted small">· {c.invoiceNo}</span></>} sub={`${DEBT_TYPES[c.debtType]} · échéance ${dshort(c.dueDate)}`} actions={<StatusPill status={c.status} />}>
    <div className="grid g3">
      <div><div className="eyebrow">Reste à payer</div><div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600 }}>{money(bal, c.currency, j.locale)}</div><div className="tiny muted">Montant initial {money(c.principalMinor, c.currency, j.locale)} · frais {money(c.feesMinor, c.currency, j.locale)} · déjà payé {money(c.paidMinor, c.currency, j.locale)}</div></div>
      <div><div className="eyebrow">Justificatifs</div><div className="row" style={{ marginTop: 4 }}>{docs.map(x => <Pill key={x} tone="info" plain>{x}</Pill>)}</div></div>
      <div className="stack" style={{ gap: 6 }}>
        <Btn kind="primary" disabled={closed || c.status === 'conteste'} onClick={() => setMode('pay')}>Payer</Btn>
        <div className="row"><Btn size="sm" disabled={closed || c.status === 'conteste'} onClick={() => setMode('plan')}>Échéancier</Btn><Btn size="sm" disabled={closed || c.status === 'conteste'} onClick={() => setMode('dispute')}>Contester</Btn><Btn size="sm" disabled={closed} onClick={() => setMode('paid')}>Déjà payé</Btn></div>
      </div>
    </div>
    {c.status === 'conteste' && <Callout tone="warn" icon="lock">Votre contestation est en cours d’examen par une personne. Aucune relance ne vous sera envoyée d’ici là.</Callout>}
    {c.plan && c.status === 'echeancier' && <div className="stack" style={{ marginTop: 10 }}><div className="eyebrow">Votre échéancier</div><div className="row">{c.plan.installments.map((i, k) => <Pill key={k} tone={i.paid ? 'ok' : 'muted'} plain>{isoDate(i.due)} · {money(i.amountMinor, c.currency, j.locale)}</Pill>)}</div></div>}
    {mode === 'pay' && <div className="card" style={{ padding: 14, marginTop: 12 }}>
      <div className="grid g3" style={{ alignItems: 'end' }}>
        <Field label={`Montant (${c.currency})`} hint="Paiement partiel accepté"><input id={'pp-amt-' + c.id} className="input num" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
        <Field label="Moyen de paiement"><select id={'pp-m-' + c.id} className="input" value={method} onChange={e => setMethod(e.target.value)}><option value="carte">Carte (simulée)</option><option value="virement">Virement (simulé)</option><option value="mobile_money">Mobile Money (simulé)</option></select></Field>
        <Btn kind="primary" onClick={() => { const p = act(mm => mm.recordPayment(c.id, Math.round(parseFloat(amount.replace(',', '.')) * 10 ** dec), method, { byDebtor: true }), 'Paiement simulé accepté. Merci.'); if (p) { setReceipt(p); setMode(null); } }}>Confirmer le paiement fictif</Btn>
      </div>
      <p className="tiny muted" style={{ marginTop: 6 }}>Ne saisissez aucune vraie donnée bancaire : aucun champ de carte n’existe dans ce simulateur.</p>
    </div>}
    {mode === 'plan' && <div className="card" style={{ padding: 14, marginTop: 12 }}><Field label={`Nombre de mensualités : ${n}`}><input id={'pp-n-' + c.id} type="range" min="2" max="12" value={n} onChange={e => setN(+e.target.value)} /></Field><p className="small">≈ {money(Math.floor(bal / n), c.currency, j.locale)} par mois. Au-delà de 12 mois, un conseiller étudie la demande.</p><Btn kind="primary" style={{ marginTop: 8 }} onClick={() => { act(mm => mm.createPlan(c.id, n, { byDebtor: true }), 'Échéancier accepté.'); setMode(null); }}>Demander cet échéancier</Btn></div>}
    {mode === 'dispute' && <div className="card" style={{ padding: 14, marginTop: 12 }}><Field label="Motif de la contestation"><textarea id={'pp-r-' + c.id} className="input" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Expliquez pourquoi vous contestez cette créance." /></Field><Btn kind="primary" style={{ marginTop: 8 }} disabled={reason.trim().length < 5} onClick={() => { act(mm => mm.openDispute(c.id, reason.trim(), 'débiteur'), 'Contestation enregistrée. Les relances sont suspendues.'); setMode(null); }}>Envoyer la contestation</Btn></div>}
    {mode === 'paid' && <div className="card" style={{ padding: 14, marginTop: 12 }}><p className="small">Indiquez que vous avez déjà payé : le dossier sera vérifié par une personne avant toute nouvelle relance.</p><Btn kind="primary" style={{ marginTop: 8 }} onClick={() => { act(mm => { c.humanQueue = 'Le débiteur déclare avoir déjà payé : vérification du rapprochement'; c.nextActionAt = null; mm.event(c, 'paiement déclaré', 'Le débiteur déclare avoir déjà payé', 'débiteur'); mm.log('débiteur', 'paiement déclaré', c.id, 'Vérification humaine demandée'); mm.bump(); }, 'Merci. Votre déclaration sera vérifiée ; les relances sont suspendues.'); setMode(null); }}>Je déclare avoir payé</Btn></div>}
    {receipt && <ReceiptModal p={receipt} onClose={() => setReceipt(null)} />}
  </Card>;
}

function ContactHuman({ d, mine }) {
  const { act } = useApp();
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  return <Card title="Contacter un interlocuteur humain">
    {sent ? <Callout tone="ok">Message transmis à un conseiller (simulation). Réponse sous 2 jours ouvrés dans cet espace.</Callout> : <>
      <Field label="Votre message"><textarea id="contact-msg" className="input" rows={4} value={msg} onChange={e => setMsg(e.target.value)} /></Field>
      <div className="row" style={{ marginTop: 8 }}><Btn kind="primary" disabled={msg.trim().length < 3} onClick={() => { act(mm => { mm.log('débiteur', 'demande de contact humain', d.id, msg.slice(0, 120)); mine.forEach(c => { if (!['paye', 'clos'].includes(c.status)) { c.humanQueue = 'Le débiteur demande un contact humain'; } }); mm.bump(); }); setSent(true); }}>Envoyer</Btn><span className="tiny muted">Téléphone conseiller (fictif) : <span className="mono">+00 000 0000</span></span></div>
    </>}
  </Card>;
}
