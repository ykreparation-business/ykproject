const { useState, useMemo, useEffect } = React;
import { useApp, Card, PageHead, Pill, Btn, Field, Callout, Table, Kpi, Tabs, KV, Checks, AreaChart, Icon, Logo, money, eur, nfmt, pct, dtime, dshort } from '../kit.jsx';
import { jurisdictionState, evaluateContact, localParts } from '../../engine/legal.js';
import { analyzeDocument } from '../../engine/ai.js';
import { SAMPLE_DOC } from '../../engine/data.js';
import { CURRENCIES, DAY, isoDate, startOfDayUTC, fmtMoney } from '../../engine/util.js';
import { CONTROLS } from './secure.jsx';

/* ================================ TITAN WORLD ================================ */
const MAP = [
  '               ####                             ',
  '    ######     ####        #  ##########        ',
  '  ##########    ##     ##### ###############    ',
  '   ###########        ######################   ',
  '    ##########        ####  ###############    ',
  '     #########       ###  ##################   ',
  '      #######        ########  ############    ',
  '       #####         #########  #########      ',
  '        ###          ##########  ######  #     ',
  '         ####         ########     ###   ##    ',
  '          #####        ######      ##     #    ',
  '          #######       #####              ##  ',
  '           ######       ####          ######   ',
  '            ####         ###          ######   ',
  '            ###          ##            ####    ',
  '            ##                          ##     ',
  '            #                                  ',
];
const POS = { 'XA-VAL': [24, 4, 1], 'XB-NOR': [22, 1], 'XC-SER': [13, 10, 1], 'XD-OST': [27, 2], 'XE-SAH': [23, 9], 'XF-QAM': [30, 7], 'XG-MER': [41, 5], 'XH-ISL': [11, 8] };

export function World() {
  const { model: m, version } = useApp();
  const [sel, setSel] = useState('XF-QAM');
  const [lite, setLite] = useState(() => document.documentElement.hasAttribute('data-lite'));
  useEffect(() => { if (lite) document.documentElement.setAttribute('data-lite', ''); else document.documentElement.removeAttribute('data-lite'); }, [lite]);
  const s = useMemo(() => m.computeStats(), [version]);
  const j = m.jurByCode.get(sel);
  const st = jurisdictionState(j, m.clock);
  const lp = localParts(m.clock, j.tz);
  const cell = 14;
  const sample = 1234567.89;
  return <>
    <PageHead eyebrow="Titan World — déploiement mondial" title="Carte des juridictions" desc="Architecture multi-pays, multi-devises, multi-fuseaux et multilingue. Tous les marchés sont désactivés pour une utilisation réelle tant que leur validation juridique et opérationnelle n’est pas terminée." actions={<label className="check"><input type="checkbox" checked={lite} onChange={e => setLite(e.target.checked)} />Mode connexion lente</label>} />
    <div className="grid g3">
      <Card className="span2" title="Carte interactive" sub="Juridictions fictives — positions illustratives">
        <div className="mapwrap"><svg viewBox={`0 0 ${48 * cell} ${17 * cell}`} style={{ width: '100%', minWidth: 520, height: 'auto' }} role="img" aria-label="Carte du monde stylisée">
          {MAP.flatMap((row, y) => row.split('').map((ch, x) => ch === '#' ? <circle key={x + '-' + y} cx={x * cell + cell / 2} cy={y * cell + cell / 2} r={cell * .26} fill="var(--line-2)" /> : null))}
          {m.jurisdictions.map(x => { const [cx, cy, below] = POS[x.code]; const ok = jurisdictionState(x, m.clock).ok; const r = 6 + Math.min(10, (s.byJur[x.code]?.count || 0) / 25); return <g key={x.code} className="worldtile" onClick={() => setSel(x.code)} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') setSel(x.code); }} role="button" aria-label={x.name}>
            <circle cx={cx * cell + cell / 2} cy={cy * cell + cell / 2} r={r + 6} fill={ok ? 'var(--emerald)' : 'var(--danger)'} opacity=".15" />
            <circle cx={cx * cell + cell / 2} cy={cy * cell + cell / 2} r={r} fill={ok ? 'var(--emerald)' : 'var(--danger)'} stroke={sel === x.code ? 'var(--fg)' : 'none'} strokeWidth="2" />
            <text x={cx * cell + cell / 2} y={below ? cy * cell + cell / 2 + r + 13 : cy * cell + cell / 2 - r - 5} textAnchor="middle" style={{ fill: 'var(--fg)', fontSize: 11, fontWeight: 600 }}>{x.name}</text>
          </g>; })}
        </svg></div>
        <div className="legend"><span><i style={{ background: 'var(--emerald)' }} />Règles validées (démo)</span><span><i style={{ background: 'var(--danger)' }} />Bloquée</span><span>Taille : nombre de dossiers</span></div>
      </Card>
      <Card title={<>{j.name} <span className="mono muted small">{j.code}</span></>} sub={j.region}>
        <KV items={[
          ['État des règles', <Pill tone={st.ok ? 'ok' : 'danger'}>{st.ok ? 'validées (fictives)' : 'bloquées'}</Pill>],
          ['Usage réel', <Pill tone="muted">désactivé</Pill>],
          ['Heure locale', `${lp.date} ${String(Math.floor(lp.hour)).padStart(2, '0')}:${String(Math.round(lp.hour % 1 * 60)).padStart(2, '0')} (UTC${j.tz >= 0 ? '+' : ''}${j.tz / 60})`],
          ['Devise', `${j.currency} — ${CURRENCIES[j.currency].label}`],
          ['Format monétaire', fmtMoney(Math.round(sample * 10 ** CURRENCIES[j.currency].dec), j.currency, j.locale)],
          ['Format de date', new Intl.DateTimeFormat(j.locale, { dateStyle: 'full', timeZone: 'UTC' }).format(m.clock)],
          ['Langue / écriture', `${j.locale}${j.rtl ? ' · droite à gauche' : ''}`],
          ['Dossiers', nfmt(s.byJur[j.code]?.count || 0)],
        ]} />
        {j.rtl && <div className="codebox wrap rtl" style={{ marginTop: 10 }} lang="ar">مثال على واجهة من اليمين إلى اليسار: رصيدكم المستحق {fmtMoney(125000, 'USD', 'ar-AE')}</div>}
        <div className="sep" />
        <div className="eyebrow">Avant toute activation réelle</div>
        <div className="checks" style={{ marginTop: 6 }}>{[['Analyse juridique par un cabinet local habilité', false], ['Validation à trois niveaux des règles', st.ok], ['Agréments et habilitations professionnelles', false], ['Hébergement régional / résidence des données', false], ['Tests opérationnels et de sécurité', false]].map(([t, ok]) => <div key={t} className={'chk ' + (ok ? 'ok' : 'ko')}><span className="ic">{ok ? '✓' : '✕'}</span><div>{t}</div></div>)}</div>
      </Card>
    </div>
    <Card title="Options d’hébergement envisagées" sub="Aucune n’est en service">
      <div className="grid g4">{[['Cloud public régional', 'Régions UE, Amériques, Afrique, Asie-Pacifique ; résidence des données par client.'], ['Cloud souverain', 'Pour administrations et opérateurs sensibles, qualification à obtenir.'], ['Hébergement dédié', 'Instance isolée par grande institution.'], ['Sur site', 'Pour banques et organisations internationales le justifiant.']].map(([t, d]) => <div key={t} className="card" style={{ padding: 12 }}><b>{t}</b><p className="small muted">{d}</p></div>)}</div>
    </Card>
  </>;
}

/* ============================ TITAN INTEGRATION ============================ */
const CONNECTORS = ['SAP', 'Oracle', 'Microsoft Dynamics', 'Salesforce', 'Sage', 'Odoo', 'QuickBooks', 'Xero', 'Logiciels comptables (FEC, etc.)', 'Systèmes bancaires (API)', 'Systèmes administratifs', 'Facturation électronique', 'Prestataires de paiement', 'Prestataires de téléphonie'];
const SAMPLE_CSV = 'organisation;debiteur;facture;montant;echeance\nORG-001;Société Démo Import-01;FAC-IMP-0001;1200,50;2026-10-15\nORG-002;Camille Exemple;FAC-IMP-0002;340;2026-09-30\nORG-999;Organisation inconnue;FAC-IMP-0003;100;2026-09-30\nORG-003;Débiteur sans montant;FAC-IMP-0004;;2026-10-01';

export function Integrations() {
  const { model: m, version, act, toast } = useApp();
  const [tab, setTab] = useState('sandbox');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState(`/v1/cases/${m.cases[3].id}`);
  const [body, setBody] = useState('{ "channel": "sms" }');
  const [resp, setResp] = useState(null);
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [imp, setImp] = useState(null);
  const [label, setLabel] = useState('Intégration ERP de test');
  const send = () => { let b = null; try { b = body.trim() ? JSON.parse(body) : null; } catch { toast('Corps JSON invalide.', 'danger'); return; } setResp(act(mm => mm.sandboxRequest(method, path, b))); };
  return <>
    <PageHead eyebrow="Titan Integration — interopérabilité" title="Espace développeur" desc="Documentation, sandbox, clés fictives, webhooks simulés, import et export CSV. Aucun système réel n’est connecté dans le prototype." />
    <Tabs value={tab} onChange={setTab} tabs={[{ id: 'sandbox', label: 'Sandbox API' }, { id: 'docs', label: 'Documentation' }, { id: 'keys', label: 'Clés API', count: m.apiKeys.filter(k => !k.revoked).length }, { id: 'webhooks', label: 'Webhooks' }, { id: 'csv', label: 'Import CSV' }, { id: 'connectors', label: 'Connecteurs' }, { id: 'log', label: 'Historique', count: m.integrationLog.length }]} />
    {tab === 'sandbox' && <div className="grid g2">
      <Card title="Requête" sub="Exécutée contre le modèle en mémoire, en lecture seule">
        <div className="row" style={{ flexWrap: 'nowrap' }}><select className="input" style={{ width: 100 }} value={method} onChange={e => setMethod(e.target.value)} aria-label="Méthode"><option>GET</option><option>POST</option><option>DELETE</option></select><input id="sb-path" className="input mono" value={path} onChange={e => setPath(e.target.value)} aria-label="Chemin" /></div>
        <div className="row" style={{ marginTop: 8 }}>{['/v1/cases', `/v1/cases/${m.cases[3].id}`, `/v1/cases/${m.cases[3].id}/evaluate`, '/v1/organizations', '/v1/jurisdictions'].map(p => <Btn key={p} size="sm" kind="ghost" onClick={() => { setPath(p); setMethod(p.endsWith('evaluate') ? 'POST' : 'GET'); }}>{p.replace(/CR-2026-\d+/, ':id')}</Btn>)}</div>
        <Field label="Corps (JSON, pour POST …/evaluate)"><textarea id="sb-body" className="input mono" rows={3} value={body} onChange={e => setBody(e.target.value)} /></Field>
        <Btn kind="primary" style={{ marginTop: 8 }} onClick={send}>Envoyer</Btn>
      </Card>
      <Card title="Réponse" actions={resp && <Pill tone={resp.status < 400 ? 'ok' : 'danger'}>{resp.status} · {resp.ms} ms</Pill>}>
        {resp ? <div className="codebox" style={{ maxHeight: 360 }}>{JSON.stringify(resp.body, null, 2)}</div> : <p className="muted">Envoyez une requête pour voir la réponse. Les coordonnées des débiteurs sont toujours masquées.</p>}
      </Card>
    </div>}
    {tab === 'docs' && <Card title="API REST v1 (simulée)" sub="Authentification prévue : OAuth 2.0 client credentials + mTLS pour les institutions">
      <div className="tablewrap"><table className="t"><thead><tr><th>Méthode</th><th>Route</th><th>Description</th><th>Sandbox</th></tr></thead><tbody>{[
        ['GET', '/v1/cases', 'Liste paginée des dossiers', true], ['GET', '/v1/cases/:id', 'Détail d’un dossier (débiteur masqué)', true], ['POST', '/v1/cases/:id/evaluate', 'Évaluation juridique d’un contact', true], ['GET', '/v1/organizations', 'Organisations', true], ['GET', '/v1/jurisdictions', 'Juridictions et état de validation', true],
        ['POST', '/v1/cases', 'Créer un dossier', false], ['POST', '/v1/cases/:id/payments', 'Déclarer un paiement reçu par le prestataire', false], ['POST', '/v1/cases/:id/disputes', 'Ouvrir une contestation', false], ['GET', '/v1/audit', 'Extraire le journal d’audit (rôle auditeur)', false],
      ].map(([mm, p, d, ok]) => <tr key={mm + p}><td><Pill tone={mm === 'GET' ? 'info' : 'accent'} plain>{mm}</Pill></td><td className="mono small">{p}</td><td className="small">{d}</td><td>{ok ? <Pill tone="ok">disponible</Pill> : <Pill tone="muted">prévu</Pill>}</td></tr>)}</tbody></table></div>
      <div className="codebox" style={{ marginTop: 12 }}>{`curl -X POST https://api.exemple.invalid/v1/cases/CR-2026-00004/evaluate \\
  -H "Authorization: Bearer titan_test_••••" \\
  -d '{"channel":"sms"}'
# → { "allowed": false, "blockers": ["…"], "ruleset": "XA-VAL-v2.1.0", "fictitious_rules": true }`}</div>
      <p className="tiny muted" style={{ marginTop: 6 }}>Domaine en .invalid : aucun appel n’aboutira. Erreurs normalisées : 400 requête invalide, 401 clé absente, 403 permission, 404 introuvable, 405 méthode, 409 conflit, 422 règle bloquante, 429 limitation de débit.</p>
    </Card>}
    {tab === 'keys' && <Card title="Clés API fictives" sub="Seuls le préfixe et les 4 derniers caractères sont conservés">
      <div className="row" style={{ marginBottom: 10 }}><input className="input" style={{ maxWidth: 280 }} value={label} onChange={e => setLabel(e.target.value)} aria-label="Libellé" /><Btn kind="primary" icon="plus" onClick={() => act(mm => mm.createApiKey(label), k => `Clé ${k.prefix}••••${k.last4} créée (fictive).`)}>Créer une clé</Btn></div>
      <Table rows={m.apiKeys} pageSize={8} columns={[{ key: 'label', label: 'Libellé' }, { key: 'k', label: 'Clé', render: k => <span className="mono small">{k.prefix}••••••••{k.last4}</span> }, { key: 'createdAt', label: 'Créée', render: k => dshort(k.createdAt) }, { key: 'revoked', label: 'État', render: k => <Pill tone={k.revoked ? 'danger' : 'ok'}>{k.revoked ? 'révoquée' : 'active'}</Pill> }, { key: 'a', label: '', sortable: false, render: k => !k.revoked && <Btn size="sm" kind="danger" onClick={() => act(mm => mm.revokeApiKey(k.id), 'Clé révoquée.')}>Révoquer</Btn> }]} />
    </Card>}
    {tab === 'webhooks' && <Card title="Webhooks simulés" sub="Les événements sont générés par la simulation mais jamais envoyés">
      <div className="stack">{m.webhooks.map(w => <div key={w.id} className="between card" style={{ padding: 12 }}><div><span className="mono small">{w.url}</span><div className="tiny muted">Événements : {w.events.join(', ')} · signature HMAC prévue</div></div><div className="row"><Pill tone={w.active ? 'ok' : 'muted'}>{w.active ? 'actif' : 'inactif'}</Pill><Btn size="sm" onClick={() => act(mm => { w.active = !w.active; mm.log(mm.currentUserId, 'webhook', w.id, w.active ? 'activé' : 'désactivé'); mm.bump(); })}>{w.active ? 'Désactiver' : 'Activer'}</Btn><Btn size="sm" onClick={() => act(mm => { mm.webhookEvent('payment.succeeded', { test: true }); mm.bump(); }, 'Événement de test généré (non envoyé).')}>Événement test</Btn></div></div>)}</div>
    </Card>}
    {tab === 'csv' && <div className="grid g2">
      <Card title="Importer des dossiers (CSV)" sub="Séparateur ; ou , — en-têtes : organisation;debiteur;facture;montant;echeance">
        <textarea id="csv-in" className="input mono" rows={8} value={csv} onChange={e => setCsv(e.target.value)} />
        <div className="row" style={{ marginTop: 8 }}>
          <label className="btn sm">Charger un fichier<input type="file" accept=".csv,text/csv" hidden onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => setCsv(String(r.result)); r.readAsText(f); }} /></label>
          <Btn kind="primary" onClick={() => setImp(act(mm => mm.importCSV(csv), r => `${r.ok.length} dossier(s) créé(s), ${r.errors.length} ligne(s) rejetée(s).`))}>Importer</Btn>
        </div>
        <p className="tiny muted" style={{ marginTop: 6 }}>Le fichier est lu localement par le navigateur ; il n’est envoyé nulle part. L’exemple contient volontairement deux lignes erronées.</p>
      </Card>
      <Card title="Résultat de l’import">
        {!imp ? <p className="muted">Aucun import pour l’instant.</p> : <div className="stack">
          <Callout tone={imp.errors.length ? 'warn' : 'ok'}>{imp.ok.length} créé(s) : {imp.ok.join(', ') || '—'}</Callout>
          {imp.errors.map((e, i) => <div key={i} className="callout danger">{e}</div>)}
        </div>}
      </Card>
    </div>}
    {tab === 'connectors' && <Card title="Connecteurs prévus" sub="Architecture d’intégration future — aucun n’est connecté">
      <div className="grid g4">{CONNECTORS.map(c => <div key={c} className="card" style={{ padding: 12 }}><div className="between"><b>{c}</b><Pill tone="muted">non connecté</Pill></div><p className="tiny muted" style={{ marginTop: 4 }}>Adaptateur via API officielle ou fichier d’échange, avec mappage des champs et journalisation.</p><Btn size="sm" style={{ marginTop: 8 }} onClick={() => act(mm => { mm.integrationLog.unshift({ at: mm.clock, kind: 'connecteur', ok: false, text: `Test ${c} : désactivé dans le prototype (aucune connexion externe)` }); mm.bump(); }, `${c} : aucune connexion externe dans le prototype.`)}>Tester</Btn></div>)}</div>
    </Card>}
    {tab === 'log' && <Card title="Historique des intégrations et erreurs">
      <Table rows={m.integrationLog} pageSize={14} empty="Aucun événement." columns={[{ key: 'at', label: 'Date', render: x => <span className="mono tiny">{dtime(x.at)}</span> }, { key: 'kind', label: 'Type' }, { key: 'ok', label: 'Résultat', render: x => <Pill tone={x.ok ? 'ok' : 'danger'}>{x.ok ? 'succès' : 'erreur'}</Pill> }, { key: 'text', label: 'Détail', sortable: false, render: x => <span className="small">{x.text}</span> }]} />
    </Card>}
  </>;
}

/* ============================ MODÈLE ÉCONOMIQUE ============================ */
const PLANS = [['STARTER', 29], ['PROFESSIONAL', 99], ['BUSINESS', 299], ['ENTERPRISE', 999], ['BANKING', null], ['GOVERNMENT', null], ['GLOBAL CORPORATE', null]];
export function Business() {
  const [v, setV] = useState({ STARTER: 400, PROFESSIONAL: 180, BUSINESS: 60, ENTERPRISE: 12, BANKING: 2, GOVERNMENT: 3, 'GLOBAL CORPORATE': 1, customPrice: 6000, infra: 9000, ai: 6000, tel: 4000, compliance: 7000, security: 8000, payroll: 85000, sales: 18000, growth: 6, cash: 600000, multiple: 6 });
  const set = (k, x) => setV(s => ({ ...s, [k]: x }));
  const mrr = PLANS.reduce((a, [k, p]) => a + v[k] * (p ?? v.customPrice), 0);
  const cogs = v.infra + v.ai + v.tel;
  const opex = v.compliance + v.security + v.payroll + v.sales;
  const gross = mrr - cogs; const ebit = gross - opex;
  const months = 24; const proj = []; let cash = v.cash; let r = mrr;
  for (let i = 0; i < months; i++) { const varCost = cogs * (r / Math.max(1, mrr)); cash += r - varCost - opex; proj.push({ r, cash }); r *= 1 + v.growth / 100; }
  const runway = ebit >= 0 ? null : Math.floor(v.cash / -ebit);
  const S = ({ k, label, min, max, step = 1, unit = '€' }) => <Field label={`${label} : ${nfmt(v[k])}${unit ? ' ' + unit : ''}`}><input id={'bm-' + k} type="range" min={min} max={max} step={step} value={v[k]} onChange={e => set(k, +e.target.value)} /></Field>;
  const e = x => eur(Math.round(x * 100));
  return <>
    <PageHead eyebrow="Modèle économique" title="Simulateur financier" desc="Toutes les valeurs sont des hypothèses modifiables, sans valeur prévisionnelle ni engagement. Offres fictives." />
    <div className="grid g4">
      <Kpi label="Revenu récurrent mensuel" value={e(mrr)} detail={`ARR ${e(mrr * 12)}`} tone="emerald" />
      <Kpi label="Marge brute" value={e(gross)} detail={mrr ? pct(gross / mrr) : '—'} />
      <Kpi label="Résultat opérationnel / mois" value={e(ebit)} tone={ebit >= 0 ? 'emerald' : 'danger'} />
      <Kpi label="Valorisation hypothétique" value={e(mrr * 12 * v.multiple)} detail={`ARR × ${v.multiple} (hypothèse)`} />
    </div>
    <div className="grid g3">
      <Card title="Clients par offre">
        <div className="stack">{PLANS.map(([k, p]) => <S key={k} k={k} label={`${k} (${p ? p + ' €/mois' : 'sur mesure'})`} min={0} max={k === 'STARTER' ? 3000 : k === 'PROFESSIONAL' ? 1500 : 300} unit="" />)}
          <S k="customPrice" label="Prix moyen sur mesure" min={1000} max={50000} step={500} /></div>
      </Card>
      <Card title="Coûts mensuels">
        <div className="stack"><S k="infra" label="Infrastructures" min={0} max={80000} step={500} /><S k="ai" label="IA" min={0} max={60000} step={500} /><S k="tel" label="Téléphonie" min={0} max={40000} step={500} /><S k="compliance" label="Conformité" min={0} max={50000} step={500} /><S k="security" label="Cybersécurité" min={0} max={50000} step={500} /><S k="payroll" label="Masse salariale" min={0} max={500000} step={5000} /><S k="sales" label="Dépenses commerciales" min={0} max={150000} step={1000} /></div>
      </Card>
      <Card title="Trajectoire">
        <div className="stack"><S k="growth" label="Croissance mensuelle du revenu" min={0} max={20} unit="%" /><S k="cash" label="Trésorerie initiale" min={0} max={5000000} step={50000} /><S k="multiple" label="Multiple d’ARR" min={1} max={15} unit="×" /></div>
        <div className="sep" />
        <p className="small">{runway == null ? 'Résultat opérationnel positif : pas de consommation de trésorerie (hypothèse).' : `Autonomie de trésorerie estimée : ${runway} mois au rythme actuel.`}</p>
      </Card>
    </div>
    <Card title="Projection sur 24 mois" sub="Revenu mensuel et trésorerie — hypothèses">
      <AreaChart height={230} fmt={x => eur(Math.round(x * 100))} labels={proj.map((_, i) => (i % 4 === 0 ? `M${i + 1}` : ''))} series={[{ name: 'Revenu mensuel', color: 'var(--emerald)', data: proj.map(p => p.r) }, { name: 'Trésorerie', color: 'var(--accent)', data: proj.map(p => Math.max(0, p.cash)), fill: false }]} />
      <p className="tiny muted">Licences institutionnelles, contrats de service, intégrations personnalisées et hébergement dédié s’ajoutent via le « prix moyen sur mesure ».</p>
    </Card>
  </>;
}

/* ============================ CONFORMITÉ ============================ */
const FRAMEWORKS = [
  ['RGPD', 'Protection des données', 'Analyse d’écart', 'Registre des traitements, minimisation, droits des personnes (parcours portail implémenté en démo).'],
  ['ISO 27001', 'Sécurité de l’information', 'Objectif', 'SMSI à construire ; contrôles techniques partiellement représentés.'],
  ['ISO 27701', 'Vie privée', 'Objectif', 'Extension du SMSI après ISO 27001.'],
  ['ISO 22301', 'Continuité d’activité', 'Objectif', 'PCA/PRA à formaliser et tester.'],
  ['ISO 42001', 'Systèmes d’IA', 'Analyse d’écart', 'Gouvernance IA : validation humaine et traçabilité implémentées en démo.'],
  ['SOC 2', 'Contrôles de service', 'Objectif', 'Rapport type II envisagé pour les clients nord-américains.'],
  ['PCI DSS', 'Données de carte', 'Si applicable', 'Périmètre réduit visé : aucune donnée de carte traitée par la plateforme.'],
  ['DORA', 'Résilience opérationnelle numérique', 'Si applicable', 'Pertinent pour les clients financiers de l’UE (exigences contractuelles).'],
  ['NIS2', 'Cybersécurité', 'Si applicable', 'Selon la qualification de l’entité et de ses clients.'],
  ['Règlement européen sur l’IA', 'Intelligence artificielle', 'Analyse d’écart', 'Classification des cas d’usage à mener ; transparence (annonce de l’agent vocal) implémentée en démo.'],
  ['OWASP ASVS', 'Sécurité applicative', 'Objectif', 'Niveau 2 visé, niveau 3 pour les modules sensibles.'],
  ['NIST CSF', 'Cybersécurité', 'Objectif', 'Cartographie Identifier / Protéger / Détecter / Répondre / Rétablir.'],
  ['WCAG 2.2', 'Accessibilité', 'En cours', 'Mode haute accessibilité, navigation clavier, contrastes ; audit non réalisé.'],
  ['RGAA', 'Accessibilité secteur public FR', 'Objectif', 'Pour les usages publics français concernés.'],
];
export function Compliance() {
  const { model: m, act } = useApp();
  const [actions, setActions] = useState([
    { id: 'CA-01', text: 'Désigner un délégué à la protection des données', fw: 'RGPD', status: 'à faire' },
    { id: 'CA-02', text: 'Réaliser une analyse d’impact (AIPD) sur le recouvrement automatisé', fw: 'RGPD', status: 'à faire' },
    { id: 'CA-03', text: 'Commander un test d’intrusion indépendant', fw: 'ISO 27001', status: 'à faire' },
    { id: 'CA-04', text: 'Audit d’accessibilité par un tiers', fw: 'WCAG 2.2', status: 'en cours' },
    { id: 'CA-05', text: 'Classifier les cas d’usage IA', fw: 'Règlement IA', status: 'en cours' },
    { id: 'CA-06', text: 'Formaliser et tester le PRA', fw: 'ISO 22301', status: 'à faire' },
  ]);
  const impl = CONTROLS.filter(c => c[1] === 'implémenté').length;
  return <>
    <PageHead eyebrow="Conformité et standards internationaux" title="Matrice des exigences" desc="Objectifs de conformité, contrôles, preuves et actions correctives. Ce tableau distingue les objectifs des certifications : aucune certification, attestation ou validation n’a été obtenue." />
    <div className="grid g4">
      <Kpi label="Certifications obtenues" value="0" detail="Aucune — affichage honnête" />
      <Kpi label="Référentiels suivis" value={FRAMEWORKS.length} />
      <Kpi label="Contrôles implémentés (démo)" value={`${impl}/${CONTROLS.length}`} detail="Voir Titan Security" />
      <Kpi label="Actions correctives ouvertes" value={actions.filter(a => a.status !== 'fait').length} />
    </div>
    <Card title="Référentiels">
      <div className="tablewrap"><table className="t"><thead><tr><th>Référentiel</th><th>Domaine</th><th>Statut</th><th>Preuves / remarques</th><th>Audit</th></tr></thead><tbody>{FRAMEWORKS.map(([k, d, s, r]) => <tr key={k}><td><b>{k}</b></td><td className="small">{d}</td><td><Pill tone={s === 'En cours' ? 'accent' : s === 'Analyse d’écart' ? 'info' : 'muted'}>{s}</Pill></td><td className="small muted">{r}</td><td className="small">Non réalisé</td></tr>)}</tbody></table></div>
    </Card>
    <Card title="Actions correctives">
      <div className="stack">{actions.map(a => <div key={a.id} className="between card" style={{ padding: 10 }}><div><span className="mono tiny muted">{a.id} · {a.fw}</span><div>{a.text}</div></div>
        <select className="input" style={{ width: 'auto' }} value={a.status} aria-label={`Statut ${a.id}`} onChange={e => { const st = e.target.value; setActions(x => x.map(y => y.id === a.id ? { ...y, status: st } : y)); act(mm => { mm.log(mm.currentUserId, 'action corrective', a.id, `Statut : ${st}`); mm.bump(); }); }}><option>à faire</option><option>en cours</option><option>fait</option></select></div>)}</div>
      <p className="tiny muted" style={{ marginTop: 8 }}>Marquer « fait » une action ne vaut pas preuve : en production, chaque action serait liée à une pièce justificative.</p>
    </Card>
  </>;
}

/* ============================ ARCHITECTURE ============================ */
export function Architecture() {
  const boxes = [
    [20, 20, 'Clients web / mobile', 'React + TypeScript'], [250, 20, 'Portail débiteur', 'Accessible, faible bande passante'], [480, 20, 'API partenaires', 'OAuth2 + mTLS'],
    [250, 120, 'Passerelle API', 'Quotas, WAF, authentification'],
    [20, 220, 'Moteur de règles', 'Titan Legal versionné'], [250, 220, 'Orchestrateur de workflows', 'Relances, échéanciers, file humaine'], [480, 220, 'Services IA', 'Multi-fournisseurs, garde-fous'],
    [20, 320, 'PostgreSQL', 'Données métier, cloisonnement par organisation'], [250, 320, 'File de messages / événements', 'Traitements asynchrones'], [480, 320, 'Stockage documentaire', 'Chiffré, antivirus'],
    [20, 420, 'Redis', 'Cache, limitation de débit'], [250, 420, 'Observabilité', 'Journaux, métriques, traces'], [480, 420, 'Coffre de secrets / KMS', 'Rotation des clés'],
  ];
  return <>
    <PageHead eyebrow="Architecture technique de production envisagée" title="Architecture cible" desc="Monolithe modulaire au départ, découpable en services distribués lorsque les besoins réels le justifieront. Les objectifs chiffrés ci-dessous sont des cibles, pas des performances atteintes." />
    <div className="grid g3">
      <Card className="span2" title="Vue d’ensemble">
        <div className="mapwrap"><svg viewBox="0 0 700 490" style={{ width: '100%', minWidth: 560, height: 'auto' }} role="img" aria-label="Schéma d’architecture">
          <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--muted)" /></marker></defs>
          {[[110, 70, 340, 120], [340, 70, 340, 120], [570, 70, 340, 120], [340, 170, 110, 220], [340, 170, 340, 220], [340, 170, 570, 220], [340, 270, 340, 320], [110, 270, 110, 320], [570, 270, 570, 320], [340, 370, 340, 420]].map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="var(--line-2)" strokeWidth="1.5" markerEnd="url(#ar)" />)}
          {boxes.map(([x, y, t, s]) => <g key={t}><rect x={x} y={y} width="200" height="50" rx="8" fill="var(--surface-2)" stroke="var(--line-2)" /><text x={x + 100} y={y + 22} textAnchor="middle" style={{ fill: 'var(--fg)', fontSize: 12, fontWeight: 600 }}>{t}</text><text x={x + 100} y={y + 38} textAnchor="middle" style={{ fill: 'var(--muted)', fontSize: 10 }}>{s}</text></g>)}
        </svg></div>
      </Card>
      <div className="stack">
        <Card title="Objectifs de service (cibles)">
          <div className="tablewrap"><table className="t"><tbody>{[['Disponibilité', '99,9 % (puis 99,95 % institutions)'], ['Latence API p95', '< 300 ms'], ['RPO', '≤ 15 min'], ['RTO', '≤ 4 h'], ['Capacité initiale', '1 M dossiers / 10 M communications par mois']].map(([k, x]) => <tr key={k}><td className="muted">{k}</td><td>{x}</td></tr>)}</tbody></table></div>
          <p className="tiny muted" style={{ marginTop: 6 }}>Non mesurés : aucune infrastructure de production n’existe.</p>
        </Card>
        <Card title="Environnements et livraison">
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}><li>Développement, test, préproduction et production séparés.</li><li>Intégration et déploiement continus, tests automatisés obligatoires.</li><li>Infrastructure décrite en code, revues à quatre yeux.</li><li>Hébergement régional, souverain ou dédié selon le client.</li></ul>
        </Card>
        <Card title="Ce prototype">
          <p className="small">Application React autonome exécutée dans le navigateur : moteur métier en JavaScript pur (testé par 20 tests automatisés), données générées localement par une graine déterministe, aucun serveur.</p>
        </Card>
      </div>
    </div>
  </>;
}

/* ============================ REGISTRE ============================ */
const REG = [
  ['Interface premium, 3 modes, 4 thèmes, responsive', 'terminé'], ['Centre de commande dynamique (KPI, graphiques, filtres)', 'terminé'], ['Recherche universelle et raccourcis clavier', 'terminé'],
  ['Gestion des dossiers, fiche, formulaire guidé chronométré', 'terminé'], ['Filtres mémorisables (sur l’appareil)', 'terminé'], ['Moteur juridique : 8 juridictions fictives, versions, validation 3 niveaux, blocage automatique', 'terminé'],
  ['Banc d’essai juridique', 'terminé'], ['Simulation du temps (jour, semaine, mois, an), pause, arrêt d’urgence', 'terminé'], ['Calendrier intelligent', 'terminé'],
  ['Paiements fictifs, reçus, remboursements, rapprochement, multidevise', 'terminé'], ['Portail débiteur (paiement, contestation, échéancier, difficulté, droits)', 'terminé'],
  ['Permissions RBAC, accès exceptionnel, révocation', 'terminé'], ['Journal d’audit chaîné SHA-256 avec test d’altération', 'terminé'],
  ['Centre de cybersécurité (incidents fictifs)', 'terminé'], ['Espace bancaire (quatre yeux) et circuit public hiérarchique', 'terminé'], ['Détection d’anomalies et file d’investigation', 'terminé'],
  ['Analyse documentaire, garde-fous IA, génération multilingue', 'simulé'], ['Agent vocal (transcription scriptée, tonalités)', 'simulé'], ['Traduction (glossaire)', 'simulé'], ['Prévisions et scénarios', 'simulé'],
  ['Sandbox API, clés, webhooks, import/export CSV', 'terminé'], ['Connecteurs ERP, banques, paiement, téléphonie', 'à développer'], ['Carte mondiale, formats régionaux, RTL, mode connexion lente', 'terminé'],
  ['Modèle économique', 'terminé'], ['Matrice de conformité', 'terminé'], ['MFA, passkeys, SSO, chiffrement, KMS', 'à développer'], ['Backend, base de données, multi-organisation réel', 'à développer'],
  ['IA réelle multi-fournisseurs avec évaluation', 'à développer'], ['Téléphonie, e-mail, SMS réels via prestataires', 'à développer'], ['Persistance partagée entre utilisateurs', 'à développer'],
];
export function Registry() {
  const n = s => REG.filter(r => r[1] === s).length;
  return <>
    <PageHead eyebrow="Registre des fonctionnalités" title="Avancement du prototype" desc="Ce qui fonctionne réellement dans le simulateur, ce qui est simulé et ce qui reste à développer." />
    <div className="grid g3"><Kpi label="Terminé (fonctionnel)" value={n('terminé')} tone="emerald" /><Kpi label="Simulé" value={n('simulé')} detail="Comportement scripté ou déterministe" /><Kpi label="À développer" value={n('à développer')} detail="Production" /></div>
    <Card><div className="tablewrap"><table className="t"><thead><tr><th>Fonctionnalité</th><th>État</th></tr></thead><tbody>{REG.map(([k, s]) => <tr key={k}><td>{k}</td><td><Pill tone={s === 'terminé' ? 'ok' : s === 'simulé' ? 'info' : 'muted'}>{s}</Pill></td></tr>)}</tbody></table></div></Card>
    <Card title="Limites de l’environnement Artifact">
      <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
        <li>Pas de serveur ni de base de données : l’état vit dans l’onglet et se réinitialise au rechargement (seules les préférences d’affichage et les filtres sont mémorisés sur l’appareil).</li>
        <li>Téléchargements bloqués : l’export CSV et les reçus se copient dans le presse-papiers.</li>
        <li>Aucun appel réseau externe : intégrations, IA, téléphonie et paiements sont simulés.</li>
        <li>Pas de vraie authentification : le changement d’utilisateur sert à tester les permissions.</li>
      </ul>
    </Card>
  </>;
}

/* ============================ LABORATOIRE ============================ */
function eligible(m, jur = 'XA-VAL') {
  return m.cases.find(c => c.jurisdiction === jur && c.status === 'actif' && !c.humanQueue && c.documents.facture && !c.flags.hardship && !c.flags.vulnerable
    && m.debtorById.get(c.debtorId).identity === 'vérifiée' && m.debtorById.get(c.debtorId).country === m.orgById.get(c.orgId).jurisdiction
    && m.orgById.get(c.orgId).status === 'actif' && m.orgById.get(c.orgId).authorizations.includes(c.debtType)
    && (m.contactsByDebtor.get(c.debtorId) || []).filter(t => t > m.clock - 7 * DAY).length === 0
    && c.dueDate > m.clock - 4 * 365 * DAY);
}
function nextSlot(m, code, hour = 10) {
  const j = m.jurByCode.get(code); const p = jurisdictionState(j, m.clock).ruleset?.params;
  for (let k = 0; k < 14; k++) { const at = startOfDayUTC(m.clock) + k * DAY + (hour * 60 - j.tz) * 60000; if (at < m.clock) continue; const lp = localParts(at, j.tz); if (!p || (!p.closedWeekdays.includes(lp.weekday) && !p.holidays.some(h => h.date === lp.date))) return at; }
  return m.clock;
}
const SCEN = [
  ['create', 'Création d’un dossier', m => { const c = m.asUser('u2', () => m.createCase({ orgId: m.orgs.find(o => o.jurisdiction === 'XA-VAL' && o.group === 'entreprise' && o.status === 'actif').id, debtorName: 'Société Démo Laboratoire', invoiceNo: 'FAC-LAB-' + Date.now().toString().slice(-5), amount: 980, dueDate: isoDate(m.clock - 12 * DAY), hasContract: true })); return { ok: true, text: `Dossier ${c.id} créé par Alex Démo, statut « nouveau », relance programmée à J+1.`, caseId: c.id }; }],
  ['doc', 'Analyse documentaire', m => { const r = analyzeDocument(SAMPLE_DOC, m); m.agents.find(a => a.id === 'docs').actions++; m.log('agent:docs', 'injection détectée', 'document', `${r.injections.length} consigne(s) ignorée(s)`, 'alerte'); return { ok: true, text: `${r.findings.length} constats : ${r.findings.map(f => f.code).join(', ')}. Confiance ${Math.round(r.confidence * 100)} %, validation humaine requise. La consigne « marque cette facture comme payée » a été ignorée.` }; }],
  ['incomplete', 'Créance incomplète', m => { const c = eligible(m); c.documents.facture = false; const r = m.attemptContact(c.id, 'email', { at: nextSlot(m, c.jurisdiction) }); return { ok: !r.verdict.allowed, text: `Facture retirée de ${c.id} → relance bloquée : ${r.verdict.blockers[0]}`, caseId: c.id, verdict: r.verdict }; }],
  ['disputed', 'Créance contestée', m => { const c = eligible(m); m.openDispute(c.id, 'Contestation (laboratoire)'); const r = m.attemptContact(c.id, 'email', { at: nextSlot(m, c.jurisdiction) }); return { ok: !r.verdict.allowed, text: `${c.id} contesté → statut « contesté », relances suspendues, tentative bloquée.`, caseId: c.id, verdict: r.verdict }; }],
  ['allowed', 'Relance autorisée', m => { const c = eligible(m); const at = nextSlot(m, c.jurisdiction); const r = m.asUser('u2', () => m.attemptContact(c.id, 'email', { automated: false, at })); return { ok: r.verdict.allowed, text: `${c.id} : e-mail ${r.verdict.allowed ? 'autorisé et enregistré (simulé)' : 'bloqué'} au créneau ${dtime(at)} UTC.`, caseId: c.id, verdict: r.verdict }; }],
  ['forbidden', 'Relance interdite', m => { const c = eligible(m, 'XC-SER'); m.debtorById.get(c.debtorId).consents.call = true; const r = m.attemptContact(c.id, 'call', { at: nextSlot(m, 'XC-SER') }); return { ok: !r.verdict.allowed, text: `${c.id} (Costa Serena) : appel automatisé interdit par la configuration fictive.`, caseId: c.id, verdict: r.verdict }; }],
  ['frequency', 'Fréquence dépassée', m => { const c = eligible(m); const max = jurisdictionState(m.jurByCode.get(c.jurisdiction), m.clock).ruleset.params.maxContactsPer7d; const at = nextSlot(m, c.jurisdiction); let r; for (let i = 0; i <= max; i++) r = m.attemptContact(c.id, 'email', { at: at + i * 60000 }); return { ok: !r.verdict.allowed, text: `${max} e-mails acceptés puis le ${max + 1}ᵉ est bloqué : limite de ${max} contacts sur 7 jours, tous canaux et dossiers confondus.`, caseId: c.id, verdict: r.verdict }; }],
  ['partial', 'Paiement partiel', m => { const c = eligible(m); const p = m.asUser('u2', () => m.recordPayment(c.id, Math.round(m.balance(c) * 0.3), 'carte')); return { ok: c.status !== 'paye', text: `${p.id} : 30 % payé sur ${c.id}, reste ${money(m.balance(c), c.currency)}. Le dossier reste actif.`, caseId: c.id }; }],
  ['full', 'Paiement intégral', m => { const c = eligible(m); c.nextActionAt = m.clock + 2 * DAY; m.asUser('u2', () => m.recordPayment(c.id, m.balance(c), 'virement')); const r = m.attemptContact(c.id, 'email', { at: nextSlot(m, c.jurisdiction) }); return { ok: c.status === 'paye' && !r.verdict.allowed, text: `${c.id} soldé : statut « payé », relance programmée annulée, toute nouvelle tentative est bloquée.`, caseId: c.id, verdict: r.verdict }; }],
  ['plan', 'Échéancier', m => { const c = eligible(m); m.asUser('u2', () => m.createPlan(c.id, 6)); return { ok: c.status === 'echeancier', text: `${c.id} : échéancier en 6 mensualités, prochaine échéance ${dshort(c.plan.installments[0].due)}. Relances suspendues tant qu’il est respecté.`, caseId: c.id }; }],
  ['identity', 'Erreur d’identité', m => { const c = eligible(m); m.debtorById.get(c.debtorId).identity = 'incohérente'; m.addFraud('identity', c.debtorId, `Identité incohérente détectée sur ${c.debtorId} (laboratoire).`, 'moyenne'); const r = m.attemptContact(c.id, 'email', { at: nextSlot(m, c.jurisdiction) }); return { ok: !r.verdict.allowed, text: `Identité incohérente → contact interdit (risque de révéler la dette à un tiers) et alerte d’anomalie créée.`, caseId: c.id, verdict: r.verdict }; }],
  ['unvalidated', 'Juridiction non validée', m => { const c = m.cases.find(x => x.jurisdiction === 'XF-QAM' && x.status === 'actif'); const r = m.attemptContact(c.id, 'email'); return { ok: !r.verdict.allowed, text: `${c.id} (Al-Qamar) : validation de niveau 3 manquante → blocage automatique.`, caseId: c.id, verdict: r.verdict }; }],
  ['expired', 'Règle réglementaire expirée', m => { const c = m.cases.find(x => x.jurisdiction === 'XG-MER' && x.status === 'actif'); const r = m.attemptContact(c.id, 'email'); return { ok: !r.verdict.allowed, text: `${c.id} (Meridia) : règles expirées le 2026-06-30, aucune version de remplacement → blocage.`, caseId: c.id, verdict: r.verdict }; }],
  ['unauthorized', 'Tentative d’accès non autorisé', m => { const out = []; try { m.asUser('u3', () => m.createCase({})); } catch (e) { out.push(e.message); } try { m.asUser('u1', () => m.revealPII(m.debtors[0].id)); } catch (e) { out.push(e.message); } return { ok: out.length === 2, text: out.join(' · ') + ' — tentatives journalisées.' }; }],
  ['anomaly', 'Détection d’une anomalie', m => { const src = m.cases.find(c => c.status === 'actif' && m.orgById.get(c.orgId).status === 'actif'); const c = m.asUser('u2', () => m.createCase({ orgId: src.orgId, debtorName: 'Débiteur doublon (laboratoire)', invoiceNo: src.invoiceNo, amount: 1500, dueDate: isoDate(m.clock - 5 * DAY) })); return { ok: true, text: `Facture ${src.invoiceNo} saisie deux fois → alerte « créance dupliquée » ajoutée à la file Titan Fraud (à vérifier, pas une preuve).`, caseId: c.id }; }],
  ['suspend', 'Suspension d’un compte', m => { const c = eligible(m); const o = m.orgById.get(c.orgId); m.asUser('u1', () => m.setOrgStatus(o.id, 'suspendu', 'Laboratoire : suspension')); const r = m.attemptContact(c.id, 'email', { at: nextSlot(m, c.jurisdiction) }); return { ok: !r.verdict.allowed, text: `${o.name} suspendue → relances de ses dossiers bloquées. Réactivation possible dans Titan Control.`, caseId: c.id, verdict: r.verdict }; }],
  ['incident', 'Incident de sécurité fictif', m => { const id = m.raiseIncident('Jeton d’API sandbox exposé dans un ticket (exercice)', 'élevée', 'Secrets', 'Laboratoire'); const k = m.apiKeys.find(x => !x.revoked); if (k) m.asUser('u1', () => m.revokeApiKey(k.id)); return { ok: true, text: `${id} ouvert ; clé sandbox révoquée immédiatement par précaution.` }; }],
  ['kill', 'Arrêt d’urgence', m => { m.asUser('u1', () => m.setKillSwitch(true, 'Laboratoire')); const c = eligible(m); const r = m.attemptContact(c.id, 'email', { at: nextSlot(m, c.jurisdiction) }); return { ok: !r.verdict.allowed, text: 'Arrêt d’urgence activé : plus aucune communication automatisée. Bandeau rouge affiché.', caseId: c.id, verdict: r.verdict }; }],
  ['recovery', 'Reprise d’activité simulée', m => { m.asUser('u1', () => { if (m.killSwitch) m.setKillSwitch(false, 'Reprise après incident (laboratoire)'); }); m.incidents.filter(i => i.status !== 'résolu').forEach(i => { i.status = 'résolu'; }); m.orgs.filter(o => o.status === 'suspendu').forEach(o => { o.status = 'actif'; }); const v = m.verifyAudit(); m.log('u1', 'reprise d’activité', 'plateforme', `PRA simulé : automatisations relancées, incidents clos, journal ${v.ok ? 'intègre' : 'altéré'}`, 'alerte'); return { ok: v.ok, text: `Automatisations relancées, incidents clôturés, organisations réactivées, intégrité du journal ${v.ok ? 'vérifiée' : 'NON vérifiée'}.` }; }],
];
export function Lab() {
  const { model: m, act, openCase } = useApp();
  const [results, setResults] = useState({});
  const [open, setOpen] = useState(null);
  const run = (id, fn) => { const r = act(mm => { const x = fn(mm); mm.bump(); return x; }); if (r) { setResults(s => ({ ...s, [id]: r })); setOpen(id); } };
  return <>
    <PageHead eyebrow="Laboratoire de simulation" title="Scénarios interactifs" desc="Chaque scénario agit sur le modèle réel du simulateur : dossiers, statistiques, journaux et alertes évoluent en conséquence. « Attendu » signale si le comportement observé est celui prévu par les règles." actions={<Btn onClick={() => { for (const [id, , fn] of SCEN) { if (id === 'kill') continue; run(id, fn); } }}>Tout exécuter (sauf arrêt d’urgence)</Btn>} />
    <div className="grid g3">{SCEN.map(([id, label, fn], i) => { const r = results[id]; return <div key={id} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="between"><span className="tiny muted mono">S{String(i + 1).padStart(2, '0')}</span>{r && <Pill tone={r.ok ? 'ok' : 'danger'}>{r.ok ? 'attendu' : 'inattendu'}</Pill>}</div>
      <b>{label}</b>
      {r && <p className="small">{r.text}</p>}
      <div className="row" style={{ marginTop: 'auto' }}><Btn size="sm" kind={id === 'kill' ? 'danger' : 'primary'} onClick={() => run(id, fn)}>{r ? 'Rejouer' : 'Exécuter'}</Btn>{r?.caseId && <Btn size="sm" kind="ghost" onClick={() => openCase(r.caseId)}>Dossier</Btn>}{r?.verdict && <Btn size="sm" kind="ghost" onClick={() => setOpen(open === id ? null : id)}>Détail juridique</Btn>}</div>
      {open === id && r?.verdict && <Checks verdict={r.verdict} />}
    </div>; })}</div>
  </>;
}
