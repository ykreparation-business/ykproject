const { useState, useMemo, useEffect } = React;
import { useApp, Card, PageHead, Pill, Btn, Field, Callout, Table, Kpi, Tabs, KV, Icon, eur, nfmt, dtime } from '../kit.jsx';
import { ROLES, PERMISSIONS, ORG_TYPES } from '../../engine/data.js';

export const CONTROLS = [
  ['Contrôle d’accès par rôles (RBAC) et contrôle des actions', 'implémenté', 'Chaque action métier vérifie la permission de l’utilisateur ; refus journalisés.'],
  ['Séparation des fonctions / double validation', 'implémenté', 'Restructurations bancaires, accès exceptionnels, validations juridiques : demandeur ≠ approbateur.'],
  ['Accès exceptionnel justifié et limité dans le temps', 'implémenté', 'Justification ≥ 20 caractères, 5–60 min, approbation indépendante, journalisation.'],
  ['Journal d’audit chaîné SHA-256', 'implémenté', 'Chaque entrée inclut l’empreinte de la précédente ; altération détectable. Stockage en mémoire : non inviolable.'],
  ['Arrêt d’urgence des automatisations', 'implémenté', 'Bloque instantanément toute communication automatisée.'],
  ['Révocation immédiate des accès', 'implémenté', 'Désactive l’utilisateur simulé et ses sessions.'],
  ['Protection contre l’injection de prompts', 'implémenté', 'Documents et réponses traités comme données ; motifs suspects signalés.'],
  ['Échappement XSS', 'implémenté', 'Rendu React : tout texte importé est échappé, aucun HTML injecté.'],
  ['Masquage des données personnelles', 'implémenté', 'Coordonnées masquées par défaut ; consultation journalisée.'],
  ['Aucune donnée réelle, aucun appel réseau', 'implémenté', 'Le simulateur fonctionne hors ligne dans le navigateur.'],
  ['Authentification multifacteur, passkeys / WebAuthn', 'représenté', 'Prévu en production ; la connexion du simulateur est fictive.'],
  ['SSO SAML / OpenID Connect', 'représenté', 'Architecture prévue avec fournisseurs d’identité des clients.'],
  ['Contrôle d’accès par attributs (ABAC)', 'représenté', 'Règles par juridiction, organisation et sensibilité prévues.'],
  ['Chiffrement au repos et en transit', 'représenté', 'TLS 1.3, chiffrement des bases et du stockage documentaire.'],
  ['Gestion des clés (HSM/KMS) et rotation des secrets', 'représenté', 'Coffre de secrets, rotation automatique.'],
  ['Limitation de débit et protection des API', 'représenté', 'Passerelle API avec quotas et détection d’abus.'],
  ['Protection CSRF et sessions sécurisées', 'représenté', 'Jetons anti-CSRF, cookies HttpOnly/SameSite, expiration.'],
  ['Détection des connexions inhabituelles', 'simulé', 'Des alertes fictives sont générées pendant la simulation.'],
  ['Surveillance des dépendances logicielles', 'représenté', 'Analyse de composition logicielle en intégration continue.'],
  ['Sauvegardes chiffrées, PRA et PCA', 'représenté', 'Objectifs RPO/RTO définis, non mesurés.'],
  ['Journaux d’audit WORM externalisés', 'représenté', 'Stockage à écriture unique prévu en production.'],
];

export function Security() {
  const { model: m, version, act, confirm, setRunning } = useApp();
  const [verify, setVerify] = useState(null);
  const open = m.incidents.filter(i => !['résolu', 'clos'].includes(i.status));
  const refused = m.audit.filter(e => e.level === 'refus').length;
  return <>
    <PageHead eyebrow="Titan Security — supervision défensive" title="Centre de cybersécurité" desc="Architecture Zero Trust et moindre privilège. Les incidents sont fictifs. Le logiciel n’est pas inviolable : ce tableau distingue ce qui est réellement implémenté dans le simulateur de ce qui est seulement représenté." actions={<>
      <Btn kind={m.killSwitch ? 'danger solid' : 'danger'} icon="power" onClick={() => confirm({ title: m.killSwitch ? 'Lever l’arrêt d’urgence ?' : 'Activer l’arrêt d’urgence ?', body: 'Action journalisée. Permission « Arrêt d’urgence » requise.', danger: !m.killSwitch, ok: 'Confirmer', onOk: () => { setRunning(false); act(mm => mm.setKillSwitch(!mm.killSwitch, 'Depuis le centre de sécurité')); } })}>{m.killSwitch ? 'Lever l’arrêt' : 'Arrêt d’urgence'}</Btn>
    </>} />
    <div className="grid g4">
      <Kpi label="Incidents ouverts" value={open.length} tone={open.length ? 'warn' : 'emerald'} alert={open.some(i => i.severity === 'élevée')} />
      <Kpi label="Accès refusés" value={nfmt(refused)} detail="Tentatives journalisées" />
      <Kpi label="Entrées d’audit" value={nfmt(m.audit.length)} detail={`Ancre n° ${m.auditAnchor.seq}`} />
      <Kpi label="Accès exceptionnels actifs" value={m.breakGlass.filter(b => b.status === 'actif' && b.expiresAt > Date.now()).length} />
    </div>
    <div className="grid g3">
      <Card className="span2" title="Incidents (fictifs)">
        <Table rows={m.incidents} pageSize={8} columns={[
          { key: 'id', label: 'Incident', render: i => <><span className="mono small">{i.id}</span><div className="tiny muted">{i.category}</div></> },
          { key: 'title', label: 'Description', sortable: false, render: i => <><span className="small">{i.title}</span><div className="tiny muted">{i.source}</div></> },
          { key: 'severity', label: 'Sévérité', render: i => <Pill tone={i.severity === 'élevée' ? 'danger' : i.severity === 'moyenne' ? 'warn' : 'info'}>{i.severity}</Pill> },
          { key: 'status', label: 'Statut', render: i => <Pill tone={i.status === 'résolu' ? 'ok' : i.status === 'nouveau' ? 'danger' : 'warn'}>{i.status}</Pill> },
          { key: 'a', label: 'Actions', sortable: false, render: i => <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}>{i.status === 'nouveau' && <Btn size="sm" onClick={() => act(mm => mm.incidentAction(i.id, 'en analyse'))}>Prendre en charge</Btn>}{['nouveau', 'en analyse'].includes(i.status) && <Btn size="sm" onClick={() => act(mm => mm.incidentAction(i.id, 'contenu'))}>Contenir</Btn>}{i.status !== 'résolu' && <Btn size="sm" kind="ok" onClick={() => act(mm => mm.incidentAction(i.id, 'résolu'))}>Résoudre</Btn>}</div> },
        ]} />
        <div className="row" style={{ marginTop: 10 }}>
          <Btn size="sm" onClick={() => act(mm => { mm.raiseIncident('Connexion depuis un appareil inconnu à 03h12 (simulation)', 'élevée', 'Identité', 'Détection simulée'); mm.bump(); }, 'Alerte de connexion inhabituelle générée.')}>Simuler une connexion inhabituelle</Btn>
          <Btn size="sm" onClick={() => act(mm => { mm.raiseIncident('Tentative d’export massif sans justification (simulation)', 'moyenne', 'Données', 'Règle de détection simulée'); mm.bump(); }, 'Alerte d’exfiltration simulée.')}>Simuler un export suspect</Btn>
        </div>
      </Card>
      <div className="stack">
        <Card title="Intégrité du journal d’audit" sub="Chaînage SHA-256 réellement calculé">
          <div className="row"><Btn kind="primary" size="sm" onClick={() => setVerify(m.verifyAudit())}>Vérifier la chaîne</Btn><Btn size="sm" kind="danger" onClick={() => { const s = m.tamperAuditDemo(); setVerify(null); act(mm => mm.bump(), `Entrée n° ${s} altérée (test). Lancez la vérification.`); }}>Test d’altération</Btn><Btn size="sm" onClick={() => { act(mm => mm.repairAuditDemo(), 'Journal restauré depuis la sauvegarde simulée.'); setVerify(null); }}>Restaurer</Btn></div>
          {verify && <div style={{ marginTop: 10 }}>{verify.ok ? <Callout tone="ok" icon="check">Chaîne intègre : {nfmt(verify.count)} entrées vérifiées depuis l’ancre n° {verify.anchor.seq}.</Callout> : <Callout tone="danger">Altération détectée à l’entrée n° {verify.at} : {verify.reason}.</Callout>}</div>}
          <p className="tiny muted" style={{ marginTop: 8 }}>Le journal vit dans la mémoire du navigateur : une personne disposant du poste pourrait le recalculer entièrement. En production, l’ancrage serait externalisé (stockage WORM, horodatage tiers).</p>
        </Card>
        <Card title="Programme de sécurité prévu">
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
            <li>Tests d’intrusion autorisés par un prestataire indépendant, avant toute mise en production.</li><li>Audits indépendants périodiques.</li><li>Politique de divulgation responsable des vulnérabilités (adresse dédiée, délais de réponse, safe harbour).</li><li>Exercices de gestion de crise et de reprise d’activité.</li>
          </ul>
          <p className="tiny muted" style={{ marginTop: 6 }}>Aucune fonctionnalité offensive, de piratage ou de surveillance illégitime n’est prévue.</p>
        </Card>
      </div>
    </div>
    <Card title="Mesures de sécurité : implémenté, simulé ou représenté">
      <div className="tablewrap"><table className="t"><thead><tr><th>Mesure</th><th>État dans ce prototype</th><th>Détail</th></tr></thead><tbody>{CONTROLS.map(([k, s, d]) => <tr key={k}><td>{k}</td><td><Pill tone={s === 'implémenté' ? 'ok' : s === 'simulé' ? 'info' : 'muted'}>{s}</Pill></td><td className="small muted">{d}</td></tr>)}</tbody></table></div>
    </Card>
  </>;
}

/* ============================ TITAN CONTROL ============================ */
export function Control() {
  const { model: m, version, act, confirm } = useApp();
  const [tab, setTab] = useState('users');
  return <>
    <PageHead eyebrow="Titan Control — supervision générale" title="Administration" desc="Organisations, utilisateurs, permissions, agents IA, accès exceptionnels et journal d’audit. Même le super administrateur n’a pas d’accès illimité et non journalisé aux données sensibles." />
    <Tabs value={tab} onChange={setTab} tabs={[{ id: 'users', label: 'Utilisateurs' }, { id: 'perms', label: 'Matrice des permissions' }, { id: 'bg', label: 'Accès exceptionnels', count: m.breakGlass.filter(b => b.status === 'en attente').length }, { id: 'orgs', label: 'Organisations', count: m.orgs.length }, { id: 'agents', label: 'Agents IA' }, { id: 'audit', label: 'Journal d’audit' }]} />
    {tab === 'users' && <Card title="Utilisateurs (fictifs)">
      <Table rows={m.users} pageSize={12} columns={[
        { key: 'name', label: 'Utilisateur', render: u => <div className="row"><span className="avatar">{u.initials}</span>{u.name}{u.id === m.currentUserId && <Pill tone="accent" plain>vous</Pill>}</div> },
        { key: 'role', label: 'Rôle', render: u => ROLES[u.role].label },
        { key: 'perms', label: 'Permissions', render: u => nfmt(ROLES[u.role].perms.length) },
        { key: 'active', label: 'État', render: u => <Pill tone={u.active ? 'ok' : 'danger'}>{u.active ? 'actif' : 'révoqué'}</Pill> },
        { key: 'a', label: '', sortable: false, render: u => u.active ? <Btn size="sm" kind="danger" onClick={() => confirm({ title: `Révoquer ${u.name} ?`, body: 'Les sessions sont fermées immédiatement. Permission « Gérer les utilisateurs » requise (RSSI ou super administrateur).', danger: true, ok: 'Révoquer', onOk: () => act(mm => mm.setUserActive(u.id, false), 'Accès révoqué.') })}>Révoquer</Btn> : <Btn size="sm" onClick={() => act(mm => mm.setUserActive(u.id, true), 'Accès rétabli.')}>Rétablir</Btn> },
      ]} />
    </Card>}
    {tab === 'perms' && <Card title="Matrice rôles × permissions" sub="Lecture seule — dérivée de la configuration du moteur">
      <div className="tablewrap"><table className="t matrix"><thead><tr><th>Permission</th>{Object.entries(ROLES).map(([k, r]) => <th key={k} className="c" title={r.label} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 150, whiteSpace: 'nowrap' }}>{r.label}</th>)}</tr></thead>
        <tbody>{Object.entries(PERMISSIONS).map(([p, l]) => <tr key={p}><td className="small">{l}<div className="tiny muted mono">{p}</div></td>{Object.entries(ROLES).map(([k, r]) => <td key={k} className="c">{r.perms.includes(p) ? <span style={{ color: 'var(--emerald)' }}>●</span> : <span className="muted">·</span>}</td>)}</tr>)}</tbody></table></div>
      <p className="tiny muted" style={{ marginTop: 8 }}>Le super administrateur ne détient pas « Voir les coordonnées des débiteurs », ni les approbations à quatre yeux : il doit demander un accès exceptionnel approuvé par un tiers.</p>
    </Card>}
    {tab === 'bg' && <BreakGlass />}
    {tab === 'orgs' && <Card title="Organisations clientes (fictives)">
      <Table rows={m.orgs} pageSize={12} columns={[
        { key: 'id', label: 'ID', render: o => <span className="mono small">{o.id}</span> }, { key: 'name', label: 'Nom' }, { key: 'type', label: 'Type', render: o => ORG_TYPES[o.type].label },
        { key: 'jurisdiction', label: 'Juridiction', render: o => <span className="mono small">{o.jurisdiction}</span> }, { key: 'plan', label: 'Offre', render: o => <Pill tone="info" plain>{o.plan}</Pill> },
        { key: 'status', label: 'État', render: o => <Pill tone={o.status === 'actif' ? 'ok' : 'danger'}>{o.status}</Pill> },
        { key: 'a', label: '', sortable: false, render: o => o.status === 'actif' ? <Btn size="sm" onClick={() => confirm({ title: `Suspendre ${o.name} ?`, body: 'Plus aucune relance ni création de dossier pour cette organisation.', danger: true, ok: 'Suspendre', onOk: () => act(mm => mm.setOrgStatus(o.id, 'suspendu', 'Suspension administrative'), 'Organisation suspendue.') })}>Suspendre</Btn> : <Btn size="sm" onClick={() => act(mm => mm.setOrgStatus(o.id, 'actif', 'Réactivation'), 'Organisation réactivée.')}>Réactiver</Btn> },
      ]} />
    </Card>}
    {tab === 'agents' && <Card title="Agents IA" sub="Chaque agent peut être désactivé instantanément">
      <div className="stack">{m.agents.map(a => <div key={a.id} className="between card" style={{ padding: 12 }}><div><b>{a.name}</b><div className="small muted">{a.desc}</div><div className="tiny muted">{nfmt(a.actions)} action(s) simulée(s)</div></div><div className="row"><Pill tone={a.enabled ? 'ok' : 'danger'}>{a.enabled ? 'actif' : 'désactivé'}</Pill><Btn size="sm" onClick={() => act(mm => mm.setAgent(a.id, !a.enabled), a.enabled ? `${a.name} désactivé.` : `${a.name} réactivé.`)}>{a.enabled ? 'Désactiver' : 'Activer'}</Btn></div></div>)}</div>
    </Card>}
    {tab === 'audit' && <AuditLog />}
  </>;
}

function BreakGlass() {
  const { model: m, version, act } = useApp();
  const [just, setJust] = useState('Vérification d’une réclamation débiteur, ticket fictif REQ-2041');
  const [min, setMin] = useState(15);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick(x => x + 1), 1000); return () => clearInterval(t); }, []);
  return <div className="grid g2">
    <Card title="Demander un accès exceptionnel" sub={`Demandeur : ${m.user.name}`}>
      <div className="stack">
        <Field label="Justification (20 caractères minimum)"><textarea id="bg-just" className="input" rows={3} value={just} onChange={e => setJust(e.target.value)} /></Field>
        <Field label={`Durée : ${min} minutes`}><input id="bg-min" type="range" min="5" max="60" step="5" value={min} onChange={e => setMin(+e.target.value)} /></Field>
        <Btn kind="primary" onClick={() => act(mm => mm.requestBreakGlass(just, min), 'Demande envoyée : un approbateur indépendant doit la valider.')}>Envoyer la demande</Btn>
        <Callout>Approbation requise par un autre utilisateur ayant la permission dédiée (conformité ou auditeur indépendant). Passez sur « B. Modèle (conformité) » pour approuver.</Callout>
      </div>
    </Card>
    <Card title="Demandes">
      {m.breakGlass.length === 0 ? <p className="muted">Aucune demande.</p> : <div className="stack">{m.breakGlass.map(b => { const left = Math.max(0, Math.round((b.expiresAt - Date.now()) / 1000)); const st = b.status === 'actif' && left === 0 ? 'expiré' : b.status; return <div key={b.id} className="card" style={{ padding: 12 }}>
        <div className="between"><b className="mono">{b.id}</b><Pill tone={st === 'actif' ? 'ok' : st === 'en attente' ? 'warn' : 'muted'}>{st}{st === 'actif' ? ` · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : ''}</Pill></div>
        <div className="small">{m.userById(b.userId).name} — {b.minutes} min</div><div className="small muted">{b.justification}</div>
        {b.approver && <div className="tiny muted">Décision : {m.userById(b.approver).name}</div>}
        {b.status === 'en attente' && <div className="row" style={{ marginTop: 8 }}><Btn size="sm" kind="ok" onClick={() => act(mm => mm.decideBreakGlass(b.id, true), 'Accès approuvé et limité dans le temps.')}>Approuver</Btn><Btn size="sm" kind="danger" onClick={() => act(mm => mm.decideBreakGlass(b.id, false), 'Demande refusée.')}>Refuser</Btn></div>}
      </div>; })}</div>}
    </Card>
  </div>;
}

function AuditLog() {
  const { model: m, version } = useApp();
  const [q, setQ] = useState('');
  const [lvl, setLvl] = useState('');
  const canRead = m.can('audit.read');
  const rows = useMemo(() => { const s = q.toLowerCase(); return m.audit.slice(-3000).reverse().filter(e => (!lvl || e.level === lvl) && (!s || (e.action + e.target + e.detail + e.actor).toLowerCase().includes(s))); }, [version, q, lvl]);
  if (!canRead) return <Callout tone="warn" icon="lock">Votre rôle ne permet pas de lire le journal d’audit. Rôles autorisés : super administrateur, analyste, conformité, RSSI, validateur bancaire, auditeur indépendant.</Callout>;
  return <Card title="Journal d’audit" sub="3 000 dernières entrées · chaque ligne porte l’empreinte de la précédente" actions={<><input className="input" style={{ width: 220 }} placeholder="Filtrer…" value={q} onChange={e => setQ(e.target.value)} aria-label="Filtrer le journal" /><select className="input" style={{ width: 'auto' }} value={lvl} onChange={e => setLvl(e.target.value)} aria-label="Niveau"><option value="">Tous niveaux</option><option value="info">Info</option><option value="alerte">Alerte</option><option value="blocage">Blocage</option><option value="refus">Refus d’accès</option></select></>}>
    <Table rows={rows} pageSize={15} columns={[
      { key: 'seq', label: 'N°', right: true, render: e => <span className="mono tiny">{e.seq}</span> },
      { key: 'at', label: 'Heure virtuelle', render: e => <span className="mono tiny">{dtime(e.at)}</span> },
      { key: 'actor', label: 'Acteur', render: e => <span className="small">{m.users.find(u => u.id === e.actor)?.name || e.actor}</span> },
      { key: 'action', label: 'Action', render: e => <Pill tone={{ alerte: 'warn', blocage: 'danger', refus: 'danger' }[e.level] || 'muted'} plain>{e.action}</Pill> },
      { key: 'detail', label: 'Détail', sortable: false, render: e => <span className="small"><span className="mono tiny muted">{e.target}</span> {e.detail}</span> },
      { key: 'hash', label: 'Empreinte', sortable: false, render: e => <span className="mono tiny muted" title={e.hash}>{e.hash.slice(0, 10)}…</span> },
    ]} />
  </Card>;
}
