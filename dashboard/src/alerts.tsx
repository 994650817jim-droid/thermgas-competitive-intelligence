import { watchouts, stateByCode, type Watchout } from './data';
import { Badge, Src } from './ui';
import { go } from './App';

export const LEVELS = {
  risk: { icon: '⚠', label: 'Risk', plural: 'Risks' },
  opportunity: { icon: '★', label: 'Opportunity', plural: 'Opportunities' },
  caution: { icon: 'ⓘ', label: 'Data caution', plural: 'Data cautions' },
} as const;
export const MARKETS: Record<string, string> = { all: 'All markets', datacenters: 'Data centers', pharma: 'Pharma', batteries: 'Batteries', chips: 'Chips', competitive: 'Competitive' };
const ORDER = { risk: 0, opportunity: 1, caution: 2 } as const;

export const sortAlerts = (a: Watchout[]) => [...a].sort((x, y) => ORDER[x.level] - ORDER[y.level] || x.scope.localeCompare(y.scope));
export const alertsFor = (scope: string) => sortAlerts(watchouts.filter(w => w.scope === scope));
export const countBy = (level: Watchout['level'], list: Watchout[] = watchouts) => list.filter(w => w.level === level).length;
/** Strongest level for a state: risk beats opportunity beats caution. */
export const topLevel = (scope: string): Watchout['level'] | null => {
  const a = watchouts.filter(w => w.scope === scope);
  return a.some(w => w.level === 'risk') ? 'risk' : a.some(w => w.level === 'opportunity') ? 'opportunity' : a.length ? 'caution' : null;
};

export function LevelPill({ level }: { level: Watchout['level'] }) {
  return <span className={`lvl lvl-${level}`}><i aria-hidden>{LEVELS[level].icon}</i>{LEVELS[level].label}</span>;
}

export function AlertCard({ w, showScope = true }: { w: Watchout; showScope?: boolean }) {
  const isState = w.scope !== 'US' && stateByCode[w.scope];
  return (
    <article className={`alert alert-${w.level}`}>
      <div className="alert-top">
        <LevelPill level={w.level} />
        <b className="alert-title">{w.title}</b>
        {showScope && (isState
          ? <button className="alert-scope" onClick={() => go('market', { v: 'state', s: w.scope })} title={`Open ${stateByCode[w.scope].name}`}>{stateByCode[w.scope].name} ↗</button>
          : <span className="alert-scope plain">U.S.-wide</span>)}
        <span className="alert-market">{MARKETS[w.market] ?? w.market}</span>
      </div>
      <p>{w.text}</p>
      <div className="meta"><Badge status={w.status} full /><Src ids={w.sources} /></div>
    </article>
  );
}

export function AlertList({ items, showScope = true, empty }: { items: Watchout[]; showScope?: boolean; empty?: string }) {
  if (!items.length) return <p className="nodata">{empty ?? 'Nothing flagged.'}</p>;
  return <div className="alert-list">{items.map(w => <AlertCard key={w.id} w={w} showScope={showScope} />)}</div>;
}
