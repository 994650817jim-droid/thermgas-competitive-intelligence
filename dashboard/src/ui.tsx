import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { sourceById, statusLevel, type Bucket, BUCKET_LABEL } from './data';

/* ---------- Source drawer (global) ---------- */
const SourceCtx = createContext<(ids: string[]) => void>(() => {});
export const useSources = () => useContext(SourceCtx);

export function SourceProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIds(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <SourceCtx.Provider value={setIds}>
      {children}
      {ids && (
        <div className="drawer-backdrop" onClick={() => setIds(null)}>
          <aside className="drawer" role="dialog" aria-label="Sources" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <h3>Evidence sources</h3>
              <button className="icon-btn" onClick={() => setIds(null)} aria-label="Close">✕</button>
            </div>
            {ids.length === 0 && <p className="muted">No external source. This item is a team assumption and is labeled accordingly.</p>}
            {ids.map(id => {
              const s = sourceById[id];
              if (!s) return <p key={id} className="muted">Unknown source {id}</p>;
              return (
                <div key={id} className="src-card">
                  <div className="src-id">{s.id} · {s.type}</div>
                  <div className="src-title">{s.title}</div>
                  <div className="src-meta">{s.publisher}</div>
                  <div className="src-meta">Source date: {s.source_date} · Accessed: {s.access_date}</div>
                  <a href={s.url} target="_blank" rel="noreferrer" className="src-link">{s.url}</a>
                </div>
              );
            })}
          </aside>
        </div>
      )}
    </SourceCtx.Provider>
  );
}

export function Src({ ids, label }: { ids?: string[]; label?: string }) {
  const open = useSources();
  const list = (ids ?? []).filter(Boolean);
  return (
    <button className="src-chip" onClick={e => { e.stopPropagation(); open(list); }} title={list.map(i => `${i}: ${sourceById[i]?.title ?? ''}`).join('\n') || 'No external source'}>
      {label ?? (list.length ? `${list.length} source${list.length > 1 ? 's' : ''}` : 'assumption')}
    </button>
  );
}

/* ---------- Evidence badge ---------- */
export function Badge({ status, full }: { status?: string; full?: boolean }) {
  const lvl = statusLevel(status);
  const icon = lvl === 'Verified' ? '✓' : lvl === 'Inferred' ? '≈' : lvl === 'Assumption' ? '△' : '?';
  return <span className={`badge badge-${lvl.toLowerCase()}`} title={status}>{icon} {full && status ? status : lvl}</span>;
}

export function BucketTag({ bucket }: { bucket: Bucket }) {
  return <span className={`bucket bucket-${bucket}`}><i />{BUCKET_LABEL[bucket]}</span>;
}

export function Card({ title, sub, right, children, className = '' }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || right) && (
        <header className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {sub && <p className="card-sub">{sub}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHead({ kicker, title, lead }: { kicker: string; title: string; lead: ReactNode }) {
  return (
    <div className="page-head">
      <div className="kicker">{kicker}</div>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
    </div>
  );
}

export const Legend = () => (
  <div className="legend-row">
    <span><Badge status="Verified" /> read in an official or primary source</span>
    <span><Badge status="Inferred" /> reasoned from evidence, or sources conflict</span>
    <span><Badge status="Assumption" /> team assumption, not tested</span>
    <span><Badge status="Unknown" /> not available</span>
  </div>
);
