import { useEffect, useState } from 'react';
import usmap from '../data/usmap.json';
import { stateByCode, states, marketGeo, marketStates, XLSX_URL, shortName, presence, watchouts } from '../data';
import { AlertList, alertsFor } from '../alerts';
import { Card, Src, Badge } from '../ui';
import { StatePanel, semiIn } from './Market';
import { go } from '../App';

type SLayer = 'dc' | 'pharma' | 'plants';
const RAMP = ['#DCE8FA', '#A9C6F2', '#6F9EE3', '#3A75CF', '#17489A'];
const DARK = new Set(['#3A75CF', '#17489A']);
const fmt = (n: number) => n.toLocaleString('en-US');
const mg = marketGeo as any;
const ms = marketStates.states as Record<string, any>;

interface County { f: string; n: string; d: string; cx: number; cy: number }
interface Geo { width: number; height: number; states: Record<string, { bbox: number[]; counties: County[] }> }

const LAYER_INFO: Record<SLayer, { l: string; d: string; src: string[] }> = {
  dc: { l: 'Data centers', d: 'Announced data center investment per county (planned and under construction projects)', src: ['M31'] },
  pharma: { l: 'Pharma plants', d: 'Pharmaceutical establishments per county (NAICS 325412 + 325414)', src: ['M02'] },
  plants: { l: 'Battery plants & chip fabs', d: 'Located battery plants (circles) and named chip fab projects (diamonds)', src: ['S130', 'M14'] },
};

export default function StateView({ code, layerParam }: { code: string; layerParam?: string | null }) {
  const S = stateByCode[code] ?? states[0];
  const [geo, setGeo] = useState<Geo | null>(null);
  const [layer, setLayer] = useState<SLayer>((layerParam as SLayer) && ['dc', 'pharma', 'plants'].includes(layerParam as string) ? (layerParam as SLayer) : 'dc');
  const [selCounty, setSelCounty] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; id: string } | null>(null);
  const [hoverPlace, setHoverPlace] = useState<number | null>(null);
  const [ucOnly, setUcOnly] = useState(false);
  const [minB, setMinB] = useState(0);
  useEffect(() => { import('../data/counties.json').then(m => setGeo(m.default as unknown as Geo)); }, []);
  useEffect(() => { setSelCounty(null); setHover(null); setUcOnly(false); setMinB(0); }, [code]);

  const dcC = (mg.data_centers[code] ?? {}) as Record<string, any>;
  const phC = (mg.pharma[code] ?? {}) as Record<string, any>;
  const places = (mg.places as any[]).filter(p => p.state === code);
  const sg = geo?.states[code];
  const outline = usmap.states.find(s => s.code === code)?.d;

  const dc = ms[code]?.data_centers; const ph = ms[code]?.pharma;
  const semis = semiIn(code);
  const comp = new Set(presence(code, false).map(e => e.company)).size;
  const dcPass = (f: string) => { const o = dcC[f]; return !!o && o.b >= minB && (!ucOnly || o.uc > 0); };
  const value = (f: string) => layer === 'dc' ? (dcPass(f) ? (ucOnly ? dcC[f].ucb ?? 0 : dcC[f].b) : 0) : layer === 'pharma' ? phC[f]?.n ?? 0 : 0;
  const names: Record<string, string> = { ...(mg.names as Record<string, string>), ...(sg ? Object.fromEntries(sg.counties.map(c => [c.f, c.n])) : {}) };
  const drawn = new Set(sg ? sg.counties.map(c => c.f) : []);
  const rank = Object.keys(layer === 'dc' ? dcC : phC).map(f => ({ f, n: names[f] ?? f, v: value(f), o: layer === 'dc' ? dcC[f] : phC[f] })).filter(r => layer !== 'dc' || dcPass(r.f)).sort((a, b) => b.v - a.v || a.n.localeCompare(b.n));
  const rankOf = (get: (c: string) => number) => { const v = get(code); if (!v) return null; return 1 + states.filter(s => get(s.code) > v).length; };
  const chips = [
    { l: 'data center projects', v: dc?.projects, r: rankOf(c => ms[c]?.data_centers?.projects ?? 0) },
    { l: 'under construction', v: dc?.under_construction, r: rankOf(c => ms[c]?.data_centers?.under_construction ?? 0) },
    { l: 'pharma plants', v: ph ? fmt(ph.est) : undefined, r: rankOf(c => ms[c]?.pharma?.est ?? 0) },
    { l: 'battery GWh', v: S.battery_cell_gwh || undefined, r: rankOf(c => stateByCode[c].battery_cell_gwh) },
  ].filter(c => c.v);
  const stateAlerts = alertsFor(code);
  const usAlerts = watchouts.filter(w => w.scope === 'US' && (w.market === 'competitive' ? false : (w.market === 'datacenters' ? !!dc : w.market === 'pharma' ? !!ph : w.market === 'batteries' ? S.battery_cell_plants > 0 : semis.length > 0)));
  const max = Math.max(1, ...rank.map(r => r.v));
  const shade = (v: number) => (v <= 0 ? null : RAMP[Math.min(4, Math.floor(Math.sqrt(v / max) * 4.99))]);
  const labelSet = new Set(rank.slice(0, 4).map(r => r.f));

  const pharmaTotal = Object.values(phC).reduce((a: number, o: any) => a + o.n, 0);
  const keywords: string[] = [];
  if (dc) keywords.push(`${dc.projects} data center projects, ${dc.under_construction} under construction`);
  if (ph) keywords.push(`${fmt(ph.est)} pharma plants`);
  if (S.battery_cell_plants) keywords.push(`${S.battery_cell_plants} battery plant${S.battery_cell_plants > 1 ? 's' : ''} (${S.battery_cell_gwh} GWh)`);
  if (semis.length) keywords.push(`${semis.length} chip fab project${semis.length > 1 ? 's' : ''}`);
  const rankDc = Object.keys(dcC).map(f => ({ n: names[f] ?? f, b: dcC[f].b })).sort((a, b) => b.b - a.b).slice(0, 3);
  const rankPh = Object.keys(phC).map(f => ({ n: names[f] ?? f, v: phC[f].n })).sort((a, b) => b.v - a.v).slice(0, 3);

  let vb = '0 0 975 610'; let span = 100;
  if (sg) { const [x0, y0, x1, y1] = sg.bbox; const w = x1 - x0, h = y1 - y0; const pad = Math.max(w, h) * 0.04; vb = `${x0 - pad} ${y0 - pad} ${w + 2 * pad} ${h + 2 * pad}`; span = Math.max(w, h); }
  const fs = span / 52; const mr = span / 95;
  const sel = selCounty ? (layer === 'dc' ? dcC[selCounty] : phC[selCounty]) : null;
  const hv = hover && sg ? sg.counties.find(c => c.f === hover.id) : null;
  const hData = hover ? (layer === 'dc' ? dcC[hover.id] : phC[hover.id]) : null;
  const pl = hoverPlace !== null ? places[hoverPlace] : null;

  return (
    <div className="stack">
      <div className="sv-head">
        <button className="btn" onClick={() => go('market')}>← Back to U.S. map</button>
        <div className="sv-title"><span className="kicker" style={{ margin: 0 }}>State view</span><h2>{S.name}</h2></div>
        <label className="small muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>Go to
          <select className="input" value={code} onChange={e => go('market', { v: 'state', s: e.target.value, layer })} aria-label="Choose a state">
            {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        </label>
        <a className="btn" href={XLSX_URL} download>Excel ↓</a>
      </div>

      <div className="sv-summary">
        <b>{S.name} in one line:</b> {keywords.length ? keywords.join(' · ') : 'no data in this research for this state (Not Verified / Insufficient Evidence).'}
        {(rankDc.length > 0 || rankPh.length > 0) && (
          <div className="sv-hot">
            {rankDc.length > 0 && <span><i className="k">Data center hot spots</i> {rankDc.map(r => r.n.replace(/ County$| Parish$/, '')).join(' · ')}</span>}
            {rankPh.length > 0 && <span><i className="k">Pharma hot spots</i> {rankPh.map(r => r.n.replace(/ County$| Parish$/, '')).join(' · ')}</span>}
            {places.length > 0 && <span><i className="k">Plants and fabs</i> {places.map(p => p.label.split(' (')[0]).slice(0, 4).join(' · ')}</span>}
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="kfacts" aria-label="Key facts and U.S. rank">
          {chips.map(c => (
            <span key={c.l} className={`kfact ${c.r && c.r <= 5 ? 'top' : ''}`}>
              <b>{c.v}</b> {c.l}{c.r && c.r <= 10 ? <> · <span className="star">★</span> #{c.r} of 51</> : c.r ? <> · #{c.r}</> : null}
            </span>
          ))}
        </div>
      )}
      {(stateAlerts.length > 0 || usAlerts.length > 0) && (
        <Card title={`Watch-outs for ${S.name}`} sub={stateAlerts.length ? 'Things to know before acting on the numbers' : 'U.S.-wide items that touch this state'}>
          <AlertList items={[...stateAlerts, ...usAlerts]} showScope={false} />
        </Card>
      )}

      <div className="layer-bar" role="group" aria-label="State map layer">
        {(Object.keys(LAYER_INFO) as SLayer[]).map(k => <button key={k} className={layer === k ? 'on' : ''} onClick={() => { setLayer(k); setSelCounty(null); }}>{LAYER_INFO[k].l}</button>)}
      </div>
      <p className="small muted" style={{ margin: '-4px 0 0' }}>{LAYER_INFO[layer].d}. <Src ids={LAYER_INFO[layer].src} /></p>
      {layer === 'dc' && Object.keys(dcC).length > 0 && (
        <div className="filters" role="group" aria-label="Data center filters">
          <button className={`fchip ${ucOnly ? 'on' : ''}`} aria-pressed={ucOnly} onClick={() => { setUcOnly(!ucOnly); setSelCounty(null); }}>Under construction only</button>
          <label className="slider-inline">Min. $B per county
            <select className="input" value={minB} onChange={e => { setMinB(Number(e.target.value)); setSelCounty(null); }}>
              {[0, 1, 5, 10].map(n => <option key={n} value={n}>{n === 0 ? 'Any' : `${n}+`}</option>)}
            </select>
          </label>
          <span className="small muted">{rank.length} of {Object.keys(dcC).length} counties shown{ucOnly ? ' · map shows $B under construction' : ''}</span>
        </div>
      )}

      <div className="grid g-main">
        <Card>
          {!sg ? <p className="muted">Loading the state map…</p> : (
            <div className="map-wrap" onMouseLeave={() => { setHover(null); setHoverPlace(null); }}>
              <svg className="map-svg state-svg" viewBox={vb} role="img" aria-label={`${S.name} county map: ${LAYER_INFO[layer].l}`} style={{ maxHeight: 600 }}>
                {sg.counties.map(c => {
                  const v = value(c.f); const f = shade(v);
                  return (
                    <path key={c.f} d={c.d} className={`cty ${selCounty === c.f ? 'sel' : ''} ${f ? 'has' : ''}`} fill={f ?? '#F1F4F8'} strokeWidth={span / 900}
                      onMouseMove={e => { const r = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect(); setHoverPlace(null); setHover({ x: e.clientX - r.left, y: e.clientY - r.top, id: c.f }); }}
                      onClick={() => layer !== 'plants' && setSelCounty(c.f === selCounty ? null : c.f)} />
                  );
                })}
                {outline && <path d={outline} fill="none" stroke="#2B3A55" strokeWidth={span / 380} pointerEvents="none" />}
                {layer !== 'plants' && sg.counties.filter(c => labelSet.has(c.f)).map(c => (
                  <text key={'t' + c.f} x={c.cx} y={c.cy} style={{ fontSize: fs }} textAnchor="middle" dominantBaseline="middle" className={shade(value(c.f)) && DARK.has(shade(value(c.f)) as string) ? 'inv cty-label' : 'cty-label'}>{c.n.replace(/ County$| Parish$/, '')}</text>
                ))}
                {places.map((p, i) => (
                  <g key={i} transform={`translate(${p.x} ${p.y})`} onMouseMove={e => { const r = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect(); setHover({ x: e.clientX - r.left, y: e.clientY - r.top, id: '' }); setHoverPlace(i); }} style={{ cursor: 'default' }} opacity={layer === 'plants' ? 1 : 0.9}>
                    {p.kind === 'battery'
                      ? <circle r={mr} fill="#0097A7" stroke="#fff" strokeWidth={mr / 4} />
                      : <rect x={-mr} y={-mr} width={mr * 2} height={mr * 2} transform="rotate(45)" fill="#A23B72" stroke="#fff" strokeWidth={mr / 4} />}
                    {layer === 'plants' && <text x={mr * 1.5} y={mr / 2} style={{ fontSize: fs }} className="place-label" pointerEvents="none">{p.label.replace(/ \(.*\)/, '')}</text>}
                  </g>
                ))}
              </svg>
              {hover && (pl || hv) && (
                <div className="tooltip" style={{ left: Math.min(hover.x + 14, 420), top: hover.y + 14 }}>
                  {pl ? <><b>{pl.label}</b><div>{pl.detail}</div><div className="muted small">{pl.kind === 'battery' ? 'Battery plant' : 'Chip fab project'} · located by {pl.located_by}</div></> : (
                    <><b>{hv!.n}</b>
                      {layer === 'dc' && (hData ? <div>{hData.n} project{hData.n > 1 ? 's' : ''} · ${hData.b}B announced · {hData.uc} under construction</div> : <div className="nodata">No data center project in the tracker</div>)}
                      {layer === 'pharma' && (hData ? <div>{hData.n} pharma plant{hData.n > 1 ? 's' : ''} (325412: {hData.e325412}, 325414: {hData.e325414})</div> : <div className="nodata">No published plant count</div>)}
                      {layer !== 'plants' && hData && <div className="muted small">Click for details</div>}</>
                  )}
                </div>
              )}
              <div className="map-legend">
                {layer !== 'plants' ? <>
                  <span><span className="sw" style={{ background: '#F1F4F8' }} />none / not published</span>
                  {RAMP.map((c, i) => <span key={c}><span className="sw" style={{ background: c }} />{layer === 'dc' ? `${(i === 0 ? 0.1 : max * (i / 5) ** 2).toFixed(1)}–${(max * ((i + 1) / 5) ** 2).toFixed(1)}` : `${i === 0 ? 1 : Math.round(max * (i / 5) ** 2) + 1}–${Math.round(max * ((i + 1) / 5) ** 2)}`}</span>)}
                  <span>{layer === 'dc' ? '$B announced' : 'plants'}</span></> : <>
                  <span><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#0097A7" /></svg> Battery plant</span>
                  <span><svg width="14" height="14"><rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="#A23B72" /></svg> Chip fab project</span></>}
                {layer !== 'plants' && places.length > 0 && <><span><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#0097A7" /></svg> Battery plant</span><span><svg width="14" height="14"><rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="#A23B72" /></svg> Chip fab</span></>}
              </div>
            </div>
          )}
          {layer !== 'plants' && rank.some(r => !drawn.has(r.f)) && <p className="small muted" style={{ marginBottom: 0 }}>Some areas ({rank.filter(r => !drawn.has(r.f)).map(r => r.n).join(', ')}) are listed but not drawn: the Census now uses planning regions here, which this county map cannot show.</p>}
          {layer === 'pharma' && <p className="small muted" style={{ marginBottom: 0 }}>County detail covers {fmt(pharmaTotal)} of {ph ? fmt(ph.est) : 0} plants; the Census does not publish county industry detail for the rest. {places.length === 0 && ''}<Src ids={['M02']} /></p>}
          {layer === 'dc' && <p className="small muted" style={{ marginBottom: 0 }}>Announced investment, not spending. Secondary tracker compiled Apr–Oct 2026. <Src ids={['M31']} /></p>}
          {layer === 'plants' && places.length === 0 && <p className="nodata" style={{ marginBottom: 0 }}>No battery plant or named chip fab in this state in this research.</p>}
        </Card>

        <div className="stack">
          {layer !== 'plants' ? (
            <Card title={layer === 'dc' ? 'Where the data centers are' : 'Where the pharma plants are'} sub="Top counties. Click a row to highlight it on the map.">
              {rank.length === 0 ? <p className="nodata">No county-level data for this layer in this state.</p> : (
                <div className="rank">
                  {rank.slice(0, 8).map(r => (
                    <button key={r.f} className={`rank-row ${selCounty === r.f ? 'on' : ''}`} onClick={() => setSelCounty(r.f === selCounty ? null : r.f)}>
                      <span className="rank-n">{r.n}</span>
                      <span className="rank-bar"><i style={{ width: `${(r.v / max) * 100}%` }} /></span>
                      <span className="rank-v mono">{layer === 'dc' ? (ucOnly ? `$${r.v}B · ${r.o.uc} building` : `$${r.o.b}B · ${r.o.n} proj.`) : r.v}</span>
                    </button>
                  ))}
                  {rank.length > 8 && <div className="small muted">+ {rank.length - 8} more counties (in the table below and the Excel file)</div>}
                </div>
              )}
            </Card>
          ) : (
            <Card title="Plants and fabs in this state" sub="Hover a marker on the map for details">
              {places.length === 0 ? <p className="nodata">None in this research.</p> : places.map((p, i) => (
                <div key={i} className="ev"><span><b>{p.label}</b><div className="small muted">{p.detail}</div></span><Src ids={p.sources} /></div>
              ))}
            </Card>
          )}

          {sel && selCounty && (
            <Card title={names[selCounty] ?? 'County'} sub={layer === 'dc' ? 'Data center projects in this county' : 'Pharma plants in this county'} right={<button className="icon-btn" onClick={() => setSelCounty(null)} aria-label="Close">✕</button>}>
              {layer === 'dc' ? (
                <>
                  <p style={{ margin: '0 0 8px' }}><b className="mono">{sel.n}</b> project{sel.n > 1 ? 's' : ''} · <b className="mono">${sel.b}B</b> announced · <b className="mono">{sel.uc}</b> under construction</p>
                  <div className="table-wrap"><table className="t"><thead><tr><th>Project</th><th>Developer</th><th>$B</th><th>Status</th></tr></thead>
                    <tbody>{sel.top.map((t: any, i: number) => <tr key={i}><td>{t.p}</td><td>{t.d}</td><td className="mono">{t.b}</td><td>{t.s}</td></tr>)}</tbody></table></div>
                  <div className="meta" style={{ marginTop: 8 }}><Src ids={['M31']} /> <Badge status="Verified" /></div>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px' }}><b className="mono">{sel.n}</b> pharma plant{sel.n > 1 ? 's' : ''}: {sel.e325412} in 325412 (pharmaceutical preparations), {sel.e325414} in 325414 (biological products)</p>
                  <div className="meta"><Src ids={['M02']} /> <Badge status="Verified" /></div>
                </>
              )}
            </Card>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: 18 }}>All the data for {S.name}, with sources</h3>
      <StatePanel code={code} />
      <p className="small muted">Competitors with a verified local presence: {comp || 'none verified'} ({[...new Set(presence(code, false).map(e => shortName(e.company)))].join(', ') || 'Not Verified / Insufficient Evidence'}).</p>
    </div>
  );
}
