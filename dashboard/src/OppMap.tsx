import { useMemo, useState } from 'react';
import usmap from './data/usmap.json';
import { stateByCode, presence, shortName, dcByState, dcRank, dataCenters, executive, dcBuildByState, semiByState, pharmaByState, growthLayer } from './data';
import { opportunities, type OppClass } from './exec';
import { Src, Badge } from './ui';
import { go } from './App';

export type MapLayer = 'battery' | 'datacenter' | 'competitors' | 'semis' | 'pharma';
export type DcMetric = 'load' | 'build';
const BASE_LAYERS: { k: MapLayer; l: string }[] = [
  { k: 'battery', l: 'Battery plants' },
  { k: 'datacenter', l: 'Data centers' },
  { k: 'competitors', l: 'Competitors' },
];
/** Growth-market layers: shown only where a page asks for them (Market Opportunities, Growth Markets). */
const GROWTH_LAYERS: { k: MapLayer; l: string }[] = [
  { k: 'semis', l: 'Semiconductor fabs' },
  { k: 'pharma', l: 'Pharma priority' },
];
const CLS_COLOR: Record<OppClass, string> = { A: '#1E7A45', B: '#1F60C4', C: '#E3B04B', D: '#A23B72' };
const CLS_DARK = new Set(['A', 'B', 'D']);
const RAMP = ['#DCE8FA', '#A9C6F2', '#6F9EE3', '#3A75CF', '#17489A'];
const DC_BINS = [1e6, 3e6, 6e6, 10e6];           // MWh/y bin edges
const DC_LABELS = ['< 1 TWh', '1-3 TWh', '3-6 TWh', '6-10 TWh', '10+ TWh'];
const dcBin = (mwh: number) => DC_BINS.filter(b => mwh >= b).length;
const fmtTwh = (mwh: number) => `${(mwh / 1e6).toFixed(mwh >= 1e7 ? 0 : 1)} TWh`;
const BUILD_BINS = [2500];                       // MW under construction (CBRE metro figures)
const BUILD_LABELS = ['2,000-2,500 MW', '2,500+ MW'];
const buildFill = (mw: number) => RAMP[3 + BUILD_BINS.filter(b => mw >= b).length];
const fmtMw = (mw: number) => `${mw.toLocaleString('en-US')} MW`;
const FAB_BINS = [2, 6, 10];                     // EPA-reporting facilities: 1, 2-5, 6-9, 10+
const FAB_LABELS = ['1 facility', '2-5 facilities', '6-9 facilities', '10+ facilities'];
const fabFill = (n: number) => RAMP[1 + FAB_BINS.filter(b => n >= b).length];
/** Ordinal, not quantitative: a different hue so a rank is never read as a size. Priority 1 is darkest. */
const PRIORITY = ['#0B6E78', '#2F8F98', '#5FADB4', '#93CACE', '#C6E4E6'];
const LOW_TEXT = new Set(['#DCE8FA', '#A9C6F2', '#E3B04B', '#EEF1F5', '#93CACE', '#C6E4E6']);

export default function OppMap({ initial = 'battery', compact = false, initialDcMetric = 'load', growthLayers = false }: { initial?: MapLayer; compact?: boolean; initialDcMetric?: DcMetric; growthLayers?: boolean }) {
  const layers = growthLayers ? [...BASE_LAYERS, ...GROWTH_LAYERS] : BASE_LAYERS;
  const [layer, setLayer] = useState<MapLayer>(initial);
  const [dcMetric, setDcMetric] = useState<DcMetric>(initialDcMetric);
  const build = layer === 'datacenter' && dcMetric === 'build';
  const [sel, setSel] = useState('GA');
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const opp = useMemo(() => Object.fromEntries(opportunities().map(o => [o.code, o])), []);
  const comps = (c: string) => [...new Set(presence(c, true).map(e => shortName(e.company)))];
  const dcL = growthLayer('datacenters'); const semiL = growthLayer('semiconductors'); const pharmaL = growthLayer('pharma');

  const fill = (c: string): string | null => {
    if (layer === 'battery') return opp[c] ? CLS_COLOR[opp[c].cls] : '#EEF1F5';
    if (build) return dcBuildByState[c] ? buildFill(dcBuildByState[c].value) : null;
    if (layer === 'datacenter') return dcByState[c] ? RAMP[dcBin(dcByState[c].mwh_2023)] : null;
    if (layer === 'semis') return semiByState[c] ? fabFill(semiByState[c].value) : null;
    if (layer === 'pharma') return pharmaByState[c] ? PRIORITY[pharmaByState[c].value - 1] : null;
    const n = comps(c).length; return n ? RAMP[Math.min(4, n + 1)] : null;
  };
  const short = (c: string) => {
    if (layer === 'battery') return opp[c] ? executive.opportunity_rules.classes[opp[c].cls].label : 'No cell plant in DOE list';
    if (build) return dcBuildByState[c] ? `${dcBuildByState[c].label} under construction, H1 2026` : 'Not available';
    if (layer === 'datacenter') return dcByState[c] ? `${fmtTwh(dcByState[c].mwh_2023)} in 2023 · #${dcRank(c)} of 44` : 'Not in EPRI table';
    if (layer === 'semis') return semiByState[c] ? `${semiByState[c].label} to EPA, 2023` : 'Not available';
    if (layer === 'pharma') return pharmaByState[c] ? `${pharmaByState[c].label} (team ranking, not size)` : 'Not ranked';
    const n = comps(c); return n.length ? n.join(', ') : 'Not Verified / Insufficient Evidence';
  };
  const rowsBy = (rows: { state: string; value: number }[], asc = false) => [...rows].sort((a, b) => asc ? a.value - b.value : b.value - a.value).map(r => r.state).join(', ');
  const insight = {
    battery: <>Engage now: <b>{byCls(opp, 'A')}</b> · Prepare: <b>{byCls(opp, 'B')}</b> · Separate segment: <b>{byCls(opp, 'D')}</b></>,
    datacenter: build ? <>Under construction, H1 2026: <b>Atlanta {fmtMw(dcBuildByState.GA?.value ?? 0)}</b>, first in North America · <b>Northern Virginia {fmtMw(dcBuildByState.VA?.value ?? 0)}</b>. Other states: not available in our sources.</> : <>Largest 2023 load: <b>{[...dataCenters.rows].sort((a, b) => b.mwh_2023 - a.mwh_2023).slice(0, 5).map(r => r.state).join(', ')}</b> · ThermGAS home state GA ranks <b>#{dcRank('GA')}</b></>,
    competitors: <>Verified channels cluster in <b>CA, TX and the Northeast</b>. Most battery states show no verified local channel (not the same as no competition).</>,
    semis: <>EPA-reporting facilities, 2023: <b>{semiL?.rows.map(r => `${r.state} ${r.value}`).join(' · ')}</b>. Other states: not available in our sources. None is near Georgia.</>,
    pharma: <>Team priority: <b>{rowsBy(pharmaL?.rows ?? [], true)}</b>. A ranking of where to start, not a measure of market size.</>,
  }[layer];
  const S = stateByCode[sel]; const o = opp[sel]; const dc = dcByState[sel];

  return (
    <div className={`oppmap ${compact ? 'compact' : ''}`}>
      <div className="om-top">
        <div className="seg" role="tablist" aria-label="Map layer">
          {layers.map(l => <button key={l.k} role="tab" aria-selected={layer === l.k} className={layer === l.k ? 'on' : ''} onClick={() => setLayer(l.k)}>{l.l}</button>)}
        </div>
        {layer === 'datacenter' && (
          <div className="seg seg-sub" role="tablist" aria-label="Data center measure">
            <button role="tab" aria-selected={!build} className={!build ? 'on' : ''} onClick={() => setDcMetric('load')}>2023 load</button>
            <button role="tab" aria-selected={build} className={build ? 'on' : ''} onClick={() => setDcMetric('build')}>Under construction</button>
          </div>
        )}
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
            {build && BUILD_LABELS.map((l, i) => <span key={l}><span className="sw" style={{ background: RAMP[3 + i] }} />{l}</span>)}
            {layer === 'datacenter' && !build && DC_LABELS.map((l, i) => <span key={l}><span className="sw" style={{ background: RAMP[i] }} />{l}</span>)}
            {layer === 'semis' && FAB_LABELS.map((l, i) => <span key={l}><span className="sw" style={{ background: RAMP[1 + i] }} />{l}</span>)}
            {layer === 'pharma' && PRIORITY.map((c, i) => <span key={c}><span className="sw" style={{ background: c }} />{i === 0 ? 'Priority 1 (first)' : `Priority ${i + 1}`}</span>)}
            {layer === 'competitors' && [1, 2, 3].map(n => <span key={n}><span className="sw" style={{ background: RAMP[Math.min(4, n + 1)] }} />{n}{n === 3 ? '+' : ''} competitor{n > 1 ? 's' : ''}</span>)}
            {layer !== 'battery' && <span><span className="sw hatch" />{layer === 'pharma' ? 'Not ranked' : build || layer === 'semis' ? 'Not available' : layer === 'datacenter' ? 'Not in EPRI table' : 'Not Verified / Insufficient Evidence'}</span>}
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
            <span>{dc ? <><b>{fmtTwh(dc.mwh_2023)}</b> <span className="muted">(#{dcRank(sel)} of 44)</span><br /><span className="small muted">{dc.pct_state_electricity_2023}% of state electricity, 2023</span> <Src ids={[dc.source]} /></> : <span className="nodata">Not in EPRI table</span>}
              {dcBuildByState[sel] && <><br /><b>{fmtMw(dcBuildByState[sel].value)}</b> <span className="small muted">under construction ({dcBuildByState[sel].label.split(':')[0]}), H1 2026</span> <Src ids={dcL?.sources} /></>}</span>
          </div>
          {growthLayers && (
            <div className={`om-row ${layer === 'semis' ? 'on' : ''}`}>
              <span className="k">Facilities</span>
              <span>{semiByState[sel] ? <><b>{semiByState[sel].label}</b> <span className="small muted">to EPA, 2023</span> <Badge status={semiL?.status} /> <Src ids={semiL?.sources} /></> : <span className="nodata">Not available</span>}</span>
            </div>
          )}
          {growthLayers && (
            <div className={`om-row ${layer === 'pharma' ? 'on' : ''}`}>
              <span className="k">Pharma</span>
              <span>{pharmaByState[sel] ? <><b>{pharmaByState[sel].label}</b> <span className="small muted">team ranking</span> <Badge status={pharmaL?.status} /></> : <span className="nodata">Not ranked</span>}</span>
            </div>
          )}
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
      <p className="om-foot">
        Battery classes: research priority, not revenue. Data center load: EPRI 2023 (a proxy for cooling demand, not a site count or market size) <Src ids={['S160']} />.
        {build && <> Under construction: CBRE H1 2026, metro figures shown under their state <Src ids={dcL?.sources} />.</>}
        {layer === 'semis' && <> Fabs: {semiL?.note} <Src ids={semiL?.sources} /></>}
        {layer === 'pharma' && <> Pharma: {pharmaL?.note}</>}
        {growthLayers && ' Each layer is a different measure; they are never added together.'} Click a state for detail.
      </p>
    </div>
  );
}

function byCls(opp: Record<string, { cls: OppClass }>, c: OppClass) {
  return Object.keys(opp).filter(k => opp[k].cls === c).join(', ') || '-';
}
