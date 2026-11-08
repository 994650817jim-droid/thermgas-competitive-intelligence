import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { executive, facilities, sourceById, statusLevel, dataCenters, dcByState, dcRank, portfolio } from './data';
import { briefingMarkdown, cellFacilities, classify, comparator, opportunities, tierOf, TIERS } from './exec';

const cls = (code: string) => opportunities().find(o => o.code === code)?.cls;

describe('opportunity classification', () => {
  it('applies the documented rules', () => {
    expect(classify(1, true, false)).toBe('A');
    expect(classify(2, false, false)).toBe('B');
    expect(classify(3, true, false)).toBe('C');
    expect(classify(null, false, true)).toBe('D');
  });
  it('gives the expected classes on current evidence', () => {
    expect(cls('NC')).toBe('A');
    expect(cls('GA')).toBe('A');
    expect(cls('KS')).toBe('B');
    expect(cls('AZ')).toBe('B');
    expect(cls('LA')).toBe('D');
    expect(cls('TN')).toBe('C');   // refined vs Phase 4: no verified 2026 operating plant
    expect(cls('KY')).toBe('C');
    expect(cls('MI')).toBe('C');
  });
  it('never puts a state in A or B without a verified production or 2026-start plant', () => {
    opportunities().filter(o => o.cls === 'A' || o.cls === 'B').forEach(o =>
      expect(['T1', 'T2']).toContain(o.bestTier));
  });
  it('excludes verified-cancelled plants and gives every counted plant a tier', () => {
    expect(cellFacilities('AZ').map(f => f.city)).not.toContain('Buckeye');
    facilities.filter(f => f.type.startsWith('Li-ion') && cellFacilities(f.state).includes(f))
      .forEach(f => expect(TIERS[tierOf(f)]).toBeDefined());
  });
  it('never calls a state with no evidence "no competition"', () => {
    const txt = JSON.stringify(executive).toLowerCase();
    expect(txt.replace(/does not mean no competition/g, '')).not.toContain('no competition');
  });
});

describe('data center layer (EPRI 2023)', () => {
  it('has the 44 states from EPRI Table A1, all Verified and sourced', () => {
    expect(dataCenters.rows).toHaveLength(44);
    dataCenters.rows.forEach(r => { expect(r.status).toBe('Verified'); expect(r.source).toBe('S160'); expect(r.mwh_2023).toBeGreaterThan(0); });
  });
  it('totals about 150 TWh, matching the report headline', () => {
    const twh = dataCenters.rows.reduce((s, r) => s + r.mwh_2023, 0) / 1e6;
    expect(twh).toBeGreaterThan(145); expect(twh).toBeLessThan(160);
  });
  it('ranks correctly and leaves states outside the table unranked', () => {
    expect(dcRank('VA')).toBe(1);
    expect(dcRank('TX')).toBe(2);
    expect(dcRank('GA')).toBe(8);
    for (const c of ['AK', 'AR', 'DE', 'DC', 'MS', 'VT', 'WV']) expect(dcByState[c]).toBeUndefined();
  });
  it('labels the data center link to ThermGAS by evidence level', () => {
    const pts = executive.adjacent_opportunity.points;
    expect(pts.find((p: any) => /ThermGAS already markets/.test(p.text)).status).toBe('Verified');
    expect(pts.some((p: any) => p.status === 'Assumption')).toBe(true);
  });
});

describe('ThermGAS portfolio (thermgas.com)', () => {
  it('lists the official product line with a source per product and no prices', () => {
    expect(portfolio.products.map((p: any) => p.name)).toEqual(expect.arrayContaining(['TracePoint 1000', 'Haloguard IR', 'Haloguard III', 'Oxyguard']));
    portfolio.products.forEach((p: any) => { expect(sourceById[p.source], p.id).toBeDefined(); expect(JSON.stringify(p)).not.toMatch(/\$\s?\d/); });
  });
  it('only marks a market "stated" where the product page names it', () => {
    expect(portfolio.fit.tp1000.datacenter).toBe('stated');   // TracePoint page lists data centers
    expect(portfolio.fit.tp1000.battery).toBe('linked');      // battery page names PAIR, not a model
    expect(portfolio.fit.hgir.datacenter).toBeUndefined();
  });
  it('keeps the Haloguard III sensitivity conflict visible instead of picking a number', () => {
    const hg3 = portfolio.products.find((p: any) => p.id === 'hg3');
    expect(hg3.sensitivity).toMatch(/20 ppm/); expect(hg3.sensitivity).toMatch(/1 ppm/);
    expect(statusLevel(hg3.status)).toBe('Inferred');
  });
});

describe('public-data comparator', () => {
  it('computes counts from stated specs only', () => {
    const c = comparator(8);
    expect(c.falconUnits).toBe(8);
    expect(c.falcoListUsd).toBe(8 * 3521);
    expect(c.lampChanges).toBe(72);
    expect(c.thermgasAnalyzers).toBe(1);
  });
  it('clamps to 1-24 points per analyzer', () => {
    expect(comparator(0).points).toBe(1);
    expect(comparator(99).points).toBe(24);
    expect(comparator(24).thermgasAnalyzers).toBe(1);
  });
});

describe('executive evidence rules', () => {
  const walk = (o: any, fn: (k: string, v: any) => void) => { if (Array.isArray(o)) o.forEach(x => walk(x, fn)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { fn(k, v); walk(v, fn); } };
  it('uses only known evidence labels and existing source IDs', () => {
    walk(executive, (k, v) => {
      if (k === 'status' && typeof v === 'string' && !/^proposed/i.test(v)) expect(['Verified', 'Inferred', 'Assumption', 'Unknown']).toContain(statusLevel(v));
      if ((k === 'sources' || k === 'evidence') && Array.isArray(v)) v.forEach((id: string) => expect(sourceById[id], id).toBeDefined());
    });
  });
  it('contains no invented dollar figures (only the verified $3,521 list price)', () => {
    const found = JSON.stringify(executive).match(/\$\s?[\d,]+/g) ?? [];
    found.forEach(f => expect(f.replace(/\s/g, '')).toBe('$3,521'));
  });
  it('contains no revenue, ROI or market-share figures', () => {
    expect(JSON.stringify(executive)).not.toMatch(/\d\s?%|\bROI of\b|revenue of|market share of/i);
  });
  it('labels recommendations as proposals and keeps the student-research notice', () => {
    expect(executive.meta.status_note).toMatch(/not an approved ThermGAS strategy/i);
    const md = briefingMarkdown();
    expect(md).toContain('Independent Student Research');
    expect(md).toMatch(/proposed actions \(not approved\)/i);
    const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    expect(app).toContain('Independent Student Research');
  });
  it('has exactly three findings, three actions and three gated phases', () => {
    expect(executive.key_findings).toHaveLength(3);
    expect(executive.actions).toHaveLength(3);
    expect(executive.roadmap.phases).toHaveLength(3);
    executive.roadmap.phases.forEach((p: any) => { expect(p.gate.go).toBeTruthy(); expect(p.gate.no_go).toBeTruthy(); expect(p.items.every((i: any) => i.owner_role && i.deliverable)).toBe(true); });
  });
});
