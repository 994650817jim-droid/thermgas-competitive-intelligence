# Phase 4: Competitive Analysis

*Independent student research (Northeastern MSBA). Not an official ThermGAS publication. Evidence as of 2026-11-07.*
The structured version of everything below is `data/analysis.json`; source IDs (S##) resolve in `data/export/source_register.csv`.
Labels: **[V] Verified**, **[I] Inferred**, **[A] Assumption**.

## 1. Answer in one paragraph
ThermGAS has **two verified direct competitors** in U.S. battery-plant DMC monitoring:
- **ION Science FALCO 2 11.7 eV**, an 11.7 eV PID that lists Li-ion battery manufacturing [V, S22].
- **Riken Keiki / RKI**, with electrolyte-filling monitors for DMC/EMC/DEC and a claimed 10,000+ detectors at Li-ion plants [V, S52].

**Honeywell** competes for the same gigafactory safety budget with event detection, not concentration measurement [V, S37, S38]. Nobody has a public U.S. battery-plant DMC reference, and nobody publishes a DMC detection limit under stated test conditions.

ThermGAS can win as the **DMC-specific, multi-point, lamp-free concentration monitor that complements event detection**, but only after it fixes its own evidence gaps: the conflicting DMC spec, no interference data, and no hazardous-area answer.

## 2. Direct competitors: why they compete directly
| | ION Science FALCO 2 11.7 | Riken Keiki / RKI |
|---|---|---|
| Same job? | Fixed continuous VOC monitor; "Li-ion Battery Manufacturing" listed [V, S22] | Electrolyte-filling monitors naming DMC/EMC/DEC [V, S52] |
| DMC capability | DMC RF 1.50 at 11.7 eV; reads isobutylene-equivalent total VOC [V, S20] | Range customized to ppm for a filling customer; no DMC limit published [V, S52] |
| Technology | PID, 11.7 eV, diffusion | Hot-wire combustible (SD-D58), NDIR (SD-1RI), other diffusion types |
| Selectivity | Responds to everything below 11.7 eV (IPA, ethanol, methanol) [V, S22] | Hot-wire: all combustibles; NDIR: more selective [I] |
| Maintenance | Lamp up to 4 months; 3-month lamp warranty [V, S22, S25] | Not published |
| Approvals | UL Class I Zone 1, ATEX, IECEx [V, S22] | Explosion-proof designs [V, S52] |
| Price | **$3,521** reseller list [V, S24] | Not Publicly Available |
| U.S. channel | Office in Stafford TX; distributors tagged in 10 states [V, S23] | RKI in Union City CA; PK Safety service (CA) [V, S51, S53]; AFC (IN) [I] |

## 3. Indirect, adjacent and substitute competitors
| Company / product | Class | Threat (rule-based) | Why |
|---|---|---|---|
| Honeywell Li-ion Tamer Gen 3 | Indirect | **Elevated** | Off-gas event at 10 ppm/s, FM 6540; Gigafactory Fire Solution. No ppm output [V, S37, S38] |
| ION Science TVOC 2 | Indirect | Moderate | 10.6 eV; DMC RF 60, so 1 ppm DMC reads ~0.017 ppm [V, S20] |
| Honeywell RAEGuard 2 PID | Indirect | Moderate | 10.6 eV generic PID; from $3,740 list [V, S35] |
| Cubic ATRS-1050 | Indirect | Moderate | DMC NDIR module, ±200 ppm; OEM component [V, S41] |
| INFICON ELT3000 | Substitute | Moderate | Cell leak test (MS, 1e-6 mbar·l/s); removes leakers at the source, not room air [V, S90] |
| NevadaNano MPS | Indirect | Low | BESS off-gas sensor; HQ in Sparks NV [V, S70, S71] |
| Infrasensing GAS-VOC | Indirect | Low | Rack-level BESS sensor; not life safety [V, S80] |
| Gasmet GT6000 | Substitute | Low | FTIR library includes DMC; built for testing [V, S60] |
| MSA Chillgard 5000 | Indirect (technology twin) | Low for DMC / **High in core refrigerant business** | Same PAIR principle, 1 ppm refrigerants, no DMC [V, S100] |

Threat rule: *task overlap* (High / Medium / Low) × *battery go-to-market evidence* (High / Medium / Low) maps to High, Elevated, Moderate or Low. No numeric index or market share is claimed.

## 4. SWOT (summary; full detail with sources in the dashboard)
- **Strengths:**
  - PAIR has no UV lamp and no depletable sensor [V vendor claim].
  - Up to 24 sample points per Haloguard IR [V].
  - BACnet, relays and 4–20 mA integration [V].
  - U.S. manufacturer [V].
- **Weaknesses:**
  - Spec conflict (0.5 vs 1 ppm) and DMC missing from the gas list [V].
  - No battery reference and no public pricing [V].
  - No hazardous-area rating found [I].
  - Slower per-point updates when scanning many points [I].
- **Opportunities:**
  - No public U.S. battery-plant DMC reference for any vendor [V].
  - Plants ramping in KS and NC (and GA, AZ in H1 2026) [V].
  - UBE's DMC plant in LA [V].
  - Event detectors leave a concentration gap [I].
- **Threats:**
  - Honeywell's gigafactory bundle [V].
  - Riken's installed base [V vendor claim].
  - $3.5k–3.7k PID entry prices [V].
  - EV slowdown: KORE cancelled, Ultium Warren idle, BlueOval SK split [V].
  - MSA could add DMC to its PAIR platform [A].

## 5. Recommendations
1. **Publish one test-conditioned DMC specification.** Include the detection limit, calibration gas, per-point response time, and cross-sensitivity to IPA, ethanol, EMC, DEC and NMP.
2. **Position ThermGAS as the DMC-concentration layer that complements event detection.** Validate this in 5–8 EHS interviews.
3. **Answer the hazardous-area question.** Document the remote-analyzer and sample-line approach, or pursue approvals.
4. **Build the lifecycle-cost case from real quotes.** Cover lamps, labor, and the number of points per analyzer. No cost of ownership is claimed until then.
5. **Win a first U.S. reference through a 60–90 day side-by-side pilot.** Start in Georgia.
6. **Verify competitor channels in TN, KY, MI, KS and NC,** then recruit local partners.

## 6. State-level analysis
- **Competitor local presence** (Verified) appears in 12 states, or 14 including Inferred evidence. It is concentrated in CA, TX and the Northeast because of ION Science's distributor list.
- **Customer capacity** (DOE FCAB) is concentrated in KY, NV, MI, OH, TN and GA. Verified 2025–26 production starts are Panasonic (KS) and Toyota (NC).
- **Priority model**:
  - Formula: score = 100 × [wC·C/Cmax + wP·P/Pmax + wO·O/Omax + wD·D + wF·F − wK·K/Kmax] / (wC+wP+wO+wD+wF).
  - Inputs: C = capacity, P = plants, O = verified operating plants, D = DMC plant, F = ThermGAS foothold, K = competitor presence.
  - Default weights: 30, 10, 20, 10, 10, and 20 for the K penalty. Weights are adjustable in the dashboard.
  - States without a verified facility are not scored.
  - Default top states: NC, KY, MI, GA, KS, TN.
- **Priority states for customer development:**
  - GA: home-state service advantage; SK Commerce and HL-GA.
  - TN: three plants; no verified competitor channel.
  - KS: Panasonic in production.
  - NC: Toyota in production.
  - LA: a separate DMC-producer segment.
- **Watch:**
  - MI and KY rank high but have unverified 2025–26 status or uncertainty.
  - OH: Ultium Warren is idle.
  - NV: Tesla.

## 7. Facts vs. assumptions
| Statement | Status |
|---|---|
| FALCO 2 11.7 lamp lasts ≤4 months | Verified (vendor spec) |
| PAIR is more selective than PID for DMC | Inferred (principle; no matched test) |
| ThermGAS has lower 3-year cost | **Not claimed**: no prices |
| Buyers will budget for both event and concentration monitoring | Assumption (interviews needed) |
| Asian OEMs standardize on Riken | Assumption |
| "No competitor in state X" | Never claimed. The label is "Not Verified / Insufficient Evidence" |
