import { executive, dcRank, sources } from '../data';
import { Src, Badge } from '../ui';
import { opportunities } from '../exec';
import OppMap from '../OppMap';
import { CountUp, Spotlight, Reveal } from '../fx';

export const ProposalNote = ({ children }: { children?: React.ReactNode }) => (
  <div className="callout warn small" role="note"><b>Research-team proposal, not approved ThermGAS strategy.</b> {children ?? executive.meta.status_note}</div>
);

export default function Executive() {
  const cc = executive.core_conclusion;
  const engage = opportunities().filter(o => o.cls === 'A').length;
  const ad = executive.adjacent_opportunity;
  const kpis = [
    { v: 2, l: 'verified direct rivals', s: 'ION Science · Riken Keiki', st: 'Verified', src: ['S22', 'S52'] },
    { v: 0, l: 'public U.S. battery-plant DMC references, any vendor', s: 'the reference position is open', st: 'Verified (absence after search)', src: ['S39'] },
    { v: engage, l: 'states to engage first', s: 'verified plants + reachable from GA', st: 'Inferred', src: ['S143', 'S144', 'S147'] },
    { v: dcRank('GA') ?? 0, l: 'home-state rank in data center load', s: 'Georgia, of 44 states (EPRI 2023)', st: 'Verified', src: ['S160'], prefix: '#' },
  ];
  return (
    <div className="stack exec">
      <section className="hero hero-tight">
        <div className="kicker">Executive Overview · evidence as of {executive.meta.as_of}</div>
        <h1>{cc.short}</h1>
        <p className="next"><span className="prop-chip">Proposal</span> {cc.short_next}</p>
        <div className="kpis k4">
          {kpis.map((k, i) => (
            <Reveal key={k.l} delay={i * 80}>
              <Spotlight className="kpi">
                <div className="v">{k.prefix}<CountUp to={k.v} /></div>
                <div className="l"><b>{k.l}</b><br /><span className="muted">{k.s}</span></div>
                <div className="f"><Badge status={k.st} /><Src ids={k.src} /></div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="card map-hero">
          <header className="card-head"><div><h3>Where to play</h3><p className="card-sub">Switch layers to compare battery plants, data centers and competitor channels.</p></div></header>
          <OppMap />
        </section>
      </Reveal>

      <div className="grid g3">
        {executive.key_findings.map((k: any, i: number) => (
          <Reveal key={k.id} delay={i * 90}>
            <Spotlight className="card kf">
              <div className="num-badge">{i + 1}</div>
              <p className="kf-text">{k.short}</p>
              <div className="meta"><Badge status={k.status} /><Src ids={k.sources} /></div>
            </Spotlight>
          </Reveal>
        ))}
      </div>

      <div className="grid g-main">
        <Reveal>
          <section className="card">
            <header className="card-head"><div><h3>Three proposed actions</h3><p className="card-sub">In order. Not approved ThermGAS plans.</p></div><a className="btn" href="#/roadmap">Roadmap →</a></header>
            <ol className="actions">
              {executive.actions.map((a: any) => (
                <li key={a.id}><b>{a.short}</b><span className="owner">{a.owner_role}</span></li>
              ))}
            </ol>
          </section>
        </Reveal>
        <Reveal delay={100}>
          <section className="decision">
            <div className="kicker">Decision for management</div>
            <h2>{executive.decision.short_question}</h2>
            <div className="opts">
              {executive.decision.options.map((o: any) => (
                <div key={o.id} className={`opt ${o.id === 'O2' ? 'rec-opt' : ''}`} title={`Upside: ${o.upside}\nDownside: ${o.downside}`}>
                  <b>{o.short}</b>{o.id === 'O2' && <span className="small"> · team proposal</span>}
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: '10px 0 0' }}>Needs: {executive.decision.needs_from_management.join(' · ')}</p>
          </section>
        </Reveal>
      </div>

      <Reveal>
        <Spotlight className="card adjacent">
          <div>
            <div className="kicker">{ad.title}</div>
            <p className="adj-text">{ad.short}</p>
          </div>
          <ul className="adj-points">
            {ad.points.slice(0, 3).map((p: any, i: number) => <li key={i}><Badge status={p.status} /> {p.text} <Src ids={p.sources} /></li>)}
          </ul>
        </Spotlight>
      </Reveal>

      <details className="card how-sure">
        <summary><b>How sure are we?</b> <span className="muted small">What is verified, inferred and assumed behind the conclusion</span></summary>
        <div className="evid-trio">
          <div><h4><Badge status="Verified" /> We know</h4><ul>{cc.known.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
          <div><h4><Badge status="Inferred" /> We infer</h4><ul>{cc.inferred.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
          <div><h4><Badge status="Assumption" /> We assume</h4><ul>{cc.assumed.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
        </div>
      </details>

      <div className="deep-links">
        <span className="muted small">Go deeper:</span>
        <a href="#/research">Evidence dashboard</a><a href="#/competitors">Competitors</a><a href="#/battlecard">Battlecards</a><a href="#/map">Evidence map</a><a href="#/strategy">SWOT</a><a href="#/sources">Sources ({sources.length})</a><a href="#/briefing">Printable briefing</a>
      </div>
    </div>
  );
}
