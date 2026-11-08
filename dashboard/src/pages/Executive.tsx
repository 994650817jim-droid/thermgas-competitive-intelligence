import { executive } from '../data';
import { Card, Src, Badge, Legend } from '../ui';
import { opportunities } from '../exec';
import { go } from '../App';

export const ProposalNote = ({ children }: { children?: React.ReactNode }) => (
  <div className="callout warn small" role="note"><b>Research-team proposal, not approved ThermGAS strategy.</b> {children ?? executive.meta.status_note}</div>
);

export default function Executive() {
  const cc = executive.core_conclusion;
  const opp = opportunities();
  const n = (c: string) => opp.filter(o => o.cls === c).map(o => o.code).join(', ');
  return (
    <div className="stack">
      <section className="hero">
        <div className="kicker">Executive Overview · evidence as of {executive.meta.as_of}</div>
        <h1>{cc.headline}</h1>
        <p className="next"><b>Proposed next move.</b> {cc.next_move}</p>
        <div className="evid-trio">
          <div><h4><Badge status="Verified" /> We know</h4><ul>{cc.known.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
          <div><h4><Badge status="Inferred" /> We infer</h4><ul>{cc.inferred.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
          <div><h4><Badge status="Assumption" /> We assume</h4><ul>{cc.assumed.map((x: any, i: number) => <li key={i}>{x.text} <Src ids={x.sources} /></li>)}</ul></div>
        </div>
      </section>

      <h2 className="sec">Three key findings</h2>
      <div className="grid g3">
        {executive.key_findings.map((k: any, i: number) => (
          <Card key={k.id} className="kf">
            <div className="num-badge">{i + 1}</div>
            <h3>{k.title}</h3>
            <p className="small">{k.body}</p>
            <p className="so">→ {k.so_what}</p>
            <div className="meta"><Badge status={k.status} /><Src ids={k.sources} /></div>
          </Card>
        ))}
      </div>

      <h2 className="sec">Three proposed actions</h2>
      <ProposalNote>Actions are ordered by priority. Each names a suggested owner role and the condition that proves it worked.</ProposalNote>
      <div className="grid g3">
        {executive.actions.map((a: any) => (
          <Card key={a.id} className="act">
            <div className="rank">Priority {a.rank} · {a.status}</div>
            <h3>{a.title}</h3>
            <p className="small">{a.why}</p>
            <dl className="kv" style={{ gridTemplateColumns: '84px 1fr' }}>
              <dt>Owner role</dt><dd>{a.owner_role}</dd>
              <dt>Done when</dt><dd>{a.validation}</dd>
            </dl>
            <div className="meta"><Src ids={a.evidence} /><a className="btn" href="#/roadmap">See in roadmap →</a></div>
          </Card>
        ))}
      </div>

      <section className="decision" aria-label="Decision for management">
        <div className="kicker">Decision for management</div>
        <h2>{executive.decision.question}</h2>
        <div className="grid g3">
          {executive.decision.options.map((o: any) => (
            <div key={o.id} className={`opt ${o.id === 'O2' ? 'rec-opt' : ''}`}>
              <h4>{o.label}</h4>
              <p className="small"><b>Upside:</b> {o.upside}</p>
              <p className="small"><b>Downside:</b> {o.downside}</p>
              <p className="small muted">{o.note}</p>
            </div>
          ))}
        </div>
        <p className="small" style={{ marginBottom: 0 }}><b>Needed from management:</b> {executive.decision.needs_from_management.join(' · ')}.</p>
      </section>

      <div className="grid g2">
        <Card title="Where to look first" sub="Market opportunity classes (research prioritization, not revenue)" right={<a className="btn" href="#/opportunities">Details →</a>}>
          <dl className="kv" style={{ gridTemplateColumns: '150px 1fr' }}>
            <dt>Engage now</dt><dd><b>{n('A') || '-'}</b></dd>
            <dt>Prepare</dt><dd><b>{n('B') || '-'}</b></dd>
            <dt>Verify before investing</dt><dd>{n('C')}</dd>
            <dt>Separate segment</dt><dd>{n('D')}</dd>
          </dl>
        </Card>
        <Card title="Go deeper" sub="All research, sources and technical comparisons are kept">
          <div className="toolbar" style={{ marginBottom: 0 }}>
            <a className="btn" href="#/research">Evidence dashboard</a>
            <a className="btn" href="#/competitors">Competitor Explorer</a>
            <a className="btn" href="#/battlecard">Product Battlecard</a>
            <a className="btn" href="#/map">U.S. map</a>
            <a className="btn" href="#/strategy">SWOT &amp; positioning</a>
            <a className="btn" href="#/sources">Sources &amp; Method</a>
          </div>
        </Card>
      </div>
      <Legend />
      <button className="linklike" onClick={() => go('briefing')}>Open the printable Executive Briefing →</button>
    </div>
  );
}
