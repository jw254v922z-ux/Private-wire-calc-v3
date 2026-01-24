import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

interface GridConnectionSliderProps {
  onCostsUpdate: (costs: GridConnectionCosts) => void;
}

export interface GridConnectionCosts {
  distance: number;
  transformerCount: number;
  voltage: string;
  joints: number;
  agriculturalTrenchingMin: number;
  agriculturalTrenchingMax: number;
  roadTrenchingMin: number;
  roadTrenchingMax: number;
  majorRoadCrossingsMin: number;
  majorRoadCrossingsMax: number;
  jointBaysMin: number;
  jointBaysMax: number;
  transformersMin: number;
  transformersMax: number;
  landRightsCompensationMin: number;
  landRightsCompensationMax: number;
  landRightsLegalMin: number;
  landRightsLegalMax: number;
  planningFeesMin: number;
  planningFeesMax: number;
  planningConsentsMin: number;
  planningConsentsMax: number;
  constructionMin: number;
  constructionMax: number;
  softCostsMin: number;
  softCostsMax: number;
  projectMin: number;
  projectMax: number;
}

// Cost rates per km for different trench types
const COST_RATES = {
  agricultural: { min: 200000, max: 350000 }, // £ per km
  road: { min: 600000, max: 1200000 }, // £ per km
  roadCrossing: { min: 150000, max: 300000 }, // £ per crossing
  jointBay: { min: 30000, max: 40000 }, // £ per joint
  transformer: {
    "33/11": { min: 250000, max: 400000 },
    "33/6.6": { min: 250000, max: 400000 },
    "11/0.4": { min: 50000, max: 100000 },
  },
};

export function GridConnectionSliders({ onCostsUpdate }: GridConnectionSliderProps) {
  const [distance, setDistance] = useState(3);
  const [transformerCount, setTransformerCount] = useState(2);
  const [voltage, setVoltage] = useState("33/11");
  const [roadPercentage, setRoadPercentage] = useState(50);
  const [majorRoadCrossings, setMajorRoadCrossings] = useState(2);

  // Calculate joints based on distance (approximately 1 joint per 500m)
  const joints = Math.ceil((distance * 1000) / 500);

  // Calculate trenching costs
  const agriculturalDistance = (distance * (100 - roadPercentage)) / 100;
  const roadDistance = (distance * roadPercentage) / 100;

  const agriculturalTrenchingMin = agriculturalDistance * COST_RATES.agricultural.min;
  const agriculturalTrenchingMax = agriculturalDistance * COST_RATES.agricultural.max;
  const roadTrenchingMin = roadDistance * COST_RATES.road.min;
  const roadTrenchingMax = roadDistance * COST_RATES.road.max;

  // Calculate road crossing costs
  const majorRoadCrossingsMin = majorRoadCrossings * COST_RATES.roadCrossing.min;
  const majorRoadCrossingsMax = majorRoadCrossings * COST_RATES.roadCrossing.max;

  // Calculate joint bay costs
  const jointBaysMin = joints * COST_RATES.jointBay.min;
  const jointBaysMax = joints * COST_RATES.jointBay.max;

  // Calculate transformer costs based on voltage
  const transformerCosts = COST_RATES.transformer[voltage as keyof typeof COST_RATES.transformer] || COST_RATES.transformer["33/11"];
  const transformersMin = transformerCount * transformerCosts.min;
  const transformersMax = transformerCount * transformerCosts.max;

  // Land rights and planning costs (relatively fixed)
  const landRightsCompensationMin = 20000;
  const landRightsCompensationMax = 60000;
  const landRightsLegalMin = 50000;
  const landRightsLegalMax = 90000;
  const planningFeesMin = 600;
  const planningFeesMax = 1200;
  const planningConsentsMin = 15000;
  const planningConsentsMax = 40000;

  // Calculate totals
  const constructionMin = agriculturalTrenchingMin + roadTrenchingMin + majorRoadCrossingsMin + jointBaysMin + transformersMin;
  const constructionMax = agriculturalTrenchingMax + roadTrenchingMax + majorRoadCrossingsMax + jointBaysMax + transformersMax;
  const softCostsMin = landRightsCompensationMin + landRightsLegalMin + planningFeesMin + planningConsentsMin;
  const softCostsMax = landRightsCompensationMax + landRightsLegalMax + planningFeesMax + planningConsentsMax;
  const projectMin = constructionMin + softCostsMin;
  const projectMax = constructionMax + softCostsMax;

  // Update parent component with new costs
  useEffect(() => {
    onCostsUpdate({
      distance,
      transformerCount,
      voltage,
      joints,
      agriculturalTrenchingMin,
      agriculturalTrenchingMax,
      roadTrenchingMin,
      roadTrenchingMax,
      majorRoadCrossingsMin,
      majorRoadCrossingsMax,
      jointBaysMin,
      jointBaysMax,
      transformersMin,
      transformersMax,
      landRightsCompensationMin,
      landRightsCompensationMax,
      landRightsLegalMin,
      landRightsLegalMax,
      planningFeesMin,
      planningFeesMax,
      planningConsentsMin,
      planningConsentsMax,
      constructionMin,
      constructionMax,
      softCostsMin,
      softCostsMax,
      projectMin,
      projectMax,
    });
  }, [distance, transformerCount, voltage, roadPercentage, majorRoadCrossings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CostSummaryCard = ({ label, min, max }: { label: string; min: number; max: number }) => (
    <div className="p-3 bg-slate-50 rounded-lg border">
      <p className="text-xs text-slate-600 font-medium">{label}</p>
      <p className="text-sm font-semibold text-slate-900 mt-1">
        {formatCurrency(min)} - {formatCurrency(max)}
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Average: {formatCurrency((min + max) / 2)}
      </p>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Grid Connection Cost Calculator</CardTitle>
        <CardDescription>
          Adjust parameters to calculate grid connection costs dynamically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="costs">Cost Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="space-y-6 mt-4">
            {/* Distance Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Cable Distance (km)</Label>
                <span className="text-2xl font-bold text-blue-600">{distance.toFixed(1)} km</span>
              </div>
              <Slider
                value={[distance]}
                min={0.5}
                max={10}
                step={0.1}
                onValueChange={(v) => setDistance(v[0])}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Calculated joints: <span className="font-semibold">{joints}</span> (1 joint per 500m)
              </p>
            </div>

            {/* Road Percentage */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Road Percentage</Label>
                <span className="text-2xl font-bold text-amber-600">{roadPercentage}%</span>
              </div>
              <Slider
                value={[roadPercentage]}
                min={0}
                max={100}
                step={5}
                onValueChange={(v) => setRoadPercentage(v[0])}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                <div>Agricultural: {((100 - roadPercentage) * distance / 100).toFixed(1)} km</div>
                <div>Road: {(roadPercentage * distance / 100).toFixed(1)} km</div>
              </div>
            </div>

            {/* Major Road Crossings */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Major Road Crossings</Label>
                <span className="text-2xl font-bold text-purple-600">{majorRoadCrossings}</span>
              </div>
              <Slider
                value={[majorRoadCrossings]}
                min={0}
                max={5}
                step={1}
                onValueChange={(v) => setMajorRoadCrossings(v[0])}
                className="w-full"
              />
            </div>

            {/* Transformer Count */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Number of Transformers</Label>
                <span className="text-2xl font-bold text-green-600">{transformerCount}</span>
              </div>
              <Slider
                value={[transformerCount]}
                min={1}
                max={10}
                step={1}
                onValueChange={(v) => setTransformerCount(v[0])}
                className="w-full"
              />
            </div>

            {/* Voltage Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Transformer Voltage (HV/LV)</Label>
              <div className="grid grid-cols-3 gap-2">
                {["33/11", "33/6.6", "11/0.4"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVoltage(v)}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                      voltage === v
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {v} kV
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected: <span className="font-semibold">{voltage} kV</span>
              </p>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                Costs are calculated based on industry benchmarks and will be updated in real-time as you adjust parameters.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Trenching Costs</h3>
              <CostSummaryCard
                label="Agricultural Trenching"
                min={agriculturalTrenchingMin}
                max={agriculturalTrenchingMax}
              />
              <CostSummaryCard
                label="Road Trenching"
                min={roadTrenchingMin}
                max={roadTrenchingMax}
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Infrastructure</h3>
              <CostSummaryCard
                label="Major Road Crossings"
                min={majorRoadCrossingsMin}
                max={majorRoadCrossingsMax}
              />
              <CostSummaryCard
                label={`Joint Bays (${joints} joints)`}
                min={jointBaysMin}
                max={jointBaysMax}
              />
              <CostSummaryCard
                label={`Transformers (${transformerCount} × ${voltage} kV)`}
                min={transformersMin}
                max={transformersMax}
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Totals</h3>
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">Total Project Cost</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {formatCurrency(projectMin)} - {formatCurrency(projectMax)}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Average: {formatCurrency((projectMin + projectMax) / 2)}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
