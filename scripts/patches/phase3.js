// Phase 3 evidence update (2026-11-07). Applied once to data/*.json; kept for provenance.
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..', '..', 'data');
const L = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const W = (f, o) => fs.writeFileSync(path.join(D, f), JSON.stringify(o, null, 2));
const A = '2026-11-07';

// ---- sources
const S = L('sources.json');
if (S.some(s => s.id === 'S24')) { console.log('already applied'); process.exit(0); }
S.push(
  { id: 'S24', publisher: 'DODTEC (U.S. reseller)', title: 'FALCO 2 (0.1-200 ppm) Diffused with 11.7 eV - list price $3,521.00 (available as of 6/2025)', url: 'https://dodtec.com/falco-2-extractive-explosion-proof-voc-detector.html', source_date: '2025-06 (availability note)', access_date: A, type: 'Public reseller price' },
  { id: 'S25', publisher: 'ION Science', title: 'A basic guide to lamp variants (11.7 eV lamp LA4TM700; 3-month lamp warranty)', url: 'https://euro-index.be/files/secured/documents/ion-science-a-basic-guide-to-lamp-variants.pdf', source_date: 'N/A', access_date: A, type: 'Product documentation (search excerpt)' },
  { id: 'S37', publisher: 'Honeywell', title: 'Li-ion Tamer GEN 3 Lithium Ion Off-Gas Detection System - data sheet', url: 'https://prod-edam.honeywell.com/content/dam/honeywell-edam/hbt/en-us/documents/literature-and-specs/datasheets/hon-ba-fire-li-ion-tamer-gen3-data-sheet.pdf?download=false', source_date: 'N/A (current Honeywell document library)', access_date: A, type: 'Product documentation' },
  { id: 'S38', publisher: 'Honeywell Building Automation', title: 'Gigafactory Fire Solution (Li-ion Tamer Gen 3 + VESDA for battery production)', url: 'https://buildings.honeywell.com/gb/en/industries/industrial-manufacturing/gigafactory-fire-solution', source_date: 'N/A', access_date: A, type: 'Company website' },
  { id: 'S39', publisher: 'Xtralis (Honeywell)', title: 'Alamitos Energy Center Case Study - Li-ion Tamer (Long Beach, CA; 100 MW/400 MWh BESS)', url: 'https://xtralis.com/file/10646', source_date: '2021-02', access_date: A, type: 'Public customer reference' },
  { id: 'S43', publisher: 'Xtralis (Honeywell)', title: 'Protecting Gigafactories with VESDA & Li-ion Tamer', url: 'https://xtralis.com/page/1160/gigafactories-building-a-safer-future-reducing-risk-and-supporting-continuous-supply', source_date: 'N/A', access_date: A, type: 'Company website' },
  { id: 'S44', publisher: 'Li-ion Tamer (liiontamer.com) / company profiles', title: 'Li-ion Tamer address 404 Enterprise Drive, Lewis Center, OH 43035 (pre-acquisition)', url: 'https://liiontamer.com/', source_date: 'N/A', access_date: A, type: 'Company website (search excerpt)' },
  { id: 'S52', publisher: 'Riken Keiki', title: 'Gas Detection Solutions for Lithium-ion Battery Production (official landing page)', url: 'https://product.rikenkeiki.co.jp/lp/en/li-ion/index.html', source_date: 'N/A', access_date: A, type: 'Product documentation' },
  { id: 'S53', publisher: 'PK Safety', title: 'PK Safety honored as RKI #1 distributor; factory-authorized RKI service center (California)', url: 'https://pksafety.com/blogs/pk-safety-blog/pk-safety-honored-as-rkis-1-distributor', source_date: '2025-06', access_date: A, type: 'Distributor page' },
  { id: 'S54', publisher: 'AFC International', title: 'RKI Instruments product category (DeMotte, IN distributor)', url: 'https://afcintl.com/product-category/rki-instruments/', source_date: 'N/A', access_date: A, type: 'Distributor page (search excerpt)' },
  { id: 'S103', publisher: 'Kele (U.S. reseller)', title: 'MSA Chillgard 5000 4-point w/ strobe A-CG5000-0-4-1-0: list $29,885 / sale $15,540.20 (search excerpt; page blocked by bot check)', url: 'https://www.kele.com/product/gas-and-specialty-sensors/refrigerant/msa/a-cg5000-0-4-1-0', source_date: 'N/A', access_date: A, type: 'Public reseller price (search excerpt)' },
  { id: 'S141', publisher: 'Energy-Storage.news', title: 'KORE Power no longer building Arizona cell gigafactory', url: 'https://www.energy-storage.news/us-bess-startup-kore-power-no-longer-building-arizona-cell-gigafactory', source_date: '2025-02', access_date: A, type: 'Industry news' },
  { id: 'S142', publisher: 'Tennessee Lookout', title: 'Ford, SK On plan to end BlueOval SK joint venture; SK On will operate Tennessee battery plant', url: 'https://tennesseelookout.com/2025/12/11/ford-sk-on-plan-to-end-blueoval-sk-joint-venture-sk-on-will-operate-tennessee-battery-plant/', source_date: '2025-12-11', access_date: A, type: 'News' },
  { id: 'S143', publisher: 'Kansas Department of Commerce', title: 'Governor Kelly celebrates grand opening of Panasonic EV battery facility in De Soto', url: 'https://www.kansascommerce.gov/2025/07/governor-kelly-celebrates-grand-opening-of-panasonic-ev-battery-manufacturing-facility-in-de-soto/', source_date: '2025-07', access_date: A, type: 'Government' },
  { id: 'S144', publisher: 'Axios Raleigh', title: 'Toyota opens massive North Carolina EV battery factory', url: 'https://www.axios.com/local/raleigh/2025/11/12/toyota-north-carolina-battery-factory-greensboro-liberty', source_date: '2025-11-12', access_date: A, type: 'News' },
  { id: 'S145', publisher: 'Automotive World', title: 'GM Ultium Ohio plant in limbo as US battery retreat deepens', url: 'https://www.automotiveworld.com/news/gms-ultium-ohio-plant-in-limbo-as-us-battery-retreat-deepens/', source_date: '2026-05', access_date: A, type: 'News' },
  { id: 'S146', publisher: 'RottenWifi tracker (secondary)', title: 'North America EV Battery Factories: 2026 Status Tracker (FREYR Georgia cancelled; AESC Bowling Green paused)', url: 'https://rottenwifi.com/tracking-the-ev-battery-factory-construction-boom-across-north-america-2026-update/', source_date: '2026', access_date: A, type: 'Secondary tracker (low reliability)' },
  { id: 'S147', publisher: 'Atlanta Journal-Constitution', title: 'Opening of Georgia EV battery plant to be delayed after ICE raid (HL-GA, Bryan County)', url: 'https://www.ajc.com/news/2025/09/opening-of-georgia-ev-battery-plant-to-be-delayed-after-ice-raid', source_date: '2025-09', access_date: A, type: 'News' },
  { id: 'S148', publisher: 'electrive', title: 'LGES aims to start US production of 46 mm round cells in spring 2026 (Queen Creek, AZ)', url: 'https://www.electrive.com/2025/03/06/lges-aims-to-start-us-production-of-46-mm-round-cells-in-spring-2026', source_date: '2025-03-06', access_date: A, type: 'News' }
);
W('sources.json', S);

// ---- competitors
const C = L('competitors.json');
const c = id => C.find(x => x.id === id);
Object.assign(c('riken'), {
  category: 'A. Direct', hq_status: 'Verified (RKI address)',
  relevant_products: ['SD-D58 (hot-wire, pump suction)', 'SD-1RI (NDIR, diffusion)', 'SD-1GP / SD-1GH (diffusion)', 'GADMS Lite remote monitoring'],
  battery_experience: 'Official Riken Keiki battery page: electrolyte-filling monitors for DMC/EMC/DEC; >10,000 detectors operating at Li-ion production sites worldwide; 20+ years in Li-ion; case study of a ppm-level range customised for an electrolyte-filling customer. Also NMP duct monitors (SD-2500/2600), testing (GD-70D) and separator (FI-900).',
  relationship: 'Direct competitor with the broadest battery-process portfolio (drying, filling, testing, separator). DMC-specific detection limits not published.',
  rationale: 'Official product page names the same task (electrolyte filling) and the same solvents. RKI (Union City, CA) is the U.S. channel; PK Safety (CA) is an authorized service center.',
  evidence_level: 'Verified', sources: ['S50', 'S51', 'S52', 'S53']
});
const h = c('honeywell');
h.battery_experience += ' Honeywell markets an integrated "Gigafactory Fire Solution" built around Li-ion Tamer Gen 3 + VESDA for battery production plants (S38, S43). Public U.S. reference: Alamitos Energy Center BESS, Long Beach CA (S39).';
h.rationale = 'Different measurement (rate-of-change off-gas event, FM 6540 approved) but competes for the same gigafactory safety budget. Conflict: Gen 3 product page marked Discontinued while the Gen 3 data sheet and gigafactory page remain current - unresolved.';
h.sources.push('S37', 'S38', 'S39', 'S43', 'S44');
c('ionscience').sources.push('S24', 'S25');
c('msa').sources.push('S103');
W('competitors.json', C);

// ---- products
const P = L('products.json');
const q = id => P.find(x => x.id === id);
q('falco117').price = '$3,521.00 reseller list (DODTEC, diffused 0.1-200 ppm, 11.7 eV; tariff surcharge note). Replacement 11.7 eV lamp: Not Publicly Available';
q('falco117').sources.push('S24', 'S25');
Object.assign(q('liontamer'), {
  model: 'Li-ion Tamer GEN 3 off-gas detection system',
  certifications: 'FM 6540 Approved (target gases DEC, DMC, EMC); ETL UL 61010; CSFM listing (Gen2+, Jan 2025)',
  installation: 'Monitoring sensors at racks/downstream airstreams + reference sensors at air inlets; hubs; controller up to 100 sensors; 12 VDC',
  integration: 'Controller with 16 SPDT relays and Modbus TCP/IP',
  maintenance: 'Target lifetime >10 years; calibration-free; bump test with DEC bottle (LT-ACC-TST)',
  applications: 'BESS, data centers, gigafactories (Honeywell Gigafactory Fire Solution)'
});
q('liontamer').sources.push('S37', 'S38');
q('chillgard5000').price = 'List $29,885 / sale $15,540.20 for 4-point with strobe (Kele; search excerpt, page blocked - Inferred)';
q('chillgard5000').sources.push('S103');
P.splice(4, 0, {
  id: 'riken_fill', company: 'riken', model: 'Riken Keiki electrolyte-filling monitors (SD-D58, SD-1RI, SD-1GP, SD-1GH)', category: 'A. Direct',
  technology: 'Hot-wire combustible (SD-D58, pump suction); NDIR (SD-1RI, diffusion); other diffusion sensors (SD-1GP/SD-1GH)',
  target_gases: 'Combustible solvents incl. DMC, EMC, DEC at electrolyte filling',
  dmc_capability: 'Vendor names DMC/EMC/DEC as monitored gases at filling; case study: range adjusted to ppm level on customer request. No DMC LOD published.',
  dmc_status: 'Verified (vendor claim; no DMC spec)', range: 'Not published for DMC', sensitivity: 'Not published for DMC', resolution: 'Not published',
  response_time: 'Not collected', selectivity: 'Depends on sensor (hot-wire responds to all combustibles; NDIR more selective)', accuracy: 'Not collected',
  calibration: 'Not collected', maintenance: 'Not collected', installation: 'Explosion-proof transmitters with concentration display; pump-suction or diffusion',
  integration: 'GADMS Lite remote monitoring (PC/tablet/phone)', certifications: 'Explosion-proof (model-level certificates not collected)',
  applications: 'Electrolyte filling; also NMP drying (SD-2500/2600), testing (GD-70D), separator (FI-900)', price: 'Not Publicly Available', warranty: 'Not collected',
  conditions: 'Riken claims >10,000 detectors at Li-ion production sites worldwide (vendor claim, global, not U.S.).', sources: ['S52']
});
W('products.json', P);

// ---- state evidence
const E = L('state_evidence.json');
const pair = { CT: 'U.S. Environmental', IL: 'U.S. Environmental', FL: 'U.S. Environmental', UT: 'FLUIDX', NJ: 'U.S. Environmental', GA: 'EON Products, Inc.', CA: 'ICON Safety Co Inc.', LA: 'Moody-Price', MA: 'U.S. Environmental', TX: 'Geotech Environmental Equipment, Inc.; REPSS, Inc' };
E.rows.forEach(r => { if (r.company === 'ionscience' && r.metric === 'distributor') r.notes = `Distributor paired by page-layout position: ${pair[r.state]} (pairing Inferred; state tag Verified)`; });
E.rows.push(
  { company: 'riken', product: 'All', state: 'CA', metric: 'service', value: 'PK Safety - RKI #1 distributor and factory-authorized service center (California-based service department)', source: 'S53', status: 'Verified', notes: 'Calibration/repair of RKI portable and fixed detectors' },
  { company: 'riken', product: 'All', state: 'IN', metric: 'distributor', value: 'AFC International, DeMotte, IN - large RKI distributor', source: 'S54', status: 'Inferred', notes: 'From search excerpt; distributor page not opened' },
  { company: 'honeywell', product: 'Li-ion Tamer', state: 'CA', metric: 'installation', value: 'Alamitos Energy Center, Long Beach - 100 MW/400 MWh BESS, 33 Li-ion Tamer controllers (12 monitoring + 2 reference sensors each)', source: 'S39', status: 'Verified', notes: 'BESS, not battery manufacturing' },
  { company: 'honeywell', product: 'Li-ion Tamer', state: 'OH', metric: 'office', value: 'Li-ion Tamer origin (Nexceris), 404 Enterprise Dr, Lewis Center, OH 43035', source: 'S44', status: 'Inferred', notes: 'Pre-acquisition address; post-July-2025 operating location not verified' }
);
W('state_evidence.json', E);

// ---- facility status updates
const F = L('facilities.json');
const upd = (city, st, u, src, status) => { const f = F.rows.find(x => x.city === city && x.state === st); Object.assign(f, { status_update: u, status_update_source: src, status_update_status: status }); };
upd('Buckeye', 'AZ', 'Cancelled (Feb 2025): KORE Power dropped KOREPlex', 'S141', 'Verified');
upd('Glendale', 'KY', 'BlueOval SK JV dissolved Dec 2025; Kentucky plants to Ford; second KY plant postponed', 'S142', 'Verified');
upd('Stanton', 'TN', 'BlueOval SK JV dissolved Dec 2025; SK On to own/operate the Tennessee plant', 'S142', 'Verified');
upd('De Soto', 'KS', 'Mass production began 14 Jul 2025 (~32 GWh target)', 'S143', 'Verified');
upd('Greensboro', 'NC', 'Toyota Battery NC (Liberty) in production; official launch 12 Nov 2025', 'S144', 'Verified');
upd('Warren', 'OH', 'Idle since Jan 2026; partial restart planned later in 2026', 'S145', 'Verified');
upd('Newnan', 'GA', 'Reported cancelled (secondary tracker)', 'S146', 'Inferred');
upd('Bowling Green', 'KY', 'Reported paused; restart announced Mar 2026 (secondary tracker)', 'S146', 'Inferred');
upd('Bryan County', 'GA', 'Hyundai-LGES (HL-GA); Sept 2025 ICE raid delayed opening to H1 2026; 30 GWh', 'S147', 'Verified');
upd('Queen Creek', 'AZ', 'LGES targeted 46-series cylindrical mass production in H1 2026', 'S148', 'Verified');
F.rows.find(x => x.city === 'Bryan County').operator = 'Hyundai-LG Energy Solution (HL-GA), per S147';
W('facilities.json', F);
console.log('Phase 3 patch applied');
