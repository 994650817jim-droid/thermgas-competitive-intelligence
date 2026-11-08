import { Fragment, useMemo, useState } from 'react';
import { analysis, productById, shortName, stateByCode } from '../data';
import { Card, Src, Badge, PageHead } from '../ui';
import ThreatMatrix from '../ThreatMatrix';
import { threatLevel, scoreStates, DEFAULT_WEIGHTS, type Weights } from '../model';
import { Bars } from './Overview';
import { go } from '../App';

const DIFF = [
  { f: 'Detection performance', tg: 'PAIR; vendor claims 0.5 ppm (web) / 1 ppm (app note) for DMC; conflict unresolved', tgS: ['S01', 'S02'], comp: 'FALCO 2 11.7: 0.1 ppm isobutylene-equivalent, DMC RF 1.50; Riken: no DMC limit published', compS: ['S20', 'S22', 'S52'], v: 'Not comparable yet: needs a DMC test under matched conditions', st: 'Unknown' },
  { f: 'Selectivity', tg: 'Wavelength-selective IR targets DMC absorption (vendor); no interference data', tgS: ['S02'], comp: 'PID responds to all compounds below lamp energy (IPA, ethanol, methanol); hot-wire sensors respond to all combustibles', compS: ['S22', 'S52'], v: 'Likely ThermGAS advantage in principle; prove with interference tests', st: 'Inferred' },
  { f: 'Application specialization', tg: 'DMC application note for storage, mixing, transfer, filling, formation/aging', tgS: ['S02'], comp: 'ION lists Li-ion manufacturing; Riken has a full battery-process portfolio and >10,000 units at Li-ion plants', compS: ['S22', 'S52'], v: 'Riken leads on breadth and installed base', st: 'Verified' },
  { f: 'Reliability / maintenance', tg: 'No UV lamp or depletable sensor; draw pump typically 5-6 years', tgS: ['S02', 'S09'], comp: '11.7 eV lamp lasts up to 4 months (3-month warranty); TVOC 2 annual factory service; Li-ion Tamer calibration-free, >10 yr', compS: ['S22', 'S25', 'S21', 'S37'], v: 'ThermGAS advantage vs 11.7 eV PID; parity or worse vs Li-ion Tamer', st: 'Verified' },
  { f: 'System integration', tg: 'Up to 24 points/3 gases per Haloguard IR; relays, 4-20 mA, BACnet', tgS: ['S04', 'S09'], comp: 'FALCO: 4-20 mA, relays, Modbus; Li-ion Tamer: 100 sensors/controller, Modbus TCP; Chillgard: BACnet + Modbus', compS: ['S22', 'S37', 'S100'], v: 'Comparable; ThermGAS multi-point is a coverage advantage per analyzer', st: 'Verified' },
  { f: 'Hazardous-area suitability', tg: 'No Ex/Class I rating found in ThermGAS documents', tgS: ['S03', 'S04'], comp: 'FALCO 2 11.7 UL Class I Zone 1, ATEX, IECEx; Riken explosion-proof designs', compS: ['S22', 'S52'], v: 'Competitor advantage until ThermGAS documents its approach', st: 'Inferred' },
  { f: 'Customer support / proximity', tg: 'U.S. manufacturer in GA; positions on responsive service (company claim)', tgS: ['S06', 'S05'], comp: 'ION U.S. office TX + 10-state distributors; RKI CA + PK Safety service', compS: ['S23', 'S51', 'S53'], v: 'Southeast proximity plausible advantage; unproven', st: 'Inferred' },
  { f: 'Total cost of ownership', tg: 'Price Not Publicly Available', tgS: [], comp: 'FALCO 2 11.7 $3,521 list; RAEGuard 2 from $3,740; lamp price not public', compS: ['S24', 'S35'], v: 'Cannot be computed honestly yet; get quotes (R4)', st: 'Unknown' },
];

const W_LABEL: Record<keyof Weights, string> = { capacity: 'Cell capacity (GWh)', plants: 'Number of cell plants', operating: 'Verified operating / ramping', dmc_plant: 'DMC solvent plant', foothold: 'ThermGAS foothold', competitor_presence: 'Competitor presence (penalty)' };

export default function Strategy() {
  const [w, setW] = useState<Weights>({ ...DEFAULT_WEIGHTS });
  const [inf, setInf] = useState(true);
  const scored = useMemo(() => scoreStates(w, inf), [w, inf]);
  const ranked = scored.filter(s => s.score !== null).sort((a, b) => (b.score! - a.score!) || a.row.name.localeCompare(b.row.name));
  const sw = analysis.swot;
  return (
    <div className="stack">
      <PageHead kicker="Strategic Positioning" title="How can ThermGAS compete more effectively?"
        lead="SWOT, competitor threats, differentiation and state priorities. Each recommendation states its business case, its limitation and the next step to validate it." />

      <Card title="Recommended positioning">
        <p style={{ fontSize: 18, color: 'var(--ink-strong)', margin: 0, fontFamily: 'Poppins, sans-serif', lineHeight: 1.45 }}>
          "For battery-plant EHS and process engineers who need to <span style={{ color: 'var(--brand)' }}>know how much DMC is in electrolyte-handling and filling rooms</span>, ThermGAS provides a
          <span style={{ color: 'var(--brand)' }}> DMC-specific, multi-point photoacoustic IR monitor with no UV lamp to replace</span>. Unlike PID point detectors, it does not react to every solvent in the room,
          and it <span style={{ color: 'var(--brand)' }}>complements</span>, rather than replaces, off-gas event detection."
        </p>
        <p className="small muted" style={{ marginBottom: 0 }}>Conditional on R1 (published DMC spec + interference data) and R3 (hazardous-area answer). Built from F1-F4.</p>
      </Card>

      <h2 style={{ fontSize: 22 }}>SWOT</h2>
      <div className="swot">
        {([['strengths', 'Strengths', 'q-s'], ['weaknesses', 'Weaknesses', 'q-w'], ['opportunities', 'Opportunities', 'q-o'], ['threats', 'Threats', 'q-t']] as const).map(([k, t, cls]) => (
          <div key={k} className={`q ${cls}`}>
            <h4>{t}</h4>
            <ul className="bc-list">{sw[k].map((x: any, i: number) => <li key={i}>{x.text}<div className="m"><Badge status={x.status} full /><Src ids={x.sources} /></div></li>)}</ul>
          </div>
        ))}
      </div>

      <div className="grid g-main">
        <Card title="Competitor threat matrix" sub="Placement follows explicit rules; no numeric threat index is claimed">
          <ThreatMatrix compact />
        </Card>
        <Card title="Threat rules">
          <dl className="kv" style={{ gridTemplateColumns: '120px 1fr' }}>
            {Object.entries(analysis.threat_rules.dimensions.task_overlap).map(([k, v]) => <Fragment key={`t${k}`}><dt>Task {k}</dt><dd>{v as string}</dd></Fragment>)}
            {Object.entries(analysis.threat_rules.dimensions.battery_gtm).map(([k, v]) => <Fragment key={`g${k}`}><dt>GTM {k}</dt><dd>{v as string}</dd></Fragment>)}
          </dl>
          <p className="small muted">High×High = High · High×Medium or Medium×High = Elevated · other combinations with a High or two Mediums = Moderate · otherwise Low.</p>
        </Card>
      </div>

      <Card title="Threat assessment by product">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Product</th><th>Task overlap</th><th>Battery GTM</th><th>Threat</th><th>Why</th><th>Sources</th></tr></thead>
            <tbody>
              {[...analysis.threats].sort((a: any, b: any) => ['High', 'Elevated', 'Moderate', 'Low'].indexOf(threatLevel(a.task_overlap, a.battery_gtm)) - ['High', 'Elevated', 'Moderate', 'Low'].indexOf(threatLevel(b.task_overlap, b.battery_gtm))).map((t: any) => {
                const lvl = threatLevel(t.task_overlap, t.battery_gtm);
                const p = productById[t.product];
                return (
                  <tr key={t.product} style={{ cursor: 'pointer' }} onClick={() => go('battlecard', { p: t.product })}>
                    <td><b>{shortName(p.company)}</b><br />{p.model}</td><td>{t.task_overlap}</td><td>{t.battery_gtm}</td>
                    <td><span className={`threat threat-${lvl}`}>{lvl}</span></td><td>{t.why}</td><td><Src ids={t.sources} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Differentiation: where ThermGAS can and cannot claim an edge" sub="Verdicts are only as strong as their evidence label">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Factor</th><th>ThermGAS evidence</th><th>Competitor evidence</th><th>Verdict</th></tr></thead>
            <tbody>{DIFF.map(d => (
              <tr key={d.f}>
                <td><b>{d.f}</b></td>
                <td>{d.tg} <Src ids={d.tgS} /></td>
                <td>{d.comp} <Src ids={d.compS} /></td>
                <td>{d.v}<div style={{ marginTop: 4 }}><Badge status={d.st} /></div></td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </Card>

      <h2 style={{ fontSize: 22 }}>State priority analysis</h2>
      <div className="grid g2">
        <Card title="Transparent priority model" sub={analysis.state_priority_model.description}>
          {(Object.keys(W_LABEL) as (keyof Weights)[]).map(k => (
            <div key={k} className="slider-row">
              <label htmlFor={`w-${k}`}>{W_LABEL[k]}</label>
              <input id={`w-${k}`} type="range" min={0} max={50} value={w[k]} onChange={e => setW({ ...w, [k]: +e.target.value })} />
              <span className="mono">{w[k]}</span>
            </div>
          ))}
          <div className="toolbar" style={{ marginTop: 8 }}>
            <button className="btn" onClick={() => setW({ ...DEFAULT_WEIGHTS })}>Reset weights</button>
            <label className="small" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={inf} onChange={e => setInf(e.target.checked)} /> count Inferred competitor presence</label>
          </div>
          <div className="callout small"><b>Formula:</b> {analysis.state_priority_model.formula}</div>
          <dl className="kv small" style={{ marginTop: 10 }}>
            {Object.entries(analysis.state_priority_model.inputs).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v as string}</dd></Fragment>)}
          </dl>
        </Card>
        <Card title="Research-priority ranking" sub={`${ranked.length} states scored · ${51 - ranked.length} not scored (no verified facility)`}>
          <Bars rows={ranked.map(s => ({ key: s.row.code, label: s.row.name, value: s.score!, title: `${s.inputs.C} GWh · ${s.inputs.P} plants · operating ${s.inputs.O} · DMC ${s.inputs.D} · foothold ${s.inputs.F} · competitors ${s.inputs.K}` }))} onClick={k => go('map', { s: k, layer: 'opportunity' })} />
          <p className="small muted" style={{ marginBottom: 0 }}>A prioritisation aid for <b>where to research next</b>, not a revenue or market-size estimate. Capacity is announced nominal GWh (DOE FCAB, June 2023 data).</p>
        </Card>
      </div>

      <h3 style={{ fontSize: 18 }}>Priority states for customer development</h3>
      <div className="grid g3">
        {analysis.priority_states.map((p: any) => (
          <Card key={p.code} title={`${stateByCode[p.code].name} (${p.code})`} sub={(() => { const i = ranked.findIndex(r => r.row.code === p.code); return i < 0 ? 'Not scored by model' : `Model score ${ranked[i].score} · rank ${i + 1} of ${ranked.length} (current weights)`; })()} right={<Src ids={p.evidence} />}>
            <dl className="kv" style={{ gridTemplateColumns: '96px 1fr' }}>
              <dt>Why</dt><dd>{p.why}</dd>
              <dt>Competitors</dt><dd>{p.competitors}</dd>
              <dt>Customers</dt><dd>{p.customers}</dd>
              <dt>Risks</dt><dd>{p.risks}</dd>
              <dt>Next step</dt><dd><b>{p.next}</b></dd>
            </dl>
          </Card>
        ))}
        <Card title="Watch list" sub="Large capacity, but status or evidence too uncertain">
          {analysis.watch_states.map((x: any) => <div key={x.code} className="ev"><span><b>{x.code}</b>: {x.note}</span></div>)}
        </Card>
      </div>

      <Card title="Strategic recommendations" sub="Ordered by priority. Each includes business case, limitation and validation step">
        {analysis.recommendations.map((r: any) => (
          <div key={r.id} className="rec">
            <div className="num">{r.priority}</div>
            <div>
              <h4>{r.title}</h4>
              <dl>
                <dt>Action</dt><dd>{r.action}</dd>
                <dt>Business case</dt><dd>{r.business_case} <Src ids={r.evidence} /></dd>
                <dt>Limitation</dt><dd>{r.limitation}</dd>
                <dt>Next step</dt><dd><b>{r.next_step}</b></dd>
              </dl>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
