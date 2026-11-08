import { executive, dcRank, sources } from '../data';
import { Src, Badge, statusClass } from '../ui';
import { opportunities } from '../exec';
import OppMap from '../OppMap';
import { CountUp, SplitWords } from '../fx';

export const ProposalNote = ({ children }: { children?: React.ReactNode }) => (
  <div className="callout warn small" role="note"><b>Research-team proposal, not approved ThermGAS strategy.</b> {children ?? executive.meta.status_note}</div>
);

export default function Executive() {
  const cc = executive.core_conclusion;
  const engage = opportunities().filter(o => o.cls === 'A').length;
  const ad = executive.adjacent_opportunity;
  const readouts = [
    { v: 2, l: 'direct rivals verified', s: 'ION Science, Riken Keiki', st: 'Verified', src: ['S22', 'S52'] },
    { v: 0, l: 'public U.S. battery-plant references, any vendor', s: 'the reference slot is open', st: 'Verified (absence after search)', src: ['S39'] },
    { v: engage, l: 'states to engage first', s: 'verified plants, reachable from Georgia', st: 'Inferred', src: ['S143', 'S144', 'S147'] },
    { v: dcRank('GA') ?? 0, l: 'Georgia\'s rank in data center load', s: 'of 44 states, EPRI 2023', st: 'Verified', src: ['S160'], prefix: '#' },
  ];
  return (
    <div className="exec">
      <header className="lede">
        <div className="lede-text">
          <SplitWords text={cc.short} />
          <p className="next"><span className="prop-chip">Proposal</span>{cc.short_next}</p>
        </div>
        <dl className="readouts">
          {readouts.map(r => (
            <div key={r.l} className="readout">
              <dt>{r.l}</dt>
              <dd><span className="num">{r.prefix}<CountUp to={r.v} /></span></dd>
              <div className="rd-sub">{r.s}</div>
              <div className="rd-meta"><Badge status={r.st} /><Src ids={r.src} /></div>
            </div>
          ))}
        </dl>
      </header>

      <section className="mapband" aria-label="Where to play">
        <h2 className="band-title">Where to play</h2>
        <OppMap />
      </section>

      <section className="finds" aria-label="Key findings">
        {executive.key_findings.map((k: any) => (
          <article key={k.id} className={`find ${statusClass(k.status)}`}>
            <p>{k.short}</p>
            <div className="meta"><Badge status={k.status} /><Src ids={k.sources} /></div>
          </article>
        ))}
      </section>

      <div className="duo">
        <section aria-label="Proposed actions">
          <div className="band-head"><h2 className="band-title">Three proposed actions</h2><a className="btn" href="#/roadmap">Roadmap</a></div>
          <ol className="actions">
            {executive.actions.map((a: any) => (
              <li key={a.id}><b>{a.short}</b><span className="owner">{a.owner_role}</span></li>
            ))}
          </ol>
          <p className="small muted fine">In priority order. Proposals, not approved ThermGAS plans.</p>
        </section>
        <section className="decision" aria-label="Decision for management">
          <h2>{executive.decision.short_question}</h2>
          <div className="opts">
            {executive.decision.options.map((o: any) => (
              <div key={o.id} className={`opt ${o.id === 'O2' ? 'rec-opt' : ''}`} title={`Upside: ${o.upside}\nDownside: ${o.downside}`}>
                <b>{o.short}</b>{o.id === 'O2' && <span className="small">team proposal</span>}
              </div>
            ))}
          </div>
          <p className="small needs">Needs {executive.decision.needs_from_management.map((n: string) => n.charAt(0).toLowerCase() + n.slice(1)).join(', ')}.</p>
        </section>
      </div>

      <section className="adjacent band" aria-label={ad.title}>
        <div>
          <h2 className="band-title">{ad.title.replace('Adjacent opportunity: d', 'D')}</h2>
          <p className="adj-text">{ad.short}</p>
        </div>
        <ul className="adj-points">
          {ad.points.slice(0, 3).map((p: any, i: number) => <li key={i}><Badge status={p.status} /> {p.text} <Src ids={p.sources} /></li>)}
        </ul>
      </section>

      <details className="how-sure">
        <summary><b>How sure are we?</b> <span className="muted small">Verified, inferred and assumed behind the conclusion</span></summary>
        <div className="evid-trio">
          <div><h4><Badge status="Verified" /> We know</h4><ul>{cc.known.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
          <div><h4><Badge status="Inferred" /> We infer</h4><ul>{cc.inferred.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
          <div><h4><Badge status="Assumption" /> We assume</h4><ul>{cc.assumed.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
        </div>
      </details>

      <nav className="deep-links" aria-label="Research detail">
        <span className="muted small">Go deeper</span>
        <a href="#/research">Evidence dashboard</a><a href="#/portfolio">ThermGAS products</a><a href="#/competitors">Competitors</a><a href="#/battlecard">Battlecards</a><a href="#/map">Evidence map</a><a href="#/strategy">SWOT</a><a href="#/sources">Sources ({sources.length})</a><a href="#/briefing">Printable briefing</a>
      </nav>
    </div>
  );
}
