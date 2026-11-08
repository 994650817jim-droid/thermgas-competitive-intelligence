import { useMemo, useState } from 'react';
import { portfolio } from './data';
import { Src, Badge } from './ui';
import { TiltCard } from './fx';
import PillNav from './components/PillNav';

type Fit = 'stated' | 'linked' | undefined;
const FAMILY_COLOR: Record<string, string> = { pair: 'var(--brand)', cmos: '#0097A7', o2: '#7A52B3', acc: '#8A93A3' };

/** ThermGAS's own product line from thermgas.com: flip cards + product x market fit matrix. */
export default function Portfolio({ full = false }: { full?: boolean }) {
  const fams = portfolio.families;
  const [fam, setFam] = useState<string>('all');
  const [market, setMarket] = useState<string | null>(null);
  const [hoverM, setHoverM] = useState<string | null>(null);
  const fit = (pid: string, mid: string): Fit => portfolio.fit[pid]?.[mid];
  const shown = useMemo(() => portfolio.products.filter((p: any) =>
    (fam === 'all' || p.family === fam) && (!market || fit(p.id, market))), [fam, market]);
  const filterItems = [{ label: 'All products' }, ...fams.map((f: any) => ({ label: f.name.replace(' monitors', '').replace('Mechanical room safety equipment', 'Accessories') }))];
  const m = portfolio.markets.find((x: any) => x.id === (hoverM ?? market));

  return (
    <div className="portfolio">
      <div className="pf-controls">
        <PillNav
          items={filterItems}
          defaultActiveIndex={0}
          onItemClick={(_item, i) => setFam(i === 0 ? 'all' : fams[i - 1].id)}
          theme="light" layout="joined" itemStyle="plain" hoverEffect="glide" indicator="pill"
          surface="solid" barColor="#F3F8FF" highlightColor="#1F60C4" textColor="#454545"
          size="sm" intro={false} collapse="never" ariaLabel="Product family"
        />
        {market && <button className="btn chip-clear" onClick={() => setMarket(null)}>Market: {portfolio.markets.find((x: any) => x.id === market)?.name} ✕</button>}
      </div>

      <div className="pf-cards">
        {shown.map((p: any) => (
          <TiltCard key={p.id} label={p.name} className={`fam-${p.family}`}
            front={<>
              <span className="pf-fam" style={{ color: FAMILY_COLOR[p.family] }}>{fams.find((f: any) => f.id === p.family)?.name}</span>
              <span className="pf-name">{p.name}</span>
              <span className="pf-role">{p.role}</span>
              <span className="pf-specs">
                {(p.sensitivity === 'n/a' ? [['Includes', p.outputs]] : [['Sensitivity', p.sensitivity], ['Points', p.points]]).map(([k, v]: string[]) => <span key={k}><em>{k}</em>{v}</span>)}
              </span>
              <span className="pf-markets">{portfolio.markets.filter((mk: any) => fit(p.id, mk.id)).map((mk: any) => <span key={mk.id} className={`mchip ${fit(p.id, mk.id)}`}>{mk.name.replace(/ \(.*\)$/, '')}</span>)}</span>
              <span className="pf-flip">Full specs</span>
            </>}
            back={<>
              <span className="pf-name small-name">{p.name}</span>
              <span className="pf-table">
                {[['Technology', p.tech], ['Gases', p.gases], ['Range', p.range], ['Sensitivity', p.sensitivity], ['Points', p.points], ['Tubing', p.tubing], ['Response', p.response], ['Outputs', p.outputs], ['Certification', p.certification], ['Warranty', p.warranty], ['Markets named', p.markets_stated]].map(([k, v]) => (
                  <span key={k} className="pf-row"><em>{k}</em><span className={/^Not stated/.test(v) ? 'nodata' : ''}>{v}</span></span>
                ))}
              </span>
              <span className="pf-flip">Back</span>
            </>}
          />
        ))}
        {shown.length === 0 && <p className="nodata">No ThermGAS product page names this market for the selected family.</p>}
      </div>
      <p className="small muted pf-note">Specs as written on each thermgas.com product page (vendor claims). Click a card to flip it. No prices are published. <Src ids={['S170', ...portfolio.products.map((p: any) => p.source)]} label="Product pages" /></p>

      <div className="fitwrap">
        <div className="fit-head">
          <h3 className="band-title">Where each product is pitched</h3>
          <p className="small muted">● the product page names the market &nbsp; ○ linked only through the industry page or app note (Inferred). Click a market to filter the cards.</p>
        </div>
        <div className="table-wrap">
          <table className="fit" onMouseLeave={() => setHoverM(null)}>
            <thead><tr><th>Product</th>{portfolio.markets.map((mk: any) => (
              <th key={mk.id} className={`${hoverM === mk.id || market === mk.id ? 'col-on' : ''}`} onMouseEnter={() => setHoverM(mk.id)}>
                <button type="button" onClick={() => setMarket(market === mk.id ? null : mk.id)} aria-pressed={market === mk.id}>{mk.name.replace(/ \(.*\)$/, '')}</button>
              </th>))}</tr></thead>
            <tbody>{portfolio.products.map((p: any) => (
              <tr key={p.id} className={market && !fit(p.id, market) ? 'dim' : ''}>
                <th scope="row"><span className="dotfam" style={{ background: FAMILY_COLOR[p.family] }} />{p.name}</th>
                {portfolio.markets.map((mk: any) => { const v = fit(p.id, mk.id); return (
                  <td key={mk.id} className={`${hoverM === mk.id || market === mk.id ? 'col-on' : ''}`} onMouseEnter={() => setHoverM(mk.id)} title={v ? `${p.name} · ${mk.name}: ${v === 'stated' ? 'named on the product page' : 'linked via the industry page (Inferred)'}` : ''}>
                    {v === 'stated' ? <span className="fdot on" aria-label="named on product page">●</span> : v === 'linked' ? <span className="fdot" aria-label="inferred link">○</span> : <span className="fdot none" aria-label="not linked">·</span>}
                  </td>); })}
              </tr>))}</tbody>
          </table>
        </div>
        <p className="fit-note small">{m ? <><b>{m.name}:</b> {m.note} <Src ids={[m.source]} /></> : 'Hover a market to see what ThermGAS says about it.'}</p>
      </div>

      {full && (
        <ul className="pf-obs">
          {portfolio.observations.map((o: any, i: number) => <li key={i}><Badge status={o.status} /> {o.text} <Src ids={o.sources} /></li>)}
        </ul>
      )}
    </div>
  );
}
