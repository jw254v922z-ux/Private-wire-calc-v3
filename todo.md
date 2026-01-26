# Private Wire Solar Calculator - TODO

## Critical Fixes & Enhancements

### Phase 1: Wayleave & Land Costs
- [x] Show wayleave cost units (£/km/year) in grid connection tab
- [x] Add wayleave discount percentage option
- [x] Add wayleave CPI inflation option
- [x] Add road cable laying costs (similar to wayleave structure)

### Phase 2: CAPEX/OPEX Calculations
- [x] Fix CAPEX to include: Dev Premium + EPC Cost + Private Wire Cost (already correct)
- [x] Fix OPEX to deduct from cash flow each year (already correct)
- [x] Verify financial model calculations against Excel (LCOE now matches exactly)

### Phase 3: Dev Premium vs Land Option
- [ ] Add toggle between "Developer Premium" and "Land Option Yearly Cost"
- [ ] Add discount percentage for selected option
- [ ] Add CPI inflation for selected option
- [ ] Update financial calculations accordingly

### Phase 4: Degradation & Irradiance
- [ ] Rename "Degradation" to "Panel Degradation (%)"
- [ ] Add "Irradiance Override (kWh/m²/year)" per MW capacity
- [ ] Allow custom irradiance input per site

### Phase 5: Analytics & Reporting
- [ ] Add sensitivity heatmap (LCOE vs cable voltage vs distance)
- [ ] Add full cash flow table for entire project lifespan on Cash Flow tab
- [ ] Add scenario comparison dashboard

### Phase 6: UI/UX Improvements
- [ ] Preserve private wire parameters when switching between tabs
- [ ] Add no-login option (read-only mode, no save functionality)
- [ ] Add clear visual indicators for unsaved changes

### Phase 7: Grid Connection Costs
- [ ] Add road cable laying costs (£/km for trenching, reinstatement)
- [ ] Update cost lookup from SSEN data for road works
- [ ] Show cost breakdown by category

## Completed Features
- [x] Basic solar calculator with LCOE, IRR, NPV
- [x] Grid connection cost breakdown
- [x] Cable voltage options (6-132 kV)
- [x] Step-up and step-down transformers
- [x] Split revenue model (PPA consumption vs export)
- [x] Project length slider
- [x] Comma separators in displays
- [x] Manus OAuth authentication
- [x] Model persistence to database
