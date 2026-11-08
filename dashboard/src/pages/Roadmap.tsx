import { useEffect, useState } from 'react';
import { executive } from '../data';
import { Card, Src, Badge, PageHead } from '../ui';
import { comparator } from '../exec';
import { ProposalNote } from './Executive';

const RM = executive.roadmap;
const BC = executive.business_case;
type Tab = 'roadmap' | 'business';

function RoadmapTab() {
  return (
    <div className="stack">
      <ProposalNote>{RM.status_note} Gate thresholds are assumptions for management to confirm or change.</ProposalNote>
      <div className="phases">
        {RM.phases.map((p: any) => (
          <section key={p.id} className="phase card">
            <header><div className="days">{p.days}</div><h3>{p.name}</h3></header>
            <ul className="tasks">
              {p.items.map((it: any, i: number) => (
                <li key={i}>
                  <div><b>{it.task}</b></div>
                  <div className="small muted">Suggested owner: {it.owner_role} · Deliverable: {it.deliverable} · from {it.rec}</div>
                </li>
              ))}
            </ul>
            <h4 className="mini">Success criteria</h4>
            <ul className="plain small">{p.success.map((s: string) => <li key={s}>{s}</li>)}</ul>
            <div className="gate">
              <div className="gname">◆ {p.gate.name}</div>
              <p className="small"><b className="go">Go:</b> {p.gate.go}</p>
              <p className="small"><b className="nogo">No-Go:</b> {p.gate.no_go}</p>
              <p className="small muted" style={{ margin: 0 }}>Thresholds: <Badge status={p.gate.threshold_status} /></p>
            </div>
          </section>
        ))}
      </div>
      <p className="small muted">{RM.note_after_90}</p>
    </div>
  );
}

function BusinessTab() {
  const [pts, setPts] = useState(8);
  const c = comparator(pts);
  const cmp = BC.comparator;
  return (
    <div className="stack">
      <ProposalNote>{BC.framing}</ProposalNote>

      <h2 className="sec">Pilot scenarios and resources</h2>
      <div className="grid g3">
        {BC.scenarios.map((s: any) => (
          <Card key={s.id} title={s.name} sub={`Duration: ${s.duration}`}>
            <p className="small">{s.scope}</p>
            <ul className="plain small">{s.resources.map((r: any) => <li key={r.item}><b>{r.item}</b>: {r.qty}</li>)}</ul>
            <p className="small muted" style={{ marginBottom: 0 }}>Output: {s.outcome}</p>
          </Card>
        ))}
      </div>

      <Card title="Cost drivers" sub="Only public numbers are filled in. Everything else must come from ThermGAS or from quotes.">
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Driver</th><th>Unit cost</th><th>Where the number must come from</th><th>Status</th></tr></thead>
          <tbody>{BC.cost_drivers.map((d: any) => (
            <tr key={d.driver}><td>{d.driver}</td><td>{d.unit_cost}</td><td>{d.source_of_number} <Src ids={d.sources} /></td><td><Badge status={d.status} /></td></tr>
          ))}</tbody>
        </table></div>
      </Card>

      <Card title={cmp.title} sub="Counts from published specs. Not a cost of ownership, not a saving.">
        <div className="slider-row" style={{ gridTemplateColumns: '150px minmax(0,1fr) 36px', maxWidth: 520 }}>
          <label htmlFor="pts">Monitored points in one room</label>
          <input id="pts" type="range" min={1} max={24} value={pts} onChange={e => setPts(+e.target.value)} />
          <span className="mono">{pts}</span>
        </div>
        <div className="grid g2" style={{ marginTop: 10 }}>
          <div className="cmp-box"><h4>One FALCO 2 11.7 per point</h4>
            <dl className="kv" style={{ gridTemplateColumns: '210px 1fr' }}>
              <dt>Detectors needed</dt><dd><b>{c.falconUnits}</b></dd>
              <dt>Hardware at reseller list ($3,521 each)</dt><dd><b>${c.falcoListUsd.toLocaleString()}</b> <Badge status="Verified" /></dd>
              <dt>Lamp changes over 36 months, at least</dt><dd><b>{c.lampChanges}</b> <Badge status="Inferred" /></dd>
              <dt>Lamp price and labor</dt><dd>Not Publicly Available</dd>
            </dl>
          </div>
          <div className="cmp-box"><h4>ThermGAS Haloguard IR</h4>
            <dl className="kv" style={{ gridTemplateColumns: '210px 1fr' }}>
              <dt>Analyzers needed (up to 24 points each)</dt><dd><b>{c.thermgasAnalyzers}</b> <Badge status="Verified" /></dd>
              <dt>Price</dt><dd>Not Publicly Available</dd>
              <dt>UV lamp changes</dt><dd>None (no UV lamp; vendor claim)</dd>
              <dt>Other upkeep</dt><dd>Draw pump typically 5-6 years (vendor claim)</dd>
            </dl>
          </div>
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>{cmp.note} <Src ids={cmp.sources} /></p>
      </Card>

      <h2 className="sec">Risks</h2>
      <Card>
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Risk</th><th>Impact</th><th>Early warning</th><th>Mitigation</th><th>Evidence</th></tr></thead>
          <tbody>{BC.risks.map((r: any) => (
            <tr key={r.risk}><td><b>{r.risk}</b></td><td>{r.impact}</td><td>{r.early_warning}</td><td>{r.mitigation}</td><td><Badge status={r.status} /> <Src ids={r.sources} /></td></tr>
          ))}</tbody>
        </table></div>
        <p className="small muted" style={{ marginBottom: 0 }}>No probabilities, revenues, ROI or market shares are estimated. Impact is described in words.</p>
      </Card>
    </div>
  );
}

export default function Roadmap({ params }: { params: URLSearchParams }) {
  const [tab, setTab] = useState<Tab>((params.get('t') as Tab) === 'business' ? 'business' : 'roadmap');
  useEffect(() => { setTab(params.get('t') === 'business' ? 'business' : 'roadmap'); }, [params]);
  return (
    <div className="stack">
      <PageHead kicker="Strategic Roadmap" title="A 90-day, gated plan: fix the evidence, then earn a reference site"
        lead="Three phases, each ending in a Go / No-Go decision. The business case shows what a pilot needs and which numbers are still unknown." />
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'roadmap'} className={tab === 'roadmap' ? 'on' : ''} onClick={() => setTab('roadmap')}>30 / 60 / 90 day roadmap</button>
        <button role="tab" aria-selected={tab === 'business'} className={tab === 'business' ? 'on' : ''} onClick={() => setTab('business')}>Business case</button>
      </div>
      {tab === 'roadmap' ? <RoadmapTab /> : <BusinessTab />}
    </div>
  );
}
