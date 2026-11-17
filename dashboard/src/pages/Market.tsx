import { lazy, Suspense, useState, type ReactNode } from 'react';
import usmap from '../data/usmap.json';
import { states, stateByCode, facilities, market, marketStates, presence, shortName, XLSX_URL } from '../data';
import { Card, Src, Badge, PageHead, Bars, Summary } from '../ui';
import { go } from '../App';
import { watchouts } from '../data';
import { AlertList, LEVELS, MARKETS, countBy, sortAlerts, topLevel, alertsFor } from '../alerts';

const StateView = lazy(() => import('./StateView'));

type Layer = 'dc' | 'pharma' | 'battery' | 'fab' | 'comp';
type View = 'map' | 'pharma' | 'growth' | 'dc' | 'data' | 'state' | 'watch' | 'compare';

const LAYERS: { k: Layer; l: string; unit: string; d: string; src: string[] }[] = [
  { k: 'dc', l: 'Data centers', unit: 'projects', d: 'Planned and under-construction data center projects per state', src: ['M31'] },
  { k: 'pharma', l: 'Pharma plants', unit: 'plants', d: 'Pharmaceutical establishments (NAICS 325412 + 325414), Census CBP 2023', src: ['M02', 'M03'] },
  { k: 'battery', l: 'Battery plants', unit: 'GWh', d: 'Announced Li-ion cell capacity (DOE list with 2025-26 updates)', src: ['S130'] },
  { k: 'fab', l: 'Semiconductor fabs', unit: 'projects', d: 'Named U.S. fab projects researched here (not a complete list)', src: ['M14'] },
  { k: 'comp', l: 'Competitors', unit: 'firms', d: 'Competitors with a verified office, distributor or service site', src: ['S23'] },
];
const VIEWS: { k: View; l: string; d: string }[] = [
  { k: 'map', l: 'Map', d: 'Click a state' },
  { k: 'pharma', l: 'Pharma (Q1)', d: 'NAICS and plant counts' },
  { k: 'growth', l: 'Fabs & batteries (Q2)', d: 'Named projects' },
  { k: 'dc', l: 'Data centers (Q3)', d: 'By state' },
  { k: 'watch', l: 'Watch-outs', d: 'Risks and openings' },
  { k: 'compare', l: 'Compare states', d: 'Side by side' },
  { k: 'data', l: 'All data', d: 'Spreadsheet view' },
];
const MARK = { risk: '#C0392B', opportunity: '#1F60C4', caution: '#E0A030' } as const;
const RAMP = ['#DCE8FA', '#A9C6F2', '#6F9EE3', '#3A75CF', '#17489A'];
const DARK = new Set(['#3A75CF', '#17489A']);

const ms = marketStates.states as Record<string, any>;
const semiRows: any[] = market.q2.markets[0].rows;
export const semiIn = (code: string) => semiRows.filter(r => String(r.state).split('/').map((x: string) => x.trim()).includes(code));
const q3 = Object.fromEntries(market.q3.states.map((s: any) => [s.state, s])) as Record<string, any>;

function value(layer: Layer, code: string): number {
  if (layer === 'dc') return ms[code]?.data_centers?.projects ?? 0;
  if (layer === 'pharma') return ms[code]?.pharma?.est ?? 0;
  if (layer === 'battery') return stateByCode[code].battery_cell_gwh;
  if (layer === 'fab') return semiIn(code).length;
  return new Set(presence(code, false).map(e => e.company)).size;
}
const shade = (v: number, max: number, layer: Layer) => {
  if (v <= 0) return null;
  if (layer === 'fab' || layer === 'comp') return RAMP[Math.min(4, v + 1)];
  return RAMP[Math.min(4, Math.floor(Math.sqrt(v / max) * 4.99))];
};
const legend = (layer: Layer, max: number): [string, string][] => {
  if (layer === 'fab' || layer === 'comp') return [1, 2, 3].filter(n => n <= Math.max(1, max)).map(n => [RAMP[n + 1], n === 1 ? '1' : String(n)] as [string, string]);
  return RAMP.map((c, i) => [c, `${i === 0 ? 1 : Math.round(max * (i / 5) ** 2) + 1}–${Math.round(max * ((i + 1) / 5) ** 2)}`] as [string, string]);
};
const fmt = (n: number) => n.toLocaleString('en-US');

function Disclosure({ title, headline, sub, srcs, open, children }: { title: string; headline: ReactNode; sub?: ReactNode; srcs?: string[]; open?: boolean; children?: ReactNode }) {
  const [o, setO] = useState(!!open);
  return (
    <div className="disc">
      <div className="disc-head">
        <div>
          <div className="disc-title">{title}</div>
          <div className="disc-headline">{headline}</div>
          {sub && <div className="small muted">{sub}</div>}
        </div>
        <div className="disc-actions">
          {srcs && srcs.length > 0 && <Src ids={srcs} />}
          {children && <button className="btn" onClick={() => setO(!o)} aria-expanded={o}>{o ? 'Hide table' : 'View table'}</button>}
        </div>
      </div>
      {o && children && <div className="disc-body">{children}</div>}
    </div>
  );
}

export function StatePanel({ code }: { code: string }) {
  const S = stateByCode[code];
  const m = ms[code] ?? {};
  const dc = m.data_centers;
  const ph = m.pharma;
  const fac = facilities.filter(f => f.state === code);
  const semis = semiIn(code);
  const comp = presence(code, true);
  const q = q3[code];
  const nothing = !dc && !ph && fac.length === 0 && semis.length === 0 && comp.length === 0;
  return (
    <Card title={S.name} sub={nothing ? 'Not Verified / Insufficient Evidence' : 'Click "View table" for the rows and sources behind each number'}>
      <Disclosure title="Data centers" srcs={['M31']}
        headline={dc ? <><b className="mono">{dc.projects}</b> projects · <b className="mono">${dc.announced_b}B</b> announced · <b className="mono">{dc.under_construction}</b> under construction</> : <span className="nodata">No projects in the tracker</span>}
        sub={dc ? 'Announced investment, not spending. Secondary tracker, compiled Apr–Oct 2026.' : undefined} open={!!q}>
        {dc && (
          <>
            <div className="table-wrap"><table className="t">
              <thead><tr><th>Project</th><th>Developer</th><th>County</th><th>$B</th><th>Status</th></tr></thead>
              <tbody>{dc.top.map((r: any, i: number) => <tr key={i}><td>{r.project}</td><td>{r.developer}</td><td>{r.county}</td><td className="mono">{r.investment_b}</td><td>{r.status}</td></tr>)}</tbody>
            </table></div>
            <p className="small muted">Top {dc.top.length} of {dc.projects} projects by announced investment.</p>
          </>
        )}
        {q && <div className="callout" style={{ marginTop: 8 }}><b>Incentives:</b> {q.incentives} <Badge status={q.incentive_status} /> <Src ids={q.incentive_sources} /></div>}
      </Disclosure>

      <Disclosure title="Pharma plants" srcs={['M02', 'M03']}
        headline={ph ? <><b className="mono">{fmt(ph.est)}</b> establishments · <b className="mono">{fmt(ph.emp)}</b> employees</> : <span className="nodata">Not published in CBP 2023 (zero or suppressed)</span>}
        sub={ph ? 'NAICS 325412 + 325414, Census County Business Patterns 2023' : undefined}>
        {ph && (
          <div className="table-wrap"><table className="t">
            <thead><tr><th>NAICS</th><th>Industry</th><th>Establishments</th></tr></thead>
            <tbody>
              <tr><td>325412</td><td>Pharmaceutical Preparation Manufacturing</td><td className="mono">{fmt(ph.est_325412)}</td></tr>
              <tr><td>325414</td><td>Biological Product (except Diagnostic) Manufacturing</td><td className="mono">{fmt(ph.est_325414)}</td></tr>
            </tbody>
          </table></div>
        )}
      </Disclosure>

      <Disclosure title="Battery plants" srcs={['S130']}
        headline={fac.length ? <><b className="mono">{S.battery_cell_plants}</b> cell plant(s) · <b className="mono">{S.battery_cell_gwh} GWh</b>{S.dmc_solvent_plants ? ' · DMC solvent plant' : ''}</> : <span className="nodata">None in the DOE list</span>}
        sub={fac.length ? 'Announced capacity; several plants changed status in 2025-26' : undefined}>
        {fac.length > 0 && (
          <div className="table-wrap"><table className="t">
            <thead><tr><th>Operator</th><th>City</th><th>GWh</th><th>Status</th><th>Source</th></tr></thead>
            <tbody>{fac.map((f, i) => (
              <tr key={i}><td>{f.operator}</td><td>{f.city}</td><td className="mono">{f.capacity_gwh ?? '–'}</td>
                <td>{f.status_update ?? f.status_in_source}</td><td><Src ids={[f.source, f.status_update_source ?? ''].filter(Boolean)} /></td></tr>
            ))}</tbody>
          </table></div>
        )}
      </Disclosure>

      <Disclosure title="Semiconductor fabs" srcs={['M14']}
        headline={semis.length ? <><b className="mono">{semis.length}</b> named project(s): {semis.map(s => s.company).join(', ')}</> : <span className="nodata">No named fab project in this research</span>}
        sub={semis.length ? undefined : 'This list is the projects researched here, not every U.S. fab'}>
        {semis.length > 0 && (
          <div className="table-wrap"><table className="t">
            <thead><tr><th>Company</th><th>Investment</th><th>Status</th><th>Source</th></tr></thead>
            <tbody>{semis.map((r, i) => <tr key={i}><td><b>{r.company}</b><div className="small muted">{r.location}</div></td><td>{r.investment}</td><td>{r.status}</td><td><Src ids={r.sources} /></td></tr>)}</tbody>
          </table></div>
        )}
      </Disclosure>

      <Disclosure title="Competitors" srcs={['S23']}
        headline={comp.length ? <><b className="mono">{new Set(comp.map(e => e.company)).size}</b> with a local presence: {[...new Set(comp.map(e => shortName(e.company)))].join(', ')}</> : <span className="nodata">Not Verified / Insufficient Evidence</span>}
        sub={comp.length ? undefined : 'No competitor office, distributor or service site found. This is not proof of no competition.'}>
        {comp.length > 0 && (
          <div className="table-wrap"><table className="t">
            <thead><tr><th>Company</th><th>Type</th><th>Evidence</th><th>Status</th><th>Source</th></tr></thead>
            <tbody>{comp.map((e, i) => <tr key={i}><td>{shortName(e.company)}</td><td>{e.metric}</td><td>{e.value}</td><td><Badge status={e.status} /></td><td><Src ids={[e.source]} label={e.source} /></td></tr>)}</tbody>
          </table></div>
        )}
      </Disclosure>
    </Card>
  );
}

function MapView({ params }: { params: URLSearchParams }) {
  const [layer, setLayer] = useState<Layer>((params.get('layer') as Layer) || 'dc');
  const openState = (code: string) => go('market', { v: 'state', s: code, layer: layer === 'pharma' ? 'pharma' : layer === 'battery' || layer === 'fab' ? 'plants' : 'dc' });
  const leaders = [...states].map(s => ({ code: s.code, name: s.name, v: value(layer, s.code) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 8);
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const [showW, setShowW] = useState(true);
  const L = LAYERS.find(l => l.k === layer)!;
  const max = Math.max(1, ...states.map(s => value(layer, s.code)));
  const tip = (code: string) => {
    const m = ms[code] ?? {};
    if (layer === 'dc') return m.data_centers ? `${m.data_centers.projects} projects · $${m.data_centers.announced_b}B announced · ${m.data_centers.under_construction} under construction` : '';
    if (layer === 'pharma') return m.pharma ? `${fmt(m.pharma.est)} establishments · ${fmt(m.pharma.emp)} employees` : '';
    if (layer === 'battery') { const s = stateByCode[code]; return s.battery_cell_plants ? `${s.battery_cell_gwh} GWh in ${s.battery_cell_plants} plant(s)` : ''; }
    if (layer === 'fab') return semiIn(code).map(r => r.company).join(', ');
    return [...new Set(presence(code, false).map(e => shortName(e.company)))].join(', ');
  };
  return (
    <div className="stack">
      <div className="layer-bar" role="group" aria-label="Map layer">
        {LAYERS.map(l => (
          <button key={l.k} className={layer === l.k ? 'on' : ''} onClick={() => setLayer(l.k)}>{l.l}</button>
        ))}
        <button className={`fchip ${showW ? 'on' : ''}`} onClick={() => setShowW(!showW)} aria-pressed={showW} title="Show or hide the watch-out markers">⚠ Watch-outs {showW ? 'on' : 'off'}</button>
        <a className="btn excel-link" href={XLSX_URL} download>Excel ↓</a>
      </div>
      <p className="small muted" style={{ margin: '-4px 0 0' }}>{L.d}. <Src ids={L.src} /></p>
      <div className="grid g-main">
        <Card>
          <div className="map-wrap" onMouseLeave={() => setHover(null)}>
            <svg className="map-svg" viewBox={`0 0 ${usmap.width} ${usmap.height}`} role="img" aria-label={`U.S. map: ${L.l}`}>
              <defs>
                <pattern id="hatch2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill="#F4F6F9" /><line x1="0" y1="0" x2="0" y2="6" stroke="#DADFE7" strokeWidth="2" />
                </pattern>
              </defs>
              {usmap.states.map(s => {
                const f = shade(value(layer, s.code), max, layer);
                return (
                  <path key={s.code} d={s.d} className="st" fill={f ?? 'url(#hatch2)'}
                    onMouseMove={e => { const r = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect(); setHover({ code: s.code, x: e.clientX - r.left, y: e.clientY - r.top }); }}
                    onClick={() => openState(s.code)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && openState(s.code)} aria-label={`Open ${stateByCode[s.code].name}`} />
                );
              })}
              {usmap.states.filter(s => s.area > 900).map(s => {
                const v = value(layer, s.code);
                const f = shade(v, max, layer);
                return <text key={s.code} x={s.cx} y={s.cy} textAnchor="middle" dominantBaseline="middle" className={f && DARK.has(f) ? 'inv' : ''}>{v ? `${s.code} ${fmt(v)}` : s.code}</text>;
              })}
              {showW && usmap.states.map(s => {
                const lv = topLevel(s.code);
                if (!lv) return null;
                const n = alertsFor(s.code).length;
                return (
                  <g key={'w' + s.code} className="wo-mark" transform={`translate(${s.cx + 15},${s.cy - 11})`}
                    onClick={() => go('market', { v: 'state', s: s.code, layer: layer === 'pharma' ? 'pharma' : layer === 'battery' || layer === 'fab' ? 'plants' : 'dc' })}
                    onMouseMove={e => { const r = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect(); setHover({ code: s.code, x: e.clientX - r.left, y: e.clientY - r.top }); }}>
                    <circle r="9" fill={MARK[lv]} />
                    <text textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11 }}>{n}</text>
                  </g>
                );
              })}
            </svg>
            {hover && (
              <div className="tooltip" style={{ left: Math.min(hover.x + 14, 640), top: hover.y + 14 }}>
                <b>{stateByCode[hover.code].name}</b>
                <div>{tip(hover.code) || <span className="nodata">No data for this layer</span>}</div>
                {showW && alertsFor(hover.code).map(w => <div key={w.id} className="small" style={{ marginTop: 3 }}><b style={{ color: MARK[w.level] }}>{LEVELS[w.level].icon}</b> {w.title}</div>)}
                <div className="muted small">Click to open the {stateByCode[hover.code].name} map</div>
              </div>
            )}
            <div className="map-legend">
              <span><span className="sw" style={{ background: 'repeating-linear-gradient(45deg,#F4F6F9 0 3px,#DADFE7 3px 5px)' }} />No data</span>
              {legend(layer, max).map(([c, t]) => <span key={c + t}><span className="sw" style={{ background: c }} />{t} {t === '1' ? L.unit.replace(/s$/, '') : L.unit}</span>)}
              {showW && (['risk', 'opportunity', 'caution'] as const).map(l => <span key={l}><span className="sw" style={{ background: MARK[l], borderRadius: '50%' }} />{LEVELS[l].label} (number = items)</span>)}
            </div>
          </div>
        </Card>
        <Card title={`Top states: ${L.l.toLowerCase()}`} sub="Click a state, here or on the map, to open its state map.">
          {leaders.length === 0 ? <p className="nodata">No data for this layer.</p> : (
            <div className="rank">
              {leaders.map(r => (
                <button key={r.code} className="rank-row" onClick={() => openState(r.code)}>
                  <span className="rank-n">{r.name}</span>
                  <span className="rank-bar"><i style={{ width: `${(r.v / leaders[0].v) * 100}%` }} /></span>
                  <span className="rank-v mono">{fmt(r.v)} {L.unit}</span>
                </button>
              ))}
            </div>
          )}
          <div className="callout" style={{ marginTop: 12 }}><b>Tip:</b> the state view shows <b>which counties and cities</b> hold the market, with tables and sources.</div>
        </Card>
      </div>
    </div>
  );
}

function Answer({ tag, short, full, status, srcs, note }: { tag: string; short: string; full?: string; status?: ReactNode; srcs: string[]; note?: string }) {
  const [more, setMore] = useState(false);
  return (
    <div className="answer">
      <div className="answer-tag">{tag}</div>
      <p>{short}</p>
      {more && full && <p className="answer-full">{full}</p>}
      <div className="meta">{status}{note && <span>{note}</span>}<Src ids={srcs} />{full && <button className="answer-btn" onClick={() => setMore(!more)}>{more ? 'Show less' : 'Read the full justification'}</button>}</div>
    </div>
  );
}

function PharmaView() {
  const q1 = market.q1; const a = q1.adopted_summary;
  const sizes = Object.entries(a.size as Record<string, number>).map(([k, v]) => ({ key: k, label: `${k} employees`, value: v as number }));
  return (
    <div className="stack">
      <Answer tag="Answer" short={q1.short} full={q1.paragraph} srcs={q1.sources} status={<><Badge status="Verified" /><span>counts and definitions</span><Badge status="Inferred" /><span>why these codes</span></>} />
      <div className="grid g3">
        <div className="bignum"><div className="bn-v mono">{fmt(a.est)}</div><div className="bn-l">establishments in the two adopted codes</div></div>
        <div className="bignum"><div className="bn-v mono">{fmt(a.est_50plus)}</div><div className="bn-l">have 50+ employees, the best proxy for sites with chiller plants</div></div>
        <div className="bignum"><div className="bn-v mono">{fmt(a.emp)}</div><div className="bn-l">employees in those establishments</div></div>
      </div>
      <Card title="The four NAICS codes" sub="Census 2022 NAICS definitions and CBP 2023 establishment counts. Two are adopted.">
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Code</th><th>Official description (Census)</th><th>Establishments</th><th>Employees</th><th>Decision</th></tr></thead>
          <tbody>{q1.codes.map((c: any) => (
            <tr key={c.code} className={c.adopted ? 'row-adopted' : ''}>
              <td><b>{c.code}</b><div className="small muted">{c.title}</div></td><td>{c.definition}</td><td className="mono">{fmt(c.est)}</td><td className="mono">{fmt(c.emp)}</td>
              <td>{c.adopted ? <span className="badge badge-verified">Adopted</span> : <span className="badge badge-unknown">Excluded</span>}<div className="small" style={{ marginTop: 4 }}>{c.why}</div></td>
            </tr>))}</tbody>
        </table></div>
        <div className="meta" style={{ marginTop: 8 }}><Src ids={['M01', 'M02']} /></div>
      </Card>
      <div className="grid g2">
        <Card title="Size of the 1,877 adopted establishments" sub="Number of establishments by employee count"><Bars rows={sizes} /><div className="meta" style={{ marginTop: 8 }}><Src ids={['M02']} /></div></Card>
        <Card title="Top states" sub="Establishments, NAICS 325412 + 325414">
          <div className="table-wrap"><table className="t">
            <thead><tr><th>State</th><th>Total</th><th>325412</th><th>325414</th></tr></thead>
            <tbody>{a.top_states.map((s: any) => <tr key={s.state}><td><a href={`#/market?s=${s.state}&layer=pharma`}>{stateByCode[s.state].name}</a></td><td className="mono"><b>{s.est}</b></td><td className="mono">{s['325412']}</td><td className="mono">{s['325414']}</td></tr>)}</tbody>
          </table></div>
          <div className="meta" style={{ marginTop: 8 }}><Src ids={['M03']} /></div>
        </Card>
      </div>
      <Card title="Limits of this data"><ul className="plain">{q1.limitations.map((l: string) => <li key={l}>{l}</li>)}</ul></Card>
    </div>
  );
}

function GrowthView() {
  const q2 = market.q2;
  return (
    <div className="stack">
      <p className="lead" style={{ margin: 0 }}>{q2.intro}</p>
      {q2.markets.map((m: any) => (
        <Card key={m.id} title={m.name}>
          <div className="grid g2" style={{ marginBottom: 14 }}>
            <div>
              <h4 className="mini-h">Evidence of growth</h4>
              <ul className="plain">{m.evidence_of_growth.map((e: any, i: number) => <li key={i}>{e.text} <Badge status={e.status} /> <Src ids={e.sources} /></li>)}</ul>
            </div>
            <div className="callout">
              <b>Why they need leak detection</b>
              <p style={{ margin: '6px 0' }}>{m.fit.text}</p>
              <Badge status={m.fit.status} /> <Src ids={m.fit.sources} />
            </div>
          </div>
          <div className="table-wrap"><table className="t">
            <thead><tr><th>Company</th><th>Location (state)</th><th>Investment ($)</th><th>Status / timeline</th><th>Source</th></tr></thead>
            <tbody>{m.rows.map((r: any, i: number) => (
              <tr key={i}><td><b>{r.company}</b></td><td>{r.location}</td><td>{r.investment}</td><td>{r.status}</td><td><Src ids={r.sources} /></td></tr>))}</tbody>
          </table></div>
        </Card>
      ))}
      <Card title="Gaps"><ul className="plain">{market.evidence_gaps.map((l: string) => <li key={l}>{l}</li>)}</ul></Card>
    </div>
  );
}

function DcView() {
  const q3d = market.q3;
  const rows = [...q3d.states].sort((a: any, b: any) => b.announced_b - a.announced_b);
  const byUc = [...q3d.states].sort((a: any, b: any) => b.under_construction - a.under_construction);
  return (
    <div className="stack">
      <Answer tag="Recommendation" short={q3d.recommendation.short} full={q3d.recommendation.text} srcs={q3d.recommendation.sources} status={<Badge status={q3d.recommendation.status} />} />
      <p className="lead" style={{ margin: 0 }}>{q3d.national.text} <Src ids={q3d.national.sources} /></p>
      <Card title="Six states compared" sub="Ranked by announced investment. Dollars are announced, not spent; click a state name for the full incentive text and project table.">
        <div className="table-wrap"><table className="t">
          <thead><tr><th>#</th><th>State</th><th># Projects</th><th>Total investment</th><th>Under construction</th><th>Leading developers</th><th>Incentives</th><th>Source</th></tr></thead>
          <tbody>{rows.map((s: any, i: number) => (
            <tr key={s.state}>
              <td className="mono">{i + 1}</td>
              <td><a href={`#/market?s=${s.state}&layer=dc`}><b>{s.name}</b></a><div className="small muted">{s.flagship}</div></td>
              <td className="mono">{s.projects}</td>
              <td className="mono">${s.announced_b}B{s.caveat && <div className="small muted" style={{ fontWeight: 400 }}>{s.caveat}</div>}</td>
              <td className="mono">{s.under_construction} (${s.uc_b}B)</td>
              <td>{s.developers}</td>
              <td>{s.incentive_short}<div style={{ marginTop: 4 }}><Badge status={s.incentive_status} /></div></td>
              <td><Src ids={[...s.sources, ...s.incentive_sources]} /></td>
            </tr>))}</tbody>
        </table></div>
        <p className="small muted" style={{ marginBottom: 0 }}>By projects under construction: {byUc.map((s: any) => `${s.name} ${s.under_construction}`).join(' · ')}.</p>
      </Card>
      <Card title="Why data centers need refrigerant monitoring"><p style={{ margin: 0 }}>{q3d.fit.text} <Badge status={q3d.fit.status} /> <Src ids={q3d.fit.sources} /></p></Card>
      <Card title="Limits of this data"><ul className="plain">{q3d.limitations.map((l: string) => <li key={l}>{l}</li>)}</ul></Card>
    </div>
  );
}

type Col = { k: string; l: string; get: (code: string) => number; fmt?: (n: number) => string; srcs: string[] };
const COLS: Col[] = [
  { k: 'pharma', l: 'Pharma plants', get: c => ms[c]?.pharma?.est ?? 0, srcs: ['M02', 'M03'] },
  { k: 'dc', l: 'Data center projects', get: c => ms[c]?.data_centers?.projects ?? 0, srcs: ['M31'] },
  { k: 'dcb', l: 'Announced $B', get: c => ms[c]?.data_centers?.announced_b ?? 0, fmt: n => n.toLocaleString('en-US', { maximumFractionDigits: 1 }), srcs: ['M31'] },
  { k: 'uc', l: 'Under construction', get: c => ms[c]?.data_centers?.under_construction ?? 0, srcs: ['M31'] },
  { k: 'bat', l: 'Battery GWh', get: c => stateByCode[c].battery_cell_gwh, srcs: ['S130'] },
  { k: 'fab', l: 'Fab projects', get: c => semiIn(c).length, srcs: ['M14'] },
  { k: 'comp', l: 'Competitors', get: c => new Set(presence(c, false).map(e => e.company)).size, srcs: ['S23'] },
];

function TableView() {
  const [sort, setSort] = useState<{ k: string; dir: 1 | -1 }>({ k: 'dc', dir: -1 });
  const [q, setQ] = useState('');
  const rows = states.filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase() === q.toLowerCase())
    .map(s => ({ s, v: Object.fromEntries(COLS.map(c => [c.k, c.get(s.code)])) as Record<string, number> }))
    .sort((a, b) => sort.k === 'name' ? sort.dir * a.s.name.localeCompare(b.s.name) : sort.dir * (a.v[sort.k] - b.v[sort.k]) || a.s.name.localeCompare(b.s.name));
  const tot = (k: string) => rows.reduce((a, r) => a + r.v[k], 0);
  const head = (k: string, l: string) => (
    <th key={k} onClick={() => setSort({ k, dir: sort.k === k ? (sort.dir === 1 ? -1 : 1) : k === 'name' ? 1 : -1 })} className="sortable" aria-sort={sort.k === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      {l}{sort.k === k ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
    </th>
  );
  return (
    <div className="stack">
      <div className="xl-bar">
        <div>
          <b>All 51 states in one table.</b> Click a column to sort, click a state to open its map panel and sources.
          <div className="small muted">The Excel file has these plus every project row, definition and source link (16 sheets).</div>
        </div>
        <a className="btn primary" href={XLSX_URL} download>Download Excel (.xlsx)</a>
      </div>
      <div className="toolbar" style={{ marginBottom: 0 }}><input className="input" placeholder="Search a state…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search states" /><span className="muted small">{rows.length} states</span></div>
      <div className="table-wrap sheet" style={{ maxHeight: 620 }}>
        <table className="t">
          <thead>
            <tr>{head('name', 'State')}{COLS.map(c => head(c.k, c.l))}</tr>
            <tr className="srcrow"><th>Source</th>{COLS.map(c => <th key={c.k}><Src ids={c.srcs} label={c.srcs.join(', ')} /></th>)}</tr>
          </thead>
          <tbody>
            {rows.map(({ s, v }) => (
              <tr key={s.code} onClick={() => { window.location.hash = `/market?s=${s.code}&layer=dc`; }} style={{ cursor: 'pointer' }}>
                <td><b>{s.name}</b></td>
                {COLS.map(c => <td key={c.k} className={`mono num ${v[c.k] ? '' : 'zero'}`}>{v[c.k] ? (c.fmt ? c.fmt(v[c.k]) : v[c.k].toLocaleString('en-US')) : '–'}</td>)}
              </tr>
            ))}
          </tbody>
          <tfoot><tr><td><b>Total (shown)</b></td>{COLS.map(c => <td key={c.k} className="mono num"><b>{c.fmt ? c.fmt(tot(c.k)) : tot(c.k).toLocaleString('en-US')}</b></td>)}</tr></tfoot>
        </table>
      </div>
      <p className="small muted">A dash means no data in that source (not zero activity). Fab projects are the named projects researched here, not every fab. Data centers: announced investment from a secondary tracker. Competitors: verified local presence only.</p>
    </div>
  );
}

function WatchView({ params }: { params: URLSearchParams }) {
  const [lvl, setLvl] = useState<string>(params.get('lvl') || 'all');
  const [mk, setMk] = useState<string>('all');
  const items = sortAlerts(watchouts.filter(w => (lvl === 'all' || w.level === lvl) && (mk === 'all' || w.market === mk)));
  const mkts = ['all', ...Array.from(new Set(watchouts.map(w => w.market)))];
  const lv = [['all', 'All', watchouts.length], ...(['risk', 'opportunity', 'caution'] as const).map(l => [l, LEVELS[l].plural, countBy(l)])] as [string, string, number][];
  return (
    <div className="stack">
      <p className="lead" style={{ margin: 0 }}>What an executive should notice before acting on the map. Risks could slow demand, opportunities are clear openings, and data cautions mark where the evidence is thin. Each item cites its sources.</p>
      <div className="filters" role="group" aria-label="Filter by type">
        {lv.map(([k, l, n]) => <button key={k} className={`fchip ${lvl === k ? (k === 'risk' ? 'on-risk' : k === 'caution' ? 'on-caution' : 'on') : ''}`} onClick={() => setLvl(k)}>{l} ({n})</button>)}
      </div>
      <div className="filters" role="group" aria-label="Filter by market">
        {mkts.map(k => <button key={k} className={`fchip ${mk === k ? 'on' : ''}`} onClick={() => setMk(k)}>{MARKETS[k] ?? k}</button>)}
      </div>
      <p className="small muted" style={{ margin: 0 }}>{items.length} of {watchouts.length} items shown</p>
      <AlertList items={items} empty="Nothing matches these filters." />
    </div>
  );
}

const CMP: { k: string; l: string; get: (c: string) => number; fmt?: (n: number) => string }[] = [
  { k: 'dc', l: 'Data center projects', get: c => ms[c]?.data_centers?.projects ?? 0 },
  { k: 'uc', l: 'Projects under construction', get: c => ms[c]?.data_centers?.under_construction ?? 0 },
  { k: 'dcb', l: 'Announced $B (data centers)', get: c => ms[c]?.data_centers?.announced_b ?? 0, fmt: n => n.toLocaleString('en-US', { maximumFractionDigits: 1 }) },
  { k: 'ph', l: 'Pharma plants', get: c => ms[c]?.pharma?.est ?? 0 },
  { k: 'ph50', l: 'Pharma employees', get: c => ms[c]?.pharma?.emp ?? 0 },
  { k: 'bat', l: 'Battery GWh', get: c => stateByCode[c].battery_cell_gwh },
  { k: 'fab', l: 'Fab projects', get: c => semiIn(c).length },
  { k: 'comp', l: 'Competitors with local presence', get: c => new Set(presence(c, false).map(e => e.company)).size },
];

function CompareView({ params }: { params: URLSearchParams }) {
  const init = (params.get('c') || 'TX,VA,GA').split(',').filter(c => stateByCode[c]).slice(0, 3);
  const [sel, setSel] = useState<string[]>(init.length ? init : ['TX', 'VA', 'GA']);
  const set = (i: number, c: string) => setSel(s => s.map((x, j) => j === i ? c : x));
  return (
    <div className="stack">
      <p className="lead" style={{ margin: 0 }}>Pick up to three states. The best value in each row is highlighted. A dash means no data in that source, not zero activity.</p>
      <div className="pick">
        {sel.map((c, i) => (
          <select key={i} className="input" value={c} onChange={e => set(i, e.target.value)} aria-label={`State ${i + 1}`}>
            {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        ))}
        {sel.length < 3 && <button className="btn" onClick={() => setSel([...sel, states.find(s => !sel.includes(s.code))!.code])}>+ Add a state</button>}
        {sel.length > 2 && <button className="btn" onClick={() => setSel(sel.slice(0, -1))}>Remove last</button>}
      </div>
      <div className="table-wrap">
        <table className="cmp-st">
          <thead><tr><th className="rl">Metric</th>{sel.map((c, i) => <th key={i}><a href={`#/market?v=state&s=${c}`}>{stateByCode[c].name} ↗</a></th>)}</tr></thead>
          <tbody>
            {CMP.map(r => {
              const vals = sel.map(c => r.get(c));
              const mx = Math.max(...vals);
              return (
                <tr key={r.k}>
                  <th className="rl">{r.l}</th>
                  {vals.map((v, i) => <td key={i} className={`num mono ${v && v === mx && new Set(vals).size > 1 ? 'best' : ''} ${v ? '' : 'zero'}`}>{v ? (r.fmt ? r.fmt(v) : v.toLocaleString('en-US')) : '–'}</td>)}
                </tr>
              );
            })}
            <tr>
              <th className="rl">Watch-outs</th>
              {sel.map((c, i) => {
                const a = alertsFor(c);
                return <td key={i}>{a.length ? a.map(w => <div key={w.id} className="small"><b style={{ color: MARK[w.level] }}>{LEVELS[w.level].icon}</b> {w.title}</div>) : <span className="nodata">None flagged</span>}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="meta"><Src ids={['M31', 'M02', 'M03', 'S130', 'M14']} /></div>
    </div>
  );
}

function MarketSummary() {
  const q1 = market.q1.adopted_summary;
  const tx = market.q3.states.find((s: any) => s.state === 'TX');
  return (
    <Summary title="Market growth" items={[
      { label: 'Data centers', kw: 'Texas · Virginia · Georgia', line: `Texas leads: ${tx.projects} projects, ${tx.under_construction} already under construction`, src: ['M31'] },
      { label: 'Pharma plants', kw: `${fmt(q1.est)} plants`, line: `${q1.est_50plus} have 50+ employees. California, New Jersey, Florida lead`, src: ['M02', 'M03'] },
      { label: 'Chip fabs', kw: '4 mega-projects', line: 'TSMC Arizona, Micron Idaho/New York, TI Texas/Utah, Samsung Texas', src: ['M11', 'M12', 'M10', 'M13'] },
      { label: 'Batteries', kw: 'Kansas · N. Carolina', line: 'Panasonic and Toyota already producing; others delayed or cancelled', src: ['S143', 'M21'] },
    ]} foot={<><b>Go first:</b> Texas, Virginia, then Georgia for data centers. <b>Click any state</b> to open its county map and see where the market is.</>} />
  );
}

export default function Market({ params }: { params: URLSearchParams }) {
  const v = (params.get('v') as View) || 'map';
  const stateCode = params.get('s');
  const isState = v === 'state' || (!!stateCode && !params.get('v'));
  const view = isState ? 'state' : VIEWS.some(x => x.k === v) ? v : 'map';
  return (
    <div className="stack">
      <PageHead kicker="2 · Market" title="Where is the U.S. market for ThermGAS?"
        lead="Four growth markets on one map: data centers, pharmaceutical plants, battery plants and semiconductor fabs. Click any state to see the numbers, the tables and the sources." />
      <div className="subnav" role="tablist" aria-label="Market views">
        {VIEWS.map(x => (
          <a key={x.k} role="tab" aria-selected={view === x.k} href={`#/market?v=${x.k}`} className={view === x.k ? 'on' : ''}>
            <b>{x.l}</b><span>{x.d}</span>
          </a>
        ))}
      </div>
      {view === 'state' && <Suspense fallback={<p className="muted">Loading the state map…</p>}><StateView code={stateCode ?? 'TX'} layerParam={params.get('layer')} /></Suspense>}
      {view === 'map' && <><MarketSummary /><MapView params={params} /></>}
      {view === 'pharma' && <PharmaView />}
      {view === 'growth' && <GrowthView />}
      {view === 'dc' && <DcView />}
      {view === 'watch' && <WatchView params={params} />}
      {view === 'compare' && <CompareView params={params} />}
      {view === 'data' && <TableView />}
    </div>
  );
}
