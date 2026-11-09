import { growth } from './data';

/** Data center capacity model (Assumption): systems = MW / MW per block x systems per block. Counts only, never dollars. */
export const systemsEstimate = (mw: number, mwPerBlock: number, perBlock: number) => Math.round((mw / mwPerBlock) * perBlock);

/** Plain-text summary of the growth markets for the printable briefing and the Markdown download. */
export function growthMarkdown(): string[] {
  const L: string[] = [];
  const src = (a: any) => (a.sources?.length ? ` [${a.sources.join(', ')}]` : '');
  L.push('## Growth markets (research-team proposals, not approved ThermGAS strategy)');
  L.push(`*Evidence as of ${growth.meta.as_of}. ${growth.meta.status_note}*`, '');
  growth.markets.forEach((m: any) => {
    L.push(`### ${m.label}`, `**${m.verdict.headline}**`, '');
    m.verdict.answers.forEach((a: any) => L.push(`- ${a.q}: ${a.a} (${a.status})${src(a)}`));
    m.readouts.forEach((r: any) => L.push(`- ${r.label}: ${r.value}${r.unit ? ' ' + r.unit : ''} (${r.status})${src(r)}`));
    const sz = m.market.sizing;
    L.push(`- Sizing (${sz.status}): ${sz.formula}. ${sz.limitations[0]}`);
    L.push(`- Entry plan (proposal): ${m.entry.plan.join(' ')}`, '');
  });
  return L;
}
