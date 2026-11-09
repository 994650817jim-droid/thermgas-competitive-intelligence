import { executive, growth } from '../data';
import { Badge, Src } from '../ui';
import { briefingMarkdown, opportunities } from '../exec';
import { go } from '../App';

const E = executive;
export function download() {
  const blob = new Blob([briefingMarkdown()], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ThermGAS_Executive_Briefing.md'; a.click(); URL.revokeObjectURL(a.href);
}

export default function Briefing() {
  const opp = opportunities();
  return (
    <div className="briefing">
      <div className="noprint toolbar">
        <button className="btn primary" onClick={() => window.print()}>Print / Save as PDF</button>
        <button className="btn" onClick={download}>Download Markdown</button>
        <button className="btn" onClick={() => go('overview')}>← Back</button>
        <span className="small muted">Tip: in the print dialog choose "Save as PDF".</span>
      </div>
      <h1>ThermGAS U.S. Competitive Intelligence: Executive Briefing</h1>
      <p className="small"><b>Independent Student Research</b> · Northeastern University MSBA · not an official ThermGAS publication · evidence as of {E.meta.as_of}</p>
      <p className="small"><i>{E.meta.status_note}</i></p>
      <h2>Conclusion</h2>
      <p><b>{E.core_conclusion.headline}</b></p>
      <p>Proposed next move: {E.core_conclusion.next_move}</p>
      <h2>Key findings</h2>
      <ol>{E.key_findings.map((k: any) => <li key={k.id}><b>{k.title}.</b> {k.so_what} <Badge status={k.status} /> <Src ids={k.sources} /></li>)}</ol>
      <h2>Proposed actions</h2>
      <ol>{E.actions.map((a: any) => <li key={a.id}><b>{a.title}.</b> Owner role: {a.owner_role}. Done when: {a.validation}</li>)}</ol>
      <h2>Decision for management</h2>
      <p>{E.decision.question}</p>
      <ul>{E.decision.options.map((o: any) => <li key={o.id}><b>{o.label}:</b> {o.upside} Downside: {o.downside}</li>)}</ul>
      <h2>Where to look first</h2>
      <p>{(['A', 'B', 'C', 'D'] as const).map(c => `${E.opportunity_rules.classes[c].label}: ${opp.filter(o => o.cls === c).map(o => o.code).join(', ') || '-'}`).join(' · ')}. Research-prioritization classes, not revenue estimates.</p>
      <h2>{E.adjacent_opportunity.title}</h2>
      <p>{E.adjacent_opportunity.short}</p>
      <ul>{E.adjacent_opportunity.points.map((p: any, i: number) => <li key={i} className="small">{p.text} <Badge status={p.status} /> <Src ids={p.sources} /></li>)}</ul>
      <h2>Growth markets: data centers, semiconductors, pharma</h2>
      <p className="small"><i>Research-team proposals, not approved ThermGAS strategy. Evidence as of {growth.meta.as_of}. Each market is measured differently; figures are never added together.</i></p>
      {growth.markets.map((m: any) => (
        <div key={m.id}>
          <h3 className="brief-h3">{m.label}</h3>
          <p><b>{m.verdict.headline}</b></p>
          <ul>{m.verdict.answers.map((a: any) => <li key={a.q} className="small"><b>{a.q}:</b> {a.a} <Badge status={a.status} /> <Src ids={a.sources} /></li>)}</ul>
          <p className="small">Key figure: {m.readouts[0].label}, {m.readouts[0].value}{m.readouts[0].unit ? ` ${m.readouts[0].unit}` : ''} <Badge status={m.readouts[0].status} /> <Src ids={m.readouts[0].sources} />. Sizing: {m.market.sizing.status}; no prices or dollar estimates are shown.</p>
        </div>
      ))}
      <h2>Roadmap</h2>
      <ul>{E.roadmap.phases.map((p: any) => <li key={p.id}><b>{p.days}, {p.name}.</b> {p.gate.name}. Go if: {p.gate.go}</li>)}</ul>
      <p className="small">{E.roadmap.note_after_90}</p>
      <h2>Still unknown</h2>
      <ul>{E.open_gaps.map((g: any, i: number) => <li key={i} className="small">{g.text}</li>)}</ul>
      <p className="small muted">Source IDs (S##) resolve in the source register export. No revenue, ROI, market share or ThermGAS internal figures are estimated.</p>
    </div>
  );
}
