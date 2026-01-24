import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateSolarModel, defaultInputs, SolarInputs, SolarResults } from "@/lib/calculator";
import { cn } from "@/lib/utils";
import { BatteryCharging, Coins, Download, Factory, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricCard } from "../components/MetricCard";

export default function Dashboard() {
  const [inputs, setInputs] = useState<SolarInputs>(defaultInputs);
  const [results, setResults] = useState<SolarResults>(calculateSolarModel(defaultInputs));

  useEffect(() => {
    setResults(calculateSolarModel(inputs));
  }, [inputs]);

  const handleInputChange = (key: keyof SolarInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (val: number, decimals = 2) => {
    return new Intl.NumberFormat('en-GB', { maximumFractionDigits: decimals }).format(val);
  };

  const exportCSV = () => {
    const headers = [
      "Year", "Capex", "Opex", "Generation (MWh)", "Revenue", "Cash Flow", 
      "Cumulative Cash Flow", "Discount Factor", "Discounted Cost", 
      "Discounted Energy", "Discounted Revenue", "Discounted Cash Flow", "Cumulative Discounted CF"
    ];
    
    const rows = results.yearlyData.map(y => [
      y.year, y.capex, y.opex, y.generation, y.revenue, y.cashFlow,
      y.cumulativeCashFlow, y.discountFactor, y.discountedCost,
      y.discountedEnergy, y.discountedRevenue, y.discountedCashFlow, y.cumulativeDiscountedCashFlow
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "solar_model_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Hero Header */}
      <div className="relative bg-slate-900 text-white pb-24 pt-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <img src="/images/solar-hero.jpg" alt="Solar Farm" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/95" />
        </div>
        
        <div className="container relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display mb-2">
                Private Wire Solar Calculator
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg">
                Advanced financial modeling for solar assets with private wire integration.
              </p>
            </div>
            <Button onClick={exportCSV} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Download className="mr-2 h-4 w-4" /> Export Model
            </Button>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <MetricCard 
              title="LCOE (Real)" 
              value={formatCurrency(results.summary.lcoe) + "/MWh"} 
              icon={Coins}
              className="bg-white/5 border-l-emerald-400 text-white border-white/10 backdrop-blur-sm"
            />
            <MetricCard 
              title="IRR (Unlevered)" 
              value={(results.summary.irr * 100).toFixed(2) + "%"} 
              icon={Zap}
              className="bg-white/5 border-l-yellow-400 text-white border-white/10 backdrop-blur-sm"
            />
            <MetricCard 
              title="Payback Period" 
              value={results.summary.paybackPeriod > inputs.projectLife ? "> Project Life" : results.summary.paybackPeriod.toFixed(1) + " Years"} 
              icon={BatteryCharging}
              className="bg-white/5 border-l-blue-400 text-white border-white/10 backdrop-blur-sm"
            />
            <MetricCard 
              title="Total NPV" 
              value={formatCurrency(results.summary.totalDiscountedCashFlow)} 
              icon={Factory}
              className="bg-white/5 border-l-purple-400 text-white border-white/10 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="container -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Project Parameters</CardTitle>
                <CardDescription>Adjust inputs to update the model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Size</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Capacity (MW)</Label>
                      <span className="text-sm font-mono">{inputs.mw} MW</span>
                    </div>
                    <Slider 
                      value={[inputs.mw]} 
                      min={1} max={100} step={0.5} 
                      onValueChange={(v) => handleInputChange("mw", v[0])} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Costs (Capex)</h3>
                  
                  <div className="space-y-2">
                    <Label>EPC Cost per MW (£)</Label>
                    <Input 
                      type="number" 
                      value={inputs.capexPerMW} 
                      onChange={(e) => handleInputChange("capexPerMW", Number(e.target.value))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Private Wire Cost (£)</Label>
                    <Input 
                      type="number" 
                      value={inputs.privateWireCost} 
                      onChange={(e) => handleInputChange("privateWireCost", Number(e.target.value))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dev Premium per MW (£)</Label>
                    <Input 
                      type="number" 
                      value={inputs.developmentPremiumPerMW} 
                      onChange={(e) => handleInputChange("developmentPremiumPerMW", Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Operational</h3>
                  
                  <div className="space-y-2">
                    <Label>Opex per MW (£/year)</Label>
                    <Input 
                      type="number" 
                      value={inputs.opexPerMW} 
                      onChange={(e) => handleInputChange("opexPerMW", Number(e.target.value))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Power Price (£/MWh)</Label>
                    <Input 
                      type="number" 
                      value={inputs.powerPrice} 
                      onChange={(e) => handleInputChange("powerPrice", Number(e.target.value))} 
                    />
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Rate</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          step="0.01"
                          value={inputs.discountRate} 
                          onChange={(e) => handleInputChange("discountRate", Number(e.target.value))} 
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Degradation</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          step="0.001"
                          value={inputs.degradationRate} 
                          onChange={(e) => handleInputChange("degradationRate", Number(e.target.value))} 
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Main Charts Area */}
          <div className="lg:col-span-8 space-y-6">
            
            <Tabs defaultValue="cashflow" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="cashflow">Cash Flow Analysis</TabsTrigger>
                <TabsTrigger value="cumulative">Cumulative Returns</TabsTrigger>
                <TabsTrigger value="generation">Generation & Revenue</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cashflow">
                <Card>
                  <CardHeader>
                    <CardTitle>Annual Cash Flow</CardTitle>
                    <CardDescription>Undiscounted annual cash flows over project life</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(val) => `£${val/1000000}m`} />
                        <Tooltip formatter={(val: number) => formatCurrency(val)} />
                        <Legend />
                        <Bar dataKey="cashFlow" name="Net Cash Flow" fill="#0ea5e9">
                          {results.yearlyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cashFlow >= 0 ? "#10b981" : "#ef4444"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cumulative">
                <Card>
                  <CardHeader>
                    <CardTitle>Cumulative Discounted Cash Flow</CardTitle>
                    <CardDescription>Project NPV trajectory showing payback period</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(val) => `£${val/1000000}m`} />
                        <Tooltip formatter={(val: number) => formatCurrency(val)} />
                        <Legend />
                        <Area type="monotone" dataKey="cumulativeDiscountedCashFlow" name="Cumulative Discounted CF" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCumulative)" />
                        {/* Zero line */}
                        <Line type="monotone" dataKey={() => 0} stroke="#64748b" strokeDasharray="5 5" strokeWidth={1} dot={false} activeDot={false} legendType="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="generation">
                <Card>
                  <CardHeader>
                    <CardTitle>Generation & Revenue</CardTitle>
                    <CardDescription>Energy production vs. Revenue over time (accounting for degradation)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" />
                        <YAxis yAxisId="left" tickFormatter={(val) => `${val/1000}k`} label={{ value: 'MWh', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `£${val/1000000}m`} label={{ value: 'Revenue', angle: 90, position: 'insideRight' }} />
                        <Tooltip formatter={(val: number, name: string) => [name === 'Revenue' ? formatCurrency(val) : formatNumber(val) + ' MWh', name]} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="generation" name="Generation (MWh)" stroke="#f59e0b" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (£)" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Detailed Table Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Yearly Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b">
                      <tr>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Generation (MWh)</th>
                        <th className="px-4 py-3">Revenue</th>
                        <th className="px-4 py-3">Opex</th>
                        <th className="px-4 py-3">Cash Flow</th>
                        <th className="px-4 py-3">Discounted CF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {results.yearlyData.slice(0, 11).map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium">{row.year}</td>
                          <td className="px-4 py-3">{formatNumber(row.generation, 0)}</td>
                          <td className="px-4 py-3">{formatCurrency(row.revenue)}</td>
                          <td className="px-4 py-3">{formatCurrency(row.opex)}</td>
                          <td className={cn("px-4 py-3 font-medium", row.cashFlow >= 0 ? "text-emerald-600" : "text-red-600")}>
                            {formatCurrency(row.cashFlow)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.discountedCashFlow)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 text-center text-xs text-muted-foreground border-t bg-slate-50/30">
                    Showing first 10 years. Export to CSV for full details.
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
