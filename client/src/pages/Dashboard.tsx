import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { calculateSolarModel, defaultInputs, SolarInputs, SolarResults } from "@/lib/calculator";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumberWithCommas } from "@/lib/formatters";
import { BatteryCharging, Coins, Download, Factory, Save, Trash2, Zap, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricCard } from "../components/MetricCard";
import { GridConnectionCostBreakdown } from "../components/GridConnectionCostBreakdown";
import { GridConnectionSliders, type GridConnectionCosts } from "../components/GridConnectionSliders";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [inputs, setInputs] = useState<SolarInputs>(defaultInputs);
  const [results, setResults] = useState<SolarResults>(calculateSolarModel(defaultInputs));
  const [modelName, setModelName] = useState("My Solar Model");
  const [modelDescription, setModelDescription] = useState("");
  const [currentModelId, setCurrentModelId] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [gridConnectionCosts, setGridConnectionCosts] = useState<GridConnectionCosts | null>(null);

  const { data: savedModels = [], refetch: refetchModels } = trpc.solar.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createModelMutation = trpc.solar.create.useMutation({
    onSuccess: () => {
      toast.success("Model saved successfully!");
      refetchModels();
      setShowSaveDialog(false);
      setModelName("My Solar Model");
      setModelDescription("");
    },
    onError: (error) => {
      toast.error("Failed to save model: " + error.message);
    },
  });

  const updateModelMutation = trpc.solar.update.useMutation({
    onSuccess: () => {
      toast.success("Model updated successfully!");
      refetchModels();
      setShowSaveDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to update model: " + error.message);
    },
  });

  const deleteModelMutation = trpc.solar.delete.useMutation({
    onSuccess: () => {
      toast.success("Model deleted successfully!");
      refetchModels();
      if (currentModelId) setCurrentModelId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete model: " + error.message);
    },
  });

  const loadModel = trpc.solar.get.useQuery(
    { id: currentModelId! },
    { enabled: currentModelId !== null && isAuthenticated }
  );

  useEffect(() => {
    if (loadModel.data) {
      const model = loadModel.data;
      setInputs({
        mw: model.mw,
        capexPerMW: model.capexPerMW,
        privateWireCost: model.privateWireCost,
        gridConnectionCost: model.gridConnectionCost,
        developmentPremiumPerMW: model.developmentPremiumPerMW,
        opexPerMW: model.opexPerMW,
        opexEscalation: parseFloat(model.opexEscalation),
        generationPerMW: parseFloat(model.generationPerMW),
        degradationRate: parseFloat(model.degradationRate),
        projectLife: model.projectLife,
        discountRate: parseFloat(model.discountRate),
        powerPrice: model.powerPrice,
        percentConsumptionPPA: model.percentConsumptionPPA || 100,
        percentConsumptionExport: model.percentConsumptionExport || 0,
        exportPrice: model.exportPrice || 50,
      });
      setModelName(model.name);
      setModelDescription(model.description || "");
    }
  }, [loadModel.data]);

  useEffect(() => {
    setResults(calculateSolarModel(inputs));
  }, [inputs]);

  const handleInputChange = (key: keyof SolarInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveModel = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (currentModelId) {
      updateModelMutation.mutate({
        id: currentModelId,
        name: modelName,
        description: modelDescription,
        mw: inputs.mw,
        capexPerMW: inputs.capexPerMW,
        privateWireCost: inputs.privateWireCost,
        gridConnectionCost: inputs.gridConnectionCost,
        developmentPremiumPerMW: inputs.developmentPremiumPerMW,
        opexPerMW: inputs.opexPerMW,
        opexEscalation: inputs.opexEscalation.toString(),
        generationPerMW: inputs.generationPerMW.toString(),
        degradationRate: inputs.degradationRate.toString(),
        projectLife: inputs.projectLife,
        discountRate: inputs.discountRate.toString(),
        powerPrice: inputs.powerPrice,
        percentConsumptionPPA: inputs.percentConsumptionPPA,
        percentConsumptionExport: inputs.percentConsumptionExport,
        exportPrice: inputs.exportPrice,
        lcoe: results.summary.lcoe.toFixed(2),
        irr: (results.summary.irr * 100).toFixed(2),
        paybackPeriod: results.summary.paybackPeriod.toFixed(1),
        totalNpv: results.summary.totalDiscountedCashFlow.toFixed(0),
      });
    } else {
      createModelMutation.mutate({
        name: modelName,
        description: modelDescription,
        mw: inputs.mw,
        capexPerMW: inputs.capexPerMW,
        privateWireCost: inputs.privateWireCost,
        gridConnectionCost: inputs.gridConnectionCost,
        developmentPremiumPerMW: inputs.developmentPremiumPerMW,
        opexPerMW: inputs.opexPerMW,
        opexEscalation: inputs.opexEscalation.toString(),
        generationPerMW: inputs.generationPerMW.toString(),
        degradationRate: inputs.degradationRate.toString(),
        projectLife: inputs.projectLife,
        discountRate: inputs.discountRate.toString(),
        powerPrice: inputs.powerPrice,
        percentConsumptionPPA: inputs.percentConsumptionPPA,
        percentConsumptionExport: inputs.percentConsumptionExport,
        exportPrice: inputs.exportPrice,
        lcoe: results.summary.lcoe.toFixed(2),
        irr: (results.summary.irr * 100).toFixed(2),
        paybackPeriod: results.summary.paybackPeriod.toFixed(1),
        totalNpv: results.summary.totalDiscountedCashFlow.toFixed(0),
      });
    }
  };

  const handleDeleteModel = (id: number) => {
    if (confirm("Are you sure you want to delete this model?")) {
      deleteModelMutation.mutate({ id });
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Private Wire Solar Calculator</CardTitle>
            <CardDescription>Sign in to save and manage your solar project models</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = getLoginUrl()} 
              className="w-full"
              size="lg"
            >
              Sign In with Manus
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                Welcome, {user?.name || "User"}! Advanced financial modeling for solar assets with private wire integration.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportCSV} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button onClick={() => logout()} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
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
          
          {/* Sidebar with Model Management */}
          <div className="lg:col-span-4 space-y-6">
            {/* Model Management Card */}
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Saved Models</CardTitle>
                <CardDescription>Load or manage your project models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedModels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved models yet. Create one to get started!</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {savedModels.map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <button
                          onClick={() => setCurrentModelId(model.id)}
                          className={cn(
                            "flex-1 text-left text-sm font-medium truncate",
                            currentModelId === model.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {model.name}
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteModel(model.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parameters Card */}
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
                      <span className="text-sm font-mono">{formatNumberWithCommas(inputs.mw)} MW</span>
                    </div>
                    <Slider 
                      value={[inputs.mw]} 
                      min={1} max={100} step={0.5} 
                      onValueChange={(v) => handleInputChange("mw", v[0])} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Project Life (Years)</Label>
                      <span className="text-sm font-mono">{inputs.projectLife} years</span>
                    </div>
                    <Slider 
                      value={[inputs.projectLife]} 
                      min={5} max={30} step={1} 
                      onValueChange={(v) => handleInputChange("projectLife", v[0])} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Costs (Capex)</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>EPC Cost per MW (£)</Label>
                      <span className="text-sm font-mono">{formatNumberWithCommas(inputs.capexPerMW)}</span>
                    </div>
                    <Input 
                      type="text" 
                      value={formatNumberWithCommas(inputs.capexPerMW)} 
                      onChange={(e) => handleInputChange("capexPerMW", Number(e.target.value.replace(/,/g, '')))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Private Wire Cost (£)</Label>
                      <span className="text-sm font-mono">{formatNumberWithCommas(inputs.privateWireCost)}</span>
                    </div>
                    {gridConnectionCosts && (
                      <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded">
                        <div className="font-semibold">Grid Connection Estimate:</div>
                        <div>{formatCurrency((gridConnectionCosts.totalCostMin + gridConnectionCosts.totalCostMax) / 2)}</div>
                      </div>
                    )}
                    <Input 
                      type="text" 
                      value={formatNumberWithCommas(inputs.privateWireCost)} 
                      onChange={(e) => handleInputChange("privateWireCost", Number(e.target.value.replace(/,/g, '')))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Dev Premium per MW (£)</Label>
                      <span className="text-sm font-mono">{formatNumberWithCommas(inputs.developmentPremiumPerMW)}</span>
                    </div>
                    <Input 
                      type="text" 
                      value={formatNumberWithCommas(inputs.developmentPremiumPerMW)} 
                      onChange={(e) => handleInputChange("developmentPremiumPerMW", Number(e.target.value.replace(/,/g, '')))} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Operational</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Opex per MW (£/year)</Label>
                      <span className="text-sm font-mono">{formatNumberWithCommas(inputs.opexPerMW)}</span>
                    </div>
                    <Input 
                      type="text" 
                      value={formatNumberWithCommas(inputs.opexPerMW)} 
                      onChange={(e) => handleInputChange("opexPerMW", Number(e.target.value.replace(/,/g, '')))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Power Price (£/MWh)</Label>
                      <span className="text-sm font-mono">{formatNumberWithCommas(inputs.powerPrice)}</span>
                    </div>
                    <Input 
                      type="text" 
                      value={formatNumberWithCommas(inputs.powerPrice)} 
                      onChange={(e) => handleInputChange("powerPrice", Number(e.target.value.replace(/,/g, '')))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>% Consumption at PPA</Label>
                      <span className="text-sm font-mono">{inputs.percentConsumptionPPA.toFixed(1)}%</span>
                    </div>
                    <Slider 
                      value={[inputs.percentConsumptionPPA]} 
                      min={0} max={100} step={1} 
                      onValueChange={(v) => handleInputChange("percentConsumptionPPA", v[0])} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>% Consumption at Export</Label>
                      <span className="text-sm font-mono">{inputs.percentConsumptionExport.toFixed(1)}%</span>
                    </div>
                    <Slider 
                      value={[inputs.percentConsumptionExport]} 
                      min={0} max={100} step={1} 
                      onValueChange={(v) => handleInputChange("percentConsumptionExport", v[0])} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Export Price (£/MWh)</Label>
                      <span className="text-sm font-mono">{formatNumberWithCommas(inputs.exportPrice)}</span>
                    </div>
                    <Input 
                      type="text" 
                      value={formatNumberWithCommas(inputs.exportPrice)} 
                      onChange={(e) => handleInputChange("exportPrice", Number(e.target.value.replace(/,/g, '')))} 
                    />
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Discount Rate (%)</Label>
                        <span className="text-sm font-mono">{(inputs.discountRate * 100).toFixed(2)}%</span>
                      </div>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={inputs.discountRate * 100} 
                        onChange={(e) => handleInputChange("discountRate", Number(e.target.value) / 100)} 
                      />
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

                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Save className="mr-2 h-4 w-4" /> {currentModelId ? "Update" : "Save"} Model
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{currentModelId ? "Update" : "Save"} Model</DialogTitle>
                      <DialogDescription>Give your model a name and description</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Model Name</Label>
                        <Input 
                          value={modelName} 
                          onChange={(e) => setModelName(e.target.value)} 
                          placeholder="e.g., 28MW Solar Farm - High Price Scenario"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Input 
                          value={modelDescription} 
                          onChange={(e) => setModelDescription(e.target.value)} 
                          placeholder="Add notes about this model..."
                        />
                      </div>
                      <Button 
                        onClick={handleSaveModel} 
                        className="w-full"
                        disabled={createModelMutation.isPending || updateModelMutation.isPending}
                      >
                        {createModelMutation.isPending || updateModelMutation.isPending ? "Saving..." : "Save Model"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

              </CardContent>
            </Card>
          </div>

          {/* Main Charts Area */}
          <div className="lg:col-span-8 space-y-6">
            
            <Tabs defaultValue="gridcosts" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="gridcosts">Private Wire Parameters</TabsTrigger>
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
                  <CardContent className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.yearlyData} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
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
              
              <TabsContent value="gridcosts">
                <GridConnectionSliders
                  onCostsUpdate={(costs) => {
                    setGridConnectionCosts(costs);
                    const avgCost = (costs.totalCostMin + costs.totalCostMax) / 2;
                    handleInputChange("gridConnectionCost", Math.round(avgCost));
                    // Also update Private Wire Cost with grid connection estimate
                    handleInputChange("privateWireCost", Math.round(avgCost));
                  }}
                />
              </TabsContent>
            </Tabs>

            {/* Detailed Table Preview - Only show on non-gridcosts tabs */}
            {/* Hidden from Private Wire Parameters tab */}

          </div>
        </div>
      </div>
    </div>
  );
}
