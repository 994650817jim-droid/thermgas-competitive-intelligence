// Builds the Excel workbook of the evidence data (every row has source IDs and a clickable source link).
// Usage: node scripts/tools/build-xlsx.js   (needs exceljs from dashboard/node_modules)
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
const root = path.join(__dirname, '..', '..');
const ExcelJS = createRequire(path.join(root, 'dashboard', 'package.json'))('exceljs');
const J = f => JSON.parse(fs.readFileSync(path.join(root, 'data', f), 'utf8'));

const lcj = fs.existsSync(path.join(root, 'data', 'link_check.json')) ? J('link_check.json') : {};
const sources = J('sources.json').map(s => ({ ...s, link_check: (lcj[s.id] || {}).result || '', link_checked: (lcj[s.id] || {}).date || '' })), S = Object.fromEntries(sources.map(s => [s.id, s]));
const competitors = J('competitors.json'), products = J('products.json');
const evidence = J('state_evidence.json').rows, facilities = J('facilities.json').rows;
const market = J('market_sizing.json'), ms = J('market_states.json').states, states = J('states.json');
const BLUE = 'FF1F60C4', TINT = 'FFF3F7FF', INK = 'FF454545';

const wb = new ExcelJS.Workbook();
wb.creator = 'Independent student research (Northeastern MSBA)';
wb.created = new Date();

const link = id => (S[id] ? { text: S[id].url, hyperlink: S[id].url } : '');
const ids = a => (Array.isArray(a) ? a : [a]).filter(Boolean);
const first = a => ids(a)[0];

/** cols: [{h, k, w, fmt, link}] rows: array of objects. */
function sheet(name, title, note, cols, rows, opts = {}) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 4, xSplit: opts.freezeCols || 0 }], properties: { tabColor: { argb: BLUE } } });
  ws.mergeCells(1, 1, 1, Math.max(cols.length, 4));
  ws.getCell(1, 1).value = title;
  ws.getCell(1, 1).font = { name: 'Calibri', size: 16, bold: true, color: { argb: BLUE } };
  ws.mergeCells(2, 1, 2, Math.max(cols.length, 4));
  ws.getCell(2, 1).value = note;
  ws.getCell(2, 1).font = { size: 10, italic: true, color: { argb: 'FF7A808A' } };
  ws.getCell(2, 1).alignment = { wrapText: true, vertical: 'top' };
  ws.getRow(2).height = 30;
  const hr = ws.getRow(4);
  cols.forEach((c, i) => {
    const cell = hr.getCell(i + 1);
    cell.value = c.h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    ws.getColumn(i + 1).width = c.w || 16;
  });
  hr.height = 30;
  rows.forEach((r, ri) => {
    const row = ws.getRow(5 + ri);
    cols.forEach((c, i) => {
      const cell = row.getCell(i + 1);
      let v = typeof c.k === 'function' ? c.k(r) : r[c.k];
      if (v === undefined || v === null) v = '';
      cell.value = v;
      if (c.fmt && typeof v === 'number') cell.numFmt = c.fmt;
      if (v && typeof v === 'object' && v.hyperlink) cell.font = { color: { argb: BLUE }, underline: true };
      cell.alignment = { vertical: 'top', wrapText: !!c.wrap };
    });
    if (ri % 2) row.eachCell({ includeEmpty: true }, c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TINT } }; });
  });
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: cols.length } };
  return ws;
}

// ---------------- README ----------------
const rd = wb.addWorksheet('README', { properties: { tabColor: { argb: BLUE } } });
rd.getColumn(1).width = 28; rd.getColumn(2).width = 110;
const lines = [
  ['ThermGAS Market Intelligence: evidence workbook', ''],
  ['Status', 'Independent student research, Northeastern University MSBA. Not an official ThermGAS publication.'],
  ['Evidence as of', `${market.meta.as_of} (competitive evidence as of 2026-11-07)`],
  ['How to use', 'Each sheet is one table. Every row has source IDs and a clickable source link. Use the filter arrows in row 4 to sort and search.'],
  ['Labels', 'Verified = read in the cited source. Inferred = team reasoning or conflicting evidence. Not Verified / Insufficient Evidence = nothing found (it does not mean "no competition").'],
  ['Important limits', 'Data center figures are announced investment from a secondary tracker, not spending. Pharma counts are Census establishments with paid employees, not sites that need leak detection. No market shares, revenues or prices were estimated.'],
  ['', ''],
  ['Sheet', 'Contents'],
  ['Pharma_NAICS', 'Q1: the four NAICS 3254 codes, official Census definitions, establishments and employee-size counts, decision'],
  ['Pharma_by_state', 'Q1: establishments by state for NAICS 325412 + 325414 (Census CBP 2023)'],
  ['Semiconductor_fabs', 'Q2: named U.S. fab projects, investment, status, sources'],
  ['Battery_projects', 'Q2: named battery plants, investment, status, sources'],
  ['Battery_plants_DOE', 'DOE cell-plant list with 2025-26 status updates'],
  ['DataCenters_by_state', 'Q3: projects, announced investment and projects under construction for every state with data; incentives for six researched states'],
  ['DataCenter_projects', 'Q3: the six largest projects per state (developer, county, investment, status)'],
  ['Pharma_by_county', 'State maps: pharmaceutical establishments by county (Census CBP 2023)'],
  ['DataCenters_by_county', 'State maps: data center projects and announced investment by county'],
  ['Located_plants', 'State maps: battery plants and chip fabs with how each was located'],
  ['Competitors', 'Competitive: 11 competitors and ThermGAS, classification and evidence level'],
  ['Products', 'Competitive: product comparison matrix with test basis and sources'],
  ['Competitor_by_state', 'Competitive: state-level offices, distributors, service sites, installations'],
  ['Watch_outs', 'Risks, openings and data cautions an executive should notice, each with sources'],
  ['Sources', 'The full source register with dates and links'],
];
lines.forEach((l, i) => { const r = rd.getRow(1 + i); r.getCell(1).value = l[0]; r.getCell(2).value = l[1]; r.getCell(2).alignment = { wrapText: true, vertical: 'top' }; r.getCell(1).alignment = { vertical: 'top' }; r.getCell(1).font = { bold: true }; });
rd.getCell('A1').font = { size: 18, bold: true, color: { argb: BLUE } };
[8].forEach(n => rd.getRow(n).eachCell(c => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } }; }));

// ---------------- Q1 ----------------
const sizeKeys = Object.keys(market.q1.codes[0].size);
sheet('Pharma_NAICS', 'Q1: Pharmaceutical manufacturing, NAICS 3254', 'Census 2022 NAICS definitions; County Business Patterns 2023 (latest released). Adopted = used for the market estimate.', [
  { h: 'NAICS', k: 'code', w: 9 }, { h: 'Industry', k: 'title', w: 34, wrap: 1 }, { h: 'Official Census description', k: 'definition', w: 70, wrap: 1 },
  { h: 'Decision', k: r => (r.adopted ? 'Adopted' : 'Excluded'), w: 11 }, { h: 'Establishments', k: 'est', w: 15, fmt: '#,##0' }, { h: 'Employees', k: 'emp', w: 13, fmt: '#,##0' },
  ...sizeKeys.map(k => ({ h: `Est. with ${k} employees`, k: r => r.size[k], w: 14, fmt: '#,##0' })),
  { h: 'Why (team reasoning, Inferred)', k: 'why', w: 60, wrap: 1 }, { h: 'Source (definitions)', k: () => link('M01'), w: 40 }, { h: 'Source (counts)', k: () => link('M02'), w: 40 },
], market.q1.codes);

const phRows = Object.entries(ms).filter(([, v]) => v.pharma).map(([code, v]) => ({ code, name: (states.find(s => s.code === code) || {}).name || code, ...v.pharma }));
phRows.sort((a, b) => b.est - a.est);
sheet('Pharma_by_state', 'Q1: Pharmaceutical establishments by state (NAICS 325412 + 325414)', 'Census County Business Patterns 2023. States not listed have no published count (zero or suppressed).', [
  { h: 'State', k: 'code', w: 7 }, { h: 'State name', k: 'name', w: 20 }, { h: 'NAICS 325412', k: 'est_325412', w: 13, fmt: '#,##0' }, { h: 'NAICS 325414', k: 'est_325414', w: 13, fmt: '#,##0' },
  { h: 'Total establishments', k: 'est', w: 14, fmt: '#,##0' }, { h: 'Employees', k: 'emp', w: 12, fmt: '#,##0' }, { h: 'Source (state file)', k: () => link('M03'), w: 45 },
], phRows);

// ---------------- Q2 ----------------
const mk = id => market.q2.markets.find(m => m.id === id);
const q2cols = [
  { h: 'Company', k: 'company', w: 30, wrap: 1 }, { h: 'Location', k: 'location', w: 28, wrap: 1 }, { h: 'State', k: 'state', w: 9 },
  { h: 'Investment ($)', k: 'investment', w: 45, wrap: 1 }, { h: 'Status / timeline', k: 'status', w: 60, wrap: 1 },
  { h: 'Source IDs', k: r => ids(r.sources).join(', '), w: 16 }, { h: 'Primary source', k: r => link(first(r.sources)), w: 50 },
  { h: 'All source links', k: r => ids(r.sources).map(i => S[i] && S[i].url).join('\n'), w: 60, wrap: 1 },
];
sheet('Semiconductor_fabs', 'Q2: Semiconductor manufacturing: named U.S. projects', 'Announcements and status from March 2025 to November 2026. Not a complete list of U.S. fabs.', q2cols, mk('semis').rows);
sheet('Battery_projects', 'Q2: Battery manufacturing: named U.S. projects', 'Announcements and status 2025-2026. See Battery_plants_DOE for the wider plant list.', q2cols, mk('batteries').rows);

sheet('Battery_plants_DOE', 'U.S. Li-ion cell plants (DOE FCAB list with 2025-26 updates)', 'DOE FCAB FY2023 report (data June 2023, announced capacity) plus later status updates. Capacity is nominal announced GWh.', [
  { h: 'Operator', k: 'operator', w: 30, wrap: 1 }, { h: 'City', k: 'city', w: 20 }, { h: 'State', k: 'state', w: 7 }, { h: 'Type', k: 'type', w: 18 },
  { h: 'Status in source', k: 'status_in_source', w: 22 }, { h: 'Capacity (GWh)', k: 'capacity_gwh', w: 13, fmt: '0.0' },
  { h: '2025-26 update', k: 'status_update', w: 55, wrap: 1 }, { h: 'Update evidence level', k: 'status_update_status', w: 14 },
  { h: 'Source IDs', k: r => ids([r.source, r.status_update_source]).join(', '), w: 14 }, { h: 'Primary source', k: r => link(r.source), w: 45 }, { h: 'Update source', k: r => link(r.status_update_source), w: 45 },
], facilities);

// ---------------- Q3 ----------------
const q3 = Object.fromEntries(market.q3.states.map(s => [s.state, s]));
const dcRows = Object.entries(ms).filter(([, v]) => v.data_centers).map(([code, v]) => ({
  code, name: (states.find(s => s.code === code) || {}).name || code, ...v.data_centers, q: q3[code],
})).sort((a, b) => b.announced_b - a.announced_b);
sheet('DataCenters_by_state', 'Q3: Data center projects by state', 'Secondary tracker (BoomTownIndex; compiled Apr 2026, largest projects re-checked Oct 2026), withdrawn projects excluded. Dollars are announced investment, not spending. Incentives are from state government sources for six researched states.', [
  { h: 'State', k: 'code', w: 7 }, { h: 'State name', k: 'name', w: 18 }, { h: '# Projects', k: 'projects', w: 11, fmt: '#,##0' },
  { h: 'Announced investment ($B)', k: 'announced_b', w: 15, fmt: '#,##0.0' }, { h: 'Under construction (#)', k: 'under_construction', w: 14 },
  { h: 'Researched in detail', k: r => (r.q ? 'Yes' : ''), w: 11 },
  { h: 'Leading developers', k: r => (r.q ? r.q.developers : ''), w: 45, wrap: 1 },
  { h: 'Incentives (summary)', k: r => (r.q ? r.q.incentive_short : ''), w: 40, wrap: 1 },
  { h: 'Incentives (detail)', k: r => (r.q ? r.q.incentives : ''), w: 70, wrap: 1 },
  { h: 'Incentive evidence', k: r => (r.q ? r.q.incentive_status : ''), w: 18, wrap: 1 },
  { h: 'Incentive source', k: r => (r.q ? link(first(r.q.incentive_sources)) : ''), w: 45 },
  { h: 'Counts source', k: () => link('M31'), w: 40 },
], dcRows);

const projRows = [];
Object.entries(ms).forEach(([code, v]) => (v.data_centers ? v.data_centers.top : []).forEach(t => projRows.push({ code, ...t })));
sheet('DataCenter_projects', 'Q3: Largest data center projects per state (up to six per state)', 'Rows from the BoomTownIndex tracker (secondary compilation). Verify a project against its state or company announcement before relying on it.', [
  { h: 'State', k: 'code', w: 7 }, { h: 'Project', k: 'project', w: 45, wrap: 1 }, { h: 'Developer', k: 'developer', w: 40, wrap: 1 }, { h: 'County', k: 'county', w: 20 },
  { h: 'Announced investment ($B)', k: 'investment_b', w: 14, fmt: '#,##0.0' }, { h: 'Status', k: 'status', w: 18 }, { h: 'Timeline (tracker)', k: 'timeline', w: 50, wrap: 1 },
  { h: 'Source', k: () => link('M31'), w: 40 },
], projRows);

// ---------------- County level (state maps) ----------------
const geo = J('market_geo.json');
const cRows = (kind, f) => Object.entries(geo[kind]).flatMap(([st, cs]) => Object.entries(cs).map(([fips, o]) => ({ st, fips, name: geo.names[fips] || fips, ...f(o) })));
sheet('Pharma_by_county', 'State maps: Pharmaceutical establishments by county (NAICS 325412 + 325414)', 'Census CBP 2023 county file. County detail covers only the counties where the Census publishes industry detail, so county totals are lower than the state totals. Connecticut is shown by the new planning regions.', [
  { h: 'State', k: 'st', w: 7 }, { h: 'County FIPS', k: 'fips', w: 11 }, { h: 'County / area', k: 'name', w: 36 }, { h: 'NAICS 325412', k: 'e325412', w: 13, fmt: '#,##0' },
  { h: 'NAICS 325414', k: 'e325414', w: 13, fmt: '#,##0' }, { h: 'Total establishments', k: 'n', w: 14, fmt: '#,##0' }, { h: 'Source', k: () => link('M02'), w: 45 },
], cRows('pharma', o => o).sort((a, b) => b.n - a.n));
sheet('DataCenters_by_county', 'State maps: Data center projects by county', 'Rows from the BoomTownIndex tracker (secondary compilation), withdrawn projects excluded, grouped by county. Largest four projects per county are listed.', [
  { h: 'State', k: 'st', w: 7 }, { h: 'County FIPS', k: 'fips', w: 11 }, { h: 'County', k: 'name', w: 30 }, { h: '# Projects', k: 'n', w: 11 },
  { h: 'Announced investment ($B)', k: 'b', w: 15, fmt: '#,##0.0' }, { h: 'Under construction (#)', k: 'uc', w: 14 },
  { h: 'Largest projects', k: r => r.top.map(t => `${t.p} (${t.d}; $${t.b}B; ${t.s})`).join('\n'), w: 90, wrap: 1 }, { h: 'Source', k: () => link('M31'), w: 40 },
], cRows('data_centers', o => o).sort((a, b) => b.b - a.b));
sheet('Located_plants', 'State maps: Battery plants and chip fabs shown on the state maps', 'Located by Census gazetteer city centre, or county centre where noted. Marker positions are approximate (city or county centre, not the plant address).', [
  { h: 'Type', k: r => (r.kind === 'battery' ? 'Battery plant' : 'Chip fab project'), w: 16 }, { h: 'State', k: 'state', w: 7 }, { h: 'Plant / project', k: 'label', w: 36, wrap: 1 },
  { h: 'Detail', k: 'detail', w: 80, wrap: 1 }, { h: 'Located by', k: 'located_by', w: 30 }, { h: 'Source IDs', k: r => ids(r.sources).join(', '), w: 16 }, { h: 'Primary source', k: r => link(first(r.sources)), w: 50 },
], geo.places);

// ---------------- Competitive ----------------
sheet('Competitors', 'Competitive: companies researched', 'Direct = officially marketed for continuous DMC / electrolyte-solvent monitoring in battery production. Evidence level = how well the classification is supported.', [
  { h: 'Company', k: 'name', w: 34, wrap: 1 }, { h: 'Category', k: 'category', w: 26, wrap: 1 }, { h: 'Headquarters', k: 'hq', w: 32, wrap: 1 }, { h: 'Relevant products', k: r => r.relevant_products.join('; '), w: 40, wrap: 1 },
  { h: 'U.S. presence', k: 'us_presence', w: 60, wrap: 1 }, { h: 'Battery experience', k: 'battery_experience', w: 60, wrap: 1 }, { h: 'Relationship to ThermGAS', k: 'relationship', w: 55, wrap: 1 },
  { h: 'Evidence level', k: 'evidence_level', w: 18, wrap: 1 }, { h: 'Source IDs', k: r => r.sources.join(', '), w: 24, wrap: 1 }, { h: 'Primary source', k: r => link(r.sources[0]), w: 45 },
], competitors);

const pc = [['technology', 'Technology', 30], ['dmc_capability', 'DMC capability', 45], ['dmc_status', 'DMC evidence', 18], ['range', 'Range', 20], ['sensitivity', 'Sensitivity', 22], ['response_time', 'Response time', 20], ['selectivity', 'Selectivity', 35], ['accuracy', 'Accuracy', 24], ['maintenance', 'Maintenance', 40], ['price', 'Price', 36], ['conditions', 'Test basis / caveats', 40]];
sheet('Products', 'Competitive: product comparison matrix', 'Specifications are vendor claims on different bases (isobutylene-equivalent, ppm/s, leak rate). Do not rank products across rows.', [
  { h: 'Company', k: r => (competitors.find(c => c.id === r.company) || {}).name || r.company, w: 26, wrap: 1 }, { h: 'Product', k: 'model', w: 36, wrap: 1 }, { h: 'Category', k: 'category', w: 20, wrap: 1 },
  ...pc.map(([k, h, w]) => ({ h, k, w, wrap: 1 })), { h: 'Source IDs', k: r => r.sources.join(', '), w: 22, wrap: 1 }, { h: 'Primary source', k: r => link(r.sources[0]), w: 45 },
], products);

sheet('Competitor_by_state', 'Competitive: state-level evidence', 'One fact per row. Metrics (hq, office, distributor, service, installation, regulatory) are never added together. A state with no row is Not Verified / Insufficient Evidence.', [
  { h: 'Company', k: r => (competitors.find(c => c.id === r.company) || {}).name || r.company, w: 26, wrap: 1 }, { h: 'State', k: 'state', w: 7 }, { h: 'Metric', k: 'metric', w: 14 },
  { h: 'Evidence', k: 'value', w: 70, wrap: 1 }, { h: 'Evidence level', k: 'status', w: 12 }, { h: 'Notes', k: 'notes', w: 45, wrap: 1 }, { h: 'Source ID', k: 'source', w: 9 }, { h: 'Source', k: r => link(r.source), w: 45 },
], evidence);

sheet('Watch_outs', 'Watch-outs: risks, openings and data cautions', 'Things to notice before acting on the numbers. Level: Risk = could slow demand; Opportunity = a clear opening; Data caution = a limit of the evidence.', [
  { h: 'ID', k: 'id', w: 7 }, { h: 'Level', k: r => ({ risk: 'Risk', opportunity: 'Opportunity', caution: 'Data caution' })[r.level], w: 14 },
  { h: 'Scope', k: r => (r.scope === 'US' ? 'U.S.-wide' : r.scope), w: 10 }, { h: 'Market', k: 'market', w: 14 }, { h: 'Title', k: 'title', w: 34, wrap: 1 },
  { h: 'What to know', k: 'text', w: 90, wrap: 1 }, { h: 'Evidence level', k: 'status', w: 26, wrap: 1 }, { h: 'Source IDs', k: r => ids(r.sources).join(', '), w: 16 }, { h: 'Primary source', k: r => link(first(r.sources)), w: 50 },
], J('watchouts.json').items);

sheet('Sources', 'Source register', 'Every number in the dashboard cites one of these IDs. Source date = date of the document; access date = when the team read it.', [
  { h: 'ID', k: 'id', w: 7 }, { h: 'Publisher', k: 'publisher', w: 32, wrap: 1 }, { h: 'Title', k: 'title', w: 70, wrap: 1 }, { h: 'Type', k: 'type', w: 28, wrap: 1 },
  { h: 'Source date', k: 'source_date', w: 20, wrap: 1 }, { h: 'Accessed', k: 'access_date', w: 12 }, { h: 'Link', k: r => ({ text: r.url, hyperlink: r.url }), w: 70 }, { h: 'Link check', k: 'link_check', w: 34, wrap: 1 }, { h: 'Checked on', k: 'link_checked', w: 12 },
], sources);

const file = 'ThermGAS_Market_Intelligence_Data.xlsx';
const outDirs = [path.join(root, 'data', 'export'), path.join(root, 'dashboard', 'public', 'export')];
(async () => {
  for (const d of outDirs) { fs.mkdirSync(d, { recursive: true }); await wb.xlsx.writeFile(path.join(d, file)); }
  console.log('wrote', file, '| sheets:', wb.worksheets.map(w => `${w.name}(${Math.max(0, w.rowCount - 4)})`).join(' '));
})();
