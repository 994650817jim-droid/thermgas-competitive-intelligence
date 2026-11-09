# ThermGAS U.S. Competitive Intelligence: Executive Summary

*Independent Student Research, Northeastern University MSBA. Not an official ThermGAS publication. Evidence as of 2026-11-07. Every recommendation below is a research-team proposal for management consideration, not approved ThermGAS strategy. The same content is in `data/executive.json` and on the website (Executive Overview, Briefing page).*

## Conclusion
ThermGAS has a credible opening as the DMC-specific, lamp-free concentration monitor that complements event detection, but it cannot yet prove it. Its own DMC specification is inconsistent, and no vendor has a public U.S. battery-plant reference.

**Proposed next move:** a 30-day evidence sprint (fix the DMC spec, answer the hazardous-area question, get real quotes) before committing any pilot hardware or sales spend.

| Label | What the evidence says |
|---|---|
| **Verified** | ION Science FALCO 2 11.7 and Riken Keiki / RKI are the two direct competitors [S22, S52]. ThermGAS's DMC figure conflicts (0.5 vs 1 ppm) and DMC is missing from its gas list [S01, S02, S08]. No public U.S. battery-plant reference was found for any vendor [S39]. The FALCO lamp lasts up to 4 months [S22, S25]. |
| **Inferred** | PAIR should be more selective than a PID for DMC (principle only). Honeywell's event detection complements concentration monitoring. A Georgia base may help service in the Southeast. |
| **Assumption** | Buyers will budget for both an event layer and a concentration layer. MSA could add DMC. Large Asian OEMs may standardize on Riken. |

## Three key findings
1. **The race is against two named rivals, and neither is unbeatable.** ION is cheap ($3,521 list) and approved for hazardous areas but needs a lamp about every 4 months and cannot separate DMC from other solvents. Riken has breadth and a claimed 10,000+ detectors worldwide but publishes no DMC limit.
2. **The U.S. reference-site position is open.** Honeywell reports an off-gas rate, not DMC concentration, so it is better treated as a complement.
3. **ThermGAS's own evidence is the main blocker.** Conflicting spec, no interference data, no product-level hazardous-area rating (the Energy page claims Class I Div 1/2 explosion-proof enclosures but names no model or certifier, S179), no battery reference, no public price.

## Three proposed actions
| # | Action | Suggested owner role | Done when |
|---|---|---|---|
| 1 | Publish one test-conditioned DMC specification | Product / Applications Engineering lead | Spec sheet with detection limit, calibration gas, response time and cross-sensitivity to IPA, ethanol, EMC, DEC, NMP; DMC on the Master Gas List |
| 2 | Answer the hazardous-area question | Engineering lead + safety reviewer | Written position (remote analyzer with sample lines, or named approval path), reviewed by qualified engineering |
| 3 | Win a first U.S. reference through a side-by-side pilot | Business Development lead + Field engineer | One site signs a pilot protocol; gated on actions 1 and 2 |

## Decision for management
**Should ThermGAS commit to a validation-first U.S. battery pilot program, starting with a 30-day evidence sprint before any pilot hardware or sales spend?**
Options: do nothing (not recommended); **evidence sprint, then decide** (research team's proposal); go straight to a pilot (higher risk, because it would run on an unresolved spec). Needed from management: an executive sponsor, engineering time, and a decision on whether ThermGAS can supply a pilot analyzer.

## Where to look first (research-priority classes, not revenue estimates)
- **Engage now:** North Carolina (Toyota in production), Georgia (home state; HL-GA 2026 start planned, outcome not verified).
- **Prepare:** Kansas (Panasonic in production), Arizona (LGES Queen Creek 2026 start targeted, outcome not verified). No home-state or adjacent reach yet.
- **Verify before investing:** NV, MI, TN, TX, CA, KY, OH, IN. Best evidence is the 2023 DOE list or a disruption.
- **Separate segment:** Louisiana (UBE DMC solvent plant).
- Tennessee moved from "priority" in Phase 4 to "verify before investing": none of its three plants has a Verified 2026 operating status.

## Adjacent opportunity: data center cooling
- ThermGAS already markets refrigerant detection for data center chillers and precision cooling, and flags battery / UPS gas hazards (Verified, S161).
- MSA / Bacharach, including the PAIR-based Chillgard 5000, targets the same buyers (Verified, S162).
- By 2023 data center electricity load (EPRI, S160), the largest states are VA, TX, CA, IL and OR. Georgia, ThermGAS's home state, ranks #8 of 44 (6.2 TWh). Load is a proxy for cooling demand, not a site count or market size (Inferred).
- Georgia and Arizona combine a battery opportunity with a large data center load; one sales and service effort covering both is an Assumption to test.
- **Growth Markets (evidence as of 2026-11-08; research-team proposals).** Data centers: Atlanta has 2,882 MW under construction, first in North America (Verified, S185); test the market in Georgia through existing chiller plants and close the new-refrigerant, A2L-listing and BACnet / Modbus gaps first. Semiconductors: 46 electronics-manufacturing facilities (semiconductor, display and solar) reported to EPA in 2023, not a fab count (Verified, S208); enter through the fab chiller plant and publish NF3 data before leading with it. Honeywell's own NF3 data sheet shows no response to isopropanol or methanol, so a solvent false-alarm pitch is not supported (Verified, S209); the NF3 application note cited by the team brief was not found. Pharma: more than $500B of U.S. manufacturing investment pledged by mid-2026 (Inferred, S198); offer refrigerant and oxygen monitoring together in the Southeast and build a validation package. No prices or dollar sizing are shown; figures from different markets are not comparable.

## ThermGAS portfolio (thermgas.com, S170-S178)
- **Photoacoustic IR line:** TracePoint 1000 (single point, 0.5 ppm, names data centers), Haloguard IR (1 ppm, up to 24 points, UL 3111-1), Haloguard III (multigas; its page says 1 ppm in the header and 20 ppm in the spec table), Remote IR Module (adds up to 8 channels).
- **CMOS line:** Haloguard and Haloguard II (lower-cost refrigerant leak notification, up to 6 sensors).
- **Oxygen:** Oxyguard (0-25% O2, 18-month sensor warranty).
- **Accessories:** remote display, calibration kit, switches, SCBA, signage.
- No product page lists a price or a hazardous-area rating. Only TracePoint 1000 names data centers on its own page.

## Still unknown
ThermGAS spec, interference data, hazardous-area rating and prices. Competitor prices and lamp cost. Riken's DMC limit. Honeywell's current Li-ion Tamer status. 2026 status of HL-GA, Queen Creek and UBE. Any customer contact. Whether buyers fund both layers.
