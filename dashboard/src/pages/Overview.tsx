import { analysis, competitors, products, facilities, states, presence, bucketOf, isPublicPrice, shortName } from '../data';
import { Card, Src, Badge, Legend } from '../ui';
import ThreatMatrix from '../ThreatMatrix';
import { go } from '../App';

export function Bars({ rows, unit, onClick }: { rows: { key: string; label: string; value: number; title?: string }[]; unit?: string; onClick?: (k: string) => void }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <div className="bars">
      {rows.map(r => (
        <div key={r.key} className="bar-row" title={r.title} style={{ cursor: onClick ? 'pointer' : undefined }} onClick={() => onClick?.(r.key)}>
          <span>{r.label}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <span className="n mono">{r.value}{unit ? ` ${unit}` : ''}</span>
        </div>
      ))}
    </div>
  );
}

export default function Overview() {
  const comp = competitors.filter(c => c.id !== 'thermgas');
  const direct = comp.filter(c => bucketOf(c.category) === 'direct');
  const competitorProducts = products.filter(p => p.company !== 'thermgas');
  const verifiedPresenceStates = states.filter(s => presence(s.code, false).length > 0);
  const cellPlants = facilities.filter(f => f.type.startsWith('Li-ion') && !(/cancel/i.test(f.status_update ?? '') && f.status_update_status === 'Verified'));
  const prices = competitorProducts.filter(isPublicPrice);
  const pricesVerified = prices.filter(p => !/Inferred/i.test(p.price));

  const presenceRows = verifiedPresenceStates
    .map(s => ({ key: s.code, label: s.name, value: new Set(presence(s.code, false).map(e => e.company)).size, title: [...new Set(presence(s.code, false).map(e => shortName(e.company)))].join(', ') }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)).slice(0, 8);
  const capacityRows = states.filter(s => s.battery_cell_gwh > 0)
    .map(s => ({ key: s.code, label: s.name, value: s.battery_cell_gwh, title: `${s.battery_cell_plants} cell plant(s)` }))
    .sort((a, b) => b.value - a.value).slice(0, 8);

  const kpis = [
    { v: comp.length, l: 'Competitors researched', s: 'across direct, indirect and substitute', src: [] as string[], st: 'Verified', to: 'competitors' },
    { v: direct.length, l: 'Verified direct competitors', s: direct.map(d => shortName(d.id)).join(' · '), src: ['S22', 'S52'], st: 'Verified', to: 'battlecard' },
    { v: products.length, l: 'Products in the comparison', s: `${competitorProducts.length} competitor + 2 ThermGAS`, src: [], st: 'Verified', to: 'battlecard' },
    { v: verifiedPresenceStates.length, l: 'States with verified competitor local presence', s: 'office, HQ, distributor or service', src: ['S23', 'S51', 'S53', 'S71', 'S92'], st: 'Verified', to: 'map' },
    { v: cellPlants.length, l: 'U.S. Li-ion cell plants tracked', s: 'DOE FCAB list + 2025-26 updates', src: ['S130'], st: 'Verified', to: 'map' },
    { v: pricesVerified.length, l: 'Competitor prices published', s: `${prices.length - pricesVerified.length} more inferred · ThermGAS: none`, src: ['S24', 'S35'], st: 'Verified', to: 'battlecard' },
  ];

  return (
    <div className="stack">
      <section className="hero">
        <div className="kicker">Competitive Intelligence Overview</div>
        <h1>ThermGAS faces <em>two verified direct competitors</em> in U.S. battery-plant DMC monitoring, and <em>no vendor yet owns a public U.S. battery-plant reference.</em></h1>
        <p>ION Science and Riken Keiki/RKI officially sell DMC-capable detectors to battery makers. Honeywell competes for the same gigafactory budget with event detection. ThermGAS's opening is to be the <b>DMC-specific, low-maintenance concentration monitor</b>, once it fixes its own spec evidence.</p>
        <div className="kpis">
          {kpis.map(k => (
            <div key={k.l} className="kpi" role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => go(k.to)} onKeyDown={e => e.key === 'Enter' && go(k.to)}>
              <div className="v mono">{k.v}</div>
              <div className="l"><b>{k.l}</b><br /><span className="muted">{k.s}</span></div>
              <div className="f"><Badge status={k.st} />{k.src.length > 0 && <Src ids={k.src} />}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid g-main">
        <Card title="Who threatens ThermGAS's DMC business?" sub="Threat placement is rule-based from evidence. No market shares or numeric threat scores are used." right={<a className="btn" href="#/strategy">Rules →</a>}>
          <ThreatMatrix />
          <div className="legend-row" style={{ marginTop: 10 }}>
            <span className="bucket bucket-direct"><i />Direct</span>
            <span className="bucket bucket-indirect"><i />Indirect / adjacent</span>
            <span className="bucket bucket-substitute"><i />Potential substitute</span>
          </div>
        </Card>
        <Card title="What matters for ThermGAS" sub="Each finding: the evidence → what it means">
          {analysis.headline_findings.slice(0, 5).map((f: any) => (
            <div key={f.id} className="finding">
              <h4>{f.title}</h4>
              <p className="so">→ {f.so_what}</p>
              <div className="meta"><Badge status={f.status} /><Src ids={f.sources} /></div>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid g3">
        <Card title="Where competitor channels are verified" sub="Competitors with an office, HQ, distributor or service site (Verified only). Click a state for the map.">
          <Bars rows={presenceRows} onClick={k => go('map', { s: k })} />
          <p className="small muted" style={{ marginBottom: 0 }}>{51 - states.filter(s => s.evidence_status === 'Evidence found').length} jurisdictions: Not Verified / Insufficient Evidence. National vendors may still sell there.</p>
        </Card>
        <Card title="Where the battery customers are" sub="Announced Li-ion cell capacity by state, GWh (DOE FCAB; verified cancellations removed)" right={<Src ids={['S130', 'S141']} />}>
          <Bars rows={capacityRows} unit="GWh" onClick={k => go('map', { s: k, layer: 'facilities' })} />
          <p className="small muted" style={{ marginBottom: 0 }}>Nominal announced capacity, not output. Several plants changed status in 2025-26.</p>
        </Card>
        <Card title="Strategic implications" sub="Top actions, ranked" right={<a className="btn" href="#/strategy">All →</a>}>
          {analysis.recommendations.slice(0, 4).map((r: any) => (
            <div key={r.id} className="finding">
              <h4>{r.priority}. {r.title}</h4>
              <p>{r.business_case}</p>
              <div className="meta"><Src ids={r.evidence} /></div>
            </div>
          ))}
        </Card>
      </div>
      <Legend />
    </div>
  );
}
