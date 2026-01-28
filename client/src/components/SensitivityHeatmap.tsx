import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SensitivityMatrix, getHeatmapColor } from "@/lib/sensitivity";

interface SensitivityHeatmapProps {
  matrix: SensitivityMatrix;
  title?: string;
}

export function SensitivityHeatmap({ matrix, title = "LCOE Sensitivity Analysis" }: SensitivityHeatmapProps) {
  const cellSize = 50;
  const labelWidth = 80;
  const labelHeight = 40;
  
  // Find the current scenario (closest to base values)
  const currentVoltageIdx = matrix.voltages.indexOf(33); // Default 33kV
  const currentDistanceIdx = 4; // Default ~5km

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          LCOE (£/MWh) across different cable voltages and distances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Header with voltage labels */}
            <div className="flex">
              <div style={{ width: labelWidth }} />
              {matrix.voltages.map((voltage) => (
                <div
                  key={`header-${voltage}`}
                  style={{ width: cellSize }}
                  className="flex items-center justify-center font-semibold text-sm text-center"
                >
                  {voltage}kV
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {matrix.distances.map((distance, distanceIdx) => (
              <div key={`row-${distance}`} className="flex">
                {/* Distance label */}
                <div
                  style={{ width: labelWidth, height: cellSize }}
                  className="flex items-center justify-center font-semibold text-sm border-r border-gray-200"
                >
                  {distance}km
                </div>

                {/* Heatmap cells */}
                {matrix.data[distanceIdx].map((lcoe, voltageIdx) => {
                  const isCurrentScenario =
                    distanceIdx === currentDistanceIdx && voltageIdx === currentVoltageIdx;
                  const color = getHeatmapColor(lcoe, matrix.minLcoe, matrix.maxLcoe);

                  return (
                    <div
                      key={`cell-${distance}-${matrix.voltages[voltageIdx]}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: color,
                        border: isCurrentScenario ? "3px solid #000" : "1px solid #e5e7eb",
                      }}
                      className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative group"
                      title={`${matrix.voltages[voltageIdx]}kV, ${distance}km: £${lcoe.toFixed(2)}/MWh`}
                    >
                      <span className="text-xs font-semibold text-gray-900">
                        £{lcoe.toFixed(0)}
                      </span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                        {matrix.voltages[voltageIdx]}kV, {distance}km
                        <br />
                        LCOE: £{lcoe.toFixed(2)}/MWh
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-3">
          <div className="text-sm font-semibold">Legend:</div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div
                style={{ width: 30, height: 30, backgroundColor: "rgb(0, 255, 0)" }}
                className="border border-gray-300"
              />
              <span className="text-sm">Low Cost (£{matrix.minLcoe.toFixed(0)}/MWh)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                style={{ width: 30, height: 30, backgroundColor: "rgb(255, 200, 0)" }}
                className="border border-gray-300"
              />
              <span className="text-sm">Medium Cost</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                style={{ width: 30, height: 30, backgroundColor: "rgb(255, 0, 0)" }}
                className="border border-gray-300"
              />
              <span className="text-sm">High Cost (£{matrix.maxLcoe.toFixed(0)}/MWh)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                style={{ width: 30, height: 30, border: "3px solid #000" }}
                className="bg-gray-100"
              />
              <span className="text-sm">Current Scenario</span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-semibold text-blue-900 mb-2">Key Insights:</div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Lowest LCOE: £{matrix.minLcoe.toFixed(2)}/MWh</li>
            <li>• Highest LCOE: £{matrix.maxLcoe.toFixed(2)}/MWh</li>
            <li>• Difference: £{(matrix.maxLcoe - matrix.minLcoe).toFixed(2)}/MWh</li>
            <li>• Lower voltages and shorter distances generally reduce costs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
