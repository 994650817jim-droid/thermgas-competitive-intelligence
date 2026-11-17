// Generates docs/Market_Sizing_Report.md from data/market_sizing.json + data/sources.json.
// Usage: node scripts/tools/build-report.js
const fs = require('fs');
const path = require('path');
const D = p => path.join(__dirname, '..', '..', 'data', p);
const M = JSON.parse(fs.readFileSync(D('market_sizing.json'), 'utf8'));
const S = Object.fromEntries(JSON.parse(fs.readFileSync(D('sources.json'), 'utf8')).map(s => [s.id, s]));
const cite = ids => (ids || []).map(i => `[${i}](${S[i].url})`).join(', ');
const n = x => Number(x).toLocaleString('en-US');
const esc = s => String(s).replace(/\|/g, '/');
const L = [];
const p = (...a) => L.push(...a);

p('# ThermGAS Market Sizing and Targeting Report', '',
  '*Independent student research, Northeastern University MSBA. Not an official ThermGAS publication.*',
  `Evidence as of ${M.meta.as_of}. Generated from \`data/market_sizing.json\`; every figure carries a source ID that resolves to a dated entry in the source register (\`data/export/source_register.csv\`). Labels: **Verified** = read in the cited source; **Inferred** = the team's reasoning.`, '',
  '## Summary', '',
  `- **Q1 Pharma:** adopt NAICS **325412** (primary) and **325414** (secondary): **${n(M.q1.adopted_summary.est)}** U.S. establishments, **${n(M.q1.adopted_summary.est_50plus)}** with 50+ employees (Census CBP 2023).`,
  '- **Q2 Growth markets:** semiconductors and batteries, four named projects each, with investment, status and sources.',
  `- **Q3 Data centers:** ${M.q3.recommendation.short}`, '');

// ---- Q1
p('## Question 1. Which NAICS code for pharmaceutical manufacturing?', '', M.q1.paragraph, '',
  '| Code | Industry | Official description (Census 2022 NAICS) | Establishments | Employees | Decision |', '|---|---|---|---|---|---|');
for (const c of M.q1.codes) p(`| ${c.code} | ${c.title} | ${esc(c.definition)} | ${n(c.est)} | ${n(c.emp)} | ${c.adopted ? '**Adopted**' : 'Excluded'} |`);
p('', `Sources: ${cite(M.q1.sources)}`, '', '**Size of the adopted establishments (325412 + 325414), by employees**', '',
  '| ' + Object.keys(M.q1.adopted_summary.size).join(' | ') + ' |', '|' + Object.keys(M.q1.adopted_summary.size).map(() => '---').join('|') + '|',
  '| ' + Object.values(M.q1.adopted_summary.size).join(' | ') + ' |', '',
  '**Top states**', '', '| State | Total | 325412 | 325414 |', '|---|---|---|---|');
for (const s of M.q1.adopted_summary.top_states) p(`| ${s.state} | ${s.est} | ${s['325412']} | ${s['325414']} |`);
p('', '**Limits**', '', ...M.q1.limitations.map(x => `- ${x}`), '');

// ---- Q2
p('## Question 2. Growth markets: semiconductors and batteries', '', M.q2.intro, '');
for (const m of M.q2.markets) {
  p(`### ${m.name}`, '', '**Evidence of growth**', '', ...m.evidence_of_growth.map(e => `- ${e.text} (${e.status}; ${cite(e.sources)})`), '',
    '| Company | Location (state) | Investment ($) | Status / timeline | Source |', '|---|---|---|---|---|');
  for (const r of m.rows) p(`| ${r.company} | ${esc(r.location)} | ${esc(r.investment)} | ${esc(r.status)} | ${cite(r.sources)} |`);
  p('', `**Why they need leak detection.** ${m.fit.text} *(${m.fit.status}; ${cite(m.fit.sources)})*`, '');
}

// ---- Q3
const q3 = M.q3;
p('## Question 3. Data center construction by state', '', q3.intro, '', `${q3.national.text} (${cite(q3.national.sources)})`, '',
  '| Rank | State | # Projects | Total announced investment | Under construction | Leading developers | Incentives | Source |', '|---|---|---|---|---|---|---|---|');
[...q3.states].sort((a, b) => b.announced_b - a.announced_b).forEach((s, i) =>
  p(`| ${i + 1} | ${s.name} | ${s.projects} | $${s.announced_b}B | ${s.under_construction} ($${s.uc_b}B) | ${esc(s.developers)} | ${esc(s.incentives)} | ${cite([...s.sources, ...s.incentive_sources])} |`));
p('', q3.ranking_note, '', '**Flagship projects**', '', ...q3.states.map(s => `- **${s.name}:** ${s.flagship}${s.caveat ? ` Note: ${s.caveat}` : ''}`), '',
  `**Recommendation.** ${q3.recommendation.text} *(${q3.recommendation.status}; ${cite(q3.recommendation.sources)})*`, '',
  `**Why data centers need refrigerant monitoring.** ${q3.fit.text} *(${q3.fit.status}; ${cite(q3.fit.sources)})*`, '',
  '**Limits**', '', ...q3.limitations.map(x => `- ${x}`), '',
  '## Evidence gaps', '', ...M.evidence_gaps.map(x => `- ${x}`), '');

fs.writeFileSync(path.join(__dirname, '..', '..', 'docs', 'Market_Sizing_Report.md'), L.join('\n'));
console.log('wrote docs/Market_Sizing_Report.md', L.join('\n').length, 'chars');
