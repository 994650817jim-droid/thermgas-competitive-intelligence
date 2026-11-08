import { useMemo, useState } from 'react';
import { executive, dataCenters, dcByState, dcRank, stateByCode } from '../data';
import { Card, Src, PageHead, Badge } from '../ui';
import { opportunities, cellFacilities, tierOf, noteOf, TIERS, type OppClass } from '../exec';
import { go } from '../App';
import OppMap from '../OppMap';
import { Bars } from './Overview';

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
        lead="Research priority, not revenue. Classes combine plant status evidence, reach from Georgia, competitors and evidence completeness." />

      <section className="card map-hero">
        <OppMap initial="battery" />
      </section>

      <div className="callout warn small">
        <b>Re-check:</b> HL-GA (GA), LGES Queen Creek (AZ) and UBE (LA) start dates have passed without confirmation.
      </div>

      <div className="grid g4">
        {CLS_ORDER.map(c => (
          <button key={c} className={`cls-tile cls-${c} ${f === c ? 'on' : ''}`} onClick={() => setF(f === c ? 'all' : c)} aria-pressed={f === c}>
            <div className="cl">{R.classes[c].label}</div>
            <div className="st">{all.filter(o => o.cls === c).map(o => o.code).join(' · ') || '-'}</div>
            <div className="ru" title={R.classes[c].rule}>{({ A: 'Verified plants, reachable from GA', B: 'Verified plants, no reach yet', C: 'Plant status not re-verified', D: 'DMC producer, not a cell plant' } as const)[c]}</div>
          </button>
        ))}
      </div>

      <Card title={`${rows.length} state${rows.length === 1 ? '' : 's'}${f === 'all' ? '' : ` in class ${f}`}`} sub="Click a class tile to filter. Open a row to see each plant, its evidence tier and sources."
        right={f !== 'all' ? <button className="btn" onClick={() => setF('all')}>Show all</button> : undefined}>
        <div className="table-wrap">
          <table className="t opp">
            <thead><tr><th>State</th><th>Class</th><th>Plant status evidence</th><th>Reach for ThermGAS</th><th>Competitor environment</th><th>Data center load</th><th>Evidence</th><th>Phase 4 rank</th></tr></thead>
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
                  <td>{dcByState[o.code] ? <><b className="mono">{(dcByState[o.code].mwh_2023 / 1e6).toFixed(1)} TWh</b><div className="muted small">#{dcRank(o.code)} of 44</div></> : <span className="nodata">Not in EPRI table</span>}</td>
                  <td><Dots c={o.checks} /></td>
                  <td className="mono">{o.phase4Rank ? `#${o.phase4Rank}` : 'not scored'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>Evidence dots: plant status verified for 2025-26 · competitor channel evidence · ThermGAS foothold. No customer contact has been identified for any plant (Unknown).</p>
      </Card>

      <div className="grid">
        <Card title="Adjacent segment: data center cooling" sub="Top states by 2023 data center electricity load (EPRI). A proxy for cooling demand, not a site count or market size." right={<Src ids={['S160']} />}>
          <Bars rows={[...dataCenters.rows].sort((a, b) => b.mwh_2023 - a.mwh_2023).slice(0, 10).map(r => ({ key: r.state, label: `${stateByCode[r.state].name}${all.some(o => o.code === r.state && (o.cls === 'A' || o.cls === 'B')) ? ' ●' : ''}`, value: +(r.mwh_2023 / 1e6).toFixed(1), title: `${r.pct_state_electricity_2023}% of state electricity` }))} unit="TWh" onClick={k => go('map', { s: k, layer: 'datacenters' })} />
          <p className="small" style={{ marginBottom: 0 }}>● also an Engage-now or Prepare battery state. ThermGAS markets data center refrigerant detection <Badge status="Verified" /> <Src ids={['S161']} />; MSA targets the same buyers <Src ids={['S162']} />.</p>
        </Card>
      </div>
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
