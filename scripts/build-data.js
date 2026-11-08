// Validates the research JSON and builds derived datasets + CSV exports.
// Usage: node scripts/build-data.js
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..', 'data');
const OUT = path.join(D, 'export');
fs.mkdirSync(OUT, { recursive: true });
const load = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));

const sources = load('sources.json');
const competitors = load('competitors.json');
const products = load('products.json');
const evidence = load('state_evidence.json').rows;
const facilities = load('facilities.json').rows;
const srcIds = new Set(sources.map(s => s.id));
const compIds = new Set(competitors.map(c => c.id));

// ---- validation -------------------------------------------------------
const errors = [];
const checkSrc = (ids, ctx) => [].concat(ids).filter(Boolean).forEach(id => { if (!srcIds.has(id)) errors.push(`${ctx}: unknown source ${id}`); });
competitors.forEach(c => checkSrc(c.sources, `competitor ${c.id}`));
products.forEach(p => { checkSrc(p.sources, `product ${p.id}`); if (!compIds.has(p.company)) errors.push(`product ${p.id}: unknown company ${p.company}`); });
evidence.forEach((e, i) => { checkSrc(e.source, `evidence #${i}`); if (!compIds.has(e.company)) errors.push(`evidence #${i}: unknown company`); if (!['Verified','Inferred','Unknown'].includes(e.status)) errors.push(`evidence #${i}: bad status ${e.status}`); });
facilities.forEach((f, i) => checkSrc([f.source, f.status_update_source], `facility #${i}`));
const analysis = load('analysis.json');
const excluded = load('excluded.json');
const walk = (o, ctx) => { if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${ctx}[${i}]`)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if ((k === 'sources' || k === 'evidence') && Array.isArray(v) && v.every(x => typeof x === 'string')) checkSrc(v, `${ctx}.${k}`); else walk(v, `${ctx}.${k}`); } };
walk(analysis, 'analysis');
const executive = load('executive.json');
walk(executive, 'executive');
const OK_STATUS = /^(Verified|Inferred|Assumption|Unknown|Proposed)/;
(function chk(o, ctx) { if (Array.isArray(o)) o.forEach((x, i) => chk(x, `${ctx}[${i}]`)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k === 'status' && typeof v === 'string' && !OK_STATUS.test(v)) errors.push(`${ctx}.status: bad label "${v}"`); else chk(v, `${ctx}.${k}`); } })(executive, 'executive');
const facKeys = new Set(facilities.map(f => `${f.operator}|${f.city.replace(/ \(.*$/, '')}`));
const tierIds = Object.keys(executive.facility_tiers);
executive.facility_status.forEach(f => { if (!facKeys.has(f.key)) errors.push(`executive facility_status: unknown facility ${f.key}`); if (!tierIds.includes(f.tier)) errors.push(`executive facility_status: bad tier ${f.tier}`); });
facilities.forEach(f => { const k = `${f.operator}|${f.city.replace(/ \(.*$/, '')}`; if (f.type.startsWith('Li-ion') && !executive.facility_status.some(x => x.key === k) && !/cancel/i.test(f.status_update || '')) errors.push(`executive facility_status: missing tier for ${k}`); });
const prodIds = new Set(products.map(p => p.id));
analysis.threats.forEach(t => { if (!prodIds.has(t.product)) errors.push(`threat: unknown product ${t.product}`); });
analysis.battlecards.forEach(b => { if (!prodIds.has(b.product)) errors.push(`battlecard: unknown product ${b.product}`); });
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

// ---- state rollup (51 = 50 states + DC) --------------------------------
const STATES = {AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'};
const uniq = a => [...new Set(a)].sort();
const states = Object.entries(STATES).map(([code, name]) => {
  const ev = evidence.filter(e => e.state === code);
  const comp = ev.filter(e => e.company !== 'thermgas');
  const by = m => uniq(comp.filter(e => e.metric === m).map(e => e.company));
  const all = facilities.filter(f => f.state === code);
  // Only exclude plants whose cancellation is Verified; Inferred reports stay counted but flagged.
  const isCancelled = f => /cancel/i.test(f.status_update || '') && f.status_update_status === 'Verified';
  const fac = all.filter(f => !isCancelled(f));
  const presence = uniq(comp.filter(e => ['hq','office','distributor','service'].includes(e.metric)).map(e => e.company));
  return {
    code, name,
    competitor_hq: by('hq'), competitor_offices: by('office'), competitor_distributors: by('distributor'),
    competitor_service: by('service'), competitor_installations: by('installation'), competitor_customer_refs: by('customer_reference'),
    regulatory_notes: comp.filter(e => e.metric === 'regulatory').map(e => e.value),
    competitors_with_verified_local_presence: presence.length,
    thermgas_hq: ev.some(e => e.company === 'thermgas' && e.metric === 'hq'),
    thermgas_refrigerant_references: ev.filter(e => e.company === 'thermgas' && e.metric === 'installation').map(e => e.value),
    thermgas_foothold: ev.some(e => e.company === 'thermgas' && e.metric === 'hq') ? 1 : (ev.some(e => e.company === 'thermgas' && e.metric === 'installation') ? 0.5 : 0),
    competitor_presence_list: presence,
    battery_cell_plants: fac.filter(f => f.type.startsWith('Li-ion')).length,
    battery_cell_gwh: +fac.filter(f => f.capacity_gwh).reduce((s, f) => s + f.capacity_gwh, 0).toFixed(1),
    dmc_solvent_plants: fac.filter(f => f.type.startsWith('DMC')).length,
    cancelled_plants_excluded: all.filter(isCancelled).length,
    evidence_status: (presence.length || fac.length || ev.length) ? 'Evidence found' : 'Not Verified / Insufficient Evidence'
  };
});
fs.writeFileSync(path.join(D, 'states.json'), JSON.stringify(states, null, 2));

// ---- CSV exports --------------------------------------------------------
const csv = (rows, cols) => [cols.join(',')].concat(rows.map(r => cols.map(c => {
  let v = r[c]; if (Array.isArray(v)) v = v.join('; '); if (v === null || v === undefined) v = '';
  v = String(v); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}).join(','))).join('\n');
const write = (f, rows, cols) => fs.writeFileSync(path.join(OUT, f), '﻿' + csv(rows, cols));
write('source_register.csv', sources, ['id','publisher','title','url','source_date','access_date','type']);
write('competitors.csv', competitors, ['id','name','category','hq','hq_state','hq_status','website','industry_focus','relevant_products','us_presence','battery_experience','relationship','rationale','evidence_level','sources']);
write('competitor_comparison_matrix.csv', products, ['id','company','model','category','technology','target_gases','dmc_capability','dmc_status','range','sensitivity','resolution','response_time','selectivity','accuracy','calibration','maintenance','installation','integration','certifications','applications','price','warranty','conditions','sources']);
const srcUrl = Object.fromEntries(sources.map(s => [s.id, s]));
write('state_evidence.csv', evidence.map(e => ({...e, source_url: srcUrl[e.source].url, source_date: srcUrl[e.source].source_date, access_date: srcUrl[e.source].access_date})), ['company','product','state','metric','value','source','source_url','source_date','access_date','status','notes']);
write('states_51.csv', states, ['code','name','evidence_status','competitors_with_verified_local_presence','competitor_hq','competitor_offices','competitor_distributors','competitor_service','competitor_installations','regulatory_notes','thermgas_hq','thermgas_refrigerant_references','battery_cell_plants','battery_cell_gwh','dmc_solvent_plants','cancelled_plants_excluded']);
write('facilities.csv', facilities, ['operator','city','state','type','status_in_source','capacity_gwh','capacity_note','source','status','status_update','status_update_source','status_update_status']);

// ---- combined dataset for the dashboard ----------------------------------
const dash = path.join(__dirname, '..', 'dashboard', 'src', 'data');
if (fs.existsSync(path.join(__dirname, '..', 'dashboard'))) {
  fs.mkdirSync(dash, { recursive: true });
  fs.writeFileSync(path.join(dash, 'dataset.json'), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), sources, competitors, products, evidence, facilities, states, analysis, excluded, executive }, null, 1));
  const pub = path.join(__dirname, '..', 'dashboard', 'public', 'export');
  fs.mkdirSync(pub, { recursive: true });
  for (const f of fs.readdirSync(OUT)) fs.copyFileSync(path.join(OUT, f), path.join(pub, f));
  fs.writeFileSync(path.join(pub, 'thermgas_ci_dataset.json'), JSON.stringify({ sources, competitors, products, evidence, facilities, states, analysis, excluded, executive }, null, 2));
}

const s = states;
console.log(`OK  sources=${sources.length} competitors=${competitors.length - 1} (+ThermGAS) products=${products.length} evidence=${evidence.length} facilities=${facilities.length}`);
console.log(`States with any competitor local presence: ${s.filter(x => x.competitors_with_verified_local_presence).map(x => x.code).join(', ')}`);
console.log(`States with battery cell plants (DOE FCAB): ${s.filter(x => x.battery_cell_plants).map(x => `${x.code}(${x.battery_cell_plants}, ${x.battery_cell_gwh} GWh)`).join(', ')}`);
console.log(`States "Not Verified / Insufficient Evidence": ${s.filter(x => x.evidence_status !== 'Evidence found').length} of 51`);
