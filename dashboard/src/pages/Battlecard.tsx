import { useEffect, useState } from 'react';
import { products, productById, analysis, bucketOf, shortName, type Product } from '../data';
import { Card, Src, Badge, BucketTag, PageHead } from '../ui';
import { threatLevel } from '../model';

const ROWS: { k: string; l: string; status?: string }[] = [
  { k: 'technology', l: 'Detection technology' },
  { k: 'target_gases', l: 'Target gases' },
  { k: 'dmc_capability', l: 'DMC capability', status: 'dmc_status' },
  { k: 'applications', l: 'Target application' },
  { k: 'sensitivity', l: 'Sensitivity / detection limit' },
  { k: 'range', l: 'Range' },
  { k: 'response_time', l: 'Response time' },
  { k: 'selectivity', l: 'Selectivity / interference' },
  { k: 'accuracy', l: 'Accuracy' },
  { k: 'maintenance', l: 'Maintenance' },
  { k: 'calibration', l: 'Calibration' },
  { k: 'installation', l: 'Installation' },
  { k: 'integration', l: 'System integration' },
  { k: 'certifications', l: 'Certifications' },
  { k: 'price', l: 'Pricing availability' },
  { k: 'warranty', l: 'Warranty' },
  { k: 'conditions', l: 'Test basis / caveats' },
];
const thermgasProducts = products.filter(p => p.company === 'thermgas');
const rivals = products.filter(p => p.company !== 'thermgas');
const NA = /^(not (collected|stated|published|applicable)|n\/a)/i;

export default function Battlecard({ params }: { params: URLSearchParams }) {
  const pre = params.get('p');
  const [tg, setTg] = useState('hgir');
  const [sel, setSel] = useState<string[]>(() => {
    const base = ['falco117', 'riken_fill', 'liontamer'];
    return pre && productById[pre] && pre !== 'hgir' && pre !== 'tp1000' ? [pre, ...base.filter(x => x !== pre)].slice(0, 3) : base;
  });
  useEffect(() => { if (pre && productById[pre] && productById[pre].company !== 'thermgas') setSel(s => [pre, ...s.filter(x => x !== pre)].slice(0, 3)); }, [pre]);

  const toggle = (id: string) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : s.length >= 3 ? [...s.slice(1), id] : [...s, id]);
  const cols: Product[] = [productById[tg], ...sel.map(id => productById[id])];
  const grid = { gridTemplateColumns: `180px repeat(${cols.length}, minmax(180px, 1fr))` };
  const cards = analysis.battlecards.filter((b: any) => sel.includes(b.product));

  return (
    <div className="stack">
      <PageHead kicker="Product Battlecard" title="ThermGAS side by side with up to three competing products"
        lead="Pick a ThermGAS monitor and up to three competitors. Every cell is quoted from the cited document. Missing values stay visible as gaps." />

      <Card>
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <b>ThermGAS product:</b>
          <div className="seg">{thermgasProducts.map(p => <button key={p.id} className={tg === p.id ? 'on' : ''} onClick={() => setTg(p.id)}>{p.model}</button>)}</div>
        </div>
        <div className="toolbar" style={{ marginBottom: 0, alignItems: 'flex-start' }}>
          <b style={{ paddingTop: 4 }}>Compare with (max 3):</b>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
            {rivals.map(p => {
              const on = sel.includes(p.id);
              return (
                <button key={p.id} className={`pchip`} style={on ? { borderColor: 'var(--brand)', background: 'var(--brand-tint-2)' } : {}} onClick={() => toggle(p.id)} aria-pressed={on}>
                  <i style={{ background: `var(--c-${bucketOf(p.category)})` }} />{shortName(p.company)} · {p.model.replace(/\s*\(.*\)$/, '')}{on ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="callout warn">
        <b>Not a leaderboard.</b> These specs are measured on different bases: PID figures are isobutylene-equivalent, Li-ion Tamer reports a rate (ppm/s), ELT3000 a leak rate, and ThermGAS's DMC figure conflicts between its own documents (0.5 vs 1 ppm). So no product is ranked "most sensitive".
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div className="cmp" style={{ minWidth: 180 + cols.length * 200 }}>
          <div className="cmp-row cmp-head" style={grid}>
            <div className="rl" style={{ display: 'flex', alignItems: 'flex-end' }}>Attribute</div>
            {cols.map(p => {
              const t = analysis.threats.find((x: any) => x.product === p.id);
              return (
                <div key={p.id}>
                  <BucketTag bucket={bucketOf(p.category)} />
                  <h4>{shortName(p.company)}<br /><span style={{ fontWeight: 500 }}>{p.model}</span></h4>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {t && <span className={`threat threat-${threatLevel(t.task_overlap, t.battery_gtm)}`}>{threatLevel(t.task_overlap, t.battery_gtm)} threat</span>}
                    <Src ids={p.sources} />
                  </div>
                </div>
              );
            })}
          </div>
          {ROWS.map((r, i) => (
            <div key={r.k} className={`cmp-row ${i % 2 ? 'alt' : ''}`} style={grid}>
              <div className="rl">{r.l}</div>
              {cols.map(p => {
                const v = String(p[r.k] ?? 'Not collected');
                return (
                  <div key={p.id} className={NA.test(v) ? 'nodata' : ''}>
                    {v}
                    {r.status && <div style={{ marginTop: 4 }}><Badge status={p[r.status]} full /></div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {cards.length > 0 && <h2 style={{ fontSize: 22, marginTop: 28 }}>Battlecards</h2>}
      {cards.map((b: any) => <BattleCard key={b.product} b={b} />)}
      {cards.length === 0 && <p className="muted">No narrative battlecard for the selected products. Battlecards exist for ION Science FALCO 2 11.7, Riken Keiki/RKI, Honeywell Li-ion Tamer, Cubic ATRS-1050, MSA Chillgard 5000 and INFICON ELT3000.</p>}
    </div>
  );
}

function Items({ items }: { items: any[] }) {
  return (
    <ul className="bc-list">
      {items.map((x, i) => (
        <li key={i}>{x.text}<div className="m"><Badge status={x.status} full /><Src ids={x.sources} /></div></li>
      ))}
    </ul>
  );
}

export function BattleCard({ b }: { b: any }) {
  return (
    <Card title={b.title} sub={b.their_pitch} right={<BucketTag bucket={bucketOf(productById[b.product].category)} />}>
      <div className="grid g3">
        <div className="bc-col bc-them"><h4>Where they win</h4><Items items={b.where_they_win} /></div>
        <div className="bc-col bc-win"><h4>Where ThermGAS can win</h4><Items items={b.where_thermgas_can_win} /></div>
        <div className="bc-col bc-mine"><h4>Watch-outs for ThermGAS</h4><Items items={b.landmines} /></div>
      </div>
      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="callout"><b>Questions to ask the customer</b><ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{b.discovery_questions.map((q: string) => <li key={q}>{q}</li>)}</ul></div>
        <div className="callout warn"><b>Evidence gaps to close</b><ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{b.evidence_gaps.map((q: string) => <li key={q}>{q}</li>)}</ul></div>
      </div>
    </Card>
  );
}
