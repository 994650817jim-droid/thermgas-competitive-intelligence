import { useEffect, useState, type ReactNode } from 'react';
import { executive } from '../data';
import { Badge } from '../ui';
import ThreatMatrix from '../ThreatMatrix';
import { opportunities } from '../exec';
import { go } from '../App';

const E = executive;
const opp = opportunities();
const SLIDES: { title: string; body: () => ReactNode }[] = [
  { title: 'Title', body: () => (<div className="s-title"><div className="kicker">Executive Briefing · evidence as of {E.meta.as_of}</div><h1>ThermGAS U.S. Competitive Intelligence</h1><p>DMC vapor monitoring in U.S. lithium-ion battery manufacturing</p><p className="s-disc"><b>Independent Student Research</b> · Northeastern University MSBA · not an official ThermGAS publication. Recommendations are proposals, not approved strategy.</p></div>) },
  { title: 'Conclusion', body: () => (<><div className="kicker">Conclusion</div><h2 className="s-big">{E.core_conclusion.headline}</h2><p className="s-next"><b>Proposed next move:</b> {E.core_conclusion.next_move}</p></>) },
  { title: 'Key findings', body: () => (<><div className="kicker">Three key findings</div><div className="s-cols">{E.key_findings.map((k: any, i: number) => (<div key={k.id} className="s-card"><div className="num-badge">{i + 1}</div><h3>{k.title}</h3><p>{k.so_what}</p><Badge status={k.status} /></div>))}</div></>) },
  { title: 'Competition', body: () => (<><div className="kicker">Competitive landscape</div><h2 className="s-mid">ION Science and Riken Keiki are the verified direct rivals; Honeywell competes for the same budget</h2><div style={{ maxWidth: 900 }}><ThreatMatrix compact /></div></>) },
  { title: 'Markets', body: () => (<><div className="kicker">Market opportunities</div><h2 className="s-mid">Start where plants are verified running and ThermGAS can reach them</h2><div className="s-cols s4">{(['A', 'B', 'C', 'D'] as const).map(c => (<div key={c} className={`s-card cls-${c}`}><h3>{E.opportunity_rules.classes[c].label}</h3><p className="s-states">{opp.filter(o => o.cls === c).map(o => o.code).join(' · ')}</p><p className="s-small">{E.opportunity_rules.classes[c].rule}</p></div>))}</div><p className="s-small">Research-prioritization classes, not revenue estimates.</p></>) },
  { title: 'Actions', body: () => (<><div className="kicker">Three proposed actions</div><div className="s-cols">{E.actions.map((a: any) => (<div key={a.id} className="s-card"><div className="num-badge">{a.rank}</div><h3>{a.title}</h3><p>{a.why}</p><p className="s-small"><b>Owner role:</b> {a.owner_role}</p></div>))}</div></>) },
  { title: 'Roadmap', body: () => (<><div className="kicker">30 / 60 / 90 day roadmap (proposal)</div><div className="s-cols">{E.roadmap.phases.map((p: any) => (<div key={p.id} className="s-card"><div className="days">{p.days}</div><h3>{p.name}</h3><p className="s-small">{p.success.join(' · ')}</p><p className="s-gate">◆ {p.gate.name}</p></div>))}</div><p className="s-small">{E.roadmap.note_after_90}</p></>) },
  { title: 'Decision', body: () => (<><div className="kicker">Decision for management</div><h2 className="s-mid">{E.decision.question}</h2><div className="s-cols">{E.decision.options.map((o: any) => (<div key={o.id} className={`s-card ${o.id === 'O2' ? 'rec-opt' : ''}`}><h3>{o.label}</h3><p className="s-small"><b>Upside:</b> {o.upside}</p><p className="s-small"><b>Downside:</b> {o.downside}</p></div>))}</div></>) },
  { title: 'Limits', body: () => (<><div className="kicker">What is still unknown</div><ul className="s-list">{E.open_gaps.map((g: any, i: number) => <li key={i}>{g.text}</li>)}</ul><p className="s-small"><b>Independent Student Research</b> · not an official ThermGAS publication · no revenue, ROI, market share or internal data is estimated.</p></>) },
];

export default function Present({ params }: { params: URLSearchParams }) {
  const [i, setI] = useState(Math.min(SLIDES.length - 1, Math.max(0, (+(params.get('n') ?? 1) || 1) - 1)));
  const next = () => setI(x => Math.min(SLIDES.length - 1, x + 1));
  const prev = () => setI(x => Math.max(0, x - 1));
  const exit = () => { if (document.fullscreenElement) document.exitFullscreen?.(); go('overview'); };
  const full = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch { /* ignore */ } };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') exit();
      else if (e.key === 'f' || e.key === 'F') full();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  return (
    <div className="present" role="region" aria-label="Presentation mode">
      <div className="p-bar"><span><b>Therm<span style={{ color: 'var(--brand)' }}>GAS</span></b> · Independent Student Research</span><span>{i + 1} / {SLIDES.length}</span></div>
      <div className="p-slide" key={i}>{SLIDES[i].body()}</div>
      <div className="p-nav">
        <button className="btn" onClick={prev} disabled={i === 0}>← Back</button>
        <button className="btn" onClick={full}>Full screen (F)</button>
        <button className="btn" onClick={exit}>Exit (Esc)</button>
        <button className="btn primary" onClick={next} disabled={i === SLIDES.length - 1}>Next →</button>
      </div>
    </div>
  );
}
