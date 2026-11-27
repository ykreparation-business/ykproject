const { useState, useMemo } = React;
import { useApp, Card, PageHead, Pill, Btn, Field, Callout, Table, Kpi, Tabs, KV, AreaChart, Bars, HBars, Icon, eur, pct, nfmt, dtime } from '../kit.jsx';
import { analyzeDocument, translateGlossary, AI_PROVIDERS, generateMessage, guardrailCheck } from '../../engine/ai.js';
import { SAMPLE_DOC, CHANNELS } from '../../engine/data.js';
import { toEURMinor, DAY } from '../../engine/util.js';

/* ============================ TITAN INTELLIGENCE ============================ */
export function Intelligence() {
  const { model: m, version, act, toast } = useApp();
  const [text, setText] = useState(SAMPLE_DOC);
  const [res, setRes] = useState(() => analyzeDocument(SAMPLE_DOC, m));
  const [tab, setTab] = useState('doc');
  const [lang, setLang] = useState('en');
  const tr = useMemo(() => translateGlossary(text, lang), [text, lang]);
  const flagged = new Set(res.findings.flatMap(f => f.lines || []));
  const injLines = new Set(res.injections.map(i => i.line));
  const reviews = m.aiReviews;
  const approved = reviews.filter(r => r.decision === 'approuvé').length;
  return <>
    <PageHead eyebrow="Titan Intelligence — moteur IA simulé" title="Analyse documentaire et assistance" desc="Simulation déterministe : aucune IA réelle n’est appelée et aucune donnée ne quitte le navigateur. Chaque valeur extraite cite sa ligne source ; les décisions restent humaines." />
    <div className="grid g4">
      <Kpi label="Productions validées" value={nfmt(approved)} detail={`${nfmt(reviews.length - approved)} rejetée(s)`} tone="emerald" />
      <Kpi label="Taux d’acceptation humaine" value={reviews.length ? pct(approved / reviews.length) : '—'} detail="Évaluation continue des réponses" />
      <Kpi label="Analyses documentaires" value={nfmt(m.agents.find(a => a.id === 'docs').actions)} />
      <Kpi label="Injections bloquées" value={nfmt(m.audit.filter(e => e.action === 'injection détectée').length)} detail="Consignes traitées comme données" tone="warn" />
    </div>
    <Tabs value={tab} onChange={setTab} tabs={[{ id: 'doc', label: 'Analyse de document' }, { id: 'gen', label: 'Génération de messages' }, { id: 'translate', label: 'Traduction' }, { id: 'gov', label: 'Gouvernance IA' }]} />
    {tab === 'doc' && <div className="grid g2">
      <Card title="Document importé (donnée non fiable)" actions={<><Btn size="sm" kind="ghost" onClick={() => setText(SAMPLE_DOC)}>Exemple piégé</Btn><Btn size="sm" kind="ghost" onClick={() => setText('FACTURE N° FAC-OK-2201\nÉmetteur : Atelier Démo Lumen (fictif)\nClient : Société Démo Atlas-0007\nDate d’émission : 2026-09-01\nDate d’échéance : 2026-10-01\nLigne 1 : Prestation ........ 900,00 EUR\nLigne 2 : Déplacement ........ 100,00 EUR\nTotal TTC : 1 000,00 EUR\nContrat de service n° CS-88 ; procès-verbal de réception signé.')}>Exemple propre</Btn></>}>
        <textarea id="doc-text" className="input mono" rows={13} value={text} onChange={e => setText(e.target.value)} />
        <div className="row" style={{ marginTop: 10 }}>
          <Btn kind="primary" icon="ai" onClick={() => { const r = analyzeDocument(text, m); setRes(r); act(mm => { mm.agents.find(a => a.id === 'docs').actions++; if (r.injections.length) { mm.log('agent:docs', 'injection détectée', 'document', `${r.injections.length} consigne(s) ignorée(s)`, 'alerte'); } mm.log('agent:docs', 'analyse documentaire', r.extracted.invoiceNo?.value || 'document', `${r.findings.length} constat(s), confiance ${Math.round(r.confidence * 100)} %`); mm.bump(); }); }}>Analyser</Btn>
          <span className="tiny muted">Le document est lu comme du texte. Les phrases ressemblant à des ordres ne sont jamais exécutées.</span>
        </div>
        <div className="sep" />
        <div className="codebox" aria-label="Lignes du document">{text.split('\n').map((l, i) => <div key={i} className={injLines.has(i + 1) ? 'hl' : ''} style={{ color: flagged.has(i + 1) ? 'var(--warn)' : undefined }}><span className="muted">{String(i + 1).padStart(2, ' ')} │ </span>{l}</div>)}</div>
      </Card>
      <div className="stack">
        <Card title="Résultat" sub={`${res.traceability.engine} · confiance ${Math.round(res.confidence * 100)} %`} actions={<Pill tone={res.requiresHuman ? 'warn' : 'ok'}>{res.requiresHuman ? 'Validation humaine requise' : 'Contrôles passés'}</Pill>}>
          <p>{res.summary}</p>
          <div className="sep" />
          <KV items={Object.entries({ invoiceNo: 'N° facture', issuer: 'Émetteur', client: 'Client', issueDate: 'Émission', dueDate: 'Échéance', total: 'Total', currency: 'Devise' }).map(([k, l]) => [l, res.extracted[k] ? <>{res.extracted[k].value} <span className="tiny muted">(ligne {res.extracted[k].line})</span></> : <span className="muted">non trouvé — non déduit</span>])} />
        </Card>
        <Card title="Constats" sub={`${res.findings.length} constat(s)`}>
          <div className="stack">{res.findings.length === 0 ? <p className="muted">Aucune anomalie détectée.</p> : res.findings.map((f, i) => <div key={i} className={'callout ' + (f.level === 'critique' ? 'danger' : f.level === 'attention' ? 'warn' : '')}><div><b className="mono tiny">{f.code}</b> — {f.text}{f.lines && <div className="tiny muted">Lignes : {f.lines.join(', ')}</div>}</div></div>)}</div>
          <div className="row" style={{ marginTop: 10 }}><Btn size="sm" kind="ok" onClick={() => act(mm => mm.reviewAI('analyse documentaire', res.extracted.invoiceNo?.value || 'document', 'approuvé'), 'Analyse validée.')}>Valider l’analyse</Btn><Btn size="sm" kind="danger" onClick={() => act(mm => mm.reviewAI('analyse documentaire', res.extracted.invoiceNo?.value || 'document', 'rejeté', 'Extraction incorrecte'), 'Rejet journalisé.')}>Rejeter</Btn></div>
        </Card>
      </div>
    </div>}
    {tab === 'gen' && <MessageGen />}
    {tab === 'translate' && <Card title="Traduction simulée" sub={tr.note} actions={<select className="input" style={{ width: 'auto' }} value={lang} onChange={e => setLang(e.target.value)} aria-label="Langue cible"><option value="en">Anglais</option><option value="es">Espagnol</option></select>}>
      <div className="grid g2"><div className="codebox wrap">{text}</div><div className="codebox wrap">{tr.text}</div></div>
    </Card>}
    {tab === 'gov' && <div className="grid g2">
      <Card title="Fournisseurs d’IA (architecture multi-fournisseurs)">
        <div className="stack">{AI_PROVIDERS.map(p => <div key={p.id} className="between card" style={{ padding: 10 }}><div><b>{p.name}</b><div className="tiny muted">{p.note}</div></div><Pill tone={p.status.startsWith('actif') ? 'ok' : 'muted'}>{p.status}</Pill></div>)}</div>
        <p className="tiny muted" style={{ marginTop: 8 }}>Une couche d’abstraction unique permettra de router les tâches vers différents fournisseurs, avec journalisation des requêtes, des versions de modèle et des coûts.</p>
      </Card>
      <Card title="Garde-fous appliqués">
        <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
          <li><b>Implémenté :</b> séparation stricte données / instructions — les documents et réponses sont analysés par motifs, jamais exécutés.</li>
          <li><b>Implémenté :</b> détection de consignes injectées (FR/EN) et signalement au journal.</li>
          <li><b>Implémenté :</b> contrôle des hallucinations — aucune valeur extraite sans ligne source ; les champs absents restent « non trouvé ».</li>
          <li><b>Implémenté :</b> garde-fou de ton sur chaque message (menace, intimidation, révélation à un tiers).</li>
          <li><b>Implémenté :</b> le moteur juridique est consulté après l’IA et peut toujours refuser.</li>
          <li><b>Implémenté :</b> validation humaine journalisée des synthèses et analyses.</li>
          <li><b>Représenté :</b> évaluation automatique sur jeux de tests, red teaming, suivi des dérives de modèle.</li>
        </ul>
      </Card>
      <Card title="Dernières validations humaines" className="span2">
        <Table rows={reviews} pageSize={8} empty="Aucune validation pour l’instant. Validez une synthèse depuis une fiche dossier." columns={[
          { key: 'at', label: 'Date', render: r => <span className="mono tiny">{dtime(r.at)}</span> }, { key: 'kind', label: 'Type' }, { key: 'ref', label: 'Référence', render: r => <span className="mono small">{r.ref}</span> },
          { key: 'decision', label: 'Décision', render: r => <Pill tone={r.decision === 'approuvé' ? 'ok' : 'danger'}>{r.decision}</Pill> }, { key: 'by', label: 'Par', render: r => m.userById(r.by).name },
        ]} />
      </Card>
    </div>}
  </>;
}

function MessageGen() {
  const { model: m } = useApp();
  const pool = useMemo(() => m.jurisdictions.map(j => m.cases.find(c => c.jurisdiction === j.code && c.status === 'actif')).filter(Boolean), []);
  const [caseId, setCaseId] = useState(pool[0].id);
  const [channel, setChannel] = useState('email');
  const [tone, setTone] = useState('soft');
  const [custom, setCustom] = useState('Vous avez 24 h, sinon saisie imminente et nous préviendrons votre employeur.');
  const c = m.caseById.get(caseId);
  const msg = generateMessage(m, c, channel, tone);
  const cg = guardrailCheck(custom);
  return <div className="grid g2">
    <Card title="Communication générée" sub="Gabarits multilingues validés, adaptés à la langue du débiteur">
      <div className="grid g3"><Field label="Dossier"><select id="mg-case" className="input" value={caseId} onChange={e => setCaseId(e.target.value)}>{pool.map(x => <option key={x.id} value={x.id}>{x.id} ({x.jurisdiction})</option>)}</select></Field>
        <Field label="Canal"><select id="mg-ch" className="input" value={channel} onChange={e => setChannel(e.target.value)}>{Object.entries(CHANNELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
        <Field label="Ton"><select id="mg-tone" className="input" value={tone} onChange={e => setTone(e.target.value)}><option value="soft">Informatif</option><option value="firm">Ferme et courtois</option><option value="plan">Échéancier</option></select></Field></div>
      <div className={'codebox wrap' + (msg.rtl ? ' rtl' : '')} style={{ marginTop: 10 }}>{msg.text}</div>
      <div className="row" style={{ marginTop: 8 }}><Pill tone={msg.guard.ok ? 'ok' : 'danger'}>Garde-fou : {msg.guard.ok ? 'conforme' : 'refusé'}</Pill><span className="tiny muted">Langue : {msg.lang}</span></div>
    </Card>
    <Card title="Tester le garde-fou de ton" sub="Saisissez une formulation : elle est vérifiée avant tout envoi">
      <textarea id="mg-custom" className="input" rows={4} value={custom} onChange={e => setCustom(e.target.value)} />
      <div style={{ marginTop: 10 }}>{cg.ok ? <Callout tone="ok" icon="check">Formulation acceptable.</Callout> : <Callout tone="danger">Refusé : formulation menaçante, intimidante ou visant des tiers ({cg.hits.length} motif(s)). Un message de ce type ne peut jamais partir.</Callout>}</div>
    </Card>
  </div>;
}

/* ============================ TITAN PREDICT ============================ */
export function Predict() {
  const { model: m, version } = useApp();
  const s = useMemo(() => m.computeStats(), [version]);
  const [shock, setShock] = useState(0);
  const [cadence, setCadence] = useState('standard');
  const f = s.forecast.map(x => (x.plan + x.promise + x.base) * (1 - shock / 100) * (cadence === 'douce' ? 0.94 : 1));
  const lo = f.map((v, i) => v * (1 - 0.12 - i * 0.04)), hi = f.map((v, i) => v * (1 + 0.10 + i * 0.04));
  const cum = f.reduce((a, v) => (a.push((a[a.length - 1] || 0) + v), a), []);
  const groups = useMemo(() => { const g = {}; for (const c of m.cases) { const o = m.orgById.get(c.orgId); const k = o.group; const x = g[k] || (g[k] = { total: 0, paid: 0 }); x.total += toEURMinor(c.principalMinor + c.feesMinor, c.currency); x.paid += toEURMinor(c.paidMinor, c.currency); } return g; }, [version]);
  const glabel = { entreprise: 'Entreprises', banque: 'Banques', public: 'Secteur public', grande: 'Grandes organisations' };
  return <>
    <PageHead eyebrow="Titan Predict — intelligence financière" title="Prévisions et scénarios" desc="Estimations simulées, présentées avec leurs hypothèses et leur incertitude. Aucune caractéristique sensible n’est utilisée et aucune décision défavorable n’est prise automatiquement." />
    <div className="grid g4">
      <Kpi label="Encaissements prévus (6 mois)" value={eur(cum[5])} detail="Scénario central, hypothèse" tone="emerald" />
      <Kpi label="Fourchette" value={`${eur(lo.reduce((a, b) => a + b, 0))} – ${eur(hi.reduce((a, b) => a + b, 0))}`} detail="Incertitude croissante avec l’horizon" />
      <Kpi label="Délai moyen de règlement" value={`${Math.round(s.dso)} j`} detail="Observé sur les dossiers soldés" />
      <Kpi label="Taux mensuel observé" value={pct(s.monthlyRate)} detail="Sur les 90 derniers jours" />
    </div>
    <div className="grid g3">
      <Card className="span2" title="Prévision de trésorerie" sub="Bande : intervalle indicatif (pas un intervalle statistique calibré)">
        <AreaChart height={240} labels={['M+1', 'M+2', 'M+3', 'M+4', 'M+5', 'M+6']} fmt={v => eur(v)} band={{ lo, hi }} series={[{ name: 'Scénario central', color: 'var(--emerald)', data: f }]} />
      </Card>
      <Card title="Paramètres du scénario">
        <Field label={`Choc économique : −${shock} %`} tip="Réduction uniforme des encaissements attendus."><input id="pr-shock" type="range" min="0" max="40" value={shock} onChange={e => setShock(+e.target.value)} /></Field>
        <Field label="Stratégie de relance autorisée"><select id="pr-cad" className="input" value={cadence} onChange={e => setCadence(e.target.value)}><option value="standard">Cadence standard</option><option value="douce">Cadence douce (moins de contacts)</option></select></Field>
        <div className="sep" />
        <div className="eyebrow">Hypothèses</div>
        <ul className="small" style={{ margin: '6px 0 0', paddingLeft: 18, display: 'grid', gap: 4 }}>
          <li>Échéanciers honorés à 100 % à leur date (optimiste).</li><li>Promesses pondérées à 65 %.</li><li>Solde actif × taux mensuel observé, décroissance de 7 %/mois.</li><li>Conversion en EUR aux taux de démonstration figés.</li><li>Cadence douce : −6 % d’encaissements (hypothèse non mesurée).</li>
        </ul>
        <Callout tone="warn">Limites : petit échantillon fictif, pas de saisonnalité, pas de validation hors échantillon.</Callout>
      </Card>
    </div>
    <div className="grid g2">
      <Card title="Comparaison de stratégies autorisées" sub="Simulation simplifiée sur 6 mois">
        <div className="tablewrap"><table className="t"><thead><tr><th>Stratégie</th><th className="r">Encaissé estimé</th><th className="r">Contacts / dossier / mois</th><th className="r">Coût estimé</th></tr></thead><tbody>
          <tr><td>Standard (e-mail → SMS → appel → courrier)</td><td className="r num">{eur(cum[5] * (1 - shock / 100))}</td><td className="r num">≈ 2,6</td><td className="r num">{eur(Math.round(s.counts.active * 6 * 2.6 * 0.12 * 100))}</td></tr>
          <tr><td>Douce (e-mail + portail uniquement)</td><td className="r num">{eur(cum[5] * 0.94 * (1 - shock / 100))}</td><td className="r num">≈ 1,4</td><td className="r num">{eur(Math.round(s.counts.active * 6 * 1.4 * 0.002 * 100))}</td></tr>
          <tr><td>Négociée (échéancier proposé d’emblée)</td><td className="r num">{eur(cum[5] * 0.97 * (1 - shock / 100))}</td><td className="r num">≈ 1,8</td><td className="r num">{eur(Math.round(s.counts.active * 6 * 1.8 * 0.08 * 100))}</td></tr>
        </tbody></table></div>
        <p className="tiny muted" style={{ marginTop: 8 }}>Toutes les stratégies restent soumises au moteur juridique (fréquence, horaires, consentements).</p>
      </Card>
      <Card title="Analyse de portefeuille par segment">
        <HBars fmt={v => eur(v)} items={Object.entries(groups).map(([k, g]) => ({ label: glabel[k], value: g.total, parts: [{ label: 'Encaissé', value: g.paid, color: 'var(--emerald)' }, { label: 'Reste dû', value: g.total - g.paid, color: 'var(--accent)' }] }))} />
        <div className="legend" style={{ marginTop: 10 }}><span><i style={{ background: 'var(--emerald)' }} />Encaissé</span><span><i style={{ background: 'var(--accent)' }} />Reste dû</span></div>
        <div className="sep" />
        <p className="small"><b>Variables utilisées :</b> ancienneté, montant, historique de paiement du dossier, canal. <b>Jamais utilisées :</b> origine, religion, santé, opinions, situation familiale ou toute caractéristique sensible.</p>
      </Card>
    </div>
  </>;
}

/* ============================ TITAN FRAUD ============================ */
const KIND = { duplicate: 'Créance dupliquée', bank_change: 'Changement de coordonnées bancaires', amount: 'Montant inhabituel', identity: 'Identité incohérente', access: 'Accès inhabituel', abuse: 'Abus de relances', document: 'Document suspect' };
export function Fraud() {
  const { model: m, version, act, openCase } = useApp();
  const [status, setStatus] = useState('nouveau');
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState('');
  const rows = useMemo(() => m.fraudAlerts.filter(f => !status || f.status === status), [version, status]);
  const count = st => m.fraudAlerts.filter(f => f.status === st).length;
  const f = sel && m.fraudAlerts.find(x => x.id === sel);
  return <>
    <PageHead eyebrow="Titan Fraud — détection des anomalies" title="File d’investigation" desc="Les signaux sont des indices à examiner par une personne. Une alerte n’est jamais une preuve de fraude ; les faux positifs sont corrigés et tracés." />
    <div className="grid g4">
      <Kpi label="Nouvelles" value={count('nouveau')} tone="warn" /><Kpi label="En investigation" value={count('en investigation')} /><Kpi label="Faux positifs corrigés" value={count('faux positif')} tone="emerald" /><Kpi label="Escaladées" value={count('escaladée')} detail="Transmises à un responsable humain" />
    </div>
    <div className="grid g3">
      <Card className="span2" actions={<select className="input" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)} aria-label="Filtrer par statut"><option value="">Toutes</option><option value="nouveau">Nouvelles</option><option value="en investigation">En investigation</option><option value="faux positif">Faux positifs</option><option value="escaladée">Escaladées</option></select>} title="Alertes">
        <Table rows={rows} onRow={x => setSel(x.id)} pageSize={12} columns={[
          { key: 'id', label: 'Alerte', render: x => <span className="mono small">{x.id}</span> }, { key: 'kind', label: 'Type', render: x => KIND[x.kind] || x.kind },
          { key: 'text', label: 'Signal', sortable: false, render: x => <span className="small">{x.text}</span> },
          { key: 'severity', label: 'Sévérité', render: x => <Pill tone={x.severity === 'élevée' ? 'danger' : x.severity === 'moyenne' ? 'warn' : 'info'}>{x.severity}</Pill> },
          { key: 'status', label: 'Statut', render: x => <Pill tone={x.status === 'faux positif' ? 'ok' : x.status === 'nouveau' ? 'warn' : 'muted'}>{x.status}</Pill> },
        ]} />
      </Card>
      <Card title={f ? `Investigation ${f.id}` : 'Investigation'} sub={f ? KIND[f.kind] : 'Sélectionnez une alerte'}>
        {!f ? <p className="muted">Choisissez une alerte dans la liste pour l’examiner.</p> : <div className="stack">
          <p>{f.text}</p>
          <KV items={[['Référence', <span className="mono">{f.ref}</span>], ['Sévérité', f.severity], ['Statut', f.status], ['Détectée', dtime(f.at)]]} />
          {m.caseById.get(f.ref) && <Btn size="sm" onClick={() => openCase(f.ref)}>Ouvrir le dossier</Btn>}
          <Field label="Note d’investigation"><textarea id="fr-note" className="input" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Éléments vérifiés, sources consultées…" /></Field>
          <div className="row">
            <Btn size="sm" onClick={() => { act(mm => mm.setFraudStatus(f.id, 'en investigation', note), 'Investigation ouverte.'); setNote(''); }}>Investiguer</Btn>
            <Btn size="sm" kind="ok" onClick={() => { act(mm => mm.setFraudStatus(f.id, 'faux positif', note || 'Vérification hors bande concluante'), 'Faux positif corrigé et tracé.'); setNote(''); }}>Faux positif</Btn>
            <Btn size="sm" kind="danger" onClick={() => { act(mm => mm.setFraudStatus(f.id, 'escaladée', note || 'Escalade vers un responsable'), 'Alerte escaladée à un responsable humain.'); setNote(''); }}>Escalader</Btn>
          </div>
          {f.notes.length > 0 && <div className="timeline">{f.notes.map((n, i) => <div key={i} className="tl"><div className="when">{new Date(n.at).toISOString().slice(0, 10)}</div><div className="rail" /><div className="what">{n.text}<div className="tiny muted">{m.userById(n.by).name}</div></div></div>)}</div>}
          <Callout>« Escalader » ne déclenche aucune sanction : la décision appartient à un responsable humain habilité.</Callout>
        </div>}
      </Card>
    </div>
    <Card title="Relancer la détection" sub="Recalcule les signaux sur l’état actuel du portefeuille">
      <div className="row"><Btn onClick={() => act(mm => { const before = mm.fraudAlerts.length; mm.fraudAlerts = mm.fraudAlerts.filter(a => a.status !== 'nouveau'); mm.detectFraud(); return mm.fraudAlerts.length - before; }, 'Détection relancée.')}>Relancer la détection</Btn><span className="tiny muted">Doublons (organisation + n° de facture), changements de coordonnées bancaires, montants &gt; 6× la médiane, identités incohérentes.</span></div>
    </Card>
  </>;
}
