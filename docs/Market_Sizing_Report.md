# ThermGAS Market Sizing and Targeting Report

*Independent student research, Northeastern University MSBA. Not an official ThermGAS publication.*
Evidence as of 2026-11-16. Generated from `data/market_sizing.json`; every figure carries a source ID that resolves to a dated entry in the source register (`data/export/source_register.csv`). Labels: **Verified** = read in the cited source; **Inferred** = the team's reasoning.

## Summary

- **Q1 Pharma:** adopt NAICS **325412** (primary) and **325414** (secondary): **1,877** U.S. establishments, **665** with 50+ employees (Census CBP 2023).
- **Q2 Growth markets:** semiconductors and batteries, four named projects each, with investment, status and sources.
- **Q3 Data centers:** Go first to Texas (most projects, 26 under construction), then Virginia (largest announced total), then Georgia (home state, but its equipment tax exemption is being repealed). Watch Ohio.

## Question 1. Which NAICS code for pharmaceutical manufacturing?

We adopt NAICS 325412 (Pharmaceutical Preparation Manufacturing) as the primary code and NAICS 325414 (Biological Product, except Diagnostic, Manufacturing) as the secondary code. The Census 2022 NAICS definition of 325412 covers pharmaceutical preparations in dose forms such as ampoules, tablets, capsules, vials, ointments, powders, solutions and suspensions, which is the finished-product, cleanroom and cold-storage end of the industry; 325414 covers vaccines, toxoids and blood fractions, the most cold-chain-dependent products. We exclude 325411 (uncompounded medicinal chemicals and botanicals) and 325413 (in-vitro diagnostics) because their facilities are less tied to refrigerated storage and cleanroom HVAC. County Business Patterns 2023 (the latest year released) counts 1,436 establishments in 325412 and 441 in 325414, 1,877 in total with 245,227 employees; 665 of them (35%) have 50 or more employees, which is a better proxy for sites with chiller plants. California (286), New Jersey (147), Florida (123), Massachusetts (115) and New York (111) have the most. CBP counts establishments with paid employees, not sites that need leak detection, so these are an upper bound for targeting, not a market size.

| Code | Industry | Official description (Census 2022 NAICS) | Establishments | Employees | Decision |
|---|---|---|---|---|---|
| 325411 | Medicinal and Botanical Manufacturing | Establishments primarily engaged in (1) manufacturing uncompounded medicinal chemicals and their derivatives (generally for use by pharmaceutical preparation manufacturers) and/or (2) grading, grinding, and milling uncompounded botanicals. | 761 | 30,382 | Excluded |
| 325412 | Pharmaceutical Preparation Manufacturing | Establishments primarily engaged in manufacturing in-vivo diagnostic substances and pharmaceutical preparations (except biological) intended for internal and external consumption in dose forms, such as ampoules, tablets, capsules, vials, ointments, powders, solutions, and suspensions. | 1,436 | 170,029 | **Adopted** |
| 325413 | In-Vitro Diagnostic Substance Manufacturing | Establishments primarily engaged in manufacturing in-vitro (i.e., not taken internally) diagnostic substances, such as chemical, biological, or radioactive substances used for diagnostic tests performed in test tubes, petri dishes, machines, and other diagnostic test-type devices. | 267 | 45,459 | Excluded |
| 325414 | Biological Product (except Diagnostic) Manufacturing | Establishments primarily engaged in manufacturing vaccines, toxoids, blood fractions, and culture media of plant or animal origin (except diagnostic). | 441 | 75,198 | **Adopted** |

Sources: [M01](https://www.census.gov/naics/2022NAICS/2022_NAICS_Descriptions.xlsx), [M02](https://www2.census.gov/programs-surveys/cbp/datasets/2023/cbp23us.zip), [M03](https://www2.census.gov/programs-surveys/cbp/datasets/2023/cbp23st.zip)

**Size of the adopted establishments (325412 + 325414), by employees**

| <5 | 5-9 | 10-19 | 20-49 | 50-99 | 100-249 | 250-499 | 500-999 | 1000+ |
|---|---|---|---|---|---|---|---|---|
| 492 | 246 | 231 | 243 | 220 | 193 | 137 | 82 | 33 |

**Top states**

| State | Total | 325412 | 325414 |
|---|---|---|---|
| CA | 286 | 215 | 71 |
| NJ | 147 | 125 | 22 |
| FL | 123 | 104 | 19 |
| MA | 115 | 75 | 40 |
| NY | 111 | 102 | 9 |
| TX | 104 | 82 | 22 |
| PA | 87 | 57 | 30 |
| NC | 63 | 41 | 22 |
| UT | 51 | 44 | 7 |
| CO | 48 | 43 | 5 |

**Limits**

- CBP counts establishments with paid employees and does not say which have refrigerant or specialty-gas hazards: an upper bound, not a market size.
- CBP 2023 is the latest national release; the 2024 files were not available on 2026-11-16.
- State counts sum to 1,854 of the 1,877 national total because some state cells are not published (suppressed or zero).
- The choice of adopted codes rests on the official definitions plus team reasoning (Inferred); no survey of which pharma plants buy leak detection was done.

## Question 2. Growth markets: semiconductors and batteries

Semiconductor and battery manufacturing are both named ThermGAS industries (thermgas.com). Evidence below is limited to announcements and status updates from March 2025 to November 2026 (roughly the last 20 months).

### Semiconductor manufacturing

**Evidence of growth**

- Federal CHIPS incentives: $30.9B in direct funding plus $5.5B in loans awarded to date; no award publicly rescinded or reduced as of July 2026. The 35% investment tax credit applies to construction begun before Dec 31, 2026. (Verified; [M14](https://www.congress.gov/crs-product/R49031))
- TSMC and Micron both raised their U.S. capital commitments in 2025 (TSMC to $165B, Micron to $200B). (Verified; [M11](https://pr.tsmc.com/english/news/3210), [M12](https://www.nist.gov/news-events/news/2025/06/president-trump-secures-200b-investment-micron-technology-memory-chip), [M14](https://www.congress.gov/crs-product/R49031))
- Counter-signal: several fabs slipped (Micron New York from 2028 to Q3 2030; Intel Ohio from 2026 to 2030; Samsung Taylor delayed), so some of the construction-stage demand is later than first announced. (Verified; [M14](https://www.congress.gov/crs-product/R49031))

| Company | Location (state) | Investment ($) | Status / timeline | Source |
|---|---|---|---|---|
| TSMC Arizona | Phoenix, AZ | $165B total planned U.S. investment (incl. $65B ongoing Phoenix investment); CHIPS award up to $11.565B | First Phoenix fab in volume production since late 2024; expansion adds three fabs, two advanced-packaging plants and an R&D center. Second-fab volume production reported for 2027 (secondary). | [M11](https://pr.tsmc.com/english/news/3210), [M14](https://www.congress.gov/crs-product/R49031) |
| Texas Instruments | Sherman, TX (also Lehi, UT and Richardson, TX) | More than $60B across seven U.S. fabs; Sherman up to $40B for four fabs (SM1-SM4); CHIPS award up to $1.61B | SM1 initial production planned for 2025 and reported started Dec 2025 (trade press); SM2 shell complete; SM3 and SM4 are future phases. | [M10](https://www.ti.com/about-ti/newsroom/news-releases/2025/texas-instruments-plans-to-invest-more-than--60-billion-to-manufacture-billions-of-foundational-semiconductors-in-the-us.html), [M14](https://www.congress.gov/crs-product/R49031), [M17](https://www.tomshardware.com/tech-industry/semiconductors/new-texas-instruments-fab-will-pump-out-tens-of-millions-of-chips-per-day-first-300mm-fab-starts-production-after-usd60-billion-investment) |
| Micron | Boise, ID and Clay, NY (also Manassas, VA) | $200B plan announced June 2025 (NIST); later raised to $250B through 2035 (TrendForce, secondary); CHIPS award $6.44B | Idaho first fab: wafer output mid-to-2H 2027 (secondary). New York first fab opening delayed from 2028 to Q3 2030 (CRS). | [M12](https://www.nist.gov/news-events/news/2025/06/president-trump-secures-200b-investment-micron-technology-memory-chip), [M14](https://www.congress.gov/crs-product/R49031), [M15](https://www.trendforce.com/news/2026/07/10/news-micron-raises-u-s-investment-target-to-250b-through-2035-begins-concrete-work-on-new-yorks-first-fab/), [M16](https://www.tomshardware.com/pc-components/dram/micron-details-new-u-s-fab-projects-idaho-fab-1-comes-online-in-2h-2027-new-york-fabs-come-later-hbm-assembly-in-the-u-s) |
| Samsung Austin Semiconductor | Taylor, TX (and Austin expansion) | Over $37B; CHIPS award up to $4.745B | Production start delayed from 2024 to 2025 (CRS). Current operating status not confirmed from a primary source; trade trackers conflict. | [M13](https://www.nist.gov/chips/samsung-electronics-texas-austin), [M14](https://www.congress.gov/crs-product/R49031) |

**Why they need leak detection.** Fabs use fluorinated process gases such as SF6, NF3, C4F6 and CF4 for plasma etch and chamber cleaning, and large chiller plants and cleanroom HVAC for the building. ThermGAS already markets configurable monitors for exactly these gases, and a fab contains many gases and vapors, so selective detection matters. New construction means monitor locations (process tools, gas cabinets, sub-fab, chiller rooms) are specified during design. *(Inferred (product fit is ThermGAS's own claim; why a given fab buys it is team reasoning); [M18](https://thermgas.com/semiconductors/))*

### Battery manufacturing

**Evidence of growth**

- Operating and ramping plants in 2025-26: Panasonic (KS) in mass production since July 2025; Toyota (NC) shipping since June 2025 with an official launch in Nov 2025. (Verified; [S143](https://www.kansascommerce.gov/2025/07/governor-kelly-celebrates-grand-opening-of-panasonic-ev-battery-manufacturing-facility-in-de-soto/), [M21](https://pressroom.toyota.com/facility/toyota-battery-manufacturing-north-carolina), [S144](https://www.axios.com/local/raleigh/2025/11/12/toyota-north-carolina-battery-factory-greensboro-liberty))
- Counter-signals: KORE Power's Arizona plant cancelled (Feb 2025), Ultium Warren (OH) idle since Jan 2026, BlueOval SK joint venture dissolved (Dec 2025). Demand has shifted toward energy storage in some plants. (Verified; [S141](https://www.energy-storage.news/us-bess-startup-kore-power-no-longer-building-arizona-cell-gigafactory), [S145](https://www.automotiveworld.com/news/gms-ultium-ohio-plant-in-limbo-as-us-battery-retreat-deepens/), [S142](https://tennesseelookout.com/2025/12/11/ford-sk-on-plan-to-end-blueoval-sk-joint-venture-sk-on-will-operate-tennessee-battery-plant/))
- This project's earlier research tracks 20 U.S. cell plants (DOE FCAB list with 2025-26 updates). (Verified; [S130](https://www.energy.gov/sites/default/files/2024-09/FCAB%20Year-End%20Report%20Update%20FY23_final.pdf))

| Company | Location (state) | Investment ($) | Status / timeline | Source |
|---|---|---|---|---|
| Panasonic Energy | De Soto, KS | $4B | Grand opening July 2025; mass production started; about 1,000 staff hired; up to 4,000 jobs planned; two wings, four lines each. | [S143](https://www.kansascommerce.gov/2025/07/governor-kelly-celebrates-grand-opening-of-panasonic-ev-battery-manufacturing-facility-in-de-soto/) |
| Toyota Battery Manufacturing North Carolina | Liberty, NC | $13.9B | Began shipping batteries June 2025; official production launch Nov 12, 2025; more lines scheduled through 2030 (press). | [M21](https://pressroom.toyota.com/facility/toyota-battery-manufacturing-north-carolina), [S144](https://www.axios.com/local/raleigh/2025/11/12/toyota-north-carolina-battery-factory-greensboro-liberty) |
| HL-GA Battery (Hyundai Motor Group and LG Energy Solution) | Bryan County, GA | $4.3B (2023 announcement) | Opening delayed by the Sept 2025 immigration raid; April 2026 reporting says the plant is about to open. Production start not confirmed. | [M23](https://www.manufacturing.net/automotive/news/22863178/hyundai-lg-announce-43b-ev-battery-plant), [S147](https://www.ajc.com/news/2025/09/opening-of-georgia-ev-battery-plant-to-be-delayed-after-ice-raid), [M22](https://images.ajc.com/business/2026/04/hyundai-battery-plant-in-georgia-set-to-open-months-after-ice-raid/) |
| LG Energy Solution | Queen Creek, AZ | $5.5B | Cylindrical-cell mass production targeted for H1 2026 (March 2025 reports). No 2026 confirmation found. | [M24](https://www.koreajoongangdaily.com/business/lg/12367853), [S148](https://www.electrive.com/2025/03/06/lges-aims-to-start-us-production-of-46-mm-round-cells-in-spring-2026) |

**Why they need leak detection.** Electrolyte solvents such as dimethyl carbonate (DMC) are volatile and flammable; vapor can signal loss of containment in electrolyte storage, mixing, transfer and cell filling. Battery plants also run dry rooms and chilled process cooling, where refrigerant monitoring applies. ThermGAS publishes a DMC application note for these areas (its DMC specification is still inconsistent: 0.5 vs 1 ppm; see the competitor pages). *(Inferred (ThermGAS's application note is a vendor claim; plant-level need is team reasoning); [S01](https://thermgas.com/battery-manufacturing/), [S02](https://thermgas.com/wp-content/uploads/2026/09/ThermGAS_DMC_Battery_Environment_Application_Note.pdf))*

## Question 3. Data center construction by state

State rows combine a project tracker (counts and announced dollars) with primary sources for incentives and flagship projects. The tracker is a secondary compilation (April 2026, largest projects re-checked October 2026). It is not filtered to the last 24 months because it does not give an announcement date for every project; dollars are announced investment, not spending.

Data center construction starts reached $135.8B across 178 projects in January-September 2026 and are on pace to exceed $180B for the year (ConstructConnect). A further $74.8B across 115 planned projects is expected to start in the next six months, almost 80% of it in the South. ([M30](https://news.constructconnect.com/november-2026-data-center-report-september-adds-9.4b-in-construction-starts-costs-continue-to-increase))

| Rank | State | # Projects | Total announced investment | Under construction | Leading developers | Incentives | Source |
|---|---|---|---|---|---|---|---|
| 1 | Virginia | 41 | $162.2B | 13 ($18.4B) | Google, Amazon Web Services, The Garrett Companies, Tract, QTS, Iron Mountain | Long-standing sales and use tax exemption for data center equipment under review: the 2026 Appropriation Act directs a tax-policy study of it, and adds a data center electricity consumption tax of $0.011/kWh from July 2026 to July 2028 (revenue to the general fund capped at $600M a year). | [M31](https://boomtownindex.com/data-centers/), [M33](https://www.tax.virginia.gov/laws-rules-decisions/legislative-summaries/26-82), [M33](https://www.tax.virginia.gov/laws-rules-decisions/legislative-summaries/26-82) |
| 2 | Georgia | 43 | $128B | 9 ($18.9B) | Atlas Development, Amazon, QTS, Microsoft, Trammell Crow Company | HB 463 (2026), as passed, repeals the state sales and use tax exemption for data center equipment, effective on approval by the Governor and applicable to tax years beginning on or after Jan 1, 2026. The text is hosted in the Governor's 2026 signed-legislation folder; the signing date was not confirmed in this review. | [M31](https://boomtownindex.com/data-centers/), [M34](https://gov.georgia.gov/document/2026-signed-legislation/hb-463/download), [M34](https://gov.georgia.gov/document/2026-signed-legislation/hb-463/download) |
| 3 | Texas | 58 | $116.2B | 26 ($52.9B) | Crusoe, Stream Data Centers, Fermi America, Core Scientific, Microsoft, EdgeConneX | State sales tax exemption (6.25% state portion) for qualifying data centers: at least $200M and 20 jobs for a 10-15 year exemption; large projects at least $500M and 40 jobs for 20 years, including local taxes. | [M31](https://boomtownindex.com/data-centers/), [M32](https://comptroller.texas.gov/taxes/data-centers/), [M32](https://comptroller.texas.gov/taxes/data-centers/) |
| 4 | Indiana | 21 | $105.9B | 4 ($23.8B) | Amazon Web Services, Google, Microsoft, Meta, Sentinel Data Centers | Data center sales tax exemptions through the Indiana Economic Development Corporation: AWS New Carlisle committed for a 50-year term and Meta Lebanon for a 35-year term on at least $1B of eligible capital invested within six years (performance-based). | [M31](https://boomtownindex.com/data-centers/), [M37](https://events.in.gov/event/gov-holcomb-announces-amazon-web-services-plans-to-invest-11b-to-create-a-new-data-center-campus-in-northern-indiana), [M38](https://events.in.gov/event/gov-braun-breaks-ground-on-10b-meta-data-center-campus-at-leap-district), [M37](https://events.in.gov/event/gov-holcomb-announces-amazon-web-services-plans-to-invest-11b-to-create-a-new-data-center-campus-in-northern-indiana), [M38](https://events.in.gov/event/gov-braun-breaks-ground-on-10b-meta-data-center-campus-at-leap-district) |
| 5 | Pennsylvania | 32 | $84B | 7 ($43.1B) | Carlisle Development Partners / PowerHouse Data Centers, Aligned Data Centers, Homer City Redevelopment / Kiewit, International Electric Power | No data center sales-tax exemption confirmed in this review. The Governor's announcement credits faster permitting and site-development support, and the state later issued GRID standards with disclosure requirements for developers. | [M31](https://boomtownindex.com/data-centers/), [M36](https://www.pa.gov/governor/newsroom/2025-press-releases/gov-announces-amazon-to-invest--20b-in-pa--largest-capital-inves), [M36](https://www.pa.gov/governor/newsroom/2025-press-releases/gov-announces-amazon-to-invest--20b-in-pa--largest-capital-inves) |
| 6 | Ohio | 33 | $66.6B | 13 ($15.5B) | Amazon Web Services, SoftBank / SB Energy, OpenAI, Oracle, Meta, Microsoft | Sales and use tax exemption for data center equipment via the Ohio Tax Credit Authority, but on May 27, 2026 the Governor directed it to pause consideration of new exemption requests while the legislature's Joint Data Center Committee studies growth. Previously exempted data centers reported $27.2B of capital investment in 2025. It is not a ban. | [M31](https://boomtownindex.com/data-centers/), [M35](https://governor.ohio.gov/wps/portal/gov/governor/media/news-and-media/governor-dewine-announces-pause-of-data-center-tax-exemption), [M35](https://governor.ohio.gov/wps/portal/gov/governor/media/news-and-media/governor-dewine-announces-pause-of-data-center-tax-exemption) |

Rankings differ by measure, so three are shown. Announced dollars are dominated by a few very large planned campuses (e.g., $100B in Virginia, $65B in Indiana, $21B in Georgia), which may never be built as announced. Projects already under construction are the better signal for near-term chiller-room demand.

**Flagship projects**

- **Virginia:** Southern Virginia Megasite at Berry Hill ($100B, planned; Stack Infrastructure affiliate); Google Chesterfield ($9B, under construction)
- **Georgia:** Forsyth Technology Campus ($21B, planned); AWS Richmond County ($10B, under construction)
- **Texas:** Texas Critical Data Centers, Ector County ($12B, under construction); Meta El Paso ($10B, under construction); Skybox/Prologis Hutto ($10B, under construction)
- **Indiana:** Meta LEAP District, Lebanon ($10B; groundbreaking Feb 2026); AWS New Carlisle ($11B, announced Apr 2024); Heartland Industrial Park ($65B, planned, developer undisclosed)
- **Pennsylvania:** Amazon at least $20B (announced June 2025; Salem Township and Falls Township first); PAX-1 Cumberland County ($15B, under construction); Homer City energy campus ($10B) Note: The tracker lists two Homer City rows of $10B each (Somerset and Indiana counties) that may be the same campus. Counting it once gives $74.0B announced and $33.1B under construction.
- **Ohio:** PORTS Technology Campus, Pike County ($33.3B, planned); AWS Xenia ($4B, under construction); Stargate campus, Trumbull County ($3.6B, under construction)

**Recommendation.** Prioritize Texas first and Virginia second, and treat Georgia as the third target. Texas has the most projects (58) and by far the most under construction (26, $52.9B), with a stable large-project tax exemption. Virginia has the largest announced total ($162.2B) and 13 projects under construction, though its incentive regime is being reviewed. Georgia (43 projects, $128.0B) is ThermGAS's home state (Roswell) so service and sales travel is shortest, but its equipment tax exemption is being repealed and only 9 projects are under construction. Ohio has 13 projects under construction but has paused new exemptions, so keep it on a watch list. *(Inferred (ranking and recommendation are the team's judgment from Verified counts and incentive facts); [M31](https://boomtownindex.com/data-centers/), [M32](https://comptroller.texas.gov/taxes/data-centers/), [M33](https://www.tax.virginia.gov/laws-rules-decisions/legislative-summaries/26-82), [M34](https://gov.georgia.gov/document/2026-signed-legislation/hb-463/download), [M35](https://governor.ohio.gov/wps/portal/gov/governor/media/news-and-media/governor-dewine-announces-pause-of-data-center-tax-exemption))*

**Why data centers need refrigerant monitoring.** Data center chillers, precision cooling and DX equipment contain refrigerants (R-134a and R-410A in older systems; R-513A, R-515B, R-1234ze(E), R-454B in newer ones), and a leak can reduce cooling capacity as well as create safety risk. Refrigerant detection is also required in certain machinery-room and equipment applications. ThermGAS notes that lithium-ion UPS batteries can release hydrogen, CO and electrolyte vapors, a second monitoring need. *(Verified (ThermGAS's own statements); buying behavior is Inferred; [M19](https://thermgas.com/data-centers/))*

**Limits**

- The tracker is a secondary compilation (compiled April 2026, largest projects re-checked October 2026), not an audited list; dollars are announced investment, not spending, and projects get cancelled.
- Project counts are not limited to the last 12-24 months; announcement dates are only given for the flagship projects cited from primary sources (e.g., Amazon Pennsylvania, June 2025; Meta Indiana groundbreaking, Feb 2026; AWS Indiana is older, April 2024).
- Developer lists come from the tracker rows and were checked against primary sources only for the flagship projects named above.
- The Georgia signing date, Virginia's final sales-tax outcome and Pennsylvania's equipment-tax rules were not confirmed from primary sources.

## Evidence gaps

- No survey or sales data shows how many pharma, fab, battery or data center sites actually buy refrigerant or specialty-gas leak detection; all fit statements are reasoning.
- CBP 2024 files were not yet released; state cells are partly suppressed.
- Samsung Taylor, Hyundai-LG Georgia and LG Arizona operating status could not be confirmed from primary sources.
- Micron's $250B figure and the Idaho/New York timing come from trade press, not a company release read in full.
