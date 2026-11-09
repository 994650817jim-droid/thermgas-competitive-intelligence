import { useMemo, useState, type ReactNode } from 'react';
import { growth, growthById, dcBuildByState, dcByState, dcRank, stateByCode, compById, shortName } from '../data';
import { Badge, Src, statusClass } from '../ui';
import { opportunities } from '../exec';
import { systemsEstimate } from '../growth';
import { go } from '../App';
import OppMap, { type MapLayer } from '../OppMap';

const SECTIONS = [
  { id: 'primer', label: 'Industry' },
  { id: 'fit', label: 'Where it fits' },
  { id: 'reuse', label: 'Product reuse' },
  { id: 'market', label: 'Market size' },
  { id: 'buyers', label: 'Who buys' },
  { id: 'competition', label: 'Competitors' },
  { id: 'assets', label: 'ThermGAS assets' },
  { id: 'states', label: 'Priority states' },
  { id: 'entry', label: 'Entry plan' },
];
const TIMING = ['Now', 'Next', 'Later', 'Explore'];
const FIT_ORDER = ['Strong', 'Medium', 'New', 'Niche', 'Adjacent', 'Watch'];
const MAP_LAYER: Record<string, MapLayer> = { datacenters: 'datacenter', semiconductors: 'semis', pharma: 'pharma' };

/** Evidence line under every claim: label plus source chip. */
const Ev = ({ status, sources }: { status: string; sources?: string[] }) => (
  <span className="ev-line"><Badge status={status} />{(sources?.length || status === 'Assumption') ? <Src ids={sources ?? []} /> : status === 'Unknown' ? null : <span className="muted small">team analysis</span>}</span>
);

function Section({ id, title, lead, children }: { id: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section id={`am-${id}`} className="am-sec" aria-labelledby={`am-${id}-h`}>
      <header className="am-sec-head">
        <h2 id={`am-${id}-h`} className="band-title">{title}</h2>
        {lead && <p className="am-sec-lead">{lead}</p>}
      </header>
      {children}
    </section>
  );
}

function Sizing({ sz }: { sz: any }) {
  const interactive = sz.interactive && sz.inputs[0]?.value && sz.inputs[2]?.value_low;
  const mw = sz.inputs[0]?.value as number; const block = sz.inputs[1]?.value as number;
  const lo = sz.inputs[2]?.value_low as number, hi = sz.inputs[2]?.value_high as number;
  const [per, setPer] = useState<number>(lo || 2);
  return (
    <div className={`am-model ${statusClass(sz.status)}`}>
      <div className="am-model-head"><h3>{sz.title}</h3><Badge status={sz.status} /></div>
      <p className="am-formula">{sz.formula}</p>
      <div className={`am-model-body ${interactive ? '' : 'single'}`}>
        <dl className="am-inputs">
          {sz.inputs.map((i: any) => (
            <div key={i.name}><dt>{i.name}</dt><dd><b>{i.display}</b> <Ev status={i.status} sources={i.sources} />{i.note && <span className="muted small">{i.note}</span>}</dd></div>
          ))}
        </dl>
        {interactive && (
          <div className="am-calc">
            <label htmlFor="am-per">Systems per {block} MW block</label>
            <input id="am-per" type="range" min={1} max={6} step={1} value={per} onChange={e => setPer(+e.target.value)} aria-valuetext={`${per} systems per block`} />
            <div className="am-calc-out" aria-live="polite">
              <span className="am-calc-n mono">{systemsEstimate(mw, block, per).toLocaleString('en-US')}</span>
              <span className="small">systems for the current pipeline at {per} per block</span>
            </div>
            <p className="small muted">The team's range is {lo} to {hi} per block: about {systemsEstimate(mw, block, lo).toLocaleString('en-US')} to {systemsEstimate(mw, block, hi).toLocaleString('en-US')} systems. No dollar value is shown.</p>
          </div>
        )}
      </div>
      <details className="am-limits" open={!interactive}><summary>Limitations of this {interactive ? 'model' : 'structure'}</summary>
        <ul className="plain">{sz.limitations.map((l: string) => <li key={l}>{l}</li>)}</ul>
      </details>
    </div>
  );
}

function Player({ p, primary }: { p: any; primary?: boolean }) {
  const col = (title: string, cls: string, items: any[]) => items.length > 0 && (
    <div className={`am-pcol ${cls}`}>
      <h4>{title}</h4>
      <ul>{items.map((x: any, i: number) => <li key={i}>{x.text}<Ev status={x.status} sources={x.sources} /></li>)}</ul>
    </div>
  );
  const battery = p.company_id ? compById[p.company_id] : null;
  return (
    <article className={`am-player ${primary ? 'primary' : ''}`}>
      <header>
        <h3>{p.name}</h3><span className="am-role">{p.role}</span>
        {p.product_line && <span className="am-line">{p.product_line}</span>}
      </header>
      {battery && <p className="am-same-co small">Also in the battery research as {shortName(battery.id)}, with a different product line. That profile and its threat level are unchanged. <a href={`#/competitors?c=${battery.id}`}>Battery profile</a></p>}
      <div className="am-pcols">
        {col('They win on', 'win', p.they_win)}
        {col('ThermGAS can win on', 'tg', p.thermgas_can_win)}
        {col('Watch out', 'watch', p.watch_out)}
      </div>
    </article>
  );
}

function Market({ m }: { m: any }) {
  const opp = useMemo(() => Object.fromEntries(opportunities().map(o => [o.code, o])), []);
  const jump = (id: string) => document.getElementById(`am-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const h2h = m.competition.head_to_head;
  const cards = m.competition.players.filter((p: any) => p.landscape_card);
  const others = m.competition.players.filter((p: any) => !p.landscape_card);
  const fits = [...m.entry_points.rows].sort((a: any, b: any) => FIT_ORDER.indexOf(a.fit) - FIT_ORDER.indexOf(b.fit));
  const layer = m.geography.layer;
  const cell = (key: string, p: any) => {
    if (key === 'build') { const b = dcBuildByState[p.state]; return b ? <><b className="mono">{b.value.toLocaleString('en-US')} MW</b><div className="muted small">{b.label.split(':')[0]}</div></> : <span className="nodata">Not available</span>; }
    if (key === 'load') { const l = dcByState[p.state]; return l ? <><b className="mono">{(l.mwh_2023 / 1e6).toFixed(1)} TWh</b><div className="muted small">#{dcRank(p.state)} of 44</div></> : <span className="nodata">Not in EPRI table</span>; }
    if (key === 'layer') { const r = layer.rows.find((x: any) => x.state === p.state); return r ? <b className="mono">{r.value}</b> : <span className="nodata">Not available</span>; }
    return p[key] ?? <span className="nodata">Not available</span>;
  };

  return (
    <>
      <header className="am-hero">
        <h1>{m.title}</h1>
        <p className="lead">{m.lead}</p>
        <p className="am-brief small">Source: {m.brief}, checked against the original sources on {growth.meta.as_of}.</p>
      </header>

      <section className="am-verdict" aria-label="Our read">
        <p className="am-verdict-h">{m.verdict.headline}</p>
        <div className="am-answers">
          {m.verdict.answers.map((a: any) => (
            <div key={a.q} className={`am-answer ${statusClass(a.status)}`}>
              <div className="am-q">{a.q}</div>
              <p>{a.a}</p>
              <Ev status={a.status} sources={a.sources} />
            </div>
          ))}
        </div>
        <p className="am-verdict-note small"><span className="prop-chip">Proposal</span>{growth.meta.status_note}</p>
      </section>

      <dl className="readouts am-readouts">
        {m.readouts.map((r: any) => (
          <div key={r.label} className="readout">
            <dt>{r.label}</dt>
            <dd><span className="num">{r.value}</span>{r.unit && <span className="am-unit">{r.unit}</span>}</dd>
            <div className="rd-sub">{r.sub}</div>
            <div className="rd-meta"><Ev status={r.status} sources={r.sources} /></div>
          </div>
        ))}
      </dl>

      <nav className="am-jump" aria-label="Sections on this page">
        {SECTIONS.map(s => <button key={s.id} type="button" onClick={() => jump(s.id)}>{s.label}</button>)}
      </nav>

      <Section id="primer" title="Industry primer" lead={m.primer.summary}>
        <div className="table-wrap"><table className="t">
          <thead><tr>{m.primer.headers.map((h: string) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{m.primer.rows.map((r: string[]) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{i === 0 ? <b>{c}</b> : c}</td>)}</tr>)}</tbody>
        </table></div>
        <p className="small muted am-primer-note"><Badge status={m.primer.status} /> General industry background from the team brief; confirm with ThermGAS's applications team.</p>
        <ul className="am-notes">{m.primer.notes.map((n: any) => <li key={n.text}>{n.text} <Ev status={n.status} sources={n.sources} /></li>)}</ul>
      </Section>

      <Section id="fit" title="Where leak detection fits" lead={m.entry_points.summary}>
        <ol className="am-fit am-fit-wide">
          {fits.map((u: any) => (
            <li key={u.where}>
              <span className={`am-fitpill fit-${u.fit.toLowerCase()}`}>{u.fit}</span>
              <div>
                <b>{u.where}</b>
                <p className="small">{u.leak}. {u.why}.</p>
                <p className="small"><span className="muted">ThermGAS product:</span> {u.product}. <span className="muted">{u.fit_note}.</span></p>
                <Ev status={u.status} sources={u.sources} />
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="reuse" title="Can ThermGAS's existing products be reused?" lead={m.reuse.summary}>
        <div className="grid g2 am-reuse">
          <div className="am-transfer">
            <h3 className="am-h3">What transfers</h3>
            <ul className="am-notes">{m.reuse.transfers.map((t: any) => <li key={t.text}>{t.text} <Ev status={t.status} sources={t.sources} /></li>)}</ul>
            {m.reuse.does_not && <p className="small am-doesnot"><b>What does not:</b> {m.reuse.does_not}</p>}
          </div>
          <div>
            <h3 className="am-h3">Gaps to close</h3>
            <ul className="am-gaps">{m.reuse.gaps.map((g: any) => (
              <li key={g.gap} className={statusClass(g.status)}><b>{g.gap}</b><p className="small muted">{g.why}</p><p className="small">{g.check}</p><Ev status={g.status} sources={g.sources} /></li>
            ))}</ul>
          </div>
        </div>
      </Section>

      <Section id="market" title="Market size and why it is attractive" lead={m.market.summary}>
        {m.market.drivers?.length > 0 && (
          <div className="am-drivers">
            {m.market.drivers.map((d: any) => (
              <article key={d.title} className={`am-driver ${statusClass(d.status)}`}>
                <h3>{d.title}</h3><p>{d.text}</p><Ev status={d.status} sources={d.sources} />{d.note && <p className="am-note">{d.note}</p>}
              </article>
            ))}
          </div>
        )}
        <ul className="am-ind am-ind-grid">
          {m.market.indicators.map((i: any) => (
            <li key={i.indicator}><span className="muted small">{i.indicator}</span><b>{i.figure}</b><Ev status={i.status} sources={i.sources} /></li>
          ))}
        </ul>
        <Sizing sz={m.market.sizing} />
      </Section>

      <Section id="buyers" title="Who buys and how" lead={m.buyers.summary}>
        <div className="am-lanes">
          {TIMING.map(t => {
            const segs = m.buyers.segments.filter((s: any) => s.timing === t);
            if (!segs.length) return null;
            return (
              <div key={t} className={`am-lane lane-${t.toLowerCase()}`}>
                <h3>{t}</h3>
                <div className="am-lane-items">
                  {segs.map((s: any) => (
                    <div key={s.segment} className="am-seg">
                      <b>{s.segment}</b>
                      <p className="small muted">{s.examples}</p>
                      <p className="small"><span className="muted">Decides:</span> {s.decides}</p>
                      <p className="small"><span className="muted">Reach:</span> {s.reach}</p>
                      <Badge status={s.status} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="competition" title="Competitors" lead={m.competition.summary}>
        {h2h && (
          <>
            <div className="am-h2h" role="table" aria-label={`${h2h.left} compared with ${h2h.right}`}>
              <div className="am-h2h-row am-h2h-head" role="row"><div role="columnheader" /><div role="columnheader" className="tg">{h2h.left}</div><div role="columnheader">{h2h.right}</div></div>
              {h2h.rows.map((r: any) => (
                <div key={r.attr} className="am-h2h-row" role="row">
                  <div role="rowheader" className="attr">{r.attr}</div>
                  <div role="cell" className="tg"><span>{r.left}</span><Ev status={r.left_status} sources={r.left_sources} /></div>
                  <div role="cell"><span>{r.right}</span><Ev status={r.right_status} sources={r.right_sources} /></div>
                </div>
              ))}
            </div>
            <p className="am-takeaway"><Badge status={h2h.takeaway_status} /> {h2h.takeaway}</p>
          </>
        )}
        <div className={`am-cards ${cards.length > 1 ? 'two' : ''}`}>{cards.map((p: any) => <Player key={p.name} p={p} primary />)}</div>
        {others.length > 0 && (
          <details className="more-detail"><summary>{others.length} other supplier{others.length > 1 ? 's' : ''} in this market</summary>
            <div className="am-others">{others.map((p: any) => <Player key={p.name} p={p} />)}</div>
          </details>
        )}
        <p className="small muted">{m.competition.scope_note}</p>
      </Section>

      <Section id="assets" title="ThermGAS assets and website suggestions" lead={m.assets.summary}>
        <ul className="am-proof">
          {m.assets.items.map((p: any) => (
            <li key={p.text} className={statusClass(p.status)}><p><b>{p.text}</b></p><p className="small muted">{p.caveat}</p><Ev status={p.status} sources={p.sources} /></li>
          ))}
        </ul>
        <div className="grid g2 am-site">
          <div>
            <h3 className="am-h3">Add to ThermGAS's website, in priority order</h3>
            <ol className="am-improve">{m.assets.improvements.map((t: string) => <li key={t}>{t}</li>)}</ol>
          </div>
          <div className="am-message">
            <h3 className="am-h3">Suggested message (draft)</h3>
            <blockquote>{m.assets.message}</blockquote>
            {m.assets.message_note && <p className="small muted">{m.assets.message_note}</p>}
          </div>
        </div>
      </Section>

      <Section id="states" title="Priority states" lead={m.geography.summary}>
        <div className="mapband am-map"><OppMap key={m.id} initial={MAP_LAYER[m.id]} initialDcMetric="build" growthLayers /></div>
        <p className="callout small">{m.geography.reading_note}</p>
        <div className="table-wrap">
          <table className="t am-states">
            <thead><tr><th>Priority</th><th>State</th>{m.geography.columns.map((c: any) => <th key={c.key}>{c.label}</th>)}<th>Battery class</th><th>Why</th></tr></thead>
            <tbody>
              {m.geography.priority_states.map((p: any) => {
                const o = opp[p.state];
                return (
                  <tr key={p.state}>
                    <td className="mono">{p.rank}</td>
                    <td><b>{stateByCode[p.state].name}</b></td>
                    {m.geography.columns.map((c: any) => <td key={c.key}>{cell(c.key, p)}</td>)}
                    <td>{o ? <span className={`cls-pill cls-${o.cls}`}>{o.cls}</span> : <span className="muted small">No cell plant</span>}</td>
                    <td>{p.why} <Ev status={p.status} sources={p.sources} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted">{layer.metric}: {layer.note} Battery class comes from the Market Opportunities page and is not changed here.</p>
      </Section>

      <Section id="entry" title="Entry plan and questions for ThermGAS">
        <div className="am-entry"><span className="prop-chip">Proposal</span><p>{m.entry.recommendations?.entry ?? m.verdict.headline}</p></div>
        <div className="grid g2 am-plan">
          <div>
            <h3 className="am-h3">Recommended entry plan</h3>
            <ol className="am-improve">{m.entry.plan.map((t: string) => <li key={t}>{t}</li>)}</ol>
          </div>
          <div className="am-questions">
            <h3 className="am-h3">Questions for ThermGAS</h3>
            <ul className="plain">{m.entry.questions.map((q: string) => <li key={q}>{q}</li>)}</ul>
          </div>
        </div>
        {m.entry.recommendations && (
          <>
            <ol className="am-prio">
              {m.entry.recommendations.priorities.map((p: any) => (
                <li key={p.level} className={p.level === 'Option' ? 'opt' : ''}><span className="am-level">{p.level}</span><div><b>{p.title}</b><p className="small">{p.why}</p></div></li>
              ))}
            </ol>
            <h3 className="am-h3">Main risks</h3>
            <div className="table-wrap"><table className="t">
              <thead><tr><th>Risk</th><th>Impact</th><th>Early warning</th><th>Mitigation</th><th>Evidence</th></tr></thead>
              <tbody>{m.entry.recommendations.risks.map((r: any) => <tr key={r.risk}><td><b>{r.risk}</b></td><td>{r.impact}</td><td>{r.early_warning}</td><td>{r.mitigation}</td><td><Ev status={r.status} sources={r.sources} /></td></tr>)}</tbody>
            </table></div>
          </>
        )}
        {m.entry.plan90 && (
          <>
            <h3 className="am-h3">90-day action plan</h3>
            <p className="small muted">{m.entry.plan90.note}</p>
            <div className="phases">
              {m.entry.plan90.phases.map((p: any) => (
                <section key={p.days} className="phase card">
                  <header><div className="days">{p.days}</div><h3>{p.name}</h3></header>
                  <ul className="tasks">{p.items.map((it: any) => <li key={it.task}><b>{it.task}</b><span className="owner-tag">{it.owner}</span></li>)}</ul>
                  <div className="gate"><div className="gname">◆ {p.gate.name}</div><p className="small"><b className="go">Go</b> {p.gate.go}</p><p className="small"><b className="nogo">Stop</b> {p.gate.stop}</p></div>
                </section>
              ))}
            </div>
          </>
        )}
        {m.note && <div className="callout am-regnote"><b>{m.note.title}.</b> {m.note.text} <Ev status={m.note.status} sources={m.note.sources} /></div>}
        <details className="more-detail am-checks"><summary>How this page was checked</summary>
          <ul className="plain small">{(m.checks ?? []).map((c: string) => <li key={c}>{c}</li>)}</ul>
        </details>
      </Section>
    </>
  );
}

export default function GrowthMarkets({ params }: { params: URLSearchParams }) {
  const id = growthById[params.get('m') ?? ''] ? params.get('m')! : growth.markets[0].id;
  const m = growthById[id];
  return (
    <div className="am">
      <div className="gm-top">
        <p className="am-tag"><span className="am-tag-dot" aria-hidden />Growth markets, evidence as of {growth.meta.as_of}</p>
        <div className="gm-tabs" role="tablist" aria-label="Growth market">
          {growth.markets.map((x: any) => (
            <button key={x.id} role="tab" aria-selected={x.id === id} className={x.id === id ? 'on' : ''} onClick={() => go('growth', { m: x.id })}>{x.label}</button>
          ))}
        </div>
      </div>
      <Market key={id} m={m} />
    </div>
  );
}
