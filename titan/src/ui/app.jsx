// Coque de l'application : navigation, barre de commande, horloge virtuelle, recherche universelle, assistant de démarrage.
const { useState, useEffect, useRef, useMemo, useCallback } = React;
import { Model } from '../engine/model.js';
import { ROLES } from '../engine/data.js';
import { fmtDateTime } from '../engine/util.js';
import { Ctx, Icon, Logo, Btn, Seg, Modal, Pill, Field, Callout, Tip } from './kit.jsx';
import { Dashboard } from './views/dashboard.jsx';
import { Cases, CaseDrawer, NewCaseWizard } from './views/cases.jsx';
import { Legal } from './views/legal.jsx';
import { Connect, Voice } from './views/connect.jsx';
import { Pay, Portal } from './views/pay.jsx';
import { Intelligence, Predict, Fraud } from './views/intel.jsx';
import { Security, Control } from './views/secure.jsx';
import { Institutions } from './views/inst.jsx';
import { World, Integrations, Business, Compliance, Architecture, Registry, Lab } from './views/platform.jsx';

const model = new Model();
if (typeof window !== 'undefined') window.__titan = model; // inspection en console (démo)

const NAV = [
  { group: 'Pilotage', items: [
    { id: 'dashboard', label: 'Centre de commande', icon: 'dashboard', modes: ['simple', 'pro', 'expert'], View: Dashboard },
    { id: 'cases', label: 'Dossiers', icon: 'cases', modes: ['simple', 'pro', 'expert'], View: Cases },
    { id: 'lab', label: 'Laboratoire de scénarios', icon: 'lab', modes: ['simple', 'pro', 'expert'], View: Lab },
  ] },
  { group: 'Opérations', items: [
    { id: 'connect', label: 'Titan Connect', icon: 'connect', modes: ['simple', 'pro', 'expert'], View: Connect },
    { id: 'voice', label: 'Titan Voice', icon: 'voice', modes: ['pro', 'expert'], View: Voice },
    { id: 'pay', label: 'Titan Pay', icon: 'pay', modes: ['simple', 'pro', 'expert'], View: Pay },
    { id: 'portal', label: 'Portail débiteur', icon: 'portal', modes: ['simple', 'pro', 'expert'], View: Portal },
  ] },
  { group: 'Intelligence', items: [
    { id: 'intelligence', label: 'Titan Intelligence', icon: 'ai', modes: ['pro', 'expert'], View: Intelligence },
    { id: 'predict', label: 'Titan Predict', icon: 'predict', modes: ['pro', 'expert'], View: Predict },
    { id: 'fraud', label: 'Titan Fraud', icon: 'fraud', modes: ['pro', 'expert'], View: Fraud, badge: m => m.fraudAlerts.filter(f => f.status === 'nouveau').length },
  ] },
  { group: 'Conformité & sécurité', items: [
    { id: 'legal', label: 'Titan Legal', icon: 'legal', modes: ['pro', 'expert'], View: Legal, badge: m => m.regulatoryAlerts().filter(a => a.level === 'critique' && !a.ack).length },
    { id: 'security', label: 'Titan Security', icon: 'security', modes: ['pro', 'expert'], View: Security, badge: m => m.incidents.filter(i => i.status === 'nouveau').length },
    { id: 'compliance', label: 'Normes & conformité', icon: 'compliance', modes: ['expert'], View: Compliance },
  ] },
  { group: 'Institutions', items: [
    { id: 'institutions', label: 'Banques & collectivités', icon: 'bank', modes: ['pro', 'expert'], View: Institutions },
  ] },
  { group: 'Plateforme', items: [
    { id: 'world', label: 'Titan World', icon: 'world', modes: ['expert'], View: World },
    { id: 'integrations', label: 'Titan Integration', icon: 'integ', modes: ['expert'], View: Integrations },
    { id: 'control', label: 'Titan Control', icon: 'control', modes: ['expert'], View: Control },
    { id: 'business', label: 'Modèle économique', icon: 'business', modes: ['expert'], View: Business },
    { id: 'architecture', label: 'Architecture', icon: 'arch', modes: ['expert'], View: Architecture },
    { id: 'registry', label: 'Registre des fonctionnalités', icon: 'registry', modes: ['simple', 'pro', 'expert'], View: Registry },
  ] },
];
const ALL_ITEMS = NAV.flatMap(g => g.items);

function store(key, val) { try { if (val === undefined) return localStorage.getItem('titan.' + key); localStorage.setItem('titan.' + key, val); } catch { return null; } }

export function App() {
  const [version, setVersion] = useState(model.version);
  const [route, setRoute] = useState(() => (location.hash.slice(1) || 'dashboard'));
  const [mode, setMode] = useState(() => store('mode') || 'pro');
  const [theme, setTheme] = useState(() => store('theme') || 'auto');
  const [collapsed, setCollapsed] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [openCase, setOpenCase] = useState(null);
  const [wizard, setWizard] = useState(false);
  const [palette, setPalette] = useState(false);
  const [help, setHelp] = useState(false);
  const [onboarding, setOnboarding] = useState(() => store('onboarded') !== '1');
  const [confirmState, setConfirm] = useState(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(700);

  const refresh = useCallback(() => setVersion(model.version), []);
  const toast = useCallback((text, tone = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t.slice(-3), { id, text, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), tone === 'danger' ? 6500 : 4200);
  }, []);
  const act = useCallback((fn, ok) => {
    try { const r = fn(model); refresh(); if (ok) toast(typeof ok === 'function' ? ok(r) : ok, 'ok'); return r; }
    catch (e) { refresh(); toast(e.message || String(e), 'danger'); return undefined; }
  }, [refresh, toast]);
  const confirm = useCallback(opts => setConfirm(opts), []);
  const go = useCallback(id => { location.hash = id; setRoute(id); setSideOpen(false); window.scrollTo({ top: 0 }); }, []);

  useEffect(() => { const h = () => setRoute(location.hash.slice(1) || 'dashboard'); window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h); }, []);
  useEffect(() => { store('mode', mode); }, [mode]);
  useEffect(() => { store('theme', theme); const r = document.documentElement; if (theme === 'auto') r.removeAttribute('data-titan-theme'); else r.setAttribute('data-titan-theme', theme); }, [theme]);
  // Boucle de simulation continue
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      if (model.killSwitch) { setRunning(false); toast('Simulation interrompue : arrêt d’urgence actif.', 'danger'); return; }
      try { model.advanceDays(1); refresh(); } catch (e) { setRunning(false); toast(e.message, 'danger'); }
    }, speed);
    return () => clearInterval(t);
  }, [running, speed, refresh, toast]);
  // Notifications du modèle → toasts
  const seen = useRef(new Set(model.notifications.map(n => n.id)));
  useEffect(() => { for (const n of model.notifications.slice(0, 3)) if (!seen.current.has(n.id)) { seen.current.add(n.id); toast(n.text, n.tone); } }, [version, toast]);
  // Raccourcis clavier
  useEffect(() => {
    const h = e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); return; }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === '/') { e.preventDefault(); setPalette(true); }
      else if (e.key === 'n') { setWizard(true); }
      else if (e.key === '?') { setHelp(true); }
      else if (e.key === 'j') { act(m => m.advanceDays(1), 'Une journée simulée.'); }
      else if (e.key === 'r') { setRunning(r => !r); }
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [act]);

  const items = NAV.map(g => ({ ...g, items: g.items.filter(i => i.modes.includes(mode)) })).filter(g => g.items.length);
  const current = ALL_ITEMS.find(i => i.id === route) || ALL_ITEMS[0];
  const visible = current.modes.includes(mode) ? current : ALL_ITEMS[0];
  const View = visible.View;
  const user = model.user;
  const ctx = { model, version, act, toast, refresh, go, confirm, openCase: setOpenCase, newCase: () => setWizard(true), mode, running, setRunning };

  return <Ctx.Provider value={ctx}>
    <div className={'simbar' + (model.killSwitch ? ' kill' : '')} role="status"><span className="dot" />GLOBAL RECOVERY AI TITAN — ENVIRONNEMENT DE SIMULATION — AUCUNE OPÉRATION RÉELLE{model.killSwitch && ' — ARRÊT D’URGENCE ACTIF'}</div>
    <div className={'shell' + (collapsed ? ' collapsed' : '')}>
      <nav className={'side' + (sideOpen ? ' open' : '')} aria-label="Navigation principale">
        <div className="brand"><Logo /><div className="brand-txt"><b>GLOBAL RECOVERY<br />AI TITAN</b><span>Enterprise Edition</span></div></div>
        {items.map(g => <div key={g.group} className="navgroup"><div className="eyebrow">{g.group}</div>
          {g.items.map(i => { const b = i.badge ? i.badge(model) : 0; return <button key={i.id} className={'navitem' + (visible.id === i.id ? ' on' : '')} onClick={() => go(i.id)} title={i.label} aria-current={visible.id === i.id ? 'page' : undefined}><Icon name={i.icon} /><span className="lbl">{i.label}</span>{b > 0 && <span className="badge">{b}</span>}</button>; })}
        </div>)}
        <div className="side-foot">Intelligence financière. Conformité mondiale. Confiance absolue.<div style={{ marginTop: 6 }}>Prototype v0.1 — données 100 % fictives.</div></div>
      </nav>
      {sideOpen && <div className="scrim only-sm" style={{ zIndex: 65 }} onClick={() => setSideOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <Btn kind="ghost icon" icon="menu" className="btn ghost icon only-sm" onClick={() => setSideOpen(true)} aria-label="Ouvrir le menu" />
          <Btn kind="ghost icon hide-sm" icon="side" onClick={() => setCollapsed(c => !c)} aria-label="Réduire la navigation" />
          <button className="search" onClick={() => setPalette(true)} aria-label="Recherche universelle"><Icon name="search" size={16} /><span className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Rechercher dossier, facture, organisation…</span><kbd className="hide-sm">Ctrl K</kbd></button>
          <div className="clock" title="Horloge virtuelle de la simulation (UTC)"><span className={'pulse' + (running ? '' : ' off')} /><span className="num">{fmtDateTime(model.clock)} UTC</span></div>
          <div className="row" style={{ gap: 4 }}>
            <Btn kind={running ? 'ok' : ''} size="sm" icon={running ? 'pause' : 'play'} onClick={() => setRunning(r => !r)} title="Lecture / pause de la simulation (R)">{running ? 'Pause' : 'Lecture'}</Btn>
            <Btn size="sm" icon="ff" onClick={() => act(m => m.advanceDays(1), r => `Jour simulé : ${r.sent} envoi(s), ${r.blocked} blocage(s), ${r.paid} paiement(s).`)} title="Avancer d’un jour (J)">+1 j</Btn>
          </div>
          <div className="row hide-sm" style={{ gap: 6, flexWrap: 'nowrap' }}>
            <span className="avatar" aria-hidden="true">{user.initials}</span>
            <select className="input" style={{ width: 'auto', maxWidth: 190, height: 32 }} value={user.id} onChange={e => act(m => m.setUser(e.target.value), `Session simulée : ${model.userById(e.target.value).name}`)} aria-label="Changer d’utilisateur (simulation)">
              {model.users.map(u => <option key={u.id} value={u.id} disabled={!u.active}>{u.name} — {ROLES[u.role].label}{u.active ? '' : ' (révoqué)'}</option>)}
            </select>
          </div>
          <Prefs mode={mode} setMode={setMode} theme={theme} setTheme={setTheme} onHelp={() => setHelp(true)} onTour={() => setOnboarding(true)} />
          <Btn kind={model.killSwitch ? 'danger solid' : 'danger'} size="sm" icon="power" onClick={() => confirm({
            title: model.killSwitch ? 'Lever l’arrêt d’urgence ?' : 'Activer l’arrêt d’urgence ?',
            body: model.killSwitch ? 'Les automatisations pourront reprendre, toujours sous contrôle du moteur juridique.' : 'Toutes les communications automatisées seront immédiatement bloquées et la simulation s’arrêtera. L’action est journalisée.',
            danger: !model.killSwitch, ok: model.killSwitch ? 'Lever l’arrêt' : 'Arrêter tout',
            onOk: () => { setRunning(false); act(m => m.setKillSwitch(!m.killSwitch, 'Déclenché depuis la barre de commande')); },
          })}>{model.killSwitch ? 'Arrêt actif' : 'Arrêt d’urgence'}</Btn>
        </header>
        <main className="content" id="main"><View /></main>
      </div>
    </div>
    {openCase && <CaseDrawer id={openCase} onClose={() => setOpenCase(null)} />}
    {wizard && <NewCaseWizard onClose={() => setWizard(false)} />}
    {palette && <Palette onClose={() => setPalette(false)} />}
    {help && <Help onClose={() => setHelp(false)} />}
    {onboarding && <Onboarding onClose={() => { store('onboarded', '1'); setOnboarding(false); }} />}
    {confirmState && <ConfirmModal {...confirmState} onClose={() => setConfirm(null)} />}
    <div className="toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className={'toast ' + t.tone}><Icon name={t.tone === 'danger' ? 'alert' : t.tone === 'ok' ? 'check' : 'help'} size={16} /><span>{t.text}</span></div>)}</div>
  </Ctx.Provider>;
}

const MODE_LABEL = { simple: 'Simple', pro: 'Pro', expert: 'Expert' };
function Prefs({ mode, setMode, theme, setTheme, onHelp, onTour }) {
  const { model: m, act } = React.useContext(Ctx);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (!open) return; const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; const k = e => { if (e.key === 'Escape') setOpen(false); }; document.addEventListener('mousedown', h); window.addEventListener('keydown', k); return () => { document.removeEventListener('mousedown', h); window.removeEventListener('keydown', k); }; }, [open]);
  return <div ref={ref} style={{ position: 'relative' }}>
    <Btn size="sm" icon="control" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="dialog" title="Mode, thème, utilisateur, aide">Mode {MODE_LABEL[mode]}</Btn>
    {open && <div className="card popover" role="dialog" aria-label="Préférences">
      <Field label="Mode d’utilisation"><Seg label="Mode d’utilisation" value={mode} onChange={setMode} options={[{ value: 'simple', label: 'Simple', title: 'Pour débuter' }, { value: 'pro', label: 'Pro', title: 'Pour les gestionnaires' }, { value: 'expert', label: 'Expert', title: 'Administrateurs et analystes' }]} /></Field>
      <p className="tiny muted">Simple : l’essentiel. Pro : gestion quotidienne. Expert : administration, intégrations, architecture.</p>
      <Field label="Thème"><select id="pref-theme" className="input" value={theme} onChange={e => setTheme(e.target.value)}><option value="auto">Système</option><option value="dark">Sombre</option><option value="light">Clair</option><option value="hc">Haute accessibilité</option></select></Field>
      <Field label="Utilisateur simulé" hint="Pour tester les permissions"><select id="pref-user" className="input" value={m.currentUserId} onChange={e => act(mm => mm.setUser(e.target.value), `Session simulée : ${m.userById(e.target.value).name}`)}>{m.users.map(u => <option key={u.id} value={u.id} disabled={!u.active}>{u.name} — {ROLES[u.role].label}</option>)}</select></Field>
      <div className="row"><Btn size="sm" icon="help" onClick={() => { setOpen(false); onHelp(); }}>Raccourcis</Btn><Btn size="sm" onClick={() => { setOpen(false); onTour(); }}>Revoir l’assistant</Btn></div>
    </div>}
  </div>;
}

function ConfirmModal({ title, body, danger, ok = 'Confirmer', onOk, onClose, requireText }) {
  const [txt, setTxt] = useState('');
  const disabled = requireText && txt.trim().toUpperCase() !== requireText;
  return <Modal title={title} onClose={onClose} footer={<><Btn onClick={onClose}>Annuler</Btn><Btn kind={danger ? 'danger solid' : 'primary'} disabled={disabled} onClick={() => { onOk(); onClose(); }}>{ok}</Btn></>}>
    <p className="muted">{body}</p>
    {requireText && <Field label={`Saisissez ${requireText} pour confirmer`}><input id="confirm-text" className="input" value={txt} onChange={e => setTxt(e.target.value)} autoFocus /></Field>}
  </Modal>;
}

function Palette({ onClose }) {
  const { model: m, go, openCase, newCase } = React.useContext(Ctx);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const out = [];
    ALL_ITEMS.forEach(i => { if (!s || i.label.toLowerCase().includes(s)) out.push({ k: 'Module', label: i.label, run: () => go(i.id) }); });
    if (!s || 'nouveau dossier créer'.includes(s)) out.unshift({ k: 'Action', label: 'Créer un dossier (N)', run: newCase });
    if (s.length >= 2) {
      for (const c of m.cases) {
        if (out.length > 40) break;
        const d = m.debtorById.get(c.debtorId), o = m.orgById.get(c.orgId);
        if (c.id.toLowerCase().includes(s) || c.invoiceNo.toLowerCase().includes(s) || d.name.toLowerCase().includes(s)) out.push({ k: 'Dossier', label: `${c.id} · ${c.invoiceNo} · ${d.name}`, sub: o.name, run: () => openCase(c.id) });
      }
      m.orgs.filter(o => o.name.toLowerCase().includes(s) || o.id.toLowerCase().includes(s)).slice(0, 8).forEach(o => out.push({ k: 'Organisation', label: `${o.name}`, sub: o.id, run: () => go('control') }));
      m.payments.filter(p => p.id.toLowerCase().includes(s) || p.receipt.toLowerCase().includes(s)).slice(0, 6).forEach(p => out.push({ k: 'Opération', label: `${p.id} · reçu ${p.receipt}`, sub: p.caseId, run: () => openCase(p.caseId) }));
      m.jurisdictions.filter(j => j.name.toLowerCase().includes(s) || j.code.toLowerCase().includes(s)).forEach(j => out.push({ k: 'Juridiction', label: `${j.name} (${j.code}) — fictive`, run: () => go('legal') }));
    }
    return out.slice(0, 40);
  }, [q, m, go, openCase, newCase]);
  const run = r => { onClose(); r.run(); };
  return <><div className="scrim" onClick={onClose} /><div className="modal palette" role="dialog" aria-label="Recherche universelle">
    <input id="palette-q" autoFocus placeholder="Dossier (CR-2026-…), facture, débiteur, organisation, module…" value={q} onChange={e => { setQ(e.target.value); setSel(0); }}
      onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(results.length - 1, s + 1)); } if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); } if (e.key === 'Enter' && results[sel]) run(results[sel]); if (e.key === 'Escape') onClose(); }} />
    <div className="pal-list">{results.length === 0 ? <div className="empty">Aucun résultat pour « {q} ». Essayez un numéro de dossier comme CR-2026-00042.</div> : results.map((r, i) => <button key={i} className={'pal-item' + (i === sel ? ' sel' : '')} onMouseEnter={() => setSel(i)} onClick={() => run(r)}><span className="k">{r.k}</span><span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>{r.sub && <span className="muted tiny" style={{ marginLeft: 'auto' }}>{r.sub}</span>}</button>)}</div>
  </div></>;
}

function Help({ onClose }) {
  const keys = [['Ctrl/⌘ K ou /', 'Recherche universelle'], ['N', 'Créer un dossier'], ['J', 'Avancer la simulation d’un jour'], ['R', 'Lecture / pause de la simulation'], ['?', 'Afficher cette aide'], ['Échap', 'Fermer un panneau']];
  return <Modal title="Aide et raccourcis" onClose={onClose}>
    <div className="stack">{keys.map(([k, v]) => <div key={k} className="between"><span>{v}</span><kbd>{k}</kbd></div>)}</div>
    <Callout>Toutes les données sont fictives. Aucune communication, aucun paiement et aucun appel réel n’est effectué. Les règles juridiques sont des exemples de démonstration sans valeur légale.</Callout>
    <p className="small muted">Changez d’utilisateur dans la barre du haut pour tester les permissions (ex. « Sam Analyse » ne peut pas créer de dossier, le fondateur ne voit pas les coordonnées sans accès exceptionnel).</p>
  </Modal>;
}

function Onboarding({ onClose }) {
  const { go, newCase } = React.useContext(Ctx);
  const [step, setStep] = useState(0);
  const steps = [
    { t: 'Bienvenue dans GLOBAL RECOVERY AI TITAN', b: <><p>Ce simulateur reproduit une plateforme de gestion des créances et de recouvrement amiable, avec un moteur juridique qui autorise ou bloque chaque action.</p><Callout tone="warn">Environnement de simulation : données fictives, règles juridiques fictives, aucune opération réelle.</Callout></> },
    { t: 'Choisissez votre niveau', b: <p>Le sélecteur <b>Simple / Pro / Expert</b> en haut adapte les menus. Commencez en <b>Simple</b> si vous découvrez l’outil ; passez en <b>Expert</b> pour l’administration, les intégrations et l’architecture.</p> },
    { t: 'Faites avancer le temps', b: <p>L’horloge virtuelle simule l’activité. <b>+1 j</b> fait passer une journée : l’agent de relances examine les dossiers, le moteur juridique décide, les débiteurs fictifs répondent. Les statistiques se mettent à jour après chaque action.</p> },
    { t: 'Créez votre premier dossier', b: <p>Le formulaire guidé tient en 3 étapes. Objectif ergonomique : moins de trois minutes. Vous pourrez ensuite tester une relance et voir pourquoi elle est autorisée ou bloquée.</p> },
  ];
  const s = steps[step];
  return <Modal title={s.t} onClose={onClose} footer={<>
    <div className="steps" style={{ flex: 1, alignSelf: 'center', maxWidth: 160 }}>{steps.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
    <Btn onClick={onClose}>Passer</Btn>
    {step < steps.length - 1 ? <Btn kind="primary" onClick={() => setStep(step + 1)}>Suivant</Btn> : <><Btn onClick={() => { onClose(); go('lab'); }}>Voir les scénarios</Btn><Btn kind="primary" icon="plus" onClick={() => { onClose(); newCase(); }}>Créer un dossier</Btn></>}
  </>}>
    <div className="row" style={{ gap: 14, alignItems: 'flex-start', flexWrap: 'nowrap' }}><Logo size={52} /><div className="stack" style={{ minWidth: 0 }}>{s.b}</div></div>
  </Modal>;
}
