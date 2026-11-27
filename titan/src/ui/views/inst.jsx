const { useState, useMemo } = React;
import { useApp, Card, PageHead, Pill, Btn, Field, Callout, Table, Kpi, Tabs, KV, StatusPill, money, eur, nfmt, dshort, pct } from '../kit.jsx';
import { toEURMinor, DAY } from '../../engine/util.js';

export function Institutions() {
  const [tab, setTab] = useState('bank');
  return <>
    <PageHead eyebrow="Titan Institution" title="Banques et collectivités" desc="Espaces distincts, adaptés aux obligations de chaque secteur. Les procédures réservées aux comptables publics et aux autorités habilitées restent sous leur contrôle : l’IA ne déclenche ni prélèvement forcé, ni acte judiciaire, ni saisie, ni sanction." />
    <Tabs value={tab} onChange={setTab} tabs={[{ id: 'bank', label: 'Espace bancaire' }, { id: 'public', label: 'Collectivités et administrations' }]} />
    {tab === 'bank' ? <Bank /> : <Public />}
  </>;
}

function Bank() {
  const { model: m, version, act, openCase } = useApp();
  const banks = m.orgs.filter(o => o.group === 'banque');
  const [bankId, setBankId] = useState('');
  const cases = useMemo(() => m.cases.filter(c => c.debtType === 'banking' && (!bankId || c.orgId === bankId)), [version, bankId]);
  const out = cases.filter(c => !['paye', 'clos'].includes(c.status));
  const tot = cases.reduce((a, c) => a + toEURMinor(c.principalMinor + c.feesMinor, c.currency), 0);
  const paid = cases.reduce((a, c) => a + toEURMinor(c.paidMinor, c.currency), 0);
  const sensitive = cases.filter(c => c.flags.hardship || c.flags.vulnerable || c.status === 'conteste');
  const [form, setForm] = useState({ caseId: '', months: 12, why: 'Baisse temporaire de revenus documentée' });
  const eligible = out.filter(c => c.status !== 'conteste');
  const caseId = form.caseId || eligible[0]?.id;
  return <>
    <div className="row"><select className="input" style={{ width: 'auto' }} value={bankId} onChange={e => setBankId(e.target.value)} aria-label="Banque"><option value="">Toutes les banques fictives ({banks.length})</option>{banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select><span className="tiny muted">Utilisateur actuel : {m.user.name}</span></div>
    <div className="grid g4">
      <Kpi label="Portefeuille de créances" value={eur(tot)} detail={`${nfmt(cases.length)} dossiers bancaires`} />
      <Kpi label="Impayés" value={eur(tot - paid)} detail={`${nfmt(out.length)} dossiers ouverts`} />
      <Kpi label="Dossiers sensibles" value={nfmt(sensitive.length)} detail="Difficulté, vulnérabilité, contestation" tone="warn" />
      <Kpi label="Restructurations" value={nfmt(m.bankRequests.filter(r => r.status === 'approuvée').length)} detail={`${m.bankRequests.filter(r => r.status === 'en attente').length} en attente de 2ᵉ validation`} />
    </div>
    <div className="grid g3">
      <Card className="span2" title="Demandes de restructuration — contrôle à quatre yeux" sub="Le demandeur ne peut jamais approuver sa propre demande">
        <Table rows={m.bankRequests} pageSize={6} empty="Aucune demande. Créez-en une avec le « Chargé Banque Démo »." columns={[
          { key: 'id', label: 'Demande', render: r => <span className="mono small">{r.id}</span> },
          { key: 'caseId', label: 'Dossier', render: r => <button className="btn ghost sm mono" onClick={() => openCase(r.caseId)}>{r.caseId}</button> },
          { key: 'months', label: 'Durée', render: r => `${r.months} mois` },
          { key: 'requestedBy', label: 'Demandeur', render: r => m.userById(r.requestedBy).name },
          { key: 'status', label: 'Statut', render: r => <Pill tone={r.status === 'approuvée' ? 'ok' : r.status === 'refusée' ? 'danger' : 'warn'}>{r.status}{r.decidedBy ? ` · ${m.userById(r.decidedBy).name}` : ''}</Pill> },
          { key: 'a', label: '', sortable: false, render: r => r.status === 'en attente' && <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}><Btn size="sm" kind="ok" onClick={() => act(mm => mm.decideRestructure(r.id, true), 'Restructuration approuvée (2ᵉ validation).')}>Approuver</Btn><Btn size="sm" kind="danger" onClick={() => act(mm => mm.decideRestructure(r.id, false), 'Restructuration refusée.')}>Refuser</Btn></div> },
        ]} />
        <div className="sep" />
        <div className="grid g4" style={{ alignItems: 'end' }}>
          <Field label="Dossier bancaire"><select id="bk-case" className="input" value={caseId} onChange={e => setForm({ ...form, caseId: e.target.value })}>{eligible.slice(0, 150).map(c => <option key={c.id} value={c.id}>{c.id} · {money(m.balance(c), c.currency)}</option>)}</select></Field>
          <Field label={`Durée : ${form.months} mois`}><input id="bk-months" type="range" min="3" max="60" value={form.months} onChange={e => setForm({ ...form, months: +e.target.value })} /></Field>
          <Field label="Motif"><input id="bk-why" className="input" value={form.why} onChange={e => setForm({ ...form, why: e.target.value })} /></Field>
          <Btn kind="primary" disabled={!caseId} onClick={() => act(mm => mm.requestRestructure(caseId, form.months, 0, form.why), 'Demande créée : en attente d’un validateur distinct.')}>Demander</Btn>
        </div>
        <p className="tiny muted" style={{ marginTop: 6 }}>Pour tester : demandez avec « Chargé Banque Démo », puis approuvez avec « Validatrice Banque Démo ». Tenter d’approuver avec le demandeur est refusé et journalisé.</p>
      </Card>
      <div className="stack">
        <Card title="Contrôle interne">
          <KV items={[['Séparation des fonctions', <Pill tone="ok">active</Pill>], ['Double validation', <Pill tone="ok">restructurations</Pill>], ['Habilitations', `${m.users.filter(u => u.role.startsWith('banque')).length} profils bancaires`], ['Export autorisé', 'Sans coordonnées, journalisé'], ['Reporting réglementaire', 'Configurable (représenté)']]} />
        </Card>
        <Card title="Reporting configurable (aperçu)">
          <div className="tablewrap"><table className="t"><tbody>
            <tr><td>Encours impayé</td><td className="r num">{eur(tot - paid)}</td></tr>
            <tr><td>Taux de recouvrement</td><td className="r num">{tot ? pct(paid / tot) : '—'}</td></tr>
            <tr><td>Dossiers &gt; 90 j</td><td className="r num">{nfmt(out.filter(c => m.clock - c.dueDate > 90 * DAY).length)}</td></tr>
            <tr><td>Contestations ouvertes</td><td className="r num">{nfmt(cases.filter(c => c.status === 'conteste').length)}</td></tr>
            <tr><td>Échéanciers actifs</td><td className="r num">{nfmt(cases.filter(c => c.status === 'echeancier').length)}</td></tr>
          </tbody></table></div>
          <p className="tiny muted" style={{ marginTop: 6 }}>Gabarit indicatif, à adapter aux exigences de chaque autorité de supervision.</p>
        </Card>
      </div>
    </div>
    <Card title="Dossiers sensibles" sub="Traitement humain prioritaire, aucune automatisation">
      <Table rows={sensitive} onRow={c => openCase(c.id)} pageSize={8} empty="Aucun dossier sensible." columns={[
        { key: 'id', label: 'Dossier', render: c => <span className="mono small">{c.id}</span> }, { key: 'org', label: 'Banque', render: c => m.orgById.get(c.orgId).name },
        { key: 'why', label: 'Motif', render: c => [c.flags.hardship && 'difficulté financière', c.flags.vulnerable && 'vulnérabilité', c.status === 'conteste' && 'contestation'].filter(Boolean).join(', ') },
        { key: 'bal', label: 'Solde', right: true, render: c => money(m.balance(c), c.currency) }, { key: 'status', label: 'Statut', render: c => <StatusPill status={c.status} /> },
      ]} />
    </Card>
  </>;
}

function Public() {
  const { model: m, version, act, openCase } = useApp();
  const pubs = m.orgs.filter(o => o.public);
  const cases = useMemo(() => m.cases.filter(c => c.debtType === 'public'), [version]);
  const [f, setF] = useState({ orgId: pubs[0].id, label: 'Redevance d’occupation du domaine public — démo', amount: '480', service: 'Voirie' });
  const tot = cases.reduce((a, c) => a + toEURMinor(c.principalMinor + c.feesMinor, c.currency), 0);
  const paid = cases.reduce((a, c) => a + toEURMinor(c.paidMinor, c.currency), 0);
  const byOrg = useMemo(() => pubs.map(o => { const cs = cases.filter(c => c.orgId === o.id); return { o, n: cs.length, tot: cs.reduce((a, c) => a + toEURMinor(c.principalMinor + c.feesMinor, c.currency), 0), paid: cs.reduce((a, c) => a + toEURMinor(c.paidMinor, c.currency), 0) }; }), [version]);
  return <>
    <div className="grid g4">
      <Kpi label="Créances publiques" value={eur(tot)} detail={`${nfmt(cases.length)} dossiers`} />
      <Kpi label="Recouvré" value={eur(paid)} tone="emerald" />
      <Kpi label="Titres en circuit" value={nfmt(m.publicTitles.filter(t => t.status.startsWith('à ')).length)} />
      <Kpi label="Entités publiques" value={nfmt(pubs.length)} detail="Collectivités, mairies, administrations, hôpitaux" />
    </div>
    <Callout tone="warn">Les décisions de prise en charge, les poursuites et tout recouvrement forcé relèvent exclusivement du comptable public. La plateforme se limite au suivi, aux relances amiables autorisées et à la traçabilité.</Callout>
    <div className="grid g3">
      <Card className="span2" title="Circuit de validation hiérarchique" sub="Agent → chef de service → comptable public">
        <div className="grid g4" style={{ alignItems: 'end' }}>
          <Field label="Entité"><select id="pb-org" className="input" value={f.orgId} onChange={e => setF({ ...f, orgId: e.target.value })}>{pubs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field>
          <Field label="Objet"><input id="pb-label" className="input" value={f.label} onChange={e => setF({ ...f, label: e.target.value })} /></Field>
          <Field label="Montant"><input id="pb-amount" className="input num" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label="Service / département"><select id="pb-svc" className="input" value={f.service} onChange={e => setF({ ...f, service: e.target.value })}>{['Voirie', 'Eau et assainissement', 'Restauration scolaire', 'Culture', 'Urbanisme', 'Santé'].map(s => <option key={s}>{s}</option>)}</select></Field>
        </div>
        <div className="row" style={{ marginTop: 10 }}><Btn kind="primary" onClick={() => act(mm => mm.submitTitle(f.orgId, f.label, parseFloat(f.amount.replace(',', '.')), f.service), 'Titre soumis au chef de service.')}>Soumettre (agent)</Btn><span className="tiny muted">Rôles : « Agent Collectivité Démo » soumet, « Cheffe de service Démo » valide, « Comptable public Démo » décide.</span></div>
        <div className="sep" />
        <Table rows={m.publicTitles} pageSize={6} empty="Aucun titre dans le circuit." columns={[
          { key: 'id', label: 'Titre', render: t => <span className="mono small">{t.id}</span> }, { key: 'label', label: 'Objet', render: t => <><span className="small">{t.label}</span><div className="tiny muted">{t.service} · {m.orgById.get(t.orgId).name}</div></> },
          { key: 'amountMinor', label: 'Montant', right: true, render: t => money(t.amountMinor, t.currency) },
          { key: 'steps', label: 'Traçabilité', sortable: false, render: t => <div className="tiny">{t.steps.map((s, i) => <div key={i}>{s.step} — {m.userById(s.by).name}</div>)}</div> },
          { key: 'status', label: 'Statut', render: t => <Pill tone={t.status.startsWith('pris') ? 'ok' : t.status.startsWith('à ') ? 'warn' : 'danger'}>{t.status}</Pill> },
          { key: 'a', label: '', sortable: false, render: t => t.status.startsWith('à ') && <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}><Btn size="sm" kind="ok" onClick={() => act(mm => mm.advanceTitle(t.id, true), 'Étape validée.')}>Valider</Btn><Btn size="sm" kind="danger" onClick={() => act(mm => mm.advanceTitle(t.id, false), 'Titre rejeté.')}>Rejeter</Btn></div> },
        ]} />
      </Card>
      <div className="stack">
        <Card title="Rapport budgétaire (aperçu)">
          <div className="tablewrap"><table className="t"><thead><tr><th>Entité</th><th className="r">Émis</th><th className="r">Recouvré</th></tr></thead><tbody>{byOrg.filter(x => x.n).slice(0, 10).map(x => <tr key={x.o.id}><td className="small">{x.o.name}</td><td className="r num">{eur(x.tot)}</td><td className="r num">{x.tot ? pct(x.paid / x.tot) : '—'}</td></tr>)}</tbody></table></div>
        </Card>
        <Card title="Exigences du secteur public">
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
            <li>Accessibilité numérique : objectif de conformité RGAA / WCAG 2.2 (audit à réaliser).</li><li>Archivage : durées de conservation paramétrables (représenté).</li><li>Traçabilité administrative de chaque étape (implémentée dans le circuit).</li><li>Intégration future aux systèmes publics autorisés uniquement.</li>
          </ul>
        </Card>
      </div>
    </div>
  </>;
}
