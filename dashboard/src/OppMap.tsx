import { useMemo, useState } from 'react';
import usmap from './data/usmap.json';
import { stateByCode, presence, shortName, dcByState, dcRank, dataCenters, executive } from './data';
import { opportunities, type OppClass } from './exec';
import { Src, Badge } from './ui';
import { go } from './App';

export type MapLayer = 'battery' | 'datacenter' | 'competitors';
const LAYERS: { k: MapLayer; l: string }[] = [
  { k: 'battery', l: 'Battery plants' },
  { k: 'datacenter', l: 'Data centers' },
  { k: 'competitors', l: 'Competitors' },
];
const CLS_COLOR: Record<OppClass, string> = { A: '#1E7A45', B: '#1F60C4', C: '#E3B04B', D: '#A23B72' };
const CLS_DARK = new Set(['A', 'B', 'D']);
const RAMP = ['#DCE8FA', '#A9C6F2', '#6F9EE3', '#3A75CF', '#17489A'];
const DC_BINS = [1e6, 3e6, 6e6, 10e6];           // MWh/y bin edges
const DC_LABELS = ['< 1 TWh', '1-3 TWh', '3-6 TWh', '6-10 TWh', '10+ TWh'];
const dcBin = (mwh: number) => DC_BINS.filter(b => mwh >= b).length;
const fmtTwh = (mwh: number) => `${(mwh / 1e6).toFixed(mwh >= 1e7 ? 0 : 1)} TWh`;
const LOW_TEXT = new Set(['#DCE8FA', '#A9C6F2', '#E3B04B', '#EEF1F5']);

export default function OppMap({ initial = 'battery', compact = false }: { initial?: MapLayer; compact?: boolean }) {
  const [layer, setLayer] = useState<MapLayer>(initial);
  const [sel, setSel] = useState('GA');
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const opp = useMemo(() => Object.fromEntries(opportunities().map(o => [o.code, o])), []);
  const comps = (c: string) => [...new Set(presence(c, true).map(e => shortName(e.company)))];

  const fill = (c: string): string | null => {
    if (layer === 'battery') return opp[c] ? CLS_COLOR[opp[c].cls] : '#EEF1F5';
    if (layer === 'datacenter') return dcByState[c] ? RAMP[dcBin(dcByState[c].mwh_2023)] : null;
    const n = comps(c).length; return n ? RAMP[Math.min(4, n + 1)] : null;
  };
  const short = (c: string) => {
    if (layer === 'battery') return opp[c] ? executive.opportunity_rules.classes[opp[c].cls].label : 'No cell plant in DOE list';
    if (layer === 'datacenter') return dcByState[c] ? `${fmtTwh(dcByState[c].mwh_2023)} in 2023 · #${dcRank(c)} of 44` : 'Not in EPRI table';
    const n = comps(c); return n.length ? n.join(', ') : 'Not Verified / Insufficient Evidence';
  };
  const insight = {
    battery: <>Engage now: <b>{byCls(opp, 'A')}</b> · Prepare: <b>{byCls(opp, 'B')}</b> · Separate segment: <b>{byCls(opp, 'D')}</b></>,
    datacenter: <>Largest 2023 load: <b>{[...dataCenters.rows].sort((a, b) => b.mwh_2023 - a.mwh_2023).slice(0, 5).map(r => r.state).join(', ')}</b> · ThermGAS home state GA ranks <b>#{dcRank('GA')}</b></>,
    competitors: <>Verified channels cluster in <b>CA, TX and the Northeast</b>. Most battery states show no verified local channel (not the same as no competition).</>,
  }[layer];
  const S = stateByCode[sel]; const o = opp[sel]; const dc = dcByState[sel];

  return (
    <div className={`oppmap ${compact ? 'compact' : ''}`}>
      <div className="om-top">
        <div className="seg" role="tablist" aria-label="Map layer">
          {LAYERS.map(l => <button key={l.k} role="tab" aria-selected={layer === l.k} className={layer === l.k ? 'on' : ''} onClick={() => setLayer(l.k)}>{l.l}</button>)}
        </div>
        <p className="om-insight">{insight}</p>
      </div>
      <div className="om-body">
        <div className="map-wrap" onMouseLeave={() => setHover(null)}>
          <svg className="map-svg om-svg" viewBox={`0 0 ${usmap.width} ${usmap.height}`} role="img" aria-label={`U.S. map: ${layer}`}>
            <defs>
              <pattern id="omhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" fill="#F4F6F9" /><line x1="0" y1="0" x2="0" y2="6" stroke="#DCE1E8" strokeWidth="2" />
              </pattern>
            </defs>
            {usmap.states.map(s => (
              <path key={s.code} d={s.d} className={`st ${sel === s.code ? 'sel' : ''}`} fill={fill(s.code) ?? 'url(#omhatch)'}
                onMouseMove={e => { const r = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect(); setHover({ code: s.code, x: e.clientX - r.left, y: e.clientY - r.top }); }}
                onClick={() => setSel(s.code)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSel(s.code)} aria-label={`${stateByCode[s.code].name}: ${short(s.code)}`} />
            ))}
            {usmap.states.filter(s => s.area > 900).map(s => {
              const f = fill(s.code);
              return <text key={s.code} x={s.cx} y={s.cy} textAnchor="middle" dominantBaseline="middle" className={f && !LOW_TEXT.has(f) && (layer !== 'battery' || CLS_DARK.has(opp[s.code]?.cls)) ? 'inv' : ''}>{s.code}</text>;
            })}
            {(() => { const g = usmap.states.find(s => s.code === 'GA')!; return <g className="hq" transform={`translate(${g.cx},${g.cy + 14})`}><circle r="9" /><text textAnchor="middle" dominantBaseline="central">★</text></g>; })()}
          </svg>
          {hover && (
            <div className="tooltip" style={{ left: Math.min(hover.x + 14, 520), top: hover.y + 14 }}>
              <b>{stateByCode[hover.code].name}</b><div>{short(hover.code)}</div>
            </div>
          )}
          <div className="map-legend">
            {layer === 'battery' && (['A', 'B', 'C', 'D'] as const).map(c => <span key={c}><span className="sw" style={{ background: CLS_COLOR[c] }} />{executive.opportunity_rules.classes[c].label}</span>)}
            {layer === 'battery' && <span><span className="sw" style={{ background: '#EEF1F5' }} />No cell plant in DOE list</span>}
            {layer === 'datacenter' && DC_LABELS.map((l, i) => <span key={l}><span className="sw" style={{ background: RAMP[i] }} />{l}</span>)}
            {layer === 'competitors' && [1, 2, 3].map(n => <span key={n}><span className="sw" style={{ background: RAMP[Math.min(4, n + 1)] }} />{n}{n === 3 ? '+' : ''} competitor{n > 1 ? 's' : ''}</span>)}
            {layer !== 'battery' && <span><span className="sw hatch" />{layer === 'datacenter' ? 'Not in EPRI table' : 'Not Verified / Insufficient Evidence'}</span>}
            <span><span className="hq-key">★</span>ThermGAS HQ</span>
          </div>
        </div>

        <aside className="om-panel" aria-live="polite">
          <div className="om-state">{S.name}</div>
          <div className={`om-row ${layer === 'battery' ? 'on' : ''}`}>
            <span className="k">Battery</span>
            <span>{o ? <><span className={`cls-pill cls-${o.cls}`}>{executive.opportunity_rules.classes[o.cls].label}</span><br /><span className="small muted">{o.plants ? `${o.plants} cell plant${o.plants > 1 ? 's' : ''}, ${o.gwh} GWh announced` : 'DMC solvent plant'}</span></> : <span className="muted">No cell plant in DOE list</span>}</span>
          </div>
          <div className={`om-row ${layer === 'datacenter' ? 'on' : ''}`}>
            <span className="k">Data centers</span>
            <span>{dc ? <><b>{fmtTwh(dc.mwh_2023)}</b> <span className="muted">(#{dcRank(sel)} of 44)</span><br /><span className="small muted">{dc.pct_state_electricity_2023}% of state electricity, 2023</span> <Src ids={[dc.source]} /></> : <span className="nodata">Not in EPRI table</span>}</span>
          </div>
          <div className={`om-row ${layer === 'competitors' ? 'on' : ''}`}>
            <span className="k">Competitors</span>
            <span>{comps(sel).length ? comps(sel).join(', ') : <span className="nodata">Not Verified / Insufficient Evidence</span>}</span>
          </div>
          <div className="om-row">
            <span className="k">ThermGAS</span>
            <span>{S.thermgas_hq ? <>Headquarters <Badge status="Verified" /></> : o?.reach === 'adjacent' ? 'Borders home state' : <span className="muted">No foothold found</span>}</span>
          </div>
          {!compact && <button className="btn" onClick={() => go('map', { s: sel })}>Full evidence map →</button>}
        </aside>
      </div>
      <p className="om-foot">Battery classes: research priority, not revenue. Data center load: EPRI 2023 (a proxy for cooling demand, not a site count or market size) <Src ids={['S160']} />. Click a state for detail.</p>
    </div>
  );
}

function byCls(opp: Record<string, { cls: OppClass }>, c: OppClass) {
  return Object.keys(opp).filter(k => opp[k].cls === c).join(', ') || '-';
}
