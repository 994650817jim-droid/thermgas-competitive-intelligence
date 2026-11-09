import raw from './data/dataset.json';

export type Status = 'Verified' | 'Inferred' | 'Unknown' | string;
export interface Source { id: string; publisher: string; title: string; url: string; source_date: string; access_date: string; type: string }
export interface Competitor {
  id: string; name: string; role: string; category: string; hq: string; hq_state: string; hq_status: string; hq_source: string; website: string;
  industry_focus: string; relevant_products: string[]; company_size: string; us_presence: string; battery_experience: string;
  relationship: string; rationale: string; evidence_level: string; sources: string[];
}
export interface Product { [k: string]: any; id: string; company: string; model: string; category: string; sources: string[] }
export interface Evidence { company: string; product: string; state: string; metric: string; value: string; source: string; status: Status; notes: string }
export interface Facility { operator: string; city: string; state: string; type: string; status_in_source: string; capacity_gwh: number | null; capacity_note?: string; source: string; status: Status; status_update?: string; status_update_source?: string; status_update_status?: Status }
export interface StateRow {
  code: string; name: string; competitor_hq: string[]; competitor_offices: string[]; competitor_distributors: string[]; competitor_service: string[];
  competitor_installations: string[]; competitor_customer_refs: string[]; regulatory_notes: string[]; competitors_with_verified_local_presence: number;
  thermgas_hq: boolean; thermgas_refrigerant_references: string[]; thermgas_foothold: number; competitor_presence_list: string[];
  battery_cell_plants: number; battery_cell_gwh: number; dmc_solvent_plants: number; cancelled_plants_excluded: number; evidence_status: string;
}

const d = raw as any;
export const sources: Source[] = d.sources;
export const competitors: Competitor[] = d.competitors;
export const products: Product[] = d.products;
export const evidence: Evidence[] = d.evidence;
export const facilities: Facility[] = d.facilities;
export const states: StateRow[] = d.states;
export const analysis: any = d.analysis;
export const excluded: any[] = d.excluded;
export const executive: any = d.executive;
export const portfolio: any = d.portfolio;
export interface DataCenterRow { state: string; mwh_2023: number; pct_state_electricity_2023: number; source: string; status: Status }
export const dataCenters: { description: string; relevance: any[]; rows: DataCenterRow[] } = d.dataCenters;
export const dcByState = Object.fromEntries(dataCenters.rows.map(r => [r.state, r])) as Record<string, DataCenterRow>;
/** 1-based rank by 2023 data center load (EPRI); null when the state is not in the table. */
export const dcRank = (code: string) => { const i = [...dataCenters.rows].sort((a, b) => b.mwh_2023 - a.mwh_2023).findIndex(r => r.state === code); return i < 0 ? null : i + 1; };
export const generated: string = d.generated;

/* ---------- growth markets (data/growth_markets.json): one entry per market, same shape ---------- */
export interface Claim { text: string; status: Status; sources: string[] }
export interface LayerRow { state: string; value: number; label: string; note?: string }
export interface GrowthLayer { kind: 'construction' | 'count' | 'priority'; label: string; metric: string; unit: string; status: Status; sources: string[]; note: string; rows: LayerRow[] }
export const growth: { meta: { as_of: string; status_note: string }; highlights: any[]; markets: any[] } = d.growth;
export const growthById = Object.fromEntries(growth.markets.map(m => [m.id, m])) as Record<string, any>;
export const growthLayer = (id: string) => growthById[id]?.geography.layer as GrowthLayer | undefined;
const byState = (l?: GrowthLayer) => Object.fromEntries((l?.rows ?? []).map(r => [r.state, r])) as Record<string, LayerRow>;
/** Each market's state layer, keyed by state. A missing state means Not available, never zero. */
export const dcBuildByState = byState(growthLayer('datacenters'));
export const semiByState = byState(growthLayer('semiconductors'));
export const pharmaByState = byState(growthLayer('pharma'));
/** Growth-market product lines per battery-research company, so one company is shown once per market. */
export const growthLinesByCompany = growth.markets.reduce((acc: Record<string, { market: string; label: string; line: string }[]>, m: any) => {
  (m.competition.players as any[]).filter(p => p.company_id).forEach(p => { (acc[p.company_id] ??= []).push({ market: m.id, label: m.label, line: p.product_line }); });
  return acc;
}, {});

export const sourceById = Object.fromEntries(sources.map(s => [s.id, s])) as Record<string, Source>;
export const compById = Object.fromEntries(competitors.map(c => [c.id, c])) as Record<string, Competitor>;
export const productById = Object.fromEntries(products.map(p => [p.id, p])) as Record<string, Product>;
export const stateByCode = Object.fromEntries(states.map(s => [s.code, s])) as Record<string, StateRow>;

/** Category bucket used for colour + filtering. */
export type Bucket = 'subject' | 'direct' | 'indirect' | 'substitute';
export function bucketOf(category: string): Bucket {
  if (/^Subject/i.test(category)) return 'subject';
  if (/^A\./.test(category)) return 'direct';
  if (/^B\./.test(category)) return 'indirect';
  return 'substitute';
}
export const BUCKET_LABEL: Record<Bucket, string> = { subject: 'ThermGAS', direct: 'Direct competitor', indirect: 'Indirect / adjacent', substitute: 'Potential substitute' };

/** Normalise free-text evidence labels to the three-level scale. */
export type Level4 = 'Verified' | 'Inferred' | 'Assumption' | 'Unknown';
export function statusLevel(s: string | undefined): Level4 {
  if (!s) return 'Unknown';
  if (/^verified/i.test(s)) return 'Verified';
  if (/^assum/i.test(s)) return 'Assumption';
  if (/infer|assum|unresolved|conflict/i.test(s)) return 'Inferred';
  if (/^verified/i.test(s.trim())) return 'Verified';
  return /unknown|n\/a|not /i.test(s) ? 'Unknown' : 'Inferred';
}

export const shortName = (id: string) => ({
  thermgas: 'ThermGAS', ionscience: 'ION Science', riken: 'Riken Keiki / RKI', honeywell: 'Honeywell', cubic: 'Cubic',
  nevadanano: 'NevadaNano', infrasensing: 'Infrasensing', msa: 'MSA Safety', gasmet: 'Gasmet', inficon: 'INFICON',
  advancedenergy: 'Advanced Energy', gasera: 'Gasera',
} as Record<string, string>)[id] ?? id;

export const productLabel = (p: Product) => `${shortName(p.company)} · ${p.model}`;

export const isPublicPrice = (p: Product) => /\$\s?\d/.test(p.price ?? '');

/** Verified local presence (offices, HQ, distributors, service) per state, excluding ThermGAS. */
export function presence(code: string, includeInferred: boolean): Evidence[] {
  return evidence.filter(e => e.state === code && e.company !== 'thermgas' && ['hq', 'office', 'distributor', 'service'].includes(e.metric)
    && (includeInferred ? e.status !== 'Unknown' : e.status === 'Verified'));
}
