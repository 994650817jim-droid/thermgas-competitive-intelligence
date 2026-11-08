# ThermGAS: U.S. Competitive Intelligence Dashboard

*Independent student research, Northeastern University MSBA. Not an official ThermGAS publication.*

An evidence-based dashboard showing who competes with ThermGAS in **DMC vapor monitoring for U.S. battery manufacturing**, how the products differ, where competitors and customers are located by state, and where ThermGAS can win. Every important number links to a dated source.

## Run it (Windows)

1. Install [Node.js](https://nodejs.org/) 18 or newer. It is free.
2. Double-click **`start-dashboard.bat`**. The first run installs dependencies, which needs internet. After that it works fully offline.
3. The dashboard opens at `http://localhost:4173`.

For development with live reload:

```bash
cd dashboard
npm install
npm run dev
```

## Pages

| Page | Answers |
|---|---|
| **Overview** | Who are the main competitors, how threatening are they, and what matters for ThermGAS? (the 10-second view) |
| **Competitor Explorer** | Profiles, classification rationale, products, state evidence and sources for 11 competitors + ThermGAS; excluded candidates |
| **Product Battlecard** | ThermGAS vs. up to 3 products, 17 attributes, plus narrative battlecards (where they win / where ThermGAS can win / watch-outs / questions / gaps) |
| **U.S. Landscape** | Interactive map with 5 layers: competitor presence, service coverage, installation references, customer facilities, market opportunity. Includes hover summaries, a state detail panel and a table view |
| **Strategic Positioning** | Positioning statement, SWOT, rule-based threat matrix, differentiation table, adjustable state-priority model, priority states, recommendations |
| **Sources & Method** | 64-source register, raw tables, CSV/JSON export, methodology, data gaps |

## Project structure

```
data/                     Evidence database (source of truth, hand-curated JSON)
  sources.json            Source register (publisher, URL, source date, access date)
  competitors.json        Company profiles + classification
  products.json           Product specs with test basis and sources
  state_evidence.json     One row per state-level fact (hq/office/distributor/service/installation/regulatory)
  facilities.json         Battery & DMC facilities (DOE FCAB + 2025-26 updates)
  analysis.json           Phase 4: findings, threat rules, battlecards, SWOT, recommendations, priority model
  excluded.json           Screened-out candidates with reasons
  export/                 Generated CSVs
scripts/build-data.js     Validates every source ID, builds the 51-state dataset, CSVs and the dashboard dataset
scripts/patches/phase3.js Phase 3 evidence update (kept for provenance)
dashboard/                React + TypeScript + Vite app (SVG map and charts, no runtime network calls)
docs/                     Phase logs, Phase 4 analysis, presentation script
research/                 URL lists used during research (third-party page/PDF copies are kept locally, not published; every source is linked in data/sources.json)
```

To change data, edit `data/*.json` and run `npm run data` in `dashboard/`. The build fails if any claim cites a missing source.

## Evidence rules

- **Verified** means the fact was read in an official or primary source. For vendor specs, this verifies the vendor's *claim*, not field performance.
- **Inferred** covers facts reasoned from evidence, conflicting sources, or assumptions (labeled).
- **Unknown / N/A** means not available. Missing prices show "Not Publicly Available".
- State metrics (HQ, office, distributor, service, installation, regulatory) are kept separate and never summed.
- If no evidence was found for a state, it shows "Not Verified / Insufficient Evidence", not "no competition".
- No market shares, revenues, TCO or numeric threat indices are estimated.

## Brand

Values were read from thermgas.com computed styles on 2026-11-07:
- Blue `#1F60C4`
- Section tint `#F3F8FF`
- Headings in Poppins 600, `#454545`
- Body text in Inter, `#585858`

Other neutrals are derived, not claimed as brand colors. The category palette was validated for color-vision deficiency.

## Deliverables map

| # | Deliverable | Location |
|---|---|---|
| 1 | Dashboard | `dashboard/`, `start-dashboard.bat` |
| 2 | Competitor research dataset | `data/competitors.json`, `data/export/competitors.csv` |
| 3 | Comparison matrix | `data/export/competitor_comparison_matrix.csv`, Battlecard page |
| 4 | Battlecards | `data/analysis.json` → Battlecard page |
| 5 | State-level dataset | `data/export/states_51.csv`, `state_evidence.csv` |
| 6–8 | Positioning, SWOT, recommendations | `docs/Phase4_Competitive_Analysis.md`, Strategy page |
| 9 | Source register | `data/export/source_register.csv` |
| 10–11 | Methodology, gaps | Sources & Method page, `docs/` |
| 13 | Presentation script | `docs/Presentation_Script.md` |
