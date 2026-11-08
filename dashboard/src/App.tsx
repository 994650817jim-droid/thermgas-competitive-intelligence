import { useEffect, useState } from 'react';
import { SourceProvider } from './ui';
import { analysis } from './data';
import Overview from './pages/Overview';
import Executive from './pages/Executive';
import Landscape from './pages/Landscape';
import Opportunities from './pages/Opportunities';
import Roadmap from './pages/Roadmap';
import Present from './pages/Present';
import Briefing from './pages/Briefing';
import Competitors from './pages/Competitors';
import Battlecard from './pages/Battlecard';
import MapPage from './pages/MapPage';
import Strategy from './pages/Strategy';
import Sources from './pages/Sources';

/** Main navigation: four executive pages. Everything else is drill-down detail, still reachable. */
const MAIN = [
  { path: 'overview', label: 'Executive Overview', C: Executive },
  { path: 'landscape', label: 'Competitive Landscape', C: Landscape },
  { path: 'opportunities', label: 'Market Opportunities', C: Opportunities },
  { path: 'roadmap', label: 'Strategic Roadmap', C: Roadmap },
];
const DETAIL = [
  { path: 'research', label: 'Evidence Dashboard', C: Overview, parent: 'overview' },
  { path: 'competitors', label: 'Competitor Explorer', C: Competitors, parent: 'landscape' },
  { path: 'battlecard', label: 'Product Battlecard', C: Battlecard, parent: 'landscape' },
  { path: 'map', label: 'U.S. Landscape (map)', C: MapPage, parent: 'opportunities' },
  { path: 'strategy', label: 'Strategic Positioning', C: Strategy, parent: 'landscape' },
  { path: 'sources', label: 'Sources & Method', C: Sources, parent: 'overview' },
];
const PAGES = [...MAIN, ...DETAIL];

/** Hash routing: #/page?key=value */
export function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  return { path: path || 'overview', params: new URLSearchParams(qs ?? '') };
}
export function go(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  window.location.hash = `/${path}${qs ? `?${qs}` : ''}`;
}

export default function App() {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const on = () => { setRoute(parseHash()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  if (route.path === 'present') return <SourceProvider><Present params={route.params} /></SourceProvider>;
  const page = PAGES.find(p => p.path === route.path) ?? PAGES[0];
  const Page = page.C;
  const detail = DETAIL.find(d => d.path === page.path);
  const activePath = detail ? detail.parent : page.path;
  const briefing = route.path === 'briefing';
  return (
    <SourceProvider>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="wordmark" href="#/overview" aria-label="Home">
            <span className="logo" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 32 32"><path d="M6 25V9h4v16zm8 0V14h4v11zm8 0v-7h4v7z" fill="#fff" /></svg>
            </span>
            <span>
              <b>Therm<span>GAS</span> · Competitive Intelligence</b>
              <small>DMC vapor monitoring in U.S. battery manufacturing</small>
            </span>
          </a>
          <nav className="nav" aria-label="Main">
            {MAIN.map(p => <a key={p.path} href={`#/${p.path}`} className={p.path === activePath && !briefing ? 'active' : ''} aria-current={p.path === activePath && !briefing ? 'page' : undefined}>{p.label}</a>)}
          </nav>
          <div className="top-actions">
            <a className="btn" href="#/briefing">Briefing</a>
            <a className="btn primary" href="#/present">Present</a>
          </div>
        </div>
      </header>
      <div className="disclaimer-bar">
        <div>
          <span><b>Independent Student Research</b> · Northeastern University MSBA · not an official ThermGAS publication</span>
          <span>Evidence as of {analysis.meta.as_of} · vendor specs are vendor claims unless stated</span>
        </div>
      </div>
      <main>
        {detail && <div className="crumb"><a href={`#/${detail.parent}`}>← {MAIN.find(m => m.path === detail.parent)?.label}</a> <span>/ Research detail: {detail.label}</span></div>}
        {briefing ? <Briefing /> : <Page params={route.params} />}
      </main>
      <footer className="foot">
        Built from a traceable evidence database ({'data/*.json'}). "Not Verified / Insufficient Evidence" means the research found no public evidence - it does not mean "no competition". No market shares, revenues or prices have been estimated.
      </footer>
    </SourceProvider>
  );
}
