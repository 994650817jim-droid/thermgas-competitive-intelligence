import { analysis, productById, bucketOf, shortName } from './data';
import { threatLevel, type Level } from './model';
import { go } from './App';

const ROWS: Level[] = ['High', 'Medium', 'Low'];   // task overlap (y)
const COLS: Level[] = ['Low', 'Medium', 'High'];   // battery go-to-market (x)
const C = { subject: 'var(--c-subject)', direct: 'var(--c-direct)', indirect: 'var(--c-indirect)', substitute: 'var(--c-substitute)' };

/** Evidence-coded threat matrix: placement follows the rules in analysis.json, not a numeric index. */
export default function ThreatMatrix({ compact = false }: { compact?: boolean }) {
  const threats: any[] = analysis.threats;
  return (
    <div>
      <div className="tm" role="table" aria-label="Competitor threat matrix">
        {ROWS.map(r => (
          <FragmentRow key={r} r={r} threats={threats} compact={compact} />
        ))}
        <div />
        {COLS.map(c => <div key={c} className="tm-xlab">{c}</div>)}
      </div>
      <div className="axis-note">
        <b>↑ Task overlap</b> with ThermGAS's DMC concentration-monitoring job · <b>→ Battery go-to-market evidence</b> (battery marketing + verified U.S. channel).
        Cell shading = derived threat level (High / Elevated / Moderate / Low). Click a product for its battlecard.
      </div>
    </div>
  );
}

function FragmentRow({ r, threats, compact }: { r: Level; threats: any[]; compact: boolean }) {
  return (
    <>
      <div className="tm-ylab">{r}</div>
      {COLS.map(c => {
        const lvl = threatLevel(r, c);
        const items = threats.filter(t => t.task_overlap === r && t.battery_gtm === c);
        return (
          <div key={c} className={`tm-cell lvl-${lvl}`} role="cell" aria-label={`Task ${r}, go-to-market ${c}: ${lvl}`}>
            {items.map(t => {
              const p = productById[t.product];
              const b = bucketOf(p.category);
              return (
                <button key={t.product} className="pchip" title={t.why} onClick={() => go('battlecard', { p: t.product })}>
                  <i style={{ background: C[b] }} />
                  <span>{shortName(p.company)}{!compact && <><br /><span className="muted" style={{ fontWeight: 500 }}>{p.model.replace(/\s*\(.*\)$/, '')}</span></>}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
