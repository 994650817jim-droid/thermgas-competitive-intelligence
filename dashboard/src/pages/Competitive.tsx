import { useState } from 'react';
import { analysis, competitors, products, bucketOf, shortName, watchouts } from '../data';
import { AlertList, sortAlerts } from '../alerts';
import { Card, Src, Badge, PageHead, Summary } from '../ui';
import ThreatMatrix from '../ThreatMatrix';
import Competitors from './Competitors';
import Battlecard from './Battlecard';
import Strategy from './Strategy';
import { go } from '../App';

type View = 'who' | 'compare' | 'list' | 'strategy';
const VIEWS: { k: View; l: string; d: string }[] = [
  { k: 'who', l: 'Who competes', d: 'The short answer' },
  { k: 'compare', l: 'Compare products', d: 'ThermGAS side by side' },
  { k: 'list', l: 'All companies', d: 'Profiles and sources' },
  { k: 'strategy', l: 'What to do', d: 'SWOT and actions' },
];

function Who() {
  const [more, setMore] = useState(false);
  const sum = [
    { label: 'Direct rivals', kw: '2', line: 'ION Science and Riken Keiki/RKI already sell to battery plants', src: ['S22', 'S52'] },
    { label: 'Different job', kw: 'Event ≠ ppm', line: 'Honeywell detects venting events; ThermGAS measures DMC concentration', src: ['S37'] },
    { label: 'Open field', kw: 'No U.S. reference', line: 'No vendor has a public U.S. battery-plant DMC case study', src: ['S39'] },
    { label: 'Fix first', kw: 'One tested spec', line: 'ThermGAS shows 0.5 ppm and 1 ppm for DMC; publish one', src: ['S01', 'S02'] },
  ];
  const comp = competitors.filter(c => c.id !== 'thermgas');
  const direct = comp.filter(c => bucketOf(c.category) === 'direct');
  const f = analysis.headline_findings.slice(0, 3);
  return (
    <div className="stack">
      <Summary title="Competitive" items={sum} foot={<><b>Position:</b> the DMC-specific, low-maintenance measurement that complements event detection.</>} />
      <div className="grid g-main">
        <Card title="Who threatens ThermGAS's DMC business?" sub="Up = does the same job as ThermGAS. Right = sold to U.S. battery plants. Click a product.">
          <ThreatMatrix />
          <div className="legend-row" style={{ marginTop: 10 }}>
            <span className="bucket bucket-direct"><i />Direct</span>
            <span className="bucket bucket-indirect"><i />Indirect / adjacent</span>
            <span className="bucket bucket-substitute"><i />Potential substitute</span>
          </div>
        </Card>
        <div className="stack">
          <Card title="The two to watch" sub="Both officially sell DMC-capable detectors to battery plants">
            {direct.map(d => (
              <div key={d.id} className="duo">
                <div className="duo-name">{shortName(d.id)}<Badge status={d.evidence_level} /></div>
                <p>{d.relationship}</p>
                <div className="duo-actions"><Src ids={d.sources} /><button className="btn" onClick={() => go('competitive', { v: 'list', c: d.id })}>Profile</button></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <button className="btn" onClick={() => setMore(!more)} aria-expanded={more}>{more ? 'Hide detail' : 'More detail: things to watch and why it matters'}</button>
        <span className="small muted">{comp.length} competitors, {products.length} products researched</span>
      </div>
      {more && (
        <div className="grid g2">
          <Card title="Be careful" sub="Conflicts and openings found in the evidence">
            <AlertList items={sortAlerts(watchouts.filter(w => w.market === 'competitive'))} showScope={false} />
          </Card>
          <Card title="Why this matters">
            {f.map((x: any) => (
              <div key={x.id} className="finding">
                <h4>{x.title}</h4>
                <p className="so">→ {x.so_what}</p>
                <div className="meta"><Badge status={x.status} /><Src ids={x.sources} /></div>
              </div>
            ))}
          </Card>
        </div>
      )}
      {more && <p className="small muted">Threat placement follows written rules; no market shares or numeric threat scores are used.</p>}
    </div>
  );
}

export default function Competitive({ params }: { params: URLSearchParams }) {
  const v = (params.get('v') as View) || 'who';
  const view = VIEWS.some(x => x.k === v) ? v : 'who';
  return (
    <div className="stack">
      <PageHead kicker="1 · Competitive" title="Who competes with ThermGAS in DMC vapor monitoring?"
        lead="ION Science and Riken Keiki/RKI are the verified direct competitors. Honeywell competes for the same battery-plant safety budget with a different measurement." />
      <div className="subnav" role="tablist" aria-label="Competitive views">
        {VIEWS.map(x => (
          <a key={x.k} role="tab" aria-selected={view === x.k} href={`#/competitive?v=${x.k}`} className={view === x.k ? 'on' : ''}>
            <b>{x.l}</b><span>{x.d}</span>
          </a>
        ))}
      </div>
      {view === 'who' && <Who />}
      <div className="subpage">
        {view === 'compare' && <Battlecard params={params} />}
        {view === 'list' && <Competitors params={params} />}
        {view === 'strategy' && <Strategy />}
      </div>
    </div>
  );
}
