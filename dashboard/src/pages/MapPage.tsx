import { useMemo, useState, type ReactNode } from 'react';
import usmap from '../data/usmap.json';
import { states, stateByCode, evidence, facilities, presence, shortName, dcByState, dcRank } from '../data';
import { Card, Src, Badge, PageHead } from '../ui';
import { scoreStates, DEFAULT_WEIGHTS } from '../model';
import { go } from '../App';

type Layer = 'presence' | 'service' | 'installations' | 'facilities' | 'datacenters' | 'opportunity';
const LAYERS: { k: Layer; l: string; d: string }[] = [
  { k: 'presence', l: 'Competitor presence', d: 'Number of competitors with an office, HQ, distributor or service site in the state' },
  { k: 'service', l: 'Service coverage', d: 'Competitor service locations (factory-authorized service / calibration centers)' },
  { k: 'installations', l: 'Installation references', d: 'Public installation references by competitors (and, optionally, ThermGAS refrigerant references)' },
  { k: 'facilities', l: 'Customer facilities', d: 'Announced Li-ion cell capacity (GWh) and DMC solvent plants' },
  { k: 'datacenters', l: 'Data centers', d: 'Data center electricity load in 2023, TWh (EPRI Table A1). A proxy for where data center cooling, and refrigerant monitoring demand, is concentrated. Not a site count or market size' },
  { k: 'opportunity', l: 'Market opportunity', d: 'Research-priority score from the transparent model (Strategy page). Not a revenue estimate' },
];
const RAMP = ['#DCE8FA', '#A9C6F2', '#6F9EE3', '#3A75CF', '#17489A'];
const DARK = new Set(['#3A75CF', '#17489A']);
const COUNT_LAYERS = new Set(['presence', 'service', 'installations']);
const ramp = (v: number, max: number, count: boolean) => v <= 0 ? null : count ? RAMP[Math.min(4, v)] : RAMP[Math.min(RAMP.length - 1, Math.floor((v / max) * (RAMP.length - 0.001)))];

export default function MapPage({ params }: { params: URLSearchParams }) {
  const [layer, setLayer] = useState<Layer>((params.get('layer') as Layer) || 'presence');
  const [inferred, setInferred] = useState(false);
  const [tgRefs, setTgRefs] = useState(false);
  const [sel, setSel] = useState<string>(params.get('s') ?? 'GA');
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const [table, setTable] = useState(false);
  const scored = useMemo(() => Object.fromEntries(scoreStates(DEFAULT_WEIGHTS, true).map(s => [s.row.code, s])), []);

  const val = (code: string): { v: number; label: string; srcs: string[] } => {
    const s = stateByCode[code];
    if (layer === 'presence') {
      const p = presence(code, inferred);
      const comps = [...new Set(p.map(e => e.company))];
      return { v: comps.length, label: comps.length ? comps.map(shortName).join(', ') : '', srcs: [...new Set(p.map(e => e.source))] };
    }
    if (layer === 'service') {
      const p = evidence.filter(e => e.state === code && e.metric === 'service' && (inferred || e.status === 'Verified'));
      return { v: p.length, label: p.map(e => `${shortName(e.company)}: ${e.value}`).join('; '), srcs: p.map(e => e.source) };
    }
    if (layer === 'installations') {
      const p = evidence.filter(e => e.state === code && e.metric === 'installation' && (e.company !== 'thermgas' || tgRefs) && (inferred || e.status === 'Verified' || (tgRefs && e.company === 'thermgas')));
      return { v: p.length, label: p.map(e => `${shortName(e.company)}: ${e.value}`).join('; '), srcs: p.map(e => e.source) };
    }
    if (layer === 'facilities') {
      const f = facilities.filter(x => x.state === code);
      const v = s.battery_cell_gwh + (s.dmc_solvent_plants ? 1 : 0);
      return { v, label: f.length ? `${s.battery_cell_gwh} GWh in ${s.battery_cell_plants} cell plant(s)${s.dmc_solvent_plants ? ' + DMC solvent plant' : ''}` : '', srcs: [...new Set(f.flatMap(x => [x.source, x.status_update_source ?? '']).filter(Boolean))] };
    }
    if (layer === 'datacenters') {
      const r = dcByState[code];
      return r ? { v: +(r.mwh_2023 / 1e6).toFixed(1), label: `${(r.mwh_2023 / 1e6).toFixed(1)} TWh data center load in 2023 (${r.pct_state_electricity_2023}% of state electricity) · rank ${dcRank(code)} of 44`, srcs: [r.source] } : { v: 0, label: '', srcs: [] };
    }
    const sc = scored[code];
    return { v: sc.score ?? 0, label: sc.score === null ? '' : `Priority score ${sc.score} / 100`, srcs: ['S130'] };
  };
  const max = Math.max(1, ...states.map(s => val(s.code).v));
  const fill = (code: string) => {
    const { v } = val(code);
    if (layer === 'facilities') { const s = stateByCode[code]; if (s.dmc_solvent_plants && !s.battery_cell_gwh) return RAMP[1]; return ramp(s.battery_cell_gwh, Math.max(...states.map(x => x.battery_cell_gwh)), false); }
    if (layer === 'datacenters') return v > 0 ? RAMP[DC_BINS.filter(b => v >= b).length] : null;
    if (layer === 'opportunity') return scored[code].score === null ? null : ramp(Math.max(v, 0.01), max, false);
    return ramp(v, max, COUNT_LAYERS.has(layer));
  };
  const hv = hover ? val(hover.code) : null;
  const S = stateByCode[sel];
  const sc = scored[sel];

  return (
    <div className="stack">
      <PageHead kicker="U.S. Competitive Landscape" title="Where competitors are present, and where the battery customers are"
        lead={<>Offices, distributors, service sites, installations and customer facilities are <b>separate metrics and never added together</b>. A national sales claim does not count as local presence. Hatched states mean <b>Not Verified / Insufficient Evidence</b>, not "no competition".</>} />

      <div className="toolbar">
        <div className="seg" role="group" aria-label="Map layer">
          {LAYERS.map(l => <button key={l.k} className={layer === l.k ? 'on' : ''} onClick={() => setLayer(l.k)}>{l.l}</button>)}
        </div>
        <label className="small" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={inferred} onChange={e => setInferred(e.target.checked)} /> include Inferred evidence</label>
        {layer === 'installations' && <label className="small" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={tgRefs} onChange={e => setTgRefs(e.target.checked)} /> show ThermGAS refrigerant references</label>}
        <button className="btn" onClick={() => setTable(t => !t)}>{table ? 'Map view' : 'Table view'}</button>
      </div>
      <p className="small muted" style={{ marginTop: -6 }}>{LAYERS.find(l => l.k === layer)!.d}.</p>

      <div className="grid g-main">
        <Card>
          {!table ? (
            <div className="map-wrap" onMouseLeave={() => setHover(null)}>
              <svg className="map-svg" viewBox={`0 0 ${usmap.width} ${usmap.height}`} role="img" aria-label={`U.S. map: ${layer}`}>
                <defs>
                  <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill="#F1F3F6" /><line x1="0" y1="0" x2="0" y2="6" stroke="#D3D8E0" strokeWidth="2" />
                  </pattern>
                </defs>
                {usmap.states.map(s => {
                  const f = fill(s.code);
                  return (
                    <path key={s.code} d={s.d} className={`st ${sel === s.code ? 'sel' : ''}`} fill={f ?? 'url(#hatch)'}
                      onMouseMove={e => { const r = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect(); setHover({ code: s.code, x: e.clientX - r.left, y: e.clientY - r.top }); }}
                      onClick={() => setSel(s.code)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSel(s.code)} aria-label={stateByCode[s.code].name} />
                  );
                })}
                {usmap.states.filter(s => s.area > 900).map(s => {
                  const f = fill(s.code);
                  const v = val(s.code).v;
                  const txt = layer === 'facilities' ? (stateByCode[s.code].battery_cell_gwh ? `${s.code} ${stateByCode[s.code].battery_cell_gwh}` : (stateByCode[s.code].dmc_solvent_plants ? `${s.code} DMC` : s.code)) : (v ? `${s.code} ${v}` : s.code);
                  return <text key={s.code} x={s.cx} y={s.cy} textAnchor="middle" dominantBaseline="middle" className={f && DARK.has(f) ? 'inv' : ''}>{txt}</text>;
                })}
              </svg>
              {hover && hv && (
                <div className="tooltip" style={{ left: Math.min(hover.x + 14, 640), top: hover.y + 14 }}>
                  <b>{stateByCode[hover.code].name}</b>
                  <div>{hv.label || <span className="nodata">Not Verified / Insufficient Evidence</span>}</div>
                  {hv.srcs.length > 0 && <div className="muted small" style={{ marginTop: 4 }}>Sources: {hv.srcs.join(', ')}</div>}
                  <div className="muted small">Click for details</div>
                </div>
              )}
              <div className="map-legend">
                <span><span className="sw" style={{ background: 'url(#hatch)', backgroundImage: 'repeating-linear-gradient(45deg,#F1F3F6 0 3px,#D3D8E0 3px 5px)' }} />Not Verified / Insufficient Evidence</span>
                {legendItems(layer, max).map(([c, l]) => <span key={c + l}><span className="sw" style={{ background: c }} />{l}</span>)}
              </div>
            </div>
          ) : (
            <StateTable val={val} onPick={setSel} />
          )}
        </Card>

        <Card title={S.name} sub={S.evidence_status} right={<button className="btn" onClick={() => go('strategy')}>Priority model →</button>}>
          <Section title="Competitor HQ / offices">
            <EvList rows={evidence.filter(e => e.state === sel && e.company !== 'thermgas' && ['hq', 'office'].includes(e.metric))} />
          </Section>
          <Section title="Authorized distributors">
            <EvList rows={evidence.filter(e => e.state === sel && e.metric === 'distributor')} />
          </Section>
          <Section title="Local service locations">
            <EvList rows={evidence.filter(e => e.state === sel && e.metric === 'service')} />
          </Section>
          <Section title="Verified installations / customer references">
            <EvList rows={evidence.filter(e => e.state === sel && e.company !== 'thermgas' && ['installation', 'customer_reference'].includes(e.metric))} />
          </Section>
          <Section title="State-specific regulatory notes">
            <EvList rows={evidence.filter(e => e.state === sel && e.metric === 'regulatory')} />
          </Section>
          <Section title="Battery & DMC facilities (potential customers)">
            {facilities.filter(f => f.state === sel).length === 0 ? <p className="nodata">None in the DOE FCAB list or this research.</p> :
              facilities.filter(f => f.state === sel).map((f, i) => (
                <div key={i} className="ev">
                  <span><b>{f.operator}</b>, {f.city} · {f.capacity_gwh ? `${f.capacity_gwh} GWh` : f.capacity_note} · {f.status_in_source}
                    {f.status_update && <div className="small" style={{ color: 'var(--ink-strong)' }}>Update: {f.status_update} <Badge status={f.status_update_status} /></div>}</span>
                  <Src ids={[f.source, f.status_update_source ?? ''].filter(Boolean)} />
                </div>
              ))}
          </Section>
          <Section title="Data center load (adjacent refrigerant opportunity)">
            {dcByState[sel]
              ? <div className="ev"><span><b>{(dcByState[sel].mwh_2023 / 1e6).toFixed(1)} TWh</b> in 2023 · {dcByState[sel].pct_state_electricity_2023}% of state electricity · rank {dcRank(sel)} of 44</span><span style={{ display: 'flex', gap: 4, flex: 'none' }}><Badge status="Verified" /><Src ids={['S160']} label="S160" /></span></div>
              : <p className="nodata">Not in EPRI table (Not Verified / Insufficient Evidence)</p>}
          </Section>
          <Section title="ThermGAS footprint">
            {S.thermgas_hq && <div className="ev"><span><b>ThermGAS headquarters & manufacturing</b> (Roswell, GA)</span><Src ids={['S06']} /></div>}
            {S.thermgas_refrigerant_references.length > 0 && <div className="ev"><span>Refrigerant-monitor references (company claim): {S.thermgas_refrigerant_references.join('; ')} <Badge status="Inferred" /></span><Src ids={['S07']} /></div>}
            {!S.thermgas_hq && S.thermgas_refrigerant_references.length === 0 && <p className="nodata">No ThermGAS evidence in this state.</p>}
          </Section>
          <Section title="Opportunity (research priority)">
            {sc.score === null ? <p className="nodata">Not scored: no verified battery or DMC facility.</p> :
              <p style={{ margin: 0 }}><b className="mono" style={{ fontSize: 22, color: 'var(--ink-strong)' }}>{sc.score}</b> / 100 · inputs: {sc.inputs.C} GWh, {sc.inputs.P} plant(s), {sc.inputs.O} verified operating/ramping, DMC plant {sc.inputs.D ? 'yes' : 'no'}, ThermGAS foothold {sc.inputs.F}, competitors present {sc.inputs.K}</p>}
          </Section>
        </Card>
      </div>
    </div>
  );
}

const DC_BINS = [1, 3, 6, 10];   // TWh bin edges; the distribution is very skewed (VA alone is ~34 TWh)
function legendItems(layer: Layer, max: number): [string, string][] {
  if (layer === 'datacenters') return ['< 1 TWh', '1-3 TWh', '3-6 TWh', '6-10 TWh', '10+ TWh'].map((l, i) => [RAMP[i], l] as [string, string]);
  if (COUNT_LAYERS.has(layer)) return [1, 2, 3, 4].filter(n => n <= Math.max(1, max)).map(n => [RAMP[n], n === 4 ? '4+' : String(n)]);
  const gmax = layer === 'facilities' ? Math.max(...states.map(x => x.battery_cell_gwh)) : max;
  const unit = layer === 'facilities' ? ' GWh' : '';
  return RAMP.map((c, i) => [c, `${Math.round((i / 5) * gmax)}–${Math.round(((i + 1) / 5) * gmax)}${unit}`] as [string, string]);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <div className="panel-sec"><h4>{title}</h4>{children}</div>;
}
function EvList({ rows }: { rows: typeof evidence }) {
  if (!rows.length) return <p className="nodata">Not Verified / Insufficient Evidence</p>;
  return <>{rows.map((e, i) => (
    <div key={i} className="ev"><span><b>{shortName(e.company)}</b>: {e.value}{e.notes && <div className="small muted">{e.notes}</div>}</span><span style={{ display: 'flex', gap: 4, flex: 'none' }}><Badge status={e.status} /><Src ids={[e.source]} label={e.source} /></span></div>
  ))}</>;
}
function StateTable({ val, onPick }: { val: (c: string) => { v: number; label: string; srcs: string[] }; onPick: (c: string) => void }) {
  const rows = [...states].sort((a, b) => val(b.code).v - val(a.code).v || a.name.localeCompare(b.name));
  return (
    <div className="table-wrap" style={{ maxHeight: 560 }}>
      <table className="t">
        <thead><tr><th>State</th><th>Value</th><th>Detail</th><th>Sources</th></tr></thead>
        <tbody>{rows.map(s => { const x = val(s.code); return (
          <tr key={s.code} onClick={() => onPick(s.code)} style={{ cursor: 'pointer' }}>
            <td><b>{s.name}</b></td><td className="mono">{x.v || '-'}</td><td>{x.label || <span className="nodata">Not Verified / Insufficient Evidence</span>}</td><td className="small">{x.srcs.join(', ')}</td>
          </tr>); })}</tbody>
      </table>
    </div>
  );
}
