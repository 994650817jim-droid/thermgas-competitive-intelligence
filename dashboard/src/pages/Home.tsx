import usmap from '../data/usmap.json';
import { competitors, market, marketStates, facilities, bucketOf, analysis, productById, shortName, XLSX_URL } from '../data';
import { threatLevel } from '../model';
import { Src, Badge } from '../ui';
import { go } from '../App';
import { countBy } from '../alerts';

const RAMP = ['#DCE8FA', '#A9C6F2', '#6F9EE3', '#3A75CF', '#17489A'];

function MiniMap() {
  const st = marketStates.states as Record<string, any>;
  const vals = usmap.states.map(s => st[s.code]?.data_centers?.projects ?? 0);
  const max = Math.max(...vals, 1);
  return (
    <svg viewBox={`0 0 ${usmap.width} ${usmap.height}`} className="mini-map" role="img" aria-label="U.S. map shaded by data center projects">
      {usmap.states.map((s, i) => {
        const v = vals[i];
        const c = v <= 0 ? '#EEF1F6' : RAMP[Math.min(4, Math.floor((v / max) * 4.99))];
        return <path key={s.code} d={s.d} fill={c} stroke="#fff" strokeWidth="1.2" />;
      })}
    </svg>
  );
}

const ORDER = ['High', 'Elevated', 'Moderate', 'Low'];
function Ladder() {
  const rows = [...analysis.threats]
    .map((t: any) => ({ t, lvl: threatLevel(t.task_overlap, t.battery_gtm) }))
    .sort((a, b) => ORDER.indexOf(a.lvl) - ORDER.indexOf(b.lvl))
    .slice(0, 5);
  return (
    <div className="ladder" aria-label="Highest threats">
      <div className="ladder-h">Highest threats to ThermGAS's DMC business</div>
      {rows.map(({ t, lvl }) => {
        const p = productById[t.product];
        return (
          <div key={t.product} className="ladder-row">
            <span className={`threat threat-${lvl}`}>{lvl}</span>
            <span className="ladder-name"><b>{shortName(p.company)}</b> {p.model.replace(/\s*\(.*\)$/, '')}</span>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ v, l, src }: { v: string; l: string; src?: string[] }) {
  return (
    <div className="stat">
      <div className="stat-v mono">{v}</div>
      <div className="stat-l">{l}</div>
      {src && <Src ids={src} />}
    </div>
  );
}

export default function Home() {
  const comp = competitors.filter(c => c.id !== 'thermgas');
  const direct = comp.filter(c => bucketOf(c.category) === 'direct');
  const q1 = market.q1.adopted_summary;
  const cellPlants = facilities.filter(f => f.type.startsWith('Li-ion') && !(/cancel/i.test(f.status_update ?? '') && f.status_update_status === 'Verified')).length;
  const fabRows = market.q2.markets[0].rows.length;
  const dcStates = market.q3.states.length;

  return (
    <div className="home">
      <section className="home-hero">
        <div className="kicker">ThermGAS · U.S. market intelligence</div>
        <h1>Who competes with ThermGAS, and <em>where is the market?</em></h1>
        <p>Two questions, answered with sourced data. Pick one to start; every number opens its source.</p>
        <div className="cta-row">
          <a className="btn-cta" href="#/competitive">See who competes</a>
          <a className="btn-cta outline" href="#/market">Explore the market map</a>
          <a className="btn-link" href={XLSX_URL} download>Download the data (Excel) ↓</a>
        </div>
      </section>

      <div className="home-grid">
        <article className="feature feature-competitive" onClick={() => go('competitive')} tabIndex={0} onKeyDown={e => e.key === 'Enter' && go('competitive')} role="link">
          <div className="feature-top">
            <span className="feature-tag">1 · Competitive</span>
            <span className="feature-go">See who competes →</span>
          </div>
          <h2>Two verified direct competitors. <span>No one has a public U.S. battery-plant reference.</span></h2>
          <div className="chips">
            {direct.map(d => <span key={d.id} className="chip chip-direct"><i />{d.name.replace(/ \(.*\)/, '')}</span>)}
            <span className="chip chip-indirect"><i />Honeywell · event detection</span>
            <span className="chip chip-sub"><i />INFICON · cell leak test</span>
          </div>
          <Ladder />
          <div className="stats">
            <Stat v={String(comp.length)} l="competitors researched" />
            <Stat v={String(direct.length)} l="direct competitors" src={['S22', 'S52']} />
            <Stat v="0" l="public U.S. battery DMC references" src={['S39']} />
          </div>
          <div className="feature-foot"><Badge status="Verified" /> ION Science and Riken Keiki officially market detectors for electrolyte solvents such as DMC.</div>
        </article>

        <article className="feature feature-market" onClick={() => go('market')} tabIndex={0} onKeyDown={e => e.key === 'Enter' && go('market')} role="link">
          <div className="feature-top">
            <span className="feature-tag">2 · Market</span>
            <span className="feature-go">Explore the map →</span>
          </div>
          <h2>Four growth markets, state by state. <span>Click any state for the data and sources.</span></h2>
          <div className="market-visual">
            <MiniMap />
            <div className="legend-mini"><span>Data center projects</span><i style={{ background: RAMP[0] }} /><i style={{ background: RAMP[2] }} /><i style={{ background: RAMP[4] }} /></div>
          </div>
          <div className="stats">
            <Stat v={q1.est.toLocaleString()} l="pharma plants (NAICS 325412 + 325414)" src={['M02', 'M03']} />
            <Stat v="$135.8B" l="data center construction starts, Jan–Sep 2026" src={['M30']} />
            <Stat v={`${fabRows} + ${cellPlants}`} l="named fab projects + battery plants tracked" src={['M14', 'S130']} />
          </div>
          <div className="feature-foot"><Badge status="Verified" /> Texas has the most data center projects and Virginia the most announced investment; {dcStates} states researched in detail.</div>
        </article>
      </div>

      <section className="next-row">
        <div className="next-card"><b>Competitive: do first</b><p>Publish one tested DMC specification so buyers can compare ThermGAS with ION Science and Riken.</p></div>
        <div className="next-card"><b>Market: go first</b><p>Texas, Virginia and Georgia for data centers; {q1.est_50plus} pharma sites with 50+ employees as the first outreach list.</p></div>
        <div className="next-card"><b>Be careful</b><p>Counts show where activity exists, not what ThermGAS can sell. Fit statements are labeled Inferred.</p>
          <div className="wo-bar" style={{ margin: '8px 0 0' }}>
            <a className="wo-link risk" href="#/market?v=watch&lvl=risk">⚠ {countBy('risk')} risks</a>
            <a className="wo-link opp" href="#/market?v=watch&lvl=opportunity">★ {countBy('opportunity')} openings</a>
            <a className="wo-link" href="#/market?v=watch">ⓘ {countBy('caution')} data cautions</a>
          </div></div>
      </section>
    </div>
  );
}
