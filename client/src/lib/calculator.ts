export interface SolarInputs {
  mw: number;
  capexPerMW: number; // The base EPC cost per MW
  privateWireCost: number;
  gridConnectionCost: number; // Additional grid cost
  developmentPremiumPerMW: number;
  opexPerMW: number; // Annual Opex per MW
  opexEscalation: number; // %
  generationPerMW: number; // MWh per MW (Year 1)
  degradationRate: number; // %
  projectLife: number; // Years
  discountRate: number; // %
  powerPrice: number; // £/MWh
  percentConsumptionPPA: number; // % of generation consumed at PPA price
  percentConsumptionExport: number; // % of generation exported at export price
  exportPrice: number; // £/MWh for exported power
}

export interface YearData {
  year: number;
  capex: number;
  opex: number;
  generation: number;
  revenue: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  discountFactor: number;
  discountedCost: number;
  discountedEnergy: number;
  discountedRevenue: number;
  discountedCashFlow: number;
  cumulativeDiscountedCashFlow: number;
}

export interface SolarResults {
  yearlyData: YearData[];
  summary: {
    totalCapex: number;
    totalOpex: number;
    totalGeneration: number;
    totalRevenue: number;
    totalCashFlow: number;
    totalDiscountedCost: number;
    totalDiscountedEnergy: number;
    totalDiscountedRevenue: number;
    totalDiscountedCashFlow: number;
    lcoe: number;
    undiscountedLcoe: number;
    irr: number;
    paybackPeriod: number;
    capexPerMW: number;
  };
}

// IRR Calculation Helper (Newton-Raphson method)
function calculateIRR(cashFlows: number[], guess = 0.1): number {
  const maxIterations = 1000;
  const precision = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const df = Math.pow(1 + rate, t);
      npv += cashFlows[t] / df;
      dNpv -= (t * cashFlows[t]) / (df * (1 + rate));
    }

    const newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < precision) {
      return newRate;
    }
    rate = newRate;
  }
  return rate;
}

export function calculateSolarModel(inputs: SolarInputs): SolarResults {
  const yearlyData: YearData[] = [];
  
  // Initial Calculations
  const developerPremium = inputs.developmentPremiumPerMW * inputs.mw;
  // Based on Excel: Capex (Year 0) = EPC Cost + Private Wire + Developer Premium
  // Note: The Excel had "Aurora including grid + £300/m" but modeled as a single lump sum.
  // We will construct the total Capex from components to allow flexibility.
  const totalCapex = (inputs.capexPerMW * inputs.mw) + inputs.privateWireCost + developerPremium;
  
  const annualOpexYear1 = inputs.opexPerMW * inputs.mw; // The Excel used a fixed 15.1 * MW * 1000 formula, we generalize it
  const annualGenYear1 = inputs.generationPerMW * inputs.mw;

  let cumulativeCashFlow = -totalCapex;
  let cumulativeDiscountedCashFlow = -totalCapex;

  // Year 0
  yearlyData.push({
    year: 0,
    capex: totalCapex,
    opex: 0,
    generation: 0,
    revenue: 0,
    cashFlow: -totalCapex,
    cumulativeCashFlow: -totalCapex,
    discountFactor: 1,
    discountedCost: totalCapex,
    discountedEnergy: 0,
    discountedRevenue: 0,
    discountedCashFlow: -totalCapex,
    cumulativeDiscountedCashFlow: -totalCapex,
  });

  // Years 1 to Project Life
  for (let year = 1; year <= inputs.projectLife; year++) {
    const opex = annualOpexYear1 * Math.pow(1 + inputs.opexEscalation, year - 1);
    const generation = annualGenYear1 * Math.pow(1 - inputs.degradationRate, year - 1);
    
    // Split revenue between PPA consumption and export
    const ppaConsumption = generation * (inputs.percentConsumptionPPA / 100);
    const exportGeneration = generation * (inputs.percentConsumptionExport / 100);
    const revenue = (ppaConsumption * inputs.powerPrice) + (exportGeneration * inputs.exportPrice);
    const cashFlow = revenue - opex; // Capex is 0 for these years
    
    cumulativeCashFlow += cashFlow;

    const discountFactor = 1 / Math.pow(1 + inputs.discountRate, year);
    const discountedCost = opex * discountFactor;
    const discountedEnergy = generation * discountFactor;
    const discountedRevenue = revenue * discountFactor;
    const discountedCashFlow = cashFlow * discountFactor;
    
    cumulativeDiscountedCashFlow += discountedCashFlow;

    yearlyData.push({
      year,
      capex: 0,
      opex,
      generation,
      revenue,
      cashFlow,
      cumulativeCashFlow,
      discountFactor,
      discountedCost,
      discountedEnergy,
      discountedRevenue,
      discountedCashFlow,
      cumulativeDiscountedCashFlow,
    });
  }

  // Summary Calculations
  const totalDiscountedCost = yearlyData.reduce((sum, y) => sum + y.discountedCost, 0) + yearlyData[0].discountedCost; // Add Year 0 Capex (which is discounted cost)
  const totalDiscountedEnergy = yearlyData.reduce((sum, y) => sum + y.discountedEnergy, 0);
  const lcoe = totalDiscountedCost / totalDiscountedEnergy;

  const totalCost = yearlyData.reduce((sum, y) => sum + y.capex + y.opex, 0);
  const totalEnergy = yearlyData.reduce((sum, y) => sum + y.generation, 0);
  const undiscountedLcoe = totalCost / totalEnergy;

  const cashFlows = yearlyData.map(y => y.cashFlow);
  const irr = calculateIRR(cashFlows);

  // Simple Payback (Discounted) - finding when cumulative discounted CF turns positive
  let paybackPeriod = 0;
  for (let i = 1; i < yearlyData.length; i++) {
    if (yearlyData[i].cumulativeDiscountedCashFlow >= 0) {
      // Linear interpolation for more precision
      const prev = yearlyData[i-1].cumulativeDiscountedCashFlow;
      const curr = yearlyData[i].cumulativeDiscountedCashFlow;
      paybackPeriod = (i - 1) + (Math.abs(prev) / (curr - prev));
      break;
    }
  }
  if (paybackPeriod === 0 && yearlyData[yearlyData.length-1].cumulativeDiscountedCashFlow < 0) {
    paybackPeriod = inputs.projectLife + 1; // Never pays back
  }

  return {
    yearlyData,
    summary: {
      totalCapex,
      totalOpex: yearlyData.reduce((sum, y) => sum + y.opex, 0),
      totalGeneration: totalEnergy,
      totalRevenue: yearlyData.reduce((sum, y) => sum + y.revenue, 0),
      totalCashFlow: yearlyData.reduce((sum, y) => sum + y.cashFlow, 0),
      totalDiscountedCost,
      totalDiscountedEnergy,
      totalDiscountedRevenue: yearlyData.reduce((sum, y) => sum + y.discountedRevenue, 0),
      totalDiscountedCashFlow: yearlyData.reduce((sum, y) => sum + y.discountedCashFlow, 0),
      lcoe,
      undiscountedLcoe,
      irr,
      paybackPeriod,
      capexPerMW: totalCapex / inputs.mw,
    }
  };
}

export const defaultInputs: SolarInputs = {
  mw: 28,
  capexPerMW: 437590, // Derived from Excel: (Total Capex - Private Wire - Dev Premium) / MW approx. Or we can just set base EPC.
  // Excel: Total 20,052,511.46. Private Wire 6.4m. Dev Premium 1.4m. 
  // Base EPC = 20,052,511.46 - 6,400,000 - 1,400,000 = 12,252,511.46
  // 12,252,511.46 / 28 = 437,589.69
  privateWireCost: 6400000,
  gridConnectionCost: 0, // Included in EPC in the Excel model, but kept separate for flexibility if needed
  developmentPremiumPerMW: 50000,
  opexPerMW: 15100, // 422800 / 28 = 15100
  opexEscalation: 0,
  generationPerMW: 944.82, // 26454.96 / 28 = 944.82. Excel formula was 1086 * 0.87 = 944.82
  degradationRate: 0.004,
  projectLife: 15,
  discountRate: 0.10,
  powerPrice: 110,
  percentConsumptionPPA: 100, // 100% consumed at PPA price by default
  percentConsumptionExport: 0, // 0% exported by default
  exportPrice: 50, // Export price typically lower than PPA price
};
