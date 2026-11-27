// Composants d'interface partagés : primitives, graphiques SVG, icônes, logo.
const { useState, useEffect, useRef, useMemo, useContext, createContext, useCallback } = React;
import { fmtMoney, fmtDate, fmtDateTime, isoDate } from '../engine/util.js';
import { STATUSES } from '../engine/data.js';

export const Ctx = createContext(null);
export function useApp() { return useContext(Ctx); }

/* ------------------------------ Icônes ------------------------------ */
const P = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  cases: 'M4 4h10l6 6v10a0 0 0 0 1 0 0H4zM14 4v6h6M8 13h8M8 17h5',
  lab: 'M9 3h6M10 3v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-10V3M7 15h10',
  connect: 'M4 6h16v10H8l-4 4zM8 10h8M8 13h5',
  voice: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  pay: 'M3 6h18v12H3zM3 10h18M7 15h4',
  portal: 'M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7zM9 12l2 2 4-4',
  ai: 'M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2M8 8h8v8H8z',
  predict: 'M3 20h18M5 16l4-5 4 3 6-8M15 6h4v4',
  fraud: 'M11 4a7 7 0 1 0 4.9 12l4.6 4.6M8 11h6M11 8v6',
  legal: 'M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0zM8 21h8',
  compliance: 'M9 11l2 2 4-4M4 4h16v16H4z',
  security: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 9v4M12 16v.5',
  bank: 'M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18',
  world: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  integ: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  control: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',
  business: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  arch: 'M4 4h6v6H4zM14 4h6v6h-6zM9 14h6v6H9zM7 10v2h10v-2M12 12v2',
  registry: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  play: 'M7 4l13 8-13 8z', pause: 'M7 4h3v16H7zM14 4h3v16h-3z', stop: 'M6 6h12v12H6z',
  ff: 'M3 5l9 7-9 7zM12 5l9 7-9 7z', menu: 'M4 6h16M4 12h16M4 18h16', x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14', check: 'M5 12l5 5 9-10', alert: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  power: 'M12 3v9M6.3 7.3a8 8 0 1 0 11.4 0', sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 1-1 1.7v.5M12 17v.5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', side: 'M4 4h16v16H4zM9 4v16',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5', copy: 'M8 8h12v12H8zM4 16V4h12',
};
export function Icon({ name, size = 18, stroke = 1.7, className }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[name] || P.doc} /></svg>;
}

/* ------------------------------ Logo ------------------------------ */
export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Logo Global Recovery AI Titan">
      <defs>
        <linearGradient id="lg-sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9fb3d6" /><stop offset=".5" stopColor="#e4e9f2" /><stop offset="1" stopColor="#6f7f9c" /></linearGradient>
        <linearGradient id="lg-gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b82ff" /><stop offset="1" stopColor="#19c48f" /></linearGradient>
      </defs>
      <path d="M24 2.5 42 9v13.5c0 11-7.6 19.4-18 23-10.4-3.6-18-12-18-23V9z" fill="#0a1426" stroke="url(#lg-sh)" strokeWidth="2" />
      <circle cx="24" cy="23" r="11.5" fill="none" stroke="url(#lg-gl)" strokeWidth="1.6" />
      <ellipse cx="24" cy="23" rx="5" ry="11.5" fill="none" stroke="url(#lg-gl)" strokeWidth="1.2" opacity=".85" />
      <path d="M12.8 19h22.4M12.8 27h22.4" stroke="url(#lg-gl)" strokeWidth="1.1" opacity=".7" />
      <g fill="#66a3ff"><circle cx="17" cy="15.5" r="1.6" /><circle cx="31.5" cy="18" r="1.6" /><circle cx="27" cy="31" r="1.6" /><circle cx="16.5" cy="28.5" r="1.4" /></g>
      <path d="M17 15.5 31.5 18 27 31 16.5 28.5Z" fill="none" stroke="#66a3ff" strokeWidth=".8" opacity=".9" />
      <circle cx="24" cy="23" r="2.3" fill="#19c48f" />
    </svg>
  );
}

/* ------------------------------ Primitives ------------------------------ */
export function Card({ title, sub, actions, children, className = '', bodyClass = '', id }) {
  return (
    <section className={'card ' + className} id={id}>
      {(title || actions) && <div className="card-h"><div><h3>{title}</h3>{sub && <div className="sub">{sub}</div>}</div>{actions && <div className="row">{actions}</div>}</div>}
      <div className={'card-b ' + bodyClass}>{children}</div>
    </section>
  );
}
export function Pill({ tone = 'muted', children, plain, title }) { return <span title={title} className={`pill t-${tone}${plain ? ' plain' : ''}`}>{children}</span>; }
export function StatusPill({ status }) { const s = STATUSES[status] || { label: status, tone: 'muted' }; return <Pill tone={s.tone}>{s.label}</Pill>; }
export function Tip({ text }) { return <span className="tip" tabIndex={0} data-tip={text} aria-label={text}>?</span>; }
export function Btn({ kind = '', size = '', icon, children, ...rest }) {
  return <button className={`btn ${kind} ${size}`} {...rest}>{icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}{children}</button>;
}
export function Field({ label, hint, children, tip }) {
  return <div className="field"><label>{label}{tip && <> <Tip text={tip} /></>}</label>{children}{hint && <div className="hint">{hint}</div>}</div>;
}
export function Seg({ value, options, onChange, label }) {
  return <div className="seg" role="group" aria-label={label}>{options.map(o => <button key={o.value} className={value === o.value ? 'on' : ''} aria-pressed={value === o.value} onClick={() => onChange(o.value)} title={o.title}>{o.label}</button>)}</div>;
}
export function Tabs({ value, tabs, onChange }) {
  return <div className="tabs" role="tablist">{tabs.map(t => <button key={t.id} role="tab" aria-selected={value === t.id} className={value === t.id ? 'on' : ''} onClick={() => onChange(t.id)}>{t.label}{t.count != null && <span className="badge soft" style={{ marginLeft: 6 }}>{t.count}</span>}</button>)}</div>;
}
export function Callout({ tone = '', icon = 'alert', children }) { return <div className={'callout ' + tone}><Icon name={icon} size={16} /><div>{children}</div></div>; }
export function Modal({ title, children, footer, onClose, wide }) {
  useEffect(() => { const h = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  return <><div className="scrim" onClick={onClose} /><div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
    <div className="modal-h"><h2>{title}</h2><Btn kind="ghost icon" icon="x" onClick={onClose} aria-label="Fermer" /></div>
    <div className="modal-b">{children}</div>{footer && <div className="modal-f">{footer}</div>}</div></>;
}
export function Drawer({ title, sub, children, onClose, actions }) {
  useEffect(() => { const h = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  return <><div className="scrim" onClick={onClose} /><aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
    <div className="drawer-h"><div style={{ minWidth: 0 }}>{title}{sub && <div className="muted small">{sub}</div>}</div><div className="row">{actions}<Btn kind="ghost icon" icon="x" onClick={onClose} aria-label="Fermer" /></div></div>
    <div className="drawer-b">{children}</div></aside></>;
}
export function PageHead({ eyebrow, title, desc, actions }) {
  return <div className="pagehead"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{desc && <p>{desc}</p>}</div>{actions && <div className="actions">{actions}</div>}</div>;
}
export function Kpi({ label, value, detail, tone, spark, tip, alert }) {
  const ref = useRef(value); const [flash, setFlash] = useState(false);
  useEffect(() => { if (ref.current !== value) { ref.current = value; setFlash(true); const t = setTimeout(() => setFlash(false), 800); return () => clearTimeout(t); } }, [value]);
  return <div className={'card kpi' + (flash ? ' flash' : '') + (alert ? ' alert' : '')}>
    <div className="row" style={{ gap: 6 }}><span className="eyebrow">{label}</span>{tip && <Tip text={tip} />}</div>
    <div className="v" style={tone ? { color: `var(--${tone})` } : null}>{value}</div>
    {detail && <div className="d">{detail}</div>}
    {spark && <Spark data={spark} />}
  </div>;
}
export function Checks({ verdict }) {
  if (!verdict) return null;
  return <div className="stack" style={{ gap: 8 }}>
    <div className={'verdict ' + (verdict.allowed ? 'ok' : 'ko')}><Icon name={verdict.allowed ? 'check' : 'lock'} size={16} />{verdict.allowed ? 'Autorisé par le moteur juridique (règles fictives)' : `Bloqué — ${verdict.blockers.length} condition(s) non remplie(s)`}</div>
    <div className="checks">{verdict.checks.map(c => <div key={c.id + c.label} className={'chk ' + (c.ok ? 'ok' : 'ko')}><span className="ic">{c.ok ? '✓' : '✕'}</span><div><div>{c.label}</div><div className="dt">{c.detail}</div></div></div>)}</div>
  </div>;
}
export function Empty({ children }) { return <div className="empty">{children}</div>; }
export function KV({ items }) { return <dl className="kv">{items.filter(Boolean).map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>; }
export function Progress({ value }) { return <div className="progress" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} /></div>; }

export function Table({ columns, rows, onRow, pageSize = 12, empty = 'Aucun élément.', initialSort }) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState(initialSort || null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find(c => c.key === sort.key);
    const get = col.sort || (r => r[col.key]);
    return [...rows].sort((a, b) => { const x = get(a), y = get(b); return (x > y ? 1 : x < y ? -1 : 0) * (sort.dir === 'asc' ? 1 : -1); });
  }, [rows, sort, columns]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const p = Math.min(page, pages - 1);
  const slice = sorted.slice(p * pageSize, p * pageSize + pageSize);
  return <>
    <div className="tablewrap"><table className="t"><thead><tr>{columns.map(c => <th key={c.key} className={c.right ? 'r' : ''}>{c.sortable !== false ? <button onClick={() => setSort(s => ({ key: c.key, dir: s?.key === c.key && s.dir === 'desc' ? 'asc' : 'desc' }))}>{c.label}{sort?.key === c.key ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''}</button> : c.label}</th>)}</tr></thead>
      <tbody>{slice.length === 0 ? <tr><td colSpan={columns.length}><Empty>{empty}</Empty></td></tr> : slice.map((r, i) => <tr key={r.id || i} className={onRow ? 'click' : ''} onClick={onRow ? () => onRow(r) : undefined} tabIndex={onRow ? 0 : undefined} onKeyDown={onRow ? e => { if (e.key === 'Enter') onRow(r); } : undefined}>{columns.map(c => <td key={c.key} className={c.right ? 'r num' : ''}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}</tbody></table></div>
    {sorted.length > pageSize && <div className="pager"><span className="muted small num">{p * pageSize + 1}–{Math.min(sorted.length, (p + 1) * pageSize)} sur {sorted.length}</span><div className="row"><Btn size="sm" disabled={p === 0} onClick={() => setPage(p - 1)}>Précédent</Btn><span className="small num">{p + 1}/{pages}</span><Btn size="sm" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Suivant</Btn></div></div>}
  </>;
}

/* ------------------------------ Graphiques ------------------------------ */
export function Spark({ data, w = 90, h = 26, color = 'var(--accent)' }) {
  if (!data?.length) return null;
  const max = Math.max(1, ...data), min = Math.min(0, ...data);
  const pts = data.map((v, i) => [i / (data.length - 1 || 1) * w, h - 2 - (v - min) / (max - min || 1) * (h - 4)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
  return <svg className="spark" width={w} height={h} aria-hidden="true"><path d={d + `L${w},${h}L0,${h}Z`} fill={color} opacity=".12" /><path d={d} fill="none" stroke={color} strokeWidth="1.5" /><circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={color} /></svg>;
}
function niceMax(v) { if (v <= 0) return 1; const e = Math.pow(10, Math.floor(Math.log10(v))); const f = v / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; }

export function AreaChart({ series, height = 200, fmt = v => v, labels, band }) {
  // series: [{name, color, data:[number]}]
  const ref = useRef(null); const [w, setW] = useState(600); const [hover, setHover] = useState(null);
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(e => setW(Math.max(260, e[0].contentRect.width))); ro.observe(el); return () => ro.disconnect(); }, []);
  const n = series[0]?.data.length || 0;
  const padL = 56, padR = 10, padT = 10, padB = 22;
  const max = niceMax(Math.max(1, ...series.flatMap(s => s.data), ...(band ? band.hi : [])));
  const x = i => padL + (i / Math.max(1, n - 1)) * (w - padL - padR);
  const y = v => padT + (1 - v / max) * (height - padT - padB);
  const ticks = [0, .25, .5, .75, 1].map(t => t * max);
  return <div ref={ref} style={{ position: 'relative' }}>
    <svg className="chart" width={w} height={height} role="img" aria-label="Graphique" onMouseLeave={() => setHover(null)} onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.round((e.clientX - r.left - padL) / (w - padL - padR) * (n - 1)); setHover(i >= 0 && i < n ? i : null); }}>
      {ticks.map(t => <g key={t}><line className="grid-l" x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} /><text x={padL - 6} y={y(t) + 3} textAnchor="end">{fmt(t)}</text></g>)}
      {labels && labels.map((l, i) => l && <text key={i} x={x(i)} y={height - 6} textAnchor="middle">{l}</text>)}
      {band && <path d={band.hi.map((v, i) => (i ? 'L' : 'M') + x(i) + ',' + y(v)).join('') + band.lo.map((v, i) => 'L' + x(band.lo.length - 1 - i) + ',' + y(band.lo[band.lo.length - 1 - i])).join('') + 'Z'} fill="var(--accent)" opacity=".10" />}
      {series.map(s => { const d = s.data.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(''); return <g key={s.name}>{s.fill !== false && <path d={d + `L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill={s.color} opacity=".13" />}<path d={d} fill="none" stroke={s.color} strokeWidth="1.8" strokeDasharray={s.dash ? '4 4' : undefined} /><circle cx={x(n - 1)} cy={y(s.data[n - 1] || 0)} r="3" fill={s.color} /></g>; })}
      {hover != null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={height - padB} stroke="var(--line-2)" />}
    </svg>
    {hover != null && <div className="card" style={{ position: 'absolute', top: 4, left: Math.min(w - 190, Math.max(0, x(hover) + 8)), padding: '7px 10px', fontSize: '.75rem', pointerEvents: 'none', width: 180 }}>
      {labels?.[hover] || (series[0].dates ? series[0].dates[hover] : `#${hover + 1}`)}
      {series.map(s => <div key={s.name} className="between"><span><i style={{ display: 'inline-block', width: 8, height: 8, background: s.color, borderRadius: 2, marginRight: 5 }} />{s.name}</span><b className="num">{fmt(s.data[hover])}</b></div>)}
    </div>}
  </div>;
}
export function Bars({ data, labels, height = 170, fmt = v => v, colors }) {
  const ref = useRef(null); const [w, setW] = useState(400);
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(e => setW(Math.max(220, e[0].contentRect.width))); ro.observe(el); return () => ro.disconnect(); }, []);
  const max = niceMax(Math.max(1, ...data)); const padL = 52, padB = 22, padT = 16;
  const bw = (w - padL - 8) / data.length;
  return <div ref={ref}><svg className="chart" width={w} height={height} role="img" aria-label="Histogramme">
    {[0, .5, 1].map(t => <g key={t}><line className="grid-l" x1={padL} x2={w} y1={padT + (1 - t) * (height - padT - padB)} y2={padT + (1 - t) * (height - padT - padB)} /><text x={padL - 6} y={padT + (1 - t) * (height - padT - padB) + 3} textAnchor="end">{fmt(t * max)}</text></g>)}
    {data.map((v, i) => { const h = v / max * (height - padT - padB); return <g key={i}><rect x={padL + i * bw + bw * .18} y={height - padB - h} width={bw * .64} height={Math.max(0, h)} rx="3" fill={colors?.[i] || 'var(--accent)'}><title>{labels[i]} : {fmt(v)}</title></rect><text x={padL + i * bw + bw / 2} y={height - 6} textAnchor="middle">{labels[i]}</text><text x={padL + i * bw + bw / 2} y={height - padB - h - 4} textAnchor="middle" style={{ fill: 'var(--fg-2)' }}>{fmt(v)}</text></g>; })}
  </svg></div>;
}
export function Donut({ parts, size = 150, center }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1; let acc = 0; const r = size / 2 - 12, c = 2 * Math.PI * r;
  return <div className="row" style={{ gap: 16, alignItems: 'center' }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Répartition">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="14" />
      {parts.map(p => { const len = p.value / total * c; const el = <circle key={p.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} transform={`rotate(-90 ${size / 2} ${size / 2})`}><title>{p.label} : {p.value}</title></circle>; acc += len; return el; })}
      {center && <><text x="50%" y="48%" textAnchor="middle" style={{ fill: 'var(--fg)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>{center[0]}</text><text x="50%" y="62%" textAnchor="middle" style={{ fill: 'var(--muted)', fontSize: 10 }}>{center[1]}</text></>}
    </svg>
    <div className="stack" style={{ gap: 5, minWidth: 0 }}>{parts.map(p => <div key={p.label} className="small row" style={{ gap: 6 }}><i style={{ width: 9, height: 9, borderRadius: 2, background: p.color }} /><span>{p.label}</span><b className="num">{p.value}</b></div>)}</div>
  </div>;
}
export function HBars({ items, fmt = v => v, color }) {
  const max = Math.max(1, ...items.map(i => i.value));
  return <div className="stack" style={{ gap: 9 }}>{items.map(i => <div key={i.label} className="hbar"><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={i.label}>{i.label}</span><div className="track">{i.parts ? i.parts.map((p, k) => <div key={k} className="fill" style={{ width: `${p.value / max * 100}%`, background: p.color }} title={`${p.label} : ${fmt(p.value)}`} />) : <div className="fill" style={{ width: `${i.value / max * 100}%`, background: i.color || color }} />}</div><b className="num small">{fmt(i.value)}</b></div>)}</div>;
}

/* ------------------------------ Formats ------------------------------ */
export const eur = (minor, compact = true) => fmtMoney(minor, 'EUR', 'fr-FR', compact);
export const money = (minor, cur, locale) => fmtMoney(minor, cur, locale || 'fr-FR');
export const dshort = ms => fmtDate(ms);
export const dtime = ms => fmtDateTime(ms);
export const pct = v => (v * 100).toFixed(1).replace('.', ',') + ' %';
export const nfmt = v => new Intl.NumberFormat('fr-FR').format(Math.round(v));
export { isoDate };
