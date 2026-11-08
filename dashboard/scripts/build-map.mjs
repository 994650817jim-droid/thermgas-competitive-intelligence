// Pre-computes SVG paths for the U.S. state map (Albers USA, 975x610) from the
// public-domain us-atlas package, so the dashboard needs no network at runtime.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, mesh } from 'topojson-client';
import { geoPath } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = require('us-atlas/states-albers-10m.json');
const FIPS = { '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY' };
const path = geoPath();
const states = feature(topo, topo.objects.states).features
  .filter(f => FIPS[f.id])
  .map(f => {
    const [x, y] = path.centroid(f);
    const a = path.area(f);
    return { code: FIPS[f.id], d: path(f), cx: +x.toFixed(1), cy: +y.toFixed(1), area: Math.round(a) };
  });
const borders = path(mesh(topo, topo.objects.states, (a, b) => a !== b));
fs.writeFileSync(new URL('../src/data/usmap.json', import.meta.url), JSON.stringify({ width: 975, height: 610, states, borders }));
console.log(`map: ${states.length} states`);
