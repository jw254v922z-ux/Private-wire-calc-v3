# Private Wire Solar Calculator - TODO

## Current Work - User Requirements

### Phase 1: UI Enhancements and Disclaimers
- [x] Add total CAPEX display at top of page
- [x] Add disclaimer banner explaining tool limitations, validity date, and data sources
- [x] Move disclaimer to top of page as single-line banner
- [x] Add "View full details" link to disclaimer
- [ ] Preserve private wire parameters when switching between tabs
- [ ] Show info icons (ⓘ) for grid costs and researched costs with source links

### Phase 2: Authentication and Access Control
- [x] Add no-login option (read-only mode, no save functionality)
- [x] Update login flow to allow guest access
- [x] Disable save/update buttons for guest users

### Phase 3: Financial Model Fixes and Calculations
- [x] Fix irradiance override to actually affect revenue calculations
- [x] Add annual savings calculation based on "Offsetable energy cost" counter-factual
- [x] Add offsetable energy cost input field with note about energy pricing tool
- [x] Add offsetable energy cost to database schema
- [ ] Remove ability to discount CAPEX (all CAPEX is Year 0) - already correct
- [ ] Account for road cable laying costs (traffic management, trenching, reinstatement)

### Phase 4: Grid Cost Management and Overrides
- [x] Add ability to override ALL grid cost assumptions
- [x] Create override UI for grid connection costs
- [ ] Fix info icons to show sources for all researched costs (cable, transformer, wayleave)
- [x] Store override values in session/model

### Phase 5: Sensitivity Analysis and Reporting
- [x] Add LCOE sensitivity heatmap (cable voltage vs distance)
- [x] Show cash flow table for entire project lifespan on Cash Flow tab
- [x] Include discounted cash flow column in table
- [x] Create summary report download with all sources and assumptions
- [x] Export report as PDF with cost breakdowns and disclaimers
- [x] Fix offsetable energy cost to affect annual savings calculation
- [x] Add CPI escalation to offsetable energy cost (field added, ready for UI)
- [ ] Add IRR sensitivity analysis (showing how IRR changes with cable voltage/distance)
- [ ] Ensure current scenario in sensitivity analysis matches Private Wire Parameters tab

### Phase 6: Data Upload and Profile Management
- [ ] Add ability to upload HH (half-hourly) profile for demand
- [ ] Add ability to upload HH profile for generation
- [ ] Parse and validate uploaded profiles
- [ ] Update calculations to use uploaded profiles instead of annual averages

### Phase 7: Final Testing and Checkpoint
- [ ] Run comprehensive test suite
- [ ] Verify all features work end-to-end
- [ ] Test with and without login
- [ ] Test report generation and downloads
- [ ] Save final checkpoint and publish

## Completed Features (Previous Phases)

### Phase 1: Wayleave & Land Costs
- [x] Show wayleave cost units (£/km/year) in grid connection tab
- [x] Add wayleave discount percentage option
- [x] Add wayleave CPI inflation option
- [x] Add road cable laying costs (similar to wayleave structure)

### Phase 2: CAPEX/OPEX Calculations
- [x] Fix CAPEX to include: Dev Premium + EPC Cost + Private Wire Cost (already correct)
- [x] Fix OPEX to deduct from cash flow each year (already correct)
- [x] Verify financial model calculations against Excel (LCOE now matches exactly)

### Phase 3 & 4: Dev Premium + Land Option + Degradation Labels
- [x] Add checkbox to enable/disable Developer Premium (upfront CAPEX)
- [x] Add checkbox to enable/disable Land Option Yearly Cost (recurring OPEX)
- [x] Add discount percentage slider for Developer Premium
- [x] Add discount percentage slider for Land Option Cost
- [x] Add CPI inflation rate for both options
- [x] Update CAPEX calculation to include Developer Premium when enabled
- [x] Update OPEX calculation to include Land Option Cost when enabled
- [x] Rename Degradation label to Panel Degradation (%)
- [x] Add Irradiance Override (kWh/m²/year) input field
- [x] Update generation calculation to use custom irradiance if provided (field added, awaiting implementation)


### Phase 8: Landing Page Reorganization and Landowner Page
- [x] Rename section heading to "Project Details" (keeping Total CAPEX, LCOE, IRR, Payback Period, Total NPV)
- [x] Remove Annual Savings from Project Details section
- [x] Create new "Offtaker" section with Annual Savings metric card
- [x] Create new "Landowner" section with Total Yearly Land Options Income and Land Option Yield metric cards
- [x] Keep "Landowner" tab in tabs area for detailed analysis
- [x] Verify three separate metric sections display correctly on landing page


### Phase 9: Land Option Calculation Fix
- [x] Enable land option by default in calculator (£5,000/MW/year)
- [x] Verify land option is properly included in OPEX calculation
- [x] Test land option metrics calculate correctly (Total Yearly Land Options Income and Land Option Yield)


### Phase 10: Land Rental Terminology Update
- [x] Rename "Land Option Cost" to "Land Rental Cost" in parameters
- [x] Rename "Land Option Income" to "Land Rental Income" in metrics
- [x] Rename "Land Option Yield" to "Land Rental Yield" in metrics
- [x] Update checkbox label to "Include Land Rental Cost in OPEX"
