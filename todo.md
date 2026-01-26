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
