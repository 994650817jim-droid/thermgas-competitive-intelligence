# Executive Redesign: audit and change log

*Independent Student Research. Branch `feature/executive-redesign`.*

## Audit of the previous site
| Finding | Effect |
|---|---|
| Six equal-weight tabs mixed research detail with conclusions; the home page led with six counts, not a decision | An executive needed several pages to find the recommendation |
| No page showed owners, gates or a time-boxed plan; recommendations were in a long list inside Strategic Positioning | Hard to act on |
| "Operating" plants meant only the two with a Verified 2025-26 update. Nine plants listed "Active" in the 2023 DOE data were neither counted nor flagged as unverified; Phase 3 text called MI, TN and NV "verified operating or ramping" | Overstated certainty, and the real status of most plants was invisible |
| H1 2026 start targets (HL-GA, Queen Creek) and UBE's July 2026 completion are in the past as of 2026-11-07, with no confirmation in the data | These looked like pending events, not open gaps |
| HL-GA capacity is 15 GWh in the DOE list and 30 GWh in the 2025 update | Unreconciled; flagged in the plant notes |
| Evidence badges had no separate "Assumption" level (it was shown as Inferred) | Inferences and untested assumptions looked alike |
| Strengths kept: source discipline, 64 dated sources, validated source IDs, honest "Not Verified / Insufficient Evidence" wording, transparent state model | Preserved unchanged |

## What changed
1. **Navigation:** four main tabs (Executive Overview, Competitive Landscape, Market Opportunities, Strategic Roadmap). All earlier pages remain as drill-down pages with a "back" crumb: Evidence Dashboard (old overview, `#/research`), Competitor Explorer, Product Battlecard, U.S. map, Strategic Positioning, Sources & Method.
2. **Executive Overview:** one conclusion, a Known / Inferred / Assumed split, three findings, three actions (owner role, done-when), one decision with three options.
3. **Competitive Landscape:** ION Science, Riken and Honeywell cards (where they win, where ThermGAS can differentiate, watch-out), threat map, other players, differentiation verdicts, positioning hypothesis.
4. **Market Opportunities:** states classed A-D by plant evidence tier, reach, competitor environment and evidence completeness. Rules are in `data/executive.json`. Tennessee moves from Phase 4's priority list to "verify before investing"; Phase 4 files are unchanged.
5. **Strategic Roadmap + Business Case:** 30/60/90 plan with owners, deliverables, success criteria and three Go/No-Go gates; pilot scenarios, cost drivers (unknowns shown as Unknown), a public-data comparator, and a risk table.
6. **Presentation Mode** (`#/present`, 9 slides, arrow keys, F for full screen, Esc to exit) and **Executive Briefing** (`#/briefing`, print to PDF, or download Markdown). Both read the same data as the pages.
7. **Evidence labels:** a distinct Assumption badge. Build validation now checks `data/executive.json` (source IDs, labels, every counted plant has a tier).
8. **Tests:** `npm test` (Vitest, 12 tests) covers classification rules, the comparator, evidence labels, no invented dollar or percent figures, and the student-research notice.

## Not changed
No existing data file, source, or Phase 1-4 document was edited. No revenue, ROI, market share or internal data was added. Round 1 was later published to GitHub Pages at the user's request.

## Open items for the team
- Re-verify HL-GA, Queen Creek and UBE Louisiana (dates passed), and re-check the nine "Active" 2023 plants.
- Reconcile HL-GA capacity (15 vs 30 GWh).
- `docs/Presentation_Script.md` describes the old page flow; the new Presentation Mode follows the executive slides.

## Round 2: less text, map-first, data centers
- Executive Overview rebuilt around one sentence, four count-up KPIs and an interactive map with three layers (battery plant classes, data center load, competitor channels; ThermGAS HQ marked). Findings, actions and the decision use short wording; the Verified / Inferred / Assumption detail is in a collapsible "How sure are we?" panel. Visible words on the page fell to about 540.
- New data: `data/data_centers.json` from EPRI "Powering Intelligence" (May 2024) Table A1, 2023 load for 44 states. All 44 values were checked automatically against the report text; the total (152 TWh) matches EPRI's ~150 TWh headline. The 6 other states and DC are shown as "Not in EPRI table". Three sources added (S160 EPRI, S161 ThermGAS Data Centers page, S162 MSA data center blog).
- Data center layer added to the full evidence map; data center column and top-10 chart added to Market Opportunities; competitor map added to Competitive Landscape; Presentation Mode's market slide is now the interactive map.
- Competitive Landscape cards show one point per box; Roadmap is a timeline with deliverables first and task detail collapsed.
- Interaction effects modelled on React Bits (CountUp, SpotlightCard, AnimatedContent), written without new dependencies and with reduced-motion and fallback handling.
- Tests: 16 (adds EPRI row count, total, ranks, missing states and evidence labels for the data center claims).

## Round 3: design pass (frontend-design + ui-ux-pro-max)
Brand stays fixed as the client set it (blue #1F60C4, Poppins headings, Inter body, light background). The pass changes structure, not identity.
- **One memorable thing:** the map. Everything else is quiet. The first screen is a large headline beside four big readout numbers separated by hairlines, not boxed KPI cards.
- **Open sections instead of identical cards:** findings are three open columns whose top rule colour encodes the evidence level (green Verified, amber Inferred, purple Assumption). Actions are a numbered list because they are a ranked sequence. The decision is the only strongly bordered block.
- **Removed template tells:** the uppercase blue label above every heading, per-card spotlight hover, fade-up on every section, shared soft shadows on every card. The single deliberate motion is the headline resolving word by word on load (a dependency-free take on React Bits SplitText / BlurText), plus count-up numerals. All motion respects reduced-motion and prints fully visible.
- **Less text:** Competitive Landscape went from about 930 to about 610 visible words and Market Opportunities from about 1,040 to about 330 by moving the long tables and reference cards behind "show" disclosures. Nothing was deleted: 13 state rows, tier legend, differentiation table and other players are one click away.
- **Accessibility and interaction (ui-ux-pro-max checks):** 4.5:1 text contrast on the brand palette, visible focus rings on links, buttons and summaries, colour is never the only signal (evidence level also has an icon and a label, map classes also have text), no horizontal scroll at 375px on any page, reduced-motion respected.
- **PillNav** (React Bits) kept as the main navigation.

## Round 4: ThermGAS portfolio and more interaction
- **New data:** `data/portfolio.json` from 30 thermgas.com pages (read 2026-11-07): 8 product entries in 4 families, 7 market pages, a product x market fit map and 5 observations. Sources S170-S184 added (82 total). Specs are written as the vendor states them; gaps are "Not stated"; no prices exist.
- **Evidence refinement:** the Energy & Oil & Gas page claims explosion-proof enclosures certified for Class I, Div 1 and Div 2, but names no model, certifier or certificate. The hazardous-area wording in action A2, finding K3 and the SWOT weakness now says "no product-level rating" instead of "no rating found". The recommendation (answer the hazardous-area question) stands.
- **Haloguard III** page conflicts with itself (1 ppm header, 20 ppm spec table); shown as a conflict, labeled Inferred.
- **Where it shows:** a "What ThermGAS brings to the fight" section on Competitive Landscape and a drill-down page (`#/portfolio`) with observations.
- **Interactions (React Bits ideas, no new dependencies):** Tilted Card (cards tilt toward the cursor and flip on click or Enter to a full spec sheet), PillNav reused as the product-family filter, a clickable product x market matrix that filters the cards and explains each market, a Stepper-style roadmap (click a phase on the timeline to focus it), and an elastic-feel range slider. All respect reduced motion; no horizontal scroll at 375px.
- **Tests:** 19.
