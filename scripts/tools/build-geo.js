// Builds the state-level (county) map data.
//   dashboard/src/data/counties.json  - county outlines in the same Albers USA frame as usmap.json (from us-atlas, public domain)
//   data/market_geo.json              - per-state county numbers + located projects
// Raw inputs kept locally (not in the repo): research/census/cbp23co.txt, 2023_Gaz_place_national.txt, 2023_Gaz_counties_national.txt,
//   research/market/dc_tracker_rows.json
// Usage: node scripts/tools/build-geo.js
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
const root = path.join(__dirname, '..', '..');
const req = createRequire(path.join(root, 'dashboard', 'package.json'));
const { feature } = req('topojson-client');
const { geoPath, geoAlbersUsa } = req('d3-geo');
const topo = req('us-atlas/counties-albers-10m.json');
const R = p => path.join(root, 'research', p);
const J = f => JSON.parse(fs.readFileSync(path.join(root, 'data', f), 'utf8'));

const FIPS = { '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY' };
const tsv = f => { const L = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean); const H = L[0].split('\t').map(s => s.trim()); return L.slice(1).map(l => { const v = l.split('\t'); const o = {}; H.forEach((h, i) => (o[h] = (v[i] || '').trim())); return o; }); };

// ---- county outlines (pre-projected Albers USA 975x610) ---------------------------------
const gp = geoPath().digits(1);
const feats = feature(topo, topo.objects.counties).features;
const byState = {};
for (const f of feats) {
  const st = FIPS[String(f.id).slice(0, 2)]; if (!st) continue;
  const d = gp(f); if (!d) continue;
  const [[x0, y0], [x1, y1]] = gp.bounds(f);
  const s = (byState[st] = byState[st] || { bbox: [1e9, 1e9, -1e9, -1e9], counties: [] });
  s.bbox = [Math.min(s.bbox[0], x0), Math.min(s.bbox[1], y0), Math.max(s.bbox[2], x1), Math.max(s.bbox[3], y1)].map(v => +v.toFixed(1));
  const [[cx0, cy0], [cx1, cy1]] = [[x0, y0], [x1, y1]];
  s.counties.push({ f: String(f.id), n: f.properties.name, d, cx: +((cx0 + cx1) / 2).toFixed(1), cy: +((cy0 + cy1) / 2).toFixed(1) });
}
fs.writeFileSync(path.join(root, 'dashboard', 'src', 'data', 'counties.json'), JSON.stringify({ width: 975, height: 610, states: byState }));

// ---- gazetteers -----------------------------------------------------------------------
const gazC = tsv(R('census/2023_Gaz_counties_national.txt'));
const gazP = tsv(R('census/2023_Gaz_place_national.txt'));
const norm = s => s.toLowerCase().replace(/\b(county|parish|borough|census area|municipality|city and borough|city)\b/g, '').replace(/[^a-z0-9]/g, '');
const cntyKey = {}; // `${USPS}|${norm(name)}` -> geoid
for (const r of gazC) { const k = `${r.USPS}|${norm(r.NAME)}`; if (!cntyKey[k]) cntyKey[k] = r.GEOID; }
const cntyByGeoid = Object.fromEntries(gazC.map(r => [r.GEOID, r]));
const proj = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const xy = (lat, lon) => { const p = proj([lon, lat]); return p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null; };

// ---- pharma by county (CBP 2023) ------------------------------------------------------
const ph = {};
const lines = fs.readFileSync(R('census/cbp23co.txt'), 'utf8').split(/\r?\n/);
const H = lines[0].replace(/"/g, '').split(',');
const iS = H.indexOf('fipstate'), iC = H.indexOf('fipscty'), iN = H.indexOf('naics'), iE = H.indexOf('est'), iM = H.indexOf('emp');
for (let i = 1; i < lines.length; i++) {
  const l = lines[i]; if (!l) continue;
  const v = l.replace(/"/g, '').split(',');
  if (v[iN] !== '325412' && v[iN] !== '325414') continue;
  if (v[iC] === '999') continue;
  const st = FIPS[v[iS]]; if (!st) continue;
  const g = v[iS] + v[iC];
  const o = ((ph[st] = ph[st] || {})[g] = ph[st][g] || { n: 0, e325412: 0, e325414: 0 });
  o.n += +v[iE]; o['e' + v[iN]] += +v[iE];
}

// ---- data centers by county (tracker) ---------------------------------------------------
const trk = JSON.parse(fs.readFileSync(R('market/dc_tracker_rows.json'), 'utf8')).filter(r => r.status !== 'Withdrawn');
const dc = {}; const unmatched = [];
for (const r of trk) {
  const g = cntyKey[`${r.st}|${norm(r.county)}`];
  if (!g) { unmatched.push(`${r.st} ${r.county}`); continue; }
  const o = ((dc[r.st] = dc[r.st] || {})[g] = dc[r.st][g] || { n: 0, b: 0, uc: 0, ucb: 0, top: [] });
  o.n++; o.b += r.amount_m / 1000; if (r.status === 'Under construction') { o.uc++; o.ucb += r.amount_m / 1000; }
  o.top.push({ p: r.project, d: r.developer, b: +(r.amount_m / 1000).toFixed(2), s: r.status });
}
for (const st of Object.keys(dc)) for (const g of Object.keys(dc[st])) { const o = dc[st][g]; o.b = +o.b.toFixed(1); o.ucb = +o.ucb.toFixed(1); o.top = o.top.sort((a, b) => b.b - a.b).slice(0, 4); }

// ---- located places: battery plants and fabs ----------------------------------------------
const placeLookup = (st, name) => {
  const c = gazP.filter(r => r.USPS === st && (r.NAME === name + ' city' || r.NAME === name + ' town' || r.NAME === name + ' village' || r.NAME === name + ' township' || r.NAME.startsWith(name + ' ')) && r.LSAD !== '57');
  c.sort((a, b) => (/ city$| town$/.test(b.NAME) ? 1 : 0) - (/ city$| town$/.test(a.NAME) ? 1 : 0));
  return c[0];
};
const countyPoint = (st, name) => { const g = cntyKey[`${st}|${norm(name)}`]; return g ? cntyByGeoid[g] : null; };
const facilities = J('facilities.json').rows;
const places = [];
const miss = [];
const addPlace = (kind, st, name, label, detail, sources, lookup) => {
  let rec = null, note = '';
  if (lookup && lookup.county) rec = countyPoint(st, lookup.county), note = `${lookup.county} (county centre)`;
  else rec = placeLookup(st, (lookup && lookup.city) || name), note = `${(lookup && lookup.city) || name}, ${st}`;
  if (!rec) { miss.push(`${kind} ${st} ${name}`); return; }
  const pt = xy(+rec.INTPTLAT, +rec.INTPTLONG);
  if (!pt) { miss.push(`${kind} ${st} ${name} (outside projection)`); return; }
  places.push({ kind, state: st, label, detail, x: pt[0], y: pt[1], located_by: note, sources });
};
for (const f of facilities) {
  const lookup = f.city.includes('Jefferson Parish') ? { county: 'Jefferson Parish' } : f.city === 'Bryan County' ? { county: 'Bryan County' } : f.city === 'Glendale' ? { county: 'Hardin County' } : f.city === 'Greensboro' ? { city: 'Liberty' } : f.city === 'Van Buren Township' ? { city: 'Belleville' } : f.city === 'De Soto' ? { city: 'De Soto' } : null;
  const where = f.city === 'Greensboro' ? 'Liberty' : f.city;
  addPlace('battery', f.state, where, `${f.operator.replace(/ \(.*?\)/g, '')}`, `${where}, ${f.state}${f.capacity_gwh ? ` · ${f.capacity_gwh} GWh` : f.capacity_note ? ` · ${f.capacity_note}` : ''}${f.status_update ? ` · ${f.status_update}` : ` · ${f.status_in_source}`}`, [f.source, f.status_update_source].filter(Boolean), lookup);
}
const fabs = [
  ['AZ', 'Phoenix', 'TSMC Arizona', 'Phoenix, AZ · $165B planned U.S. investment · first fab in volume production since late 2024', ['M11', 'M14'], null],
  ['TX', 'Sherman', 'Texas Instruments (Sherman)', 'Sherman, TX · up to $40B for four fabs · SM1 initial production 2025', ['M10', 'M17'], null],
  ['UT', 'Lehi', 'Texas Instruments (Lehi)', 'Lehi, UT · LFAB1 ramping, LFAB2 under construction', ['M10'], null],
  ['TX', 'Taylor', 'Samsung (Taylor)', 'Taylor, TX · over $37B (Austin + Taylor) · start delayed from 2024 to 2025; current status not confirmed', ['M13', 'M14'], null],
  ['ID', 'Boise', 'Micron (Idaho)', 'Boise, ID · $200B plan · first fab wafer output mid-to-2H 2027 (secondary)', ['M12', 'M16'], null],
  ['NY', 'Clay', 'Micron (New York)', 'Clay, NY (Onondaga County) · first fab opening delayed to Q3 2030', ['M12', 'M14'], { county: 'Onondaga County' }],
];
for (const [st, name, label, detail, sources, lookup] of fabs) addPlace('fab', st, name, label, detail, sources, lookup);

fs.writeFileSync(path.join(root, 'data', 'market_geo.json'), JSON.stringify({
  note: 'Derived by scripts/tools/build-geo.js. pharma = Census CBP 2023 establishments per county (NAICS 325412 + 325414). data_centers = BoomTownIndex tracker rows (secondary compilation; withdrawn excluded) grouped by county. places = battery plants (DOE list + updates) and named fab projects, located by Census gazetteer city or county centre.',
  sources: { pharma: ['M02'], data_centers: ['M31'], places: ['S130', 'M14', 'M10', 'M11', 'M12', 'M13'] },
  names: Object.fromEntries([...new Set([...Object.values(ph).flatMap(o => Object.keys(o)), ...Object.values(dc).flatMap(o => Object.keys(o))])].map(g => [g, (cntyByGeoid[g] || {}).NAME || g])),
  pharma: ph, data_centers: dc, places,
}));
console.log('counties states:', Object.keys(byState).length, '| pharma counties:', Object.values(ph).reduce((a, s) => a + Object.keys(s).length, 0), '| dc counties:', Object.values(dc).reduce((a, s) => a + Object.keys(s).length, 0));
console.log('DC rows unmatched to a county:', unmatched.length, unmatched.slice(0, 12).join('; '));
console.log('places located:', places.length, '| missing:', miss.join('; ') || 'none');
