import { useMemo, useState } from 'react';
import { executive } from '../data';
import { Card, Src, PageHead } from '../ui';
import { opportunities, cellFacilities, tierOf, noteOf, TIERS, type OppClass } from '../exec';
import { go } from '../App';

const R = executive.opportunity_rules;
const CLS_ORDER: OppClass[] = ['A', 'B', 'C', 'D'];
const REACH = { home: 'Home state (Verified HQ)', adjacent: 'Borders GA (geography; service model untested)', none: 'No reach identified' };

const Dots = ({ c }: { c: { plantStatus: boolean; competitorChannel: boolean; thermgasFoothold: boolean } }) => {
  const items = [[c.plantStatus, 'Plant status verified for 2025-26'], [c.competitorChannel, 'Competitor channel evidence found'], [c.thermgasFoothold, 'ThermGAS foothold evidence']] as const;
  const n = items.filter(i => i[0]).length;
  return <span title={items.map(i => `${i[0] ? '✓' : '✗'} ${i[1]}`).join('\n')} className="dots" aria-label={`${n} of 3 evidence checks`}>{items.map((i, k) => <i key={k} className={i[0] ? 'on' : ''} />)}<b className="mono">{n}/3</b></span>;
};

export default function Opportunities() {
  const all = useMemo(opportunities, []);
  const [f, setF] = useState<OppClass | 'all'>('all');
  const rows = all.filter(o => f === 'all' || o.cls === f);
  return (
    <div className="stack">
      <PageHead kicker="Market Opportunities" title="Start where plants are verified running and ThermGAS can reach them"
        lead="States are classed with four lenses: how well each plant's real status is evidenced, whether ThermGAS can reach it, the competitive environment, and how complete the evidence is. This is a research-prioritization aid, not a revenue or market-size estimate." />

      <div className="callout warn small">
        <b>Plant dates to re-check.</b> HL-GA (GA) and LGES Queen Creek (AZ) were targeted to start in H1 2026, and UBE Louisiana was planned for completion in July 2026. Those dates have passed and no confirmation was found, so they are shown as <i>not yet verified</i>. Re-verification is in the Day 0-30 roadmap.
      </div>

      <div className="grid g4">
        {CLS_ORDER.map(c => (
          <button key={c} className={`cls-tile cls-${c} ${f === c ? 'on' : ''}`} onClick={() => setF(f === c ? 'all' : c)} aria-pressed={f === c}>
            <div className="cl">{R.classes[c].label}</div>
            <div className="st">{all.filter(o => o.cls === c).map(o => o.code).join(' · ') || '-'}</div>
            <div className="ru">{R.classes[c].rule}</div>
          </button>
        ))}
      </div>

      <Card title={`${rows.length} state${rows.length === 1 ? '' : 's'}${f === 'all' ? '' : ` in class ${f}`}`} sub="Click a class tile to filter. Open a row to see each plant, its evidence tier and sources."
        right={f !== 'all' ? <button className="btn" onClick={() => setF('all')}>Show all</button> : undefined}>
        <div className="table-wrap">
          <table className="t opp">
            <thead><tr><th>State</th><th>Class</th><th>Plant status evidence</th><th>Reach for ThermGAS</th><th>Competitor environment</th><th>Evidence</th><th>Phase 4 model rank</th></tr></thead>
            <tbody>
              {rows.map(o => (
                <tr key={o.code}>
                  <td><b>{o.name}</b><br /><span className="muted small">{o.plants ? `${o.plants} plant${o.plants > 1 ? 's' : ''} · ${o.gwh} GWh announced` : 'DMC solvent plant'}</span></td>
                  <td><span className={`cls-pill cls-${o.cls}`}>{o.cls} · {R.classes[o.cls].label}</span></td>
                  <td>
                    {Object.keys(o.tiers).sort().map(t => <span key={t} className={`tier tier-${t}`} title={TIERS[t].label}>{o.tiers[t]}× {t}</span>)}
                    <details className="small"><summary>Plant detail</summary>
                      {cellFacilities(o.code).map(fc => (
                        <div key={fc.operator + fc.city} className="pl"><b>{fc.operator.replace(/, per S\d+/, '')}, {fc.city}</b> ({TIERS[tierOf(fc)].label}). {noteOf(fc)}</div>
                      ))}
                      {!o.plants && <div className="pl">UBE DMC/EMC plant, Jefferson Parish. Completion was planned July 2026; start-up not verified.</div>}
                    </details>
                  </td>
                  <td>{REACH[o.reach]}{o.foothold === 0.5 && o.reach !== 'home' && <div className="muted small">University refrigerant references only (Inferred)</div>}</td>
                  <td>{o.competitors.length
                    ? <>{o.competitors.join(', ')}<div className="muted small">{o.competitorsVerified.length ? 'Verified' : 'Inferred'} local presence</div></>
                    : <span className="nodata">Not Verified / Insufficient Evidence</span>}</td>
                  <td><Dots c={o.checks} /></td>
                  <td className="mono">{o.phase4Rank ? `#${o.phase4Rank}` : 'not scored'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>Evidence dots: plant status verified for 2025-26 · competitor channel evidence · ThermGAS foothold. No customer contact has been identified for any plant (Unknown).</p>
      </Card>

      <div className="grid g2">
        <Card title="Plant evidence tiers" sub="Why some plants count more than others">
          <ul className="tier-list">
            {Object.entries(TIERS).map(([k, t]) => <li key={k}><span className={`tier tier-${k}`}>{k}</span> {t.label}</li>)}
          </ul>
          <p className="small muted" style={{ marginBottom: 0 }}>KORE Power (AZ) is excluded: its cancellation is Verified <Src ids={['S141']} />.</p>
        </Card>
        <Card title="How to read this">
          <ul className="plain small">
            <li><b>Reach</b>: {R.reachable}</li>
            {R.caveats.map((c: string) => <li key={c}>{c}</li>)}
            <li><b>Change from Phase 4:</b> {R.refinement_note}</li>
          </ul>
          <div className="toolbar" style={{ marginBottom: 0 }}>
            <button className="btn" onClick={() => go('map', { layer: 'opportunity' })}>Open U.S. map</button>
            <button className="btn" onClick={() => go('strategy')}>Adjust Phase 4 weights</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
