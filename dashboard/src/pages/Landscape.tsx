import { analysis, productById, shortName } from '../data';
import { Card, Src, Badge, PageHead } from '../ui';
import ThreatMatrix from '../ThreatMatrix';
import { threatLevel } from '../model';
import { DIFF } from './Strategy';
import { ProposalNote } from './Executive';
import { go } from '../App';

const KEY = ['falco117', 'riken_fill', 'liontamer'];
const ROLE: Record<string, string> = { falco117: 'Direct competitor', riken_fill: 'Direct competitor', liontamer: 'Competes for the same budget (indirect)' };
const LVL = ['High', 'Elevated', 'Moderate', 'Low'];

const Items = ({ items, n }: { items: any[]; n: number }) => (
  <ul className="bc-list">
    {items.slice(0, n).map((x, i) => <li key={i}>{x.text}<div className="m"><Badge status={x.status} /><Src ids={x.sources} /></div></li>)}
  </ul>
);

export default function Landscape() {
  const cards = KEY.map(id => ({ t: analysis.threats.find((t: any) => t.product === id), b: analysis.battlecards.find((b: any) => b.product === id) }));
  const others = [...analysis.threats].filter((t: any) => !KEY.includes(t.product))
    .sort((a: any, b: any) => LVL.indexOf(threatLevel(a.task_overlap, a.battery_gtm)) - LVL.indexOf(threatLevel(b.task_overlap, b.battery_gtm)));
  return (
    <div className="stack">
      <PageHead kicker="Competitive Landscape" title="Two rivals decide the outcome; the rest are adjacent or different jobs"
        lead="ION Science and Riken Keiki / RKI are the verified direct competitors. Honeywell competes for the same gigafactory safety budget with a different technology. Each card shows where they win, where they are exposed, and what that means for ThermGAS." />

      <div className="grid g3">
        {cards.map(({ t, b }) => {
          const lvl = threatLevel(t.task_overlap, t.battery_gtm);
          return (
            <Card key={t.product} className="rival" title={b.title} sub={ROLE[t.product]} right={<span className={`threat threat-${lvl}`}>{lvl}</span>}>
              <p className="small"><b>Their pitch:</b> {b.their_pitch}</p>
              <h4 className="mini win">Where they win</h4><Items items={b.where_they_win} n={2} />
              <h4 className="mini them">Where ThermGAS can differentiate</h4><Items items={b.where_thermgas_can_win} n={2} />
              <h4 className="mini mine">Watch-out for ThermGAS</h4><Items items={b.landmines} n={1} />
              <div className="meta"><a className="btn" onClick={() => go('battlecard', { p: t.product })} href={`#/battlecard?p=${t.product}`}>Full battlecard →</a></div>
            </Card>
          );
        })}
      </div>
      <p className="small muted">Threat level is rule-based from two evidence ratings (task overlap, battery go-to-market). No market share or numeric threat index is used. Rules: see Strategic Positioning.</p>

      <div className="grid g-main">
        <Card title="Threat map" sub="Rule-based placement. Click a product for its battlecard.">
          <ThreatMatrix compact />
        </Card>
        <Card title="Other players" sub="Adjacent, indirect or substitute. Lower overlap with ThermGAS's job.">
          <div className="table-wrap" style={{ maxHeight: 360 }}>
            <table className="t">
              <thead><tr><th>Product</th><th>Threat</th><th>Why</th></tr></thead>
              <tbody>{others.map((t: any) => {
                const p = productById[t.product]; const l = threatLevel(t.task_overlap, t.battery_gtm);
                return <tr key={t.product}><td><b>{shortName(p.company)}</b><br />{p.model.replace(/\s*\(.*\)$/, '')}</td><td><span className={`threat threat-${l}`}>{l}</span></td><td>{t.why} <Src ids={t.sources} /></td></tr>;
              })}</tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Where ThermGAS can and cannot claim an edge" sub="Each verdict is only as strong as its evidence label">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Factor</th><th>Verdict</th><th>Evidence status</th></tr></thead>
            <tbody>{DIFF.map(d => (
              <tr key={d.f}><td><b>{d.f}</b></td><td>{d.v} <Src ids={[...d.tgS, ...d.compS]} /></td><td><Badge status={d.st} /></td></tr>
            ))}</tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>Full ThermGAS-vs-competitor wording for each factor is on the Strategic Positioning page.</p>
      </Card>

      <Card title="Possible positioning" sub="A hypothesis for management to test, conditional on the evidence fixes in the roadmap">
        <ProposalNote>Positioning depends on actions A1 (published DMC spec) and A2 (hazardous-area answer).</ProposalNote>
        <p style={{ fontSize: 17, color: 'var(--ink-strong)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.45, marginBottom: 0 }}>
          The DMC-specific, multi-point, lamp-free concentration monitor that <span style={{ color: 'var(--brand)' }}>complements</span> off-gas event detection in electrolyte-handling and filling rooms.
        </p>
      </Card>

      <Card title="Drill down" right={null}>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <a className="btn" href="#/competitors">Competitor Explorer (11 profiles)</a>
          <a className="btn" href="#/battlecard">Product Battlecard (17 attributes)</a>
          <a className="btn" href="#/strategy">SWOT, threat rules, full differentiation</a>
          <a className="btn" href="#/sources">Sources &amp; Method</a>
        </div>
      </Card>
    </div>
  );
}
