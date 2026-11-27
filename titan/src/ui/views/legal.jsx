const { useState, useMemo } = React;
import { useApp, Card, PageHead, Pill, Btn, Field, Checks, Callout, KV, Tabs, Tip, dshort } from '../kit.jsx';
import { jurisdictionState, evaluateContact, VALIDATION_LEVELS, RESERVED_ACTIONS, localParts } from '../../engine/legal.js';
import { CHANNELS, DEBT_TYPES, ROLES } from '../../engine/data.js';
import { isoDate, HOUR } from '../../engine/util.js';

const PARAM_LABELS = {
  contactHours: 'Horaires de contact', closedWeekdays: 'Jours sans contact', holidays: 'Jours fériés (fictifs)', maxContactsPer7d: 'Contacts max / 7 jours (tous canaux)',
  channels: 'Canaux autorisés', consentChannels: 'Canaux soumis à consentement', debtTypes: 'Types de créances couverts', prescriptionYears: 'Prescription (années, démo)',
  automatedCalls: 'Appels automatisés', callRecording: 'Enregistrement des appels', lateInterestAnnual: 'Intérêts de retard (taux annuel démo)', maxFeesPct: 'Frais max (% du principal)',
  disputeSuspends: 'Contestation suspend les relances', crossBorder: 'Créances transfrontalières', dataTransfers: 'Transferts internationaux de données', humanRequiredFlags: 'Intervention humaine obligatoire si', notificationDays: 'Délai de notification préalable (jours)',
};
const DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
function fmtParam(k, v) {
  if (k === 'contactHours') return `${v.start}h – ${v.end}h (heure locale)`;
  if (k === 'closedWeekdays') return v.map(d => DAYS[d]).join(', ') || 'aucun';
  if (k === 'holidays') return v.map(h => `${h.date} (${h.name})`).join(' · ') || 'aucun configuré';
  if (k === 'channels' || k === 'consentChannels') return v.map(c => CHANNELS[c]?.label || c).join(', ');
  if (k === 'debtTypes') return v.map(t => DEBT_TYPES[t]).join(', ');
  if (k === 'humanRequiredFlags') return v.map(f => f === 'hardship' ? 'difficulté financière' : 'vulnérabilité').join(', ');
  if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
  if (k === 'lateInterestAnnual' || k === 'maxFeesPct') return (v * 100).toFixed(1) + ' %';
  return String(v);
}

export function Legal() {
  const { model: m, version, act } = useApp();
  const [sel, setSel] = useState('XA-VAL');
  const [tab, setTab] = useState('rules');
  const alerts = useMemo(() => m.regulatoryAlerts(), [version]);
  const j = m.jurByCode.get(sel);
  const st = jurisdictionState(j, m.clock);
  return <>
    <PageHead eyebrow="Titan Legal — moteur réglementaire" title="Règles par juridiction" desc="Moteur déterministe, indépendant de l’IA conversationnelle. Toutes les juridictions et règles ci-dessous sont FICTIVES. En cas de doute, de contradiction, de règle expirée ou de validation incomplète, l’action est bloquée." />
    <Callout tone="warn">Aucune règle réelle n’est reproduite. Les codes XA à XH appartiennent à la plage ISO 3166 réservée à l’usage privé et ne désignent aucun pays.</Callout>
    <div className="grid g4">
      {m.jurisdictions.map(x => { const s = jurisdictionState(x, m.clock); return <button key={x.code} className="card" onClick={() => setSel(x.code)} style={{ padding: 14, textAlign: 'left', cursor: 'pointer', borderColor: sel === x.code ? 'var(--accent)' : undefined, boxShadow: sel === x.code ? 'var(--glow)' : undefined }}>
        <div className="between"><b>{x.name}</b><Pill tone={s.ok ? 'ok' : 'danger'}>{s.ok ? 'validée' : 'bloquée'}</Pill></div>
        <div className="tiny muted mono">{x.code} · {x.currency} · UTC{x.tz >= 0 ? '+' : ''}{x.tz / 60}</div>
        <div className="tiny" style={{ marginTop: 4, color: s.ok ? 'var(--muted)' : 'var(--danger)' }}>{s.ok ? `v${s.ruleset.version} en vigueur` : s.issues[0]}</div>
      </button>; })}
    </div>

    <div className="grid g3">
      <div className="span2 stack">
        <Card title={<>{j.name} <span className="mono muted small">{j.code}</span></>} sub={`${j.region} · locale ${j.locale}${j.rtl ? ' · écriture de droite à gauche' : ''} · usage réel : désactivé`}
          actions={<Pill tone={st.ok ? 'ok' : 'danger'}>{st.ok ? 'Actions autorisées sous conditions' : 'Toutes les actions bloquées'}</Pill>}>
          {!st.ok && <Callout tone="danger">{st.issues.join(' · ')}</Callout>}
          <Tabs value={tab} onChange={setTab} tabs={[{ id: 'rules', label: 'Règles en vigueur' }, { id: 'versions', label: 'Versions', count: j.rulesets.length }, { id: 'validation', label: 'Validation à 3 niveaux' }, { id: 'edit', label: 'Modifier' }]} />
          <div style={{ marginTop: 12 }}>
            {tab === 'rules' && (st.ruleset || j.rulesets[j.rulesets.length - 1]) && (() => { const r = st.ruleset || j.rulesets[j.rulesets.length - 1]; return <>
              <KV items={[['Version', <><b>{r.version}</b> <Pill tone={r.status === 'validé' ? 'ok' : 'warn'}>{r.status}</Pill></>], ['Source', r.source], ['Entrée en vigueur', r.effectiveFrom], ['Expiration', r.effectiveTo || 'aucune'], ['Responsable', m.userById(r.owner).name], ['Prochaine révision', r.reviewDate]]} />
              <div className="sep" />
              <div className="tablewrap"><table className="t"><tbody>{Object.entries(r.params).map(([k, v]) => <tr key={k}><td className="muted" style={{ width: '42%' }}>{PARAM_LABELS[k] || k}</td><td>{fmtParam(k, v)}</td></tr>)}</tbody></table></div>
              {!st.ruleset && <p className="small muted" style={{ marginTop: 8 }}>Version affichée à titre indicatif : elle n’est pas applicable aujourd’hui.</p>}
            </>; })()}
            {tab === 'versions' && <div className="stack">{j.rulesets.map(r => <div key={r.id} className="card" style={{ padding: 12 }}>
              <div className="between"><b className="mono">v{r.version}</b><Pill tone={r.status === 'validé' ? 'ok' : 'warn'}>{r.status}</Pill></div>
              <div className="small muted">{r.effectiveFrom} → {r.effectiveTo || '∞'} · révision {r.reviewDate}</div>
              <div className="timeline" style={{ marginTop: 8 }}>{r.history.map((h, i) => <div key={i} className="tl"><div className="when">{h.date}</div><div className="rail" /><div className="what">{h.change}<div className="tiny muted">{m.userById(h.by).name || h.by}</div></div></div>)}</div>
            </div>)}</div>}
            {tab === 'validation' && <div className="stack">
              {VALIDATION_LEVELS.map(l => { const v = j.validations[l.key]; return <div key={l.key} className="between card" style={{ padding: 12 }}>
                <div><b>{l.label}</b><div className="tiny muted">Rôle requis : {ROLES[l.role].label}</div></div>
                {v ? <Pill tone="ok">Signé par {m.userById(v.by).name} le {v.date}</Pill> : <Btn size="sm" kind="primary" onClick={() => act(mm => mm.validateJurisdiction(j.code, l.key), `${l.label} signé.`)}>Signer avec l’utilisateur actuel</Btn>}
              </div>; })}
              <p className="tiny muted">Séparation des fonctions : chaque niveau exige un rôle différent et un utilisateur différent. Changez d’utilisateur dans la barre du haut (juriste, conformité, super administrateur) pour signer.</p>
            </div>}
            {tab === 'edit' && <EditRule j={j} st={st} />}
          </div>
        </Card>
        <TestBench />
      </div>
      <div className="stack">
        <Card title="Alertes réglementaires" sub={`${alerts.length} alerte(s)`}>
          <div className="stack">{alerts.map(a => <div key={a.id} className={'callout ' + (a.level === 'critique' ? 'danger' : 'warn')} style={{ opacity: a.ack ? .55 : 1 }}><div style={{ flex: 1 }}>{a.text}{!a.ack && <div style={{ marginTop: 6 }}><Btn size="sm" kind="ghost" onClick={() => act(mm => { mm.regAlertsAck.add(a.id); mm.log(mm.currentUserId, 'alerte réglementaire lue', a.id, a.text); mm.bump(); }, 'Alerte marquée comme lue (le blocage reste actif).')}>Marquer comme lue</Btn></div>}</div></div>)}</div>
        </Card>
        <Card title="Actions jamais déclenchées par la plateforme">
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>{RESERVED_ACTIONS.map(a => <li key={a}>{a}</li>)}</ul>
          <p className="tiny muted" style={{ marginTop: 8 }}>Réservées aux juridictions, commissaires de justice, comptables publics et autorités habilités. Le simulateur ne fait que du recouvrement amiable.</p>
        </Card>
        <Card title="Créances transfrontalières">
          <p className="small">Lorsque le créancier et le débiteur relèvent de juridictions différentes, le moteur exige une <b>revue humaine</b> avant tout contact, puis applique les règles de la juridiction du débiteur. Les transferts de données sont soumis à des garanties préalables (représentées).</p>
          <p className="tiny muted" style={{ marginTop: 6 }}>{m.cases.filter(c => m.debtorById.get(c.debtorId).country !== m.orgById.get(c.orgId).jurisdiction).length} dossiers transfrontaliers dans le jeu de données.</p>
        </Card>
      </div>
    </div>
  </>;
}

function EditRule({ j, st }) {
  const { model: m, act } = useApp();
  const r = st.ruleset || j.rulesets[j.rulesets.length - 1];
  const [param, setParam] = useState('maxContactsPer7d');
  const [value, setValue] = useState(String(r.params.maxContactsPer7d));
  const [note, setNote] = useState('');
  const editable = { maxContactsPer7d: 'nombre', prescriptionYears: 'nombre', automatedCalls: 'booléen', lateInterestAnnual: 'taux', startHour: 'heure de début', endHour: 'heure de fin' };
  const parse = () => {
    if (param === 'automatedCalls') return ['automatedCalls', value === 'true'];
    if (param === 'startHour') return ['contactHours', { ...r.params.contactHours, start: parseInt(value, 10) }];
    if (param === 'endHour') return ['contactHours', { ...r.params.contactHours, end: parseInt(value, 10) }];
    if (param === 'lateInterestAnnual') return [param, parseFloat(value) / 100];
    return [param, parseInt(value, 10)];
  };
  return <div className="stack">
    <Callout>Toute modification crée une <b>nouvelle version en brouillon</b>, expire la précédente et réinitialise les trois validations. Les relances de la juridiction restent bloquées jusqu’à revalidation complète.</Callout>
    <div className="grid g3" style={{ alignItems: 'end' }}>
      <Field label="Paramètre"><select id="er-param" className="input" value={param} onChange={e => { setParam(e.target.value); const p = e.target.value; setValue(p === 'automatedCalls' ? String(r.params.automatedCalls) : p === 'startHour' ? String(r.params.contactHours.start) : p === 'endHour' ? String(r.params.contactHours.end) : p === 'lateInterestAnnual' ? String(r.params.lateInterestAnnual * 100) : String(r.params[p])); }}>
        <option value="maxContactsPer7d">Contacts max / 7 jours</option><option value="prescriptionYears">Prescription (années)</option><option value="automatedCalls">Appels automatisés</option><option value="lateInterestAnnual">Intérêts de retard (%)</option><option value="startHour">Heure de début de contact</option><option value="endHour">Heure de fin de contact</option></select></Field>
      <Field label="Nouvelle valeur">{param === 'automatedCalls' ? <select id="er-val" className="input" value={value} onChange={e => setValue(e.target.value)}><option value="true">Autorisés</option><option value="false">Interdits</option></select> : <input id="er-val" className="input num" value={value} onChange={e => setValue(e.target.value)} />}</Field>
      <Field label="Motif / source (fictive)"><input id="er-note" className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Ex. revue annuelle démo" /></Field>
    </div>
    <div><Btn kind="primary" onClick={() => { const [k, v] = parse(); if (typeof v === 'number' && !Number.isFinite(v)) return; act(mm => mm.editRule(j.code, k, v, note), 'Nouvelle version créée en brouillon.'); }}>Créer la nouvelle version</Btn></div>
    <p className="tiny muted">Permission requise : « Modifier une règle » (rôle juriste ou super administrateur). Valeur actuelle : {editable[param]}.</p>
  </div>;
}

function TestBench() {
  const { model: m, version } = useApp();
  const [caseId, setCaseId] = useState(() => m.cases.find(c => c.status === 'actif' && c.jurisdiction === 'XA-VAL')?.id || m.cases[0].id);
  const [channel, setChannel] = useState('sms');
  const [hour, setHour] = useState(10);
  const [offsetDays, setOffsetDays] = useState(0);
  const c = m.caseById.get(caseId);
  const j = c && m.jurByCode.get(c.jurisdiction);
  const at = c ? Math.floor(m.clock / 86400000) * 86400000 + offsetDays * 86400000 + (hour * 60 - (j?.tz || 0)) * 60000 : m.clock;
  const v = useMemo(() => c && evaluateContact(m, c, channel, at, { automated: true }), [version, caseId, channel, at]);
  const lp = j ? localParts(at, j.tz) : null;
  return <Card title="Banc d’essai du moteur juridique" sub="Évaluez n’importe quel dossier, canal et horaire local, sans rien envoyer.">
    <div className="grid g4" style={{ alignItems: 'end' }}>
      <Field label="Dossier"><input id="tb-case" className="input mono" list="tb-cases" value={caseId} onChange={e => setCaseId(e.target.value.toUpperCase())} /><datalist id="tb-cases">{m.cases.slice(0, 200).map(x => <option key={x.id} value={x.id}>{x.jurisdiction} · {x.status}</option>)}</datalist></Field>
      <Field label="Canal"><select id="tb-ch" className="input" value={channel} onChange={e => setChannel(e.target.value)}>{Object.entries(CHANNELS).map(([k, x]) => <option key={k} value={k}>{x.label}</option>)}</select></Field>
      <Field label={`Heure locale : ${hour}h`}><input id="tb-hour" type="range" min="0" max="23" value={hour} onChange={e => setHour(+e.target.value)} /></Field>
      <Field label={`Jour : J${offsetDays >= 0 ? '+' : ''}${offsetDays}`}><input id="tb-day" type="range" min="0" max="45" value={offsetDays} onChange={e => setOffsetDays(+e.target.value)} /></Field>
    </div>
    {!c ? <p className="muted" style={{ marginTop: 10 }}>Dossier introuvable.</p> : <>
      <p className="small muted" style={{ margin: '10px 0' }}>{c.id} · {j.name} · {lp.date} ({DAYS[lp.weekday]}) à {hour}h locale · statut {c.status}</p>
      <Checks verdict={v} />
    </>}
  </Card>;
}
