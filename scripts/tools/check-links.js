// Checks every URL in data/sources.json and writes data/link_check.json.
// Many publishers block automated requests (HTTP 403); those are reported as "blocked", not "broken".
// Usage: node scripts/tools/check-links.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sources.json'), 'utf8'));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const label = c => (c >= 200 && c < 400 ? 'OK' : c === 403 || c === 401 || c === 429 ? 'Blocked by site (403); open in a browser' : c === 404 || c === 410 ? 'Not found (404)' : c === 0 ? 'No response' : `HTTP ${c}`);
async function check(s) {
  try {
    const r = await fetch(s.url, { redirect: 'follow', headers: { 'user-agent': UA, accept: '*/*' }, signal: AbortSignal.timeout(30000) });
    return { status: r.status, result: label(r.status) };
  } catch { return { status: 0, result: label(0) }; }
}
(async () => {
  const out = {}; const queue = [...sources];
  await Promise.all(Array.from({ length: 8 }, async () => { for (let s; (s = queue.shift());) out[s.id] = { ...(await check(s)), date: new Date().toISOString().slice(0, 10) }; }));
  fs.writeFileSync(path.join(root, 'data', 'link_check.json'), JSON.stringify(out, null, 1));
  const c = {}; Object.values(out).forEach(v => (c[v.result] = (c[v.result] || 0) + 1));
  console.log(c);
  Object.entries(out).filter(([, v]) => v.result !== 'OK').forEach(([id, v]) => console.log(id, v.status, v.result));
})();
