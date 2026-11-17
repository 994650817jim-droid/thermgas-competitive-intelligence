import { useMemo, useState } from 'react';
import { competitors, products, evidence, excluded, bucketOf, compById, sourceById, type Bucket } from '../data';
import { Card, Src, Badge, BucketTag } from '../ui';
import { go } from '../App';

const FILTERS: { k: 'all' | Bucket; l: string }[] = [
  { k: 'all', l: 'All' }, { k: 'direct', l: 'Direct' }, { k: 'indirect', l: 'Indirect / adjacent' }, { k: 'substitute', l: 'Substitutes' }, { k: 'subject', l: 'ThermGAS' },
];
const clip = (s: string, n = 150) => {
  if (!s || s.length <= n) return s;
  const cut = s.slice(0, n);
  const i = Math.max(cut.lastIndexOf(';'), cut.lastIndexOf('. '));
  return (i > 60 ? cut.slice(0, i) : cut.replace(/\s+\S*$/, '')) + '…';
};
const ORDER: Record<Bucket, number> = { direct: 0, indirect: 1, substitute: 2, subject: 3 };

export default function Competitors({ params }: { params: URLSearchParams }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState<'all' | Bucket>('all');
  const [detail, setDetail] = useState(false);
  const sel = params.get('c') ?? 'ionscience';
  const list = useMemo(() => competitors
    .filter(c => f === 'all' || bucketOf(c.category) === f)
    .filter(c => !q || JSON.stringify(c).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => ORDER[bucketOf(a.category)] - ORDER[bucketOf(b.category)] || a.name.localeCompare(b.name)), [q, f]);
  const c = compById[sel] ?? competitors[0];
  const prods = products.filter(p => p.company === c.id);
  const ev = evidence.filter(e => e.company === c.id);

  return (
    <div className="stack">
      <p className="lead" style={{ margin: 0 }}>Each company was screened on one question: <b>can it do ThermGAS's job of continuous DMC monitoring in battery plants?</b> Pick a company for the short profile.</p>
      <div className="toolbar">
        <input className="input" placeholder="Search companies, products, states…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search competitors" />
        <div className="seg" role="group" aria-label="Filter by category">
          {FILTERS.map(x => <button key={x.k} className={f === x.k ? 'on' : ''} onClick={() => setF(x.k)}>{x.l}</button>)}
        </div>
        <span className="muted small">{list.length} shown</span>
      </div>
      <div className="grid g-side">
        <div className="comp-list">
          {list.map(x => (
            <button key={x.id} className={`comp-item ${x.id === c.id ? 'on' : ''}`} onClick={() => go('competitors', { c: x.id })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span className="nm">{x.name}</span><Badge status={x.evidence_level} />
              </div>
              <div style={{ marginTop: 4 }}><BucketTag bucket={bucketOf(x.category)} /></div>
              <div className="small muted" style={{ marginTop: 4 }}>{x.relevant_products.slice(0, 2).join(' · ')}</div>
            </button>
          ))}
          {list.length === 0 && <p className="nodata">No company matches.</p>}
        </div>

        <div className="stack">
          <Card title={c.name} sub={c.category} right={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Badge status={c.evidence_level} full /><Src ids={c.sources} /></div>}>
            <div className="callout" style={{ marginBottom: 14 }}><b>Relationship to ThermGAS:</b> {c.relationship}</div>
            <dl className="kv">
              <dt>Headquarters</dt><dd>{c.hq} <Badge status={c.hq_status} /> {c.hq_source && <Src ids={[c.hq_source]} label={c.hq_source} />}</dd>
              <dt>Industry focus</dt><dd>{c.industry_focus}</dd>
              <dt>Battery experience</dt><dd>{detail ? c.battery_experience : clip(c.battery_experience)}</dd>
              {detail && <>
                <dt>Why this category</dt><dd>{c.rationale}</dd>
                <dt>Website</dt><dd><a href={c.website} target="_blank" rel="noreferrer">{c.website}</a></dd>
                <dt>U.S. presence</dt><dd>{c.us_presence}</dd>
                <dt>Company size</dt><dd>{c.company_size}</dd>
              </>}
            </dl>
          </Card>
          <div className="toolbar" style={{ marginBottom: 0 }}>
            <button className="btn" onClick={() => setDetail(!detail)} aria-expanded={detail}>{detail ? 'Hide full evidence' : 'Full evidence: products, states, sources'}</button>
          </div>

          {detail && <>
          <Card title="Relevant products" sub="Open the battlecard to compare side by side with ThermGAS">
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Model</th><th>Technology</th><th>DMC capability</th><th>Price</th><th></th></tr></thead>
                <tbody>
                  {prods.map(p => (
                    <tr key={p.id}>
                      <td><b>{p.model}</b></td>
                      <td>{p.technology}</td>
                      <td>{p.dmc_capability}<div style={{ marginTop: 4 }}><Badge status={p.dmc_status} full /></div></td>
                      <td>{p.price}</td>
                      <td><button className="btn" onClick={() => go('battlecard', { p: p.id })}>Battlecard</button></td>
                    </tr>
                  ))}
                  {prods.length === 0 && <tr><td colSpan={5} className="nodata">No product row (watch-list company).</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="State-level evidence" sub="Each row is one fact; metric types are never summed together">
            {ev.length === 0 ? <p className="nodata">Not Verified / Insufficient Evidence: no state-level office, distributor, service or installation found.</p> : (
              <div className="table-wrap">
                <table className="t">
                  <thead><tr><th>State</th><th>Metric</th><th>Evidence</th><th>Status</th><th>Source</th></tr></thead>
                  <tbody>
                    {ev.map((e, i) => (
                      <tr key={i}>
                        <td><a href={`#/map?s=${e.state}`}>{e.state}</a></td><td>{e.metric.replace('_', ' ')}</td>
                        <td>{e.value}{e.notes && <div className="small muted">{e.notes}</div>}</td>
                        <td><Badge status={e.status} /></td><td><Src ids={[e.source]} label={e.source} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          <Card title="Source documents for this company">
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5 }}>
              {c.sources.map(id => sourceById[id] && <li key={id}><b>{id}</b> · {sourceById[id].title} - <a href={sourceById[id].url} target="_blank" rel="noreferrer">link</a></li>)}
            </ul>
          </Card>
          </>}
        </div>
      </div>

      {detail && <Card title="Excluded candidates" sub="Screened out, with the reason recorded" className="" >
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Company</th><th>Product</th><th>Reason for exclusion</th><th>Evidence</th></tr></thead>
            <tbody>{excluded.map(x => <tr key={x.name}><td><b>{x.name}</b></td><td>{x.product}</td><td>{x.reason}</td><td>{/^http/.test(x.evidence) ? <a href={x.evidence} target="_blank" rel="noreferrer">link</a> : x.evidence}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>}
    </div>
  );
}
