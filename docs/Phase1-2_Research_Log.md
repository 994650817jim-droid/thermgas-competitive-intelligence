# ThermGAS U.S. Competitive Intelligence: Phase 1–2 Research Log

*Independent student research (Northeastern MSBA). Not an official ThermGAS publication.*
Access date for all sources: **2026-11-07**. Full source register: `data/export/source_register.csv` (45 sources).

---

## Phase 1: Understand

### What the existing class project already established (S11, S12)
- Focus application: **DMC vapor monitoring in Li-ion battery manufacturing**, covering electrolyte handling, cell filling, and formation/aging.
- Original shortlist: ThermGAS, ION Science (TVOC 2 / FALCO 2 11.7), Honeywell Li-ion Tamer, and Cubic ATRS-1050. No performance ranking was made.
- Open questions it raised:
  - The DMC specification conflicts between sources (0.5 vs 1 ppm).
  - Does the customer need a concentration trend or an event alarm?
  - What interferents (IPA, other carbonates) are present?
  - What are the real costs?

### What ThermGAS publishes
| Item | Finding | Source | Status |
|---|---|---|---|
| Company | Roots in Thermal Gas Systems (founded late 1980s), later acquired by ThermGAS. HQ at 11285 Elkins Rd, Roswell, GA | S05, S06 | Verified |
| Technology | Photoacoustic IR (PAIR). The vendor claims "zero-is-zero": no reference cell and no zero drift | S10 | Verified (vendor claim) |
| DMC sensitivity | **0.5 ppm** on the battery webpage vs **1 ppm** in the DMC application note | S01, S02 | **Conflict, unresolved** |
| DMC on gas list | **DMC does not appear** in the HALOGUARD Master Gas List (Sept 2026). The list also has misaligned formula columns | S08 | Verified (gap) |
| TracePoint 1000 | PAIR, 0–1000 ppm, 0.5 ppm resolution, 4–20 mA, NEMA 4/12, tubing 150 ft standard (500 ft optional), 1.5 lpm | S03 | Verified |
| Haloguard IR | 1 ppm, <1 min response per channel, up to 24 points and 3 gases, relays + analog + BACnet, UL 3111-1, 1-year warranty | S04 | Verified |
| Maintenance | Draw pump typically lasts 5–6 years. No depletable sensor | S09, S02 | Verified (vendor claim) |
| Battery references | **No public battery-plant customer reference found.** The notable-installations list covers refrigerant use only | S07 | Verified (gap) |
| Price | Not Publicly Available | – | – |

### Brand system (extracted from thermgas.com computed styles; not assumed)
- Body text: Inter, #585858. Headings: Poppins 600, #454545. Link/accent blue: **#1F60C4** (rgb 31,96,196). Light section background: **#F3F8FF**. Base: white.
- Visual style: white backgrounds, centered headings, card grids, and quiet corporate tone. The logo is lazy-loaded and was not captured yet; it is still to be extracted in Phase 5.

---

## Phase 2: Competitor discovery and screening

13 organizations were researched: ThermGAS plus 11 competitors on the list below, and some candidates that were excluded. The classification rule is whether the product can do the **same DMC monitoring task**, meaning continuous ambient DMC concentration in production areas.

### A. Direct competitors
| Company | Product | Why direct | Key evidence | Level |
|---|---|---|---|---|
| **ION Science** | **FALCO 2 11.7 eV** | Fixed VOC monitor whose official page lists "Li-ion Battery Manufacturing and Storage". DMC RF is 1.50 at 11.7 eV | 0–200 ppm, 0.1 ppm (isobutylene basis), T90 60 s, ±12 %, **lamp life up to 4 months**, UL Class I Zone 1. U.S. office in Stafford TX plus distributors in 10 states | Verified |
| Riken Keiki / RKI Instruments | Fixed detectors (model not identified) | Riken application example names electrolyte filling (DMC/EMC/DEC) as a gas-detection point | Distributor-hosted note (2021). U.S. subsidiary in Union City, CA | **Inferred**: needs a DMC datasheet |

### B. Indirect / adjacent
| Company | Product | Why not direct |
|---|---|---|
| ION Science | TVOC 2 (10.6 eV) | DMC RF is 60, so 1 ppm DMC reads about 0.017 ppm. Too weak for trace DMC |
| Honeywell | Li-ion Tamer | Detects **off-gas events** (10 ppm/s rate, 5 s response, calibration-free, 10-year life). It does not measure concentration. Acquired from Nexceris in July 2025. **U.S. pages mark Gen 3 and Multi Output System "Discontinued"** |
| Honeywell | RAEGuard 2 PID | 10.6 eV only. **Public price from $3,740** plus a 16 % surcharge (Instrumart) |
| Cubic | ATRS-1050 (NDIR) | DMC-specific but **±200 ppm** accuracy (0–2000 ppm). An OEM module for thermal-runaway and leak events. North American JV formed Dec 2025 |
| NevadaNano | MPS sensor | Classifies DMC/EMC for BESS. No published DMC LOD. HQ in Sparks, NV |
| Infrasensing | GAS-VOC | Off-gas detection at BESS and data-center racks. The vendor states it is "not a life-safety system" |
| MSA Safety (+Bacharach) | Chillgard 5000 | **Same PAIR principle** (1 ppm, ±1 ppm 0–50, 4/8/16 points, BACnet), but the gas list is refrigerants only. It is the main rival in ThermGAS's core market and the most credible potential entrant |

### C. Potential substitutes
| Company | Product | Substitution logic |
|---|---|---|
| INFICON | ELT3000 | End-of-line **cell leak test** (quadrupole MS, 1e-6 mbar·l/s, "E-Check (DMC)" accessory). It removes leaking cells at the source but does not watch room air |
| Gasmet | GT6000 + Li-ion library | FTIR library includes DMC, EMC, EC, DEC and HF. Built for off-gas and abuse testing. North American entity is in Ontario |
| Advanced Energy (INNOVA) | Photoacoustic monitors | Watch list. Official datasheet URL returned 404, and there is no DMC evidence |
| Gasera | Photoacoustic analyzers | Watch list. No DMC or battery evidence |

### Excluded (with reasons): `data/excluded.json`
GasAlarm (no U.S. presence), Dräger Polytron 8100 EC (electrochemical, no DMC evidence; Dräger PIDs still to review), Teledyne GFD (no evidence), Thermo MIRAN SapphIRe (discontinued), Xtralis VESDA (smoke), and academic sensors (not commercial).

---

## Early state-level picture (Phase 3 preview; `data/export/states_51.csv`)
Metrics are kept separate: HQ, office, distributor, service, installation, and regulatory are never summed together.

- **Competitor local presence was verified in 12 states**: CA, CT, FL, GA, IL, LA, MA, NV, NJ, NY, TX, UT. Most of this comes from ION Science's distributor list.
- **Battery cell plants** (DOE FCAB, data June 2023): 21 plants in 12 states. The largest by announced GWh are KY (116), NV (100), MI (86), OH (81), TN (77.4) and GA (70.5).
- **20 of 51 jurisdictions have no evidence at all.** These are labeled "Not Verified / Insufficient Evidence", not "No Competition".

Early implications. These are **hypotheses to test, not conclusions**:
1. **Georgia**: ThermGAS's home state, with 3 cell plants (70.5 GWh). The only competitor local presence found is an ION Science distributor. A home-field service advantage is plausible.
2. **KY, MI, OH, TN**: very large capacity, but no competitor office or distributor verified yet. Next step is to research their distributors, especially RKI's and Honeywell's.
3. **Louisiana**: the UBE DMC/EMC plant (100,000 t/y DMC; completion planned July 2026) plus an ION Science distributor. This is a DMC-handling customer outside cell manufacturing.
4. **California**: CSFM listing for Li-ion Tamer. BESS projects in CA may require listed devices, which matters if ThermGAS targets BESS.

## Most important findings so far
1. **ThermGAS's DMC claim needs to be tightened before any comparison.** The 0.5 vs 1 ppm conflict, DMC missing from the Master Gas List, and no published DMC interference data are evidence gaps in ThermGAS's own documents.
2. **ION Science FALCO 2 11.7 is the real head-to-head competitor.** Its documented weakness is lamp life of up to 4 months plus non-selective PID response. That supports a three-year maintenance/TCO and selectivity argument for PAIR, but only after real quotes are obtained.
3. **Most "battery gas detection" products solve a different job**: event or off-gas detection in BESS racks (Honeywell, NevadaNano, Infrasensing, Cubic). ThermGAS should not position against them on ppm. Its niche is **continuous low-ppm DMC concentration in production areas**.
4. **MSA Chillgard 5000 is a PAIR twin.** It is a competitive threat in ThermGAS's core refrigerant business and a potential DMC entrant.

## Limitations
- The NREL/NAATBatt database could not be reached (access blocked). Facility data is DOE FCAB, which is dated (June 2023) and includes planned plants that may have changed.
- No competitor published a **DMC-specific** detection limit under stated test conditions. All ppm values have different bases (isobutylene-equivalent, rate, leak rate), so **no performance ranking is valid yet**.
- Prices: only the RAEGuard 2 PID reseller price is public. Everything else is Not Publicly Available.
- ION Science distributor name-to-state pairing could not be extracted from the map widget.
- Corporate HQs for Honeywell, MSA and Advanced Energy were not re-verified this session and are marked Unknown.

## Next steps (Phase 3)
1. Research U.S. distributors and service locations for RKI, Honeywell (fire/BESS integrators) and MSA in the top-capacity states.
2. Get an official Riken/RKI DMC datasheet, Dräger PID specs, and current Li-ion Tamer successor model.
3. Ask ThermGAS (sponsor) to resolve 0.5 vs 1 ppm, supply DMC calibration and interference data, and provide any battery-customer references and price lists.
4. Request comparable quotations (FALCO 2 11.7, TracePoint/Haloguard IR) to build a real 3-year TCO.
5. Then Phase 4 analysis and Phase 5–6 dashboard build. The data layer in `data/` is already structured for it.
