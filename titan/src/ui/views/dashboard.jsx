const { useState, useMemo } = React;
import { useApp, Card, Kpi, PageHead, AreaChart, Bars, Donut, HBars, Pill, Btn, Seg, Callout, Icon, eur, pct, nfmt, Tip } from '../kit.jsx';
import { STATUSES, CHANNELS } from '../../engine/data.js';
import { FX_NOTE, isoDate } from '../../engine/util.js';

const STATUS_COLORS = { nouveau: 'var(--info)', actif: 'var(--accent)', promesse: 'var(--emerald)', echeancier: '#3fb8c9', conteste: 'var(--warn)', suspendu: 'var(--muted)', paye: '#2fd39a', clos: 'var(--line-2)' };

export function Dashboard() {
  const { model: m, version, go, newCase, act, mode } = useApp();
  const [jur, setJur] = useState('');
  const [group, setGroup] = useState('');
  const [range, setRange] = useState(90);
  const s = useMemo(() => m.computeStats({ jur, group }), [version, jur, group]);
  const reg = useMemo(() => m.regulatoryAlerts(), [version]);
  const series = s.series.slice(-range);
  const labels = series.map((d, i) => (i % Math.ceil(range / 6) === 0 ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(d.day) : ''));
  const openFraud = m.fraudAlerts.filter(f => ['nouveau', 'en investigation'].includes(f.status)).length;
  const openInc = m.incidents.filter(i => !['résolu', 'clos'].includes(i.status)).length;
  const humanQ = m.cases.filter(c => c.humanQueue).length;
  const collected30 = s.series.slice(-30).map(d => d.collected);

  return <>
    <PageHead eyebrow="Centre de commande mondial" title="Vue d’ensemble du portefeuille" desc="Indicateurs recalculés après chaque action simulée. Montants agrégés en euros." actions={<>
      <select className="input" style={{ width: 'auto' }} value={jur} onChange={e => setJur(e.target.value)} aria-label="Filtrer par juridiction"><option value="">Toutes juridictions</option>{m.jurisdictions.map(j => <option key={j.code} value={j.code}>{j.name} (fictive)</option>)}</select>
      <select className="input" style={{ width: 'auto' }} value={group} onChange={e => setGroup(e.target.value)} aria-label="Filtrer par segment"><option value="">Tous segments</option><option value="entreprise">Entreprises</option><option value="banque">Banques</option><option value="public">Secteur public</option><option value="grande">Grandes organisations</option></select>
      <Btn kind="primary" icon="plus" onClick={newCase}>Nouveau dossier</Btn>
    </>} />

    <div className="grid g4">
      <Kpi label="Montant total des créances" value={eur(s.total)} detail={`${nfmt(s.caseCount)} dossiers`} tip={FX_NOTE} />
      <Kpi label="Encaissements" value={eur(s.paid)} detail="Paiements simulés confirmés" tone="emerald" spark={collected30} />
      <Kpi label="Soldes impayés" value={eur(s.outstanding)} detail={`${nfmt(s.counts.active)} dossiers actifs`} />
      <Kpi label="Taux de récupération" value={pct(s.rate)} detail={`Délai moyen de paiement : ${Math.round(s.dso)} j`} tip="Encaissé ÷ total dû (principal + frais), conversion EUR démo." />
    </div>
    <div className="grid g6">
      <Kpi label="Contestés" value={nfmt(s.counts.disputed)} detail="Relances suspendues" tone={s.counts.disputed ? 'warn' : undefined} />
      <Kpi label="Échéanciers" value={nfmt(s.counts.plans)} detail="En cours" />
      <Kpi label="Promesses" value={nfmt(s.counts.promises)} detail="De paiement" />
      <Kpi label="Relances autorisées" value={nfmt(s.sentTotal)} detail="Envoyées (simulées)" tone="emerald" />
      <Kpi label="Relances bloquées" value={nfmt(s.blockedTotal)} detail="Par le moteur juridique" tone="danger" />
      <Kpi label="File humaine" value={nfmt(humanQ)} detail="Intervention requise" alert={humanQ > 0} />
    </div>

    <div className="grid g3">
      <Card className="span2" title="Encaissements et activité de relance" sub="Encaissements quotidiens (EUR) — communications envoyées et bloquées" actions={<Seg value={range} onChange={setRange} label="Période" options={[{ value: 30, label: '30 j' }, { value: 90, label: '90 j' }, { value: 120, label: '120 j' }]} />}>
        <AreaChart height={220} labels={labels} fmt={v => eur(v)} series={[{ name: 'Encaissé', color: 'var(--emerald)', data: series.map(d => d.collected), dates: series.map(d => isoDate(d.day)) }]} />
        <div className="sep" />
        <AreaChart height={110} labels={labels} fmt={v => nfmt(v)} series={[{ name: 'Envoyées', color: 'var(--accent)', data: series.map(d => d.sent), dates: series.map(d => isoDate(d.day)) }, { name: 'Bloquées', color: 'var(--danger)', data: series.map(d => d.blocked), fill: false }]} />
        <div className="legend"><span><i style={{ background: 'var(--emerald)' }} />Encaissé</span><span><i style={{ background: 'var(--accent)' }} />Relances envoyées</span><span><i style={{ background: 'var(--danger)' }} />Relances bloquées</span></div>
      </Card>
      <Card title="Alertes" sub="Réglementaires, sécurité, fraude">
        <div className="stack">
          {reg.filter(a => a.level === 'critique').slice(0, 4).map(a => <button key={a.id} className="callout danger" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => go('legal')}><Icon name="legal" size={16} /><span>{a.text}</span></button>)}
          <button className="callout warn" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => go('security')}><Icon name="security" size={16} /><span><b>{openInc}</b> incident(s) de sécurité fictif(s) ouvert(s)</span></button>
          <button className="callout" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => go('fraud')}><Icon name="fraud" size={16} /><span><b>{openFraud}</b> anomalie(s) à examiner — une alerte n’est pas une preuve.</span></button>
          {m.killSwitch && <Callout tone="danger">Arrêt d’urgence actif : aucune automatisation.</Callout>}
        </div>
      </Card>
    </div>

    <div className="grid g3">
      <Card title="Créances par ancienneté" sub="Solde restant dû, EUR">
        <Bars data={s.aging} labels={s.agingLabels} fmt={v => eur(v)} colors={['var(--accent)', 'var(--accent-2)', 'var(--warn)', '#f08a3c', 'var(--danger)']} />
      </Card>
      <Card title="Dossiers par statut">
        <Donut center={[nfmt(s.caseCount), 'dossiers']} parts={Object.keys(STATUSES).filter(k => s.byStatus[k]).map(k => ({ label: STATUSES[k].label, value: s.byStatus[k], color: STATUS_COLORS[k] }))} />
      </Card>
      <Card title="Prévision de trésorerie" sub="6 mois — hypothèse, non garantie" actions={<Btn size="sm" kind="ghost" onClick={() => go('predict')}>Détails</Btn>}>
        <Bars data={s.forecast.map(f => f.plan + f.promise + f.base)} labels={['M+1', 'M+2', 'M+3', 'M+4', 'M+5', 'M+6']} fmt={v => eur(v)} colors={Array(6).fill('var(--emerald)')} />
        <p className="tiny muted">Échéanciers + promesses (pondérées 65 %) + taux de recouvrement observé sur 90 j ({pct(s.monthlyRate)}/mois).</p>
      </Card>
    </div>

    <div className="grid g3">
      <Card title="Répartition géographique" sub="Solde impayé par juridiction fictive" actions={mode === 'expert' && <Btn size="sm" kind="ghost" onClick={() => go('world')}>Carte</Btn>}>
        <HBars fmt={v => eur(v)} items={m.jurisdictions.map(j => ({ label: `${j.name} · ${j.code}`, value: s.byJur[j.code]?.outstanding || 0, color: (m.regulatoryAlerts().some(a => a.jur === j.code && a.level === 'critique')) ? 'var(--danger)' : 'var(--accent)' }))} />
        <p className="tiny muted" style={{ marginTop: 8 }}>En rouge : juridiction bloquée (validation incomplète, règle expirée ou contradictoire).</p>
      </Card>
      <Card title="Performance par canal" sub="Envoyées / bloquées et coût unitaire démo">
        <HBars fmt={v => nfmt(v)} items={Object.keys(CHANNELS).map(k => ({ label: CHANNELS[k].label, value: (s.byChannel[k]?.sent || 0) + (s.byChannel[k]?.blocked || 0), parts: [{ label: 'Envoyées', value: s.byChannel[k]?.sent || 0, color: 'var(--accent)' }, { label: 'Bloquées', value: s.byChannel[k]?.blocked || 0, color: 'var(--danger)' }] }))} />
        <p className="tiny muted" style={{ marginTop: 8 }}>Coûts opérationnels de communication simulés : <b>{eur(Math.round(s.cost * 100), false)}</b></p>
      </Card>
      <Card title="Activité des agents IA" sub="Simulation — aucune IA réelle">
        <div className="stack" style={{ gap: 8 }}>{m.agents.map(a => <div key={a.id} className="between small"><span className="row" style={{ gap: 6 }}><Pill tone={a.enabled ? 'ok' : 'danger'}>{a.enabled ? 'actif' : 'désactivé'}</Pill>{a.name}</span><b className="num">{nfmt(a.actions)}</b></div>)}</div>
        <div className="sep" />
        <p className="tiny muted">Aucun agent ne peut contourner le moteur juridique ni déclencher d’acte réservé (saisie, acte judiciaire, sanction).</p>
      </Card>
    </div>

    <Card title="Performance par organisation" sub="10 plus gros portefeuilles (EUR)" actions={<Btn size="sm" kind="ghost" onClick={() => go('cases')}>Tous les dossiers</Btn>}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Organisation</th><th className="r">Dossiers</th><th className="r">Total</th><th className="r">Encaissé</th><th>Récupération</th></tr></thead>
        <tbody>{s.topOrgs.slice(0, 10).map(o => <tr key={o.id}><td>{o.name}<div className="tiny muted">{o.id}</div></td><td className="r num">{o.count}</td><td className="r num">{eur(o.total)}</td><td className="r num">{eur(o.paid)}</td><td style={{ minWidth: 140 }}><div className="row" style={{ flexWrap: 'nowrap' }}><div className="progress" style={{ flex: 1 }}><i style={{ width: pct(o.rate).replace(',', '.').replace(' %', '%') }} /></div><span className="tiny num">{pct(o.rate)}</span></div></td></tr>)}</tbody></table></div>
    </Card>
  </>;
}
