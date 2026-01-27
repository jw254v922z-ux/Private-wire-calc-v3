# Private Wire Solar Calculator - TODO

## Current Work - User Requirements

### Phase 1: UI Enhancements and Disclaimers
- [x] Add total CAPEX display at top of page
- [x] Add disclaimer banner explaining tool limitations, validity date, and data sources
- [ ] Preserve private wire parameters when switching between tabs
- [ ] Show info icons (ⓘ) for grid costs and researched costs with source links

### Phase 2: Authentication and Access Control
- [x] Add no-login option (read-only mode, no save functionality)
- [x] Update login flow to allow guest access
- [x] Disable save/update buttons for guest users

### Phase 3: Financial Model Fixes and Calculations
- [x] Fix irradiance override to actually affect revenue calculations
- [x] Add annual savings calculation based on "Offsetable energy cost" counter-factual
- [ ] Remove ability to discount CAPEX (all CAPEX is Year 0) - already correct
- [ ] Account for road cable laying costs (traffic management, trenching, reinstatement)

### Phase 4: Grid Cost Management and Overrides
- [ ] Add ability to override ALL grid cost assumptions
- [ ] Create override UI for grid connection costs
- [ ] Implement info icons with source documentation for all researched costs
- [ ] Store override values in session/model

### Phase 5: Sensitivity Analysis and Reporting
- [ ] Add LCOE sensitivity heatmap (cable voltage vs distance)
- [ ] Show cash flow table for entire project lifespan on Cash Flow tab
- [ ] Include discounted cash flow column in table
- [ ] Create summary report download with all sources and assumptions
- [ ] Export report as PDF with cost breakdowns and disclaimers

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
