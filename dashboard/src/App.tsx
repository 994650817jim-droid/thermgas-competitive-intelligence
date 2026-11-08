import { useEffect, useState } from 'react';
import { SourceProvider } from './ui';
import { analysis } from './data';
import Overview from './pages/Overview';
import Competitors from './pages/Competitors';
import Battlecard from './pages/Battlecard';
import MapPage from './pages/MapPage';
import Strategy from './pages/Strategy';
import Sources from './pages/Sources';

const PAGES = [
  { path: 'overview', label: 'Overview', C: Overview },
  { path: 'competitors', label: 'Competitor Explorer', C: Competitors },
  { path: 'battlecard', label: 'Product Battlecard', C: Battlecard },
  { path: 'map', label: 'U.S. Landscape', C: MapPage },
  { path: 'strategy', label: 'Strategic Positioning', C: Strategy },
  { path: 'sources', label: 'Sources & Method', C: Sources },
];

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
  const page = PAGES.find(p => p.path === route.path) ?? PAGES[0];
  const Page = page.C;
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
            {PAGES.map(p => <a key={p.path} href={`#/${p.path}`} className={p.path === page.path ? 'active' : ''}>{p.label}</a>)}
          </nav>
        </div>
      </header>
      <div className="disclaimer-bar">
        <div>
          <span><b>Independent Student Research</b> · Northeastern University MSBA · not an official ThermGAS publication</span>
          <span>Evidence as of {analysis.meta.as_of} · vendor specs are vendor claims unless stated</span>
        </div>
      </div>
      <main><Page params={route.params} /></main>
      <footer className="foot">
        Built from a traceable evidence database ({'data/*.json'}). "Not Verified / Insufficient Evidence" means the research found no public evidence - it does not mean "no competition". No market shares, revenues or prices have been estimated.
      </footer>
    </SourceProvider>
  );
}
