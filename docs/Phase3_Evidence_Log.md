# Phase 3: Evidence Collection Log

*Independent student research (Northeastern MSBA). Not an official ThermGAS publication. Access date 2026-11-07.*
Dataset after Phase 3: **64 sources, 11 competitors plus ThermGAS, 13 products, 44 state-level evidence rows, 22 facilities.**
Every change is scripted in `scripts/patches/phase3.js` and validated by `scripts/build-data.js`, which checks that every source ID exists.

---

## 1. Product evidence: what changed

| Topic | Before | After Phase 3 | Status |
|---|---|---|---|
| **Riken Keiki / RKI** | Direct (Inferred), no product | **Direct (Verified).** The official Riken battery page lists electrolyte-filling monitors (SD-D58 hot-wire pump-suction, SD-1RI NDIR, SD-1GP/GH) for **DMC, EMC, DEC**. It claims **>10,000 detectors at Li-ion plants worldwide** and 20+ years in Li-ion, plus a case study: *range adjusted to ppm level for an electrolyte-filling customer*. It also covers NMP drying (SD-2600, up to 200 °C), testing and separators. No DMC detection limit is published | Verified (vendor) |
| **Honeywell Li-ion Tamer** | BESS off-gas only | Gen 3 data sheet: **FM 6540 Approved** for DEC/DMC/EMC, 10 ppm/s threshold, 5 s response, >10 yr life, up to 100 sensors per controller, DEC bump-test bottle. **Honeywell sells a "Gigafactory Fire Solution" (Li-ion Tamer Gen 3 + VESDA) to battery plants.** | Verified |
| Li-ion Tamer "Discontinued" | Flagged | **Still a conflict.** The U.S. product page says Discontinued, while the Gen 3 data sheet and gigafactory page are current. Treat it as a question for Honeywell, not a fact | Unresolved |
| Dräger | Excluded | Its fixed Polytron 8100 is electrochemical, and its PID products are portable (Multi-PID 2, with an 11.7 eV option). There is still no fixed DMC product, so it **stays excluded** | Verified |

## 2. Price evidence (public only)

| Product | Price | Basis | Status |
|---|---|---|---|
| ION Science **FALCO 2 11.7 eV** (diffused, 0.1–200 ppm) | **$3,521.00** | DODTEC U.S. reseller list price; the page notes a tariff surcharge | Verified |
| 11.7 eV replacement lamp (LA4TM700) | Not Publicly Available | Quote-only. The lamp has a **3-month warranty** | Verified (no price) |
| Honeywell RAEGuard 2 PID (10.6 eV) | from **$3,740** + 16 % surcharge | Instrumart list price | Verified |
| MSA Chillgard 5000, 4-point with strobe | list $29,885 / sale $15,540.20 | Kele listing seen only in a search excerpt (page blocked by a bot check) | Inferred |
| ThermGAS TracePoint 1000 / Haloguard IR | **Not Publicly Available** | Request a sponsor price list | – |

**What this means:** a complete three-year cost comparison is not possible from public data. The one quantifiable fact is ION's **lamp life of about 4 months** (ION's own spec), which implies roughly **9 lamp replacements per FALCO unit over 3 years**. That count is arithmetic from the stated lifetime, not a measured cost. A quote for the lamp price and the service labor needed to replace it is the most valuable missing number for the cost argument.

## 3. State-level channel and service evidence

| State | New evidence | Metric | Status |
|---|---|---|---|
| CA | PK Safety: RKI's #1 distributor and **factory-authorized service center** | service | Verified |
| CA | **Alamitos Energy Center**, Long Beach: 33 Li-ion Tamer controllers on a 100 MW/400 MWh BESS (2021) | installation (BESS) | Verified |
| IN | AFC International (DeMotte), a major RKI distributor | distributor | Inferred |
| OH | Li-ion Tamer origin address (Nexceris, Lewis Center), before the acquisition | office | Inferred |
| 10 states | ION Science distributors paired to states using page layout: U.S. Environmental (CT, IL, NJ, FL, MA), FLUIDX (UT), EON Products (GA), ICON Safety (CA), Moody-Price (LA), Geotech and REPSS (TX) | distributor | State: Verified. Pairing: Inferred |

States with any verified or inferred **competitor local presence**: 14 (CA, CT, FL, GA, IL, IN, LA, MA, NV, NJ, NY, OH, TX, UT).
Still **Not Verified / Insufficient Evidence**: 20 of 51 jurisdictions.

**Public battery-manufacturing customer references:** none were found for any vendor in a U.S. battery plant. ION Science's only battery content is marketing, and ThermGAS has none. The only U.S. installation reference is Honeywell's, and it is BESS, not a factory. **This is an open field: the first credible U.S. battery-plant DMC reference would be a differentiator.**

## 4. Battery-plant status updates (customer base)

The DOE FCAB list (data June 2023) is now annotated with 2025–2026 news. A plant is removed from counts **only when its cancellation is Verified.**

| Plant | Update | Status |
|---|---|---|
| KORE Power, Buckeye AZ | **Cancelled** Feb 2025 (excluded from counts) | Verified |
| Panasonic, De Soto KS | Mass production since 14 Jul 2025 | Verified |
| Toyota, Liberty/Greensboro NC | In production; official launch 12 Nov 2025 | Verified |
| HL-GA (Hyundai-LGES), Bryan County GA | Opening delayed by the Sept 2025 ICE raid to H1 2026; 30 GWh | Verified |
| LGES, Queen Creek AZ | Targeted mass production in H1 2026 | Verified |
| BlueOval SK, KY and TN | JV dissolved Dec 2025: Ford takes the KY plants, SK On takes the TN plant | Verified |
| Ultium, Warren OH | Idle since Jan 2026; partial restart planned | Verified |
| FREYR, Newnan GA | Reported cancelled (secondary tracker; still counted, flagged) | Inferred |
| AESC, Bowling Green KY | Reported paused, then restarted Mar 2026 (secondary tracker) | Inferred |

## 5. Updated competitive picture

1. **There are now two verified direct competitors, and they attack differently.**
   - **ION Science FALCO 2 11.7**: a low-cost point detector ($3,521 list) with a recurring lamp burden. It is non-selective.
   - **Riken Keiki / RKI**: a full-process battery portfolio with a large installed base outside the U.S. Its U.S. channel and service run through RKI and PK Safety.
2. **Honeywell is closer than Phase 2 suggested.** It sells directly into gigafactory safety budgets with a fire-system bundle. ThermGAS should not compete on "earliest event warning". It should present continuous DMC concentration as a **complement**, covering process areas such as filling and electrolyte handling where a rack-level off-gas event sensor does not fit.
3. **No vendor has a public U.S. battery-plant DMC reference.** A first reference site would carry real weight.
4. **Customer geography is shifting.** Verified operating or ramping capacity now sits in **KS, NC, GA (HL-GA), MI, TN, NV**, while OH (Warren idle) and parts of KY are uncertain.

## 6. Remaining gaps (need the sponsor or vendors)
- ThermGAS: settle 0.5 vs 1 ppm for DMC, provide DMC calibration and interference data, price list, and any battery customers.
- ION Science: 11.7 eV lamp price and the labor needed to replace it.
- RKI: DMC detection range or limit for SD-1RI / SD-D58 and U.S. pricing.
- Honeywell: current Li-ion Tamer status and gigafactory deployments in the U.S.
- NREL/NAATBatt full facility list (blocked here; the team could download it manually).

## 7. Next: Phase 4 (business analysis)
Build the threat matrix, SWOT, positioning, and a **transparent state-priority model**. Inputs will be published, weights adjustable, and missing evidence left unscored. Then Phases 5–6, the dashboard.
