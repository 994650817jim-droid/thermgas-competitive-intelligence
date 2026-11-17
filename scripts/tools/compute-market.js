// Derives the numbers used in data/market_sizing.json from raw files kept locally (not in the repo):
//   research/census/cbp23us.txt, cbp23st.txt  (Census County Business Patterns 2023, public domain)
//   research/market/dc_tracker_rows.json      (rows parsed from the BoomTownIndex data-center tracker page)
// Usage: node scripts/tools/compute-market.js   -> prints JSON to paste/verify; writes research/market/computed.json
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', '..', 'research', p);

const rows = f => {
  const L = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean);
  const H = L[0].replace(/"/g, '').split(',');
  return L.slice(1).map(l => { const v = l.replace(/"/g, '').split(','); const o = {}; H.forEach((h, i) => (o[h] = v[i])); return o; });
};
const FIPS = { '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY' };

// ---- Q1: CBP 2023 ---------------------------------------------------------
const us = rows(R('census/cbp23us.txt')).filter(r => r.lfo === '-');
const st = rows(R('census/cbp23st.txt')).filter(r => r.lfo === '-');
const bins = [['<5', 'n<5'], ['5-9', 'n5_9'], ['10-19', 'n10_19'], ['20-49', 'n20_49'], ['50-99', 'n50_99'], ['100-249', 'n100_249'], ['250-499', 'n250_499'], ['500-999', 'n500_999'], ['1000+', 'n1000']];
const num = v => (/^\d+$/.test(v) ? +v : 0);
const codes = ['325411', '325412', '325413', '325414'];
const q1 = { codes: {}, adopted: {} };
for (const c of codes) {
  const r = us.find(x => x.naics === c);
  q1.codes[c] = { est: +r.est, emp: +r.emp, payroll_k: +r.ap, size: Object.fromEntries(bins.map(([l, k]) => [l, num(r[k])])) };
}
const adopted = ['325412', '325414'];
q1.adopted.est = adopted.reduce((a, c) => a + q1.codes[c].est, 0);
q1.adopted.emp = adopted.reduce((a, c) => a + q1.codes[c].emp, 0);
q1.adopted.size = Object.fromEntries(bins.map(([l]) => [l, adopted.reduce((a, c) => a + q1.codes[c].size[l], 0)]));
q1.adopted.est_50plus = ['50-99', '100-249', '250-499', '500-999', '1000+'].reduce((a, l) => a + q1.adopted.size[l], 0);
const by = {};
for (const r of st.filter(r => adopted.includes(r.naics))) {
  const s = FIPS[r.fipstate]; if (!s) continue;
  by[s] = by[s] || { est: 0, emp: 0, '325412': 0, '325414': 0 };
  by[s].est += +r.est; by[s].emp += +r.emp; by[s][r.naics] = +r.est;
}
q1.adopted.states_listed = Object.keys(by).length;
q1.adopted.states_sum = Object.values(by).reduce((a, b) => a + b.est, 0);
q1.adopted.top_states = Object.entries(by).sort((a, b) => b[1].est - a[1].est).slice(0, 10).map(([s, v]) => ({ state: s, ...v }));

// ---- Q3: data center tracker ---------------------------------------------
const trk = JSON.parse(fs.readFileSync(R('market/dc_tracker_rows.json'), 'utf8')).filter(r => r.status !== 'Withdrawn');
const q3 = {};
for (const s of ['TX', 'VA', 'GA', 'OH', 'PA', 'IN']) {
  const rs = trk.filter(r => r.st === s);
  const uc = rs.filter(r => r.status === 'Under construction');
  const dev = {};
  rs.forEach(r => { r.developer.split(/,| and | \/ | with /).map(x => x.replace(/\(.*?\)/g, '').trim()).filter(x => x && !/undisclosed|unknown|llc|inc\.|developer/i.test(x)).forEach(x => (dev[x] = (dev[x] || 0) + 1)); });
  q3[s] = {
    projects: rs.length, announced_b: +(rs.reduce((a, r) => a + r.amount_m, 0) / 1000).toFixed(1),
    under_construction: uc.length, uc_b: +(uc.reduce((a, r) => a + r.amount_m, 0) / 1000).toFixed(1),
    largest: [...rs].sort((a, b) => b.amount_m - a.amount_m).slice(0, 1).map(r => ({ project: r.project, developer: r.developer, b: r.amount_m / 1000, status: r.status }))[0],
    ex_largest_b: +((rs.reduce((a, r) => a + r.amount_m, 0) - Math.max(...rs.map(r => r.amount_m))) / 1000).toFixed(1),
    top_developers: Object.entries(dev).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]),
  };
}
const out = { q1, q3 };
fs.writeFileSync(R('market/computed.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));

// ---- Per-state market tables for the dashboard map (data/market_states.json) ----
const all = JSON.parse(fs.readFileSync(R('market/dc_tracker_rows.json'), 'utf8')).filter(r => r.status !== 'Withdrawn');
const dcBy = {};
for (const r of all) {
  const s = (dcBy[r.st] = dcBy[r.st] || { projects: 0, announced_m: 0, under_construction: 0, rows: [] });
  s.projects++; s.announced_m += r.amount_m; if (r.status === 'Under construction') s.under_construction++;
  s.rows.push({ project: r.project, developer: r.developer, county: r.county, investment_b: +(r.amount_m / 1000).toFixed(2), status: r.status, timeline: r.timeline });
}
const states = {};
for (const code of Object.values(FIPS)) {
  const ph = by[code] || null;
  const dc = dcBy[code];
  states[code] = {
    pharma: ph ? { est: ph.est, emp: ph.emp, est_325412: ph['325412'], est_325414: ph['325414'] } : null,
    data_centers: dc ? {
      projects: dc.projects, announced_b: +(dc.announced_m / 1000).toFixed(1), under_construction: dc.under_construction,
      top: dc.rows.sort((a, b) => b.investment_b - a.investment_b).slice(0, 6),
    } : null,
  };
}
fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'market_states.json'), JSON.stringify({
  note: 'Derived by scripts/tools/compute-market.js. pharma = Census CBP 2023 establishments for NAICS 325412 + 325414 (null = not published or zero). data_centers = BoomTownIndex tracker rows (secondary compilation; withdrawn projects excluded), top 6 projects per state by announced investment.',
  sources: { pharma: ['M02', 'M03'], data_centers: ['M31'] }, states,
}, null, 1));
console.log('wrote data/market_states.json; states with pharma:', Object.values(states).filter(s => s.pharma).length, 'with data centers:', Object.values(states).filter(s => s.data_centers).length);
