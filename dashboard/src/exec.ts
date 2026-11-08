import { executive, facilities, states, presence, shortName, type Facility } from './data';
import { scoreStates, DEFAULT_WEIGHTS } from './model';

/* ---------- facility evidence tiers (curated in data/executive.json) ---------- */
export const facKey = (f: Pick<Facility, 'operator' | 'city'>) => `${f.operator}|${f.city.replace(/ \(.*$/, '')}`;
const statusByKey: Record<string, any> = Object.fromEntries(executive.facility_status.map((x: any) => [x.key, x]));
export const TIERS: Record<string, { label: string; rank: number }> = executive.facility_tiers;

export const isVerifiedCancelled = (f: Facility) => /cancel/i.test(f.status_update ?? '') && f.status_update_status === 'Verified';
export const cellFacilities = (code: string) =>
  facilities.filter(f => f.state === code && f.type.startsWith('Li-ion') && !isVerifiedCancelled(f));
export const tierOf = (f: Facility): string => statusByKey[facKey(f)]?.tier ?? 'T6';
export const noteOf = (f: Facility): string => statusByKey[facKey(f)]?.note ?? '';

/* ---------- state opportunity classes ---------- */
export type OppClass = 'A' | 'B' | 'C' | 'D';
export const BORDERS_GA = ['NC', 'TN', 'AL', 'FL', 'SC'];

export interface Opp {
  code: string; name: string; cls: OppClass;
  tiers: Record<string, number>; bestTier: string | null; plants: number; gwh: number; dmcPlants: number;
  reach: 'home' | 'adjacent' | 'none'; foothold: number;
  competitors: string[]; competitorsVerified: string[];
  checks: { plantStatus: boolean; competitorChannel: boolean; thermgasFoothold: boolean };
  phase4Rank: number | null; phase4Score: number | null;
  why: string;
}

export function classify(bestRank: number | null, reachable: boolean, dmcOnly: boolean): OppClass {
  if (dmcOnly) return 'D';
  if (bestRank !== null && bestRank <= 2) return reachable ? 'A' : 'B';
  return 'C';
}

export function opportunities(): Opp[] {
  const scored = scoreStates(DEFAULT_WEIGHTS, true).filter(s => s.score !== null).sort((a, b) => b.score! - a.score!);
  const rows: Opp[] = [];
  for (const s of states) {
    const facs = cellFacilities(s.code);
    const dmc = s.dmc_solvent_plants;
    if (!facs.length && !dmc) continue;
    const tiers: Record<string, number> = {};
    facs.forEach(f => { const t = tierOf(f); tiers[t] = (tiers[t] ?? 0) + 1; });
    const ranks = facs.map(f => TIERS[tierOf(f)].rank);
    const best = ranks.length ? Math.min(...ranks) : null;
    const bestTier = best === null ? null : Object.keys(TIERS).find(k => TIERS[k].rank === best)!;
    const reach = s.thermgas_hq ? 'home' : BORDERS_GA.includes(s.code) ? 'adjacent' : 'none';
    const cls = classify(best, reach !== 'none', !facs.length && dmc > 0);
    const idx = scored.findIndex(x => x.row.code === s.code);
    const pAll = presence(s.code, true), pVer = presence(s.code, false);
    rows.push({
      code: s.code, name: s.name, cls, tiers, bestTier, plants: facs.length, gwh: s.battery_cell_gwh, dmcPlants: dmc,
      reach, foothold: s.thermgas_foothold,
      competitors: [...new Set(pAll.map(e => shortName(e.company)))],
      competitorsVerified: [...new Set(pVer.map(e => shortName(e.company)))],
      checks: { plantStatus: ranks.some(r => [1, 2, 4].includes(r)), competitorChannel: pAll.length > 0, thermgasFoothold: s.thermgas_foothold > 0 },
      phase4Rank: idx < 0 ? null : idx + 1, phase4Score: idx < 0 ? null : scored[idx].score,
      why: facs.length ? facs.map(f => `${f.operator.replace(/, per S\d+/, '')} (${f.city}): ${TIERS[tierOf(f)].label}`).join(' · ') : 'DMC / electrolyte-solvent plant only',
    });
  }
  const order = { A: 0, B: 1, C: 2, D: 3 } as const;
  return rows.sort((a, b) => order[a.cls] - order[b.cls] || (TIERS[a.bestTier ?? 'T6'].rank - TIERS[b.bestTier ?? 'T6'].rank) || b.gwh - a.gwh);
}

/* ---------- public-data comparator (counts only, no cost claims) ---------- */
export function comparator(points: number) {
  const c = executive.business_case.comparator;
  const n = Math.max(1, Math.min(24, Math.round(points)));
  return {
    points: n,
    falconUnits: n,
    falcoListUsd: n * c.falco_list_price_usd,
    lampChanges: n * Math.ceil(c.horizon_months / c.falco_lamp_life_months),
    thermgasAnalyzers: Math.ceil(n / c.thermgas_points_per_analyzer),
  };
}

/* ---------- executive briefing text (shared by the print page and the .md download) ---------- */
export function briefingMarkdown(): string {
  const e = executive;
  const L: string[] = [];
  const src = (a: any) => (a.sources?.length ? ` [${a.sources.join(', ')}]` : '');
  L.push('# ThermGAS U.S. Competitive Intelligence: Executive Briefing');
  L.push('*Independent Student Research, Northeastern University MSBA. Not an official ThermGAS publication. Evidence as of ' + e.meta.as_of + '.*', '');
  L.push('> ' + e.meta.status_note, '');
  L.push('## Conclusion', e.core_conclusion.headline, '', '**Proposed next move:** ' + e.core_conclusion.next_move, '');
  L.push('### What we know (Verified)'); e.core_conclusion.known.forEach((x: any) => L.push(`- ${x.text}${src(x)}`));
  L.push('', '### What we infer (Inferred)'); e.core_conclusion.inferred.forEach((x: any) => L.push(`- ${x.text}${src(x)}`));
  L.push('', '### What we assume (Assumption)'); e.core_conclusion.assumed.forEach((x: any) => L.push(`- ${x.text}${src(x)}`));
  L.push('', '## Three key findings');
  e.key_findings.forEach((k: any, i: number) => L.push(`${i + 1}. **${k.title}** (${k.status}). ${k.body} *So what:* ${k.so_what}${src(k)}`));
  L.push('', '## Three proposed actions (not approved)');
  e.actions.forEach((a: any) => L.push(`${a.rank}. **${a.title}**. Owner role: ${a.owner_role}. Validated when: ${a.validation}`));
  L.push('', '## Decision for management', e.decision.question);
  e.decision.options.forEach((o: any) => L.push(`- **${o.label}**: upside, ${o.upside} Downside, ${o.downside}`));
  L.push('', 'Needed from management: ' + e.decision.needs_from_management.join('; ') + '.');
  L.push('', '## Market opportunities (research-priority classes, not revenue estimates)');
  opportunities().forEach(o => L.push(`- ${o.name} (${o.code}): class ${o.cls}, ${e.opportunity_rules.classes[o.cls].label}`));
  L.push('', e.opportunity_rules.refinement_note);
  L.push('', '## 30 / 60 / 90 day roadmap (proposal)');
  e.roadmap.phases.forEach((p: any) => {
    L.push(`### ${p.days}: ${p.name}`);
    p.items.forEach((it: any) => L.push(`- ${it.task}. Owner role: ${it.owner_role}. Deliverable: ${it.deliverable}.`));
    L.push(`- **${p.gate.name}.** Go: ${p.gate.go} No-Go: ${p.gate.no_go} (thresholds are ${p.gate.threshold_status}s)`);
  });
  L.push('', e.roadmap.note_after_90);
  L.push('', '## Business case limits', e.business_case.framing, '', e.business_case.comparator.note);
  L.push('', '---', 'Source IDs (S##) resolve in data/export/source_register.csv.');
  return L.join('\n');
}
