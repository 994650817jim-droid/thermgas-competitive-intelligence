import { analysis, productById, shortName } from '../data';
import { Card, Src, Badge, PageHead } from '../ui';
import ThreatMatrix from '../ThreatMatrix';
import { threatLevel } from '../model';
import { DIFF } from './Strategy';
import { ProposalNote } from './Executive';
import { go } from '../App';
import OppMap from '../OppMap';
import Portfolio from '../Portfolio';

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
        lead="ION Science and Riken are the direct rivals. Honeywell competes for the same budget with a different technology." />

      <div className="grid g3">
        {cards.map(({ t, b }) => {
          const lvl = threatLevel(t.task_overlap, t.battery_gtm);
          return (
            <section key={t.product} className="card rival">
              <header className="card-head"><div><h3>{b.title}</h3><p className="card-sub">{ROLE[t.product]}</p></div><span className={`threat threat-${lvl}`}>{lvl}</span></header>
              <h4 className="mini win">They win on</h4><Items items={b.where_they_win} n={1} />
              <h4 className="mini them">ThermGAS can win on</h4><Items items={b.where_thermgas_can_win} n={1} />
              <h4 className="mini mine">Watch out</h4><Items items={b.landmines} n={1} />
              <div className="meta"><a className="btn" onClick={() => go('battlecard', { p: t.product })} href={`#/battlecard?p=${t.product}`}>Full battlecard →</a></div>
            </section>
          );
        })}
      </div>
      <p className="small muted">Threat levels are rule-based; no market share or numeric index is used.</p>

      <section className="mapband" aria-label="ThermGAS product line">
        <div className="band-head"><h2 className="band-title">What ThermGAS brings to the fight</h2><a className="btn" href="#/portfolio">Portfolio detail</a></div>
        <Portfolio />
      </section>

      <section className="card map-hero">
        <header className="card-head"><div><h3>Where competitors have local channels</h3><p className="card-sub">Hatched means no public evidence found, not "no competition".</p></div></header>
        <OppMap initial="competitors" />
      </section>

      <div className="grid g-main">
        <Card title="Threat map" sub="Rule-based placement. Click a product for its battlecard.">
          <ThreatMatrix compact />
        </Card>
        <Card title="Possible positioning" sub="A hypothesis to test, conditional on the evidence fixes in the roadmap">
          <ProposalNote>Depends on actions A1 (published DMC spec) and A2 (hazardous-area answer).</ProposalNote>
          <p className="positioning">The DMC-specific, multi-point, lamp-free concentration monitor that <span>complements</span> off-gas event detection in electrolyte-handling and filling rooms.</p>
        </Card>
      </div>

      <details className="more-detail"><summary>Other players and the full differentiation table</summary>
      <div className="stack">
      <div className="grid">
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

      </div>
      </details>

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
