import { analysis, states, facilities, presence, type StateRow } from './data';

export type Level = 'High' | 'Medium' | 'Low';
export const threatLevel = (task: Level, gtm: Level): string => analysis.threat_rules.matrix[`${task}|${gtm}`];

export interface Weights { capacity: number; plants: number; operating: number; dmc_plant: number; foothold: number; competitor_presence: number }
export const DEFAULT_WEIGHTS: Weights = analysis.state_priority_model.default_weights;

export interface Scored { row: StateRow; score: number | null; inputs: { C: number; P: number; O: number; D: number; F: number; K: number } }

/** A plant counts as operating/ramping only with a Verified 2025-26 update that reports production or launch. */
const OPERATING = /production|launch|began|ramp/i;
export const operatingPlants = (code: string) =>
  facilities.filter(f => f.state === code && f.status_update_status === 'Verified' && OPERATING.test(f.status_update ?? '') && !/cancel|idle|targeted|delayed/i.test(f.status_update ?? ''));

/** Transparent research-priority score (see analysis.json state_priority_model). Unscored if no verified facility. */
export function scoreStates(w: Weights, includeInferred = true): Scored[] {
  const inputs = states.map(row => ({
    row,
    C: row.battery_cell_gwh,
    P: row.battery_cell_plants,
    O: operatingPlants(row.code).length,
    D: row.dmc_solvent_plants > 0 ? 1 : 0,
    F: row.thermgas_foothold,
    K: new Set(presence(row.code, includeInferred).map(e => e.company)).size,
  }));
  const max = (k: 'C' | 'P' | 'K' | 'O') => Math.max(1, ...inputs.map(i => i[k]));
  const Cm = max('C'), Pm = max('P'), Km = max('K'), Om = max('O');
  const denom = w.capacity + w.plants + w.operating + w.dmc_plant + w.foothold || 1;
  return inputs.map(i => {
    const hasFacility = i.P > 0 || i.D > 0;
    const raw = (w.capacity * i.C / Cm + w.plants * i.P / Pm + w.operating * i.O / Om + w.dmc_plant * i.D + w.foothold * i.F - w.competitor_presence * i.K / Km) / denom;
    return { row: i.row, score: hasFacility ? Math.max(0, Math.round(raw * 100)) : null, inputs: { C: i.C, P: i.P, O: i.O, D: i.D, F: i.F, K: i.K } };
  });
}
