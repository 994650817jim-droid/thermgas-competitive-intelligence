import { describe, expect, it } from 'vitest';
import { analysis, competitors, dcBuildByState, executive, growth, growthById, growthLinesByCompany, pharmaByState, semiByState, sourceById } from './data';
import { systemsEstimate } from './growth';
import { briefingMarkdown } from './exec';

const LABELS = ['Verified', 'Inferred', 'Assumption', 'Unknown'];
const walk = (o: any, fn: (k: string, v: any) => void) => { if (Array.isArray(o)) o.forEach(x => walk(x, fn)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { fn(k, v); walk(v, fn); } };
const text = JSON.stringify(growth);

describe('growth markets: evidence rules', () => {
  it('uses only the four evidence labels and existing source IDs', () => {
    walk(growth, (k, v) => {
      if (/(^|_)status$/.test(k)) expect(LABELS).toContain(v);
      if (/(^|_)sources$/.test(k)) (v as string[]).forEach(id => expect(sourceById[id], id).toBeDefined());
    });
  });
  it('gives every new source a traceable URL and access date', () => {
    for (let n = 185; n <= 212; n++) {
      const s = sourceById[`S${n}`];
      expect(s, `S${n}`).toBeDefined();
      expect(s.url).toMatch(/^https:\/\//);
      expect(['2026-11-08', '2026-11-09']).toContain(s.access_date);
    }
  });
  it('never labels a claim Verified when its only sources are secondary or team analysis', () => {
    const secondary = new Set(['S186', 'S187', 'S188', 'S190', 'S191', 'S192', 'S196', 'S197', 'S198', 'S199', 'S200', 'S201', 'S205', 'S206', 'S207']);
    walk(growth, (_k, v) => {
      if (v && typeof v === 'object' && Array.isArray(v.sources) && v.sources.length && v.sources.every((s: string) => secondary.has(s)) && typeof v.status === 'string')
        expect(v.status, JSON.stringify(v).slice(0, 80)).not.toBe('Verified');
    });
  });
  it('shows no private price, no dollar sizing and keeps ThermGAS prices Not Publicly Available', () => {
    expect(text).not.toMatch(/6,000|\$9 million|\$18 million|\$9M|\$18M/);
    growth.markets.forEach((m: any) => {
      expect(['Assumption', 'Unknown']).toContain(m.market.sizing.status);
      expect(JSON.stringify(m.market.sizing)).not.toMatch(/\$\s?\d/);
    });
    expect(growthById.datacenters.competition.head_to_head.rows.find((r: any) => r.attr === 'Price').left).toBe('Not Publicly Available');
  });
  it('does not stretch the AT&T listing, the A2L statement or the unfound NF3 note', () => {
    const att = growthById.datacenters.assets.items.find((p: any) => /AT&T/.test(p.text));
    expect(att.caveat).toMatch(/no location, product or scale/i);
    expect(growthById.datacenters.competition.head_to_head.rows.find((r: any) => r.attr === 'A2L').left_status).toBe('Unknown');
    const note = growthById.semiconductors.assets.items.find((p: any) => /application note/.test(p.text));
    expect(note.status).toBe('Unknown');
    expect(growthById.semiconductors.assets.message).not.toMatch(/0\.5 ppm/);
  });
});

describe('semiconductors: findings from the source check', () => {
  const semi = growthById.semiconductors;
  it('does not call the EPA count a fab count', () => {
    expect(JSON.stringify(semi)).not.toMatch(/46 (U\.S\. )?fabs/);
    expect(semi.readouts[0].status).toBe('Verified');
    expect(semi.readouts[0].sources).toContain('S208');
    expect(semi.readouts[0].sub).toMatch(/not only semiconductor/i);
    expect(growth.highlights.find((h: any) => h.market === 'semiconductors').sub).toMatch(/not a fab count/i);
  });
  it('keeps unmatched brief figures out of the headline numbers', () => {
    const mix = semi.market.indicators.find((i: any) => /size mix/i.test(i.indicator));
    expect(mix.status).toBe('Unknown');
    expect(mix.figure).toMatch(/2016/);
  });
  it('does not claim solvents cause false alarms on pyrolyzer detectors', () => {
    const gap = semi.reuse.gaps.find((g: any) => /solvent false-alarm/i.test(g.gap));
    expect(gap.check).toMatch(/isopropanol and methanol at 500 ppm reading 0/i);
    expect(gap.sources).toContain('S209');
    expect(semi.assets.message).not.toMatch(/ignores cleaning solvents/i);
    expect(semi.verdict.headline).toMatch(/does not hold/i);
  });
  it('shows ThermGAS NF3 performance as Unknown while Honeywell\'s is sourced', () => {
    const h2h = semi.competition.head_to_head;
    const range = h2h.rows.find((r: any) => r.attr === 'NF3 range');
    expect(range.left_status).toBe('Unknown');
    expect(range.right).toBe('0-40 ppm');
    expect(range.right_sources).toContain('S209');
    expect(h2h.rows.find((r: any) => r.attr === 'Price').left).toBe('Not Publicly Available');
  });
  it('records the Master Gas List facts without inventing detection levels', () => {
    const item = semi.assets.items.find((i: any) => /Master Gas List/.test(i.text));
    expect(item.status).toBe('Verified');
    expect(item.caveat).toMatch(/no detection levels/i);
    expect(item.caveat).toMatch(/CF4/);
    expect(semi.reuse.gaps.find((g: any) => /CF4/.test(g.gap)).status).toBe('Unknown');
  });
  it('treats MSA Chemgard NF3 support as unverified', () => {
    const msa = semi.competition.players.find((p: any) => p.company_id === 'msa');
    expect(msa.watch_out[0].status).toBe('Unknown');
    expect(sourceById.S211.title).toMatch(/NF3 is not named/i);
  });
});

describe('growth markets: content and map layers', () => {
  it('has three markets with every section the briefs cover', () => {
    expect(growth.markets.map((m: any) => m.id)).toEqual(['datacenters', 'semiconductors', 'pharma']);
    growth.markets.forEach((m: any) => ['primer', 'entry_points', 'reuse', 'market', 'buyers', 'competition', 'assets', 'geography', 'entry'].forEach(k => expect(m[k], `${m.id}.${k}`).toBeTruthy()));
    growth.markets.forEach((m: any) => expect(m.entry.questions.length).toBeGreaterThan(0));
  });
  it('uses only the state figures given in the briefs', () => {
    expect(Object.keys(dcBuildByState).sort()).toEqual(['GA', 'VA']);
    expect(Object.fromEntries(Object.values(semiByState).map(r => [r.state, r.value]))).toEqual({ TX: 10, OR: 6, AZ: 3, NY: 3, ID: 1 });
    expect(Object.fromEntries(Object.values(pharmaByState).map(r => [r.state, r.value]))).toEqual({ NC: 1, VA: 2, AL: 3, IN: 4, TX: 5 });
  });
  it('labels the pharma layer as a ranking, not a size', () => {
    const l = growthById.pharma.geography.layer;
    expect(l.kind).toBe('priority');
    expect(l.note).toMatch(/not a measure of size/i);
  });
  it('computes the data center system count from the stated inputs', () => {
    expect(systemsEstimate(7481.1, 10, 2)).toBe(1496);
    expect(systemsEstimate(7481.1, 10, 4)).toBe(2992);
  });
  it('maps growth-market product lines onto existing company profiles without adding companies', () => {
    expect(Object.keys(growthLinesByCompany).sort()).toEqual(['honeywell', 'msa', 'riken']);
    Object.keys(growthLinesByCompany).forEach(id => expect(competitors.some(c => c.id === id)).toBe(true));
    expect(growthLinesByCompany.riken.map(l => l.market)).toEqual(['semiconductors']);
  });
});

describe('battery research stays intact', () => {
  it('leaves the core conclusion, threat rules and actions unchanged', () => {
    expect(executive.key_findings).toHaveLength(3);
    expect(executive.actions).toHaveLength(3);
    expect(Object.keys(analysis.threat_rules.matrix)).toHaveLength(9);
    expect(analysis.threats.find((t: any) => t.product === 'chillgard5000').task_overlap).toBe('Low');
    expect(analysis.threats.find((t: any) => t.product === 'riken_fill')).toBeDefined();
  });
  it('summarises the growth markets in the briefing as proposals', () => {
    const md = briefingMarkdown();
    expect(md).toContain('## Growth markets (research-team proposals, not approved ThermGAS strategy)');
    ['### Data Centers', '### Semiconductors', '### Pharma'].forEach(h => expect(md).toContain(h));
    expect(md).toContain(executive.core_conclusion.headline);
  });
});
