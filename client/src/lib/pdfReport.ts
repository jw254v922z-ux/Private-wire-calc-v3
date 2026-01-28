import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { SolarInputs, SolarResults } from "./calculator";
import { formatCurrency, formatNumberWithCommas } from "./formatters";

interface PDFReportOptions {
  inputs: SolarInputs;
  results: SolarResults;
  projectName: string;
  description?: string;
  generatedDate?: Date;
}

export async function generatePDFReport(options: PDFReportOptions) {
  const {
    inputs,
    results,
    projectName,
    description = "",
    generatedDate = new Date(),
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add section
  const addSection = (title: string, fontSize: number = 14) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, yPosition);
    yPosition += 10;
    doc.setDrawColor(200);
    doc.line(20, yPosition - 3, pageWidth - 20, yPosition - 3);
    yPosition += 5;
  };

  const addText = (text: string, fontSize: number = 11, bold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, pageWidth - 40);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 2;
  };

  const checkPageBreak = (neededSpace: number = 30) => {
    if (yPosition + neededSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // ===== TITLE PAGE =====
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Private Wire Solar Calculator", 20, yPosition);
  yPosition += 15;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Project Summary Report", 20, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  addText(`Project Name: ${projectName}`);
  if (description) {
    addText(`Description: ${description}`);
  }
  addText(`Generated: ${generatedDate.toLocaleDateString()} ${generatedDate.toLocaleTimeString()}`);
  addText(`Report Version: 1.0`);

  yPosition += 10;
  doc.setDrawColor(0);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // ===== DISCLAIMER =====
  checkPageBreak(40);
  addSection("DISCLAIMER", 12);
  addText(
    "This report contains indicative projections based on January 2026 data and assumptions. These projections are not suitable for investment decisions without professional verification. Actual results may differ materially from projections due to changes in market conditions, technology, policy, and site-specific factors.",
    10
  );
  addText("Use this tool for preliminary assessment only. Engage qualified professionals for detailed feasibility studies.", 10);

  // ===== KEY METRICS =====
  checkPageBreak(50);
  addSection("KEY FINANCIAL METRICS");

  const metrics = [
    ["Metric", "Value"],
    ["Total CAPEX", formatCurrency(results.summary.totalCapex)],
    ["LCOE (Discounted)", formatCurrency(results.summary.lcoe) + "/MWh"],
    ["LCOE (Undiscounted)", formatCurrency(results.summary.undiscountedLcoe) + "/MWh"],
    ["IRR (Unlevered)", results.summary.irr.toFixed(2) + "%"],
    ["Payback Period", results.summary.paybackPeriod],
    ["Annual Savings", formatCurrency(results.summary.annualSavings) + "/year"],
    ["Total Generation (25yr)", formatNumberWithCommas(results.summary.totalGeneration.toFixed(0)) + " MWh"],
  ];

  (doc as any).autoTable({
    head: [metrics[0]],
    body: metrics.slice(1),
    startY: yPosition,
    margin: { left: 20, right: 20 },
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ===== PROJECT PARAMETERS =====
  checkPageBreak(60);
  addSection("PROJECT PARAMETERS");

  const projectParams = [
    ["Parameter", "Value"],
    ["Installed Capacity", formatNumberWithCommas(inputs.mw.toFixed(1)) + " MW"],
    ["Project Lifetime", inputs.projectLife + " years"],
    ["Discount Rate", inputs.discountRate + "%"],
    ["Panel Degradation", inputs.degradationRate + "%/year"],
    ["Annual CPI Inflation", inputs.costInflationRate + "%"],
    ["Export Price", formatCurrency(inputs.exportPrice) + "/MWh"],
    ["Offsetable Energy Cost", formatCurrency(inputs.offsetableEnergyCost) + "/MWh"],
  ];

  (doc as any).autoTable({
    head: [projectParams[0]],
    body: projectParams.slice(1),
    startY: yPosition,
    margin: { left: 20, right: 20 },
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ===== GRID CONNECTION PARAMETERS =====
  checkPageBreak(40);
  addSection("GRID CONNECTION PARAMETERS");

  const gridParams = [
    ["Parameter", "Value"],
    ["Grid Connection Cost", inputs.gridCostOverrideEnabled ? "Custom: " + formatCurrency(inputs.gridCostOverride) : "Auto-calculated"],
    ["Total Grid Cost", formatCurrency(inputs.gridConnectionCost)],
    ["Private Wire Cost", formatCurrency(inputs.privateWireCost)],
  ];

  (doc as any).autoTable({
    head: [gridParams[0]],
    body: gridParams.slice(1),
    startY: yPosition,
    margin: { left: 20, right: 20 },
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ===== COST BREAKDOWN =====
  checkPageBreak(50);
  addSection("COST BREAKDOWN");

  const capexCalc = inputs.mw * inputs.capexPerMW;
  const devPremium = inputs.developmentPremiumEnabled ? inputs.mw * inputs.developmentPremiumPerMW * (1 - inputs.developmentPremiumDiscount / 100) : 0;
  const costBreakdown = [
    ["Cost Component", "Amount (GBP)"],
    ["EPC Cost", formatCurrency(capexCalc)],
    ["Grid Connection Cost", formatCurrency(inputs.gridConnectionCost)],
    ["Private Wire Cost", formatCurrency(inputs.privateWireCost)],
    ["Developer Premium", inputs.developmentPremiumEnabled ? formatCurrency(devPremium) : "Not included"],
    ["Total CAPEX", formatCurrency(results.summary.totalCapex)],
  ];

  (doc as any).autoTable({
    head: [costBreakdown[0]],
    body: costBreakdown.slice(1),
    startY: yPosition,
    margin: { left: 20, right: 20 },
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ===== ANNUAL OPEX =====
  checkPageBreak(40);
  addSection("ANNUAL OPERATING COSTS");

  const opexBreakdown = [
    ["Cost Type", "Year 1 (GBP)"],
    ["Base OPEX", formatCurrency(inputs.mw * inputs.opexPerMW)],
    ...(inputs.landOptionEnabled ? [["Land Option Cost", formatCurrency(inputs.mw * inputs.landOptionCostPerMWYear * (1 - inputs.landOptionDiscount / 100))]] : []),
    ["Total Year 1 OPEX", formatCurrency(results.yearlyData[1]?.opex || 0)],
  ];

  (doc as any).autoTable({
    head: [opexBreakdown[0]],
    body: opexBreakdown.slice(1),
    startY: yPosition,
    margin: { left: 20, right: 20 },
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ===== CASH FLOW TABLE =====
  checkPageBreak(80);
  addSection("DETAILED CASH FLOW ANALYSIS (25-YEAR PROJECT LIFE)");

  const cashFlowTableData = [
    ["Year", "Gen (MWh)", "OPEX (GBP)", "Revenue (GBP)", "Nom. CF (GBP)", "Disc. CF (GBP)", "Cum. DCF (GBP)"],
    ...results.yearlyData.map((year) => [
      year.year.toString(),
      formatNumberWithCommas(year.generation.toFixed(0)),
      formatCurrency(year.opex),
      formatCurrency(year.revenue),
      formatCurrency(year.cashFlow),
      formatCurrency(year.discountedCashFlow),
      formatCurrency(year.cumulativeDiscountedCashFlow),
    ]),
  ];

  (doc as any).autoTable({
    head: [cashFlowTableData[0]],
    body: cashFlowTableData.slice(1),
    startY: yPosition,
    margin: { left: 20, right: 20 },
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: 0 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ===== DATA SOURCES =====
  checkPageBreak(60);
  addSection("DATA SOURCES & METHODOLOGY");

  addText("Cable Costs:", 11, true);
  addText("Based on SSEN Distribution 2025 pricing schedules. Includes installation, testing, and commissioning.");

  addText("Transformer Costs:", 11, true);
  addText("Manufacturer quotes and industry benchmarks (2026). Includes delivery and installation.");

  addText("Wayleave Costs:", 11, true);
  addText("SSEN Distribution standard rates (GBP/km/year). Subject to annual CPI escalation.");

  addText("EPC Costs:", 11, true);
  addText("Industry benchmarks for solar installations (2026). Includes engineering, procurement, and construction.");

  addText("Energy Pricing:", 11, true);
  addText("Export price based on current market conditions. Offsetable energy cost from energy pricing tool.");

  // ===== FOOTER =====
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      "Private Wire Solar Calculator - Confidential",
      20,
      pageHeight - 10
    );
  }

  // Download PDF
  doc.save(`${projectName}-solar-report.pdf`);
}
