import { useEffect, useState } from 'react';
import { SourceProvider } from './ui';
import { analysis, market } from './data';
import Home from './pages/Home';
import Competitive from './pages/Competitive';
import Market from './pages/Market';
import Sources from './pages/Sources';

const PAGES = [
  { path: 'home', label: 'Home', C: Home },
  { path: 'competitive', label: 'Competitive', C: Competitive },
  { path: 'market', label: 'Market', C: Market },
  { path: 'sources', label: 'Sources & Method', C: Sources },
];

/** Old page names keep working: they map to a page plus a sub-view. */
const ALIAS: Record<string, { path: string; v?: string }> = {
  overview: { path: 'home' },
  competitors: { path: 'competitive', v: 'list' },
  battlecard: { path: 'competitive', v: 'compare' },
  strategy: { path: 'competitive', v: 'strategy' },
  map: { path: 'market' },
};

/** Hash routing: #/page?key=value */
export function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [raw, qs] = h.split('?');
  const params = new URLSearchParams(qs ?? '');
  let path = raw || 'home';
  const a = ALIAS[path];
  if (a) { path = a.path; if (a.v && !params.get('v')) params.set('v', a.v); }
  return { path, params };
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
          <a className="wordmark" href="#/home" aria-label="Home">
            <span className="logo" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 32 32"><path d="M6 25V9h4v16zm8 0V14h4v11zm8 0v-7h4v7z" fill="#fff" /></svg>
            </span>
            <span>
              <b>Therm<span>GAS</span> · Market Intelligence</b>
              <small>Competitive landscape and U.S. market opportunity</small>
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
          <span>Competitive evidence as of {analysis.meta.as_of} · market data as of {market.meta.as_of} · vendor specs are vendor claims unless stated</span>
        </div>
      </div>
      <main><Page params={route.params} /></main>
      <footer className="foot">
        Built from a traceable evidence database. Every number links to a dated source. "Not Verified / Insufficient Evidence" means no public evidence was found; it does not mean "no competition". No market shares, revenues or prices have been estimated.
      </footer>
    </SourceProvider>
  );
}
