"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { linearRegression } from "@/lib/regression-utils"
import type { AQIData } from "@/lib/types"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AirQualityPredictiveProps {
  data: AQIData[]
}

export function AirQualityPredictive({ data }: AirQualityPredictiveProps) {
  const [metric, setMetric] = useState("Median AQI")
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["Los Angeles-Long Beach-Anaheim CA"])
  const [open, setOpen] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [cityInfo, setCityInfo] = useState<any[]>([])
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const metrics = [
    { value: "Median AQI", label: "Median AQI" },
    { value: "90th Percentile AQI", label: "90th Percentile AQI" },
    { value: "Good Days", label: "Good Days" },
    { value: "Unhealthy Days", label: "Unhealthy Days" },
  ]

  // Safely get all unique locations
  const locations = Array.from(new Set((data || []).map((item) => item.CBSA))).sort()

  // Define colors for each city
  const cityColors = [
    "#3b82f6", // Blue
    "#22c55e", // Green
    "#ef4444", // Red
    "#eab308", // Yellow
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f97316", // Orange
  ]

  // Generate chart data whenever dependencies change
  useEffect(() => {
    if (!data || data.length === 0 || selectedLocations.length === 0) {
      setChartData([])
      setCityInfo([])
      return
    }

    try {
      // Process each selected location
      const processedCities = selectedLocations
        .map((location, locationIndex) => {
          // Filter data for the selected location
          const locationData = data.filter((item) => item.CBSA === location)

          if (locationData.length < 2) {
            return null
          }

          // Sort by year
          locationData.sort((a, b) => Number.parseInt(a.Year) - Number.parseInt(b.Year))

          // Extract years and metric values
          const years = locationData.map((item) => Number.parseInt(item.Year))

          let metricValues: number[] = []

          // Extract the selected metric values
          switch (metric) {
            case "Median AQI":
              metricValues = locationData.map((item) => Number.parseInt(item["Median AQI"] || "0"))
              break
            case "90th Percentile AQI":
              metricValues = locationData.map((item) => Number.parseInt(item["90th Percentile AQI"] || "0"))
              break
            case "Good Days":
              metricValues = locationData.map((item) => Number.parseInt(item["Good Days"] || "0"))
              break
            case "Unhealthy Days":
              metricValues = locationData.map((item) => {
                const unhealthySensitive = Number.parseInt(item["Unhealthy for Sensitive Groups Days"] || "0")
                const unhealthy = Number.parseInt(item["Unhealthy Days"] || "0")
                const veryUnhealthy = Number.parseInt(item["Very Unhealthy Days"] || "0")
                const hazardous = Number.parseInt(item["Hazardous Days"] || "0")
                return unhealthySensitive + unhealthy + veryUnhealthy + hazardous
              })
              break
          }

          // Calculate the average of the last 2 years (2023-2024) to use as a baseline
          const recentYears = years.filter((year) => year >= 2023 && year <= 2024)
          const recentValues = metricValues.filter((_, i) => years[i] >= 2023 && years[i] <= 2024)

          let baselineValue = 0
          if (recentValues.length > 0) {
            baselineValue = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
          } else {
            // If no recent data, use the average of all historical data
            baselineValue = metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length
          }

          // Perform linear regression for R² value only
          const model = linearRegression(years, metricValues)

          // Calculate R² value
          const r2 = model.r2

          return {
            location,
            color: cityColors[locationIndex % cityColors.length],
            r2,
            years,
            metricValues,
            baselineValue,
          }
        })
        .filter(Boolean)

      setCityInfo(processedCities)

      // Get all unique years from historical data
      const allYears = new Set<number>()
      data.forEach((item) => {
        allYears.add(Number.parseInt(item.Year))
      })

      // Add future years
      const futureYears = [2025, 2026, 2027, 2028]
      futureYears.forEach((year) => allYears.add(year))

      // Sort years
      const sortedYears = Array.from(allYears).sort((a, b) => a - b)

      // Create combined chart data
      const combinedData = sortedYears.map((year) => {
        const dataPoint: Record<string, any> = { year: year.toString() }

        processedCities.forEach((city) => {
          // For each city, calculate the value for this year
          if (year <= Math.max(...city.years)) {
            // Historical data
            const index = city.years.indexOf(year)
            if (index !== -1) {
              dataPoint[city.location] = city.metricValues[index]
            }
          } else {
            // Predicted data with gradual increase
            // Calculate the year index (0 for 2025, 1 for 2026, etc.)
            const yearIndex = year - 2025

            // Define increase factors for each year (10% increase per year)
            const increaseFactors = {
              "Median AQI": 1.1,
              "90th Percentile AQI": 1.1,
              "Unhealthy Days": 1.15,
              "Good Days": 0.95, // For Good Days, we want a decrease (which means worse air quality)
            }

            // Get the appropriate increase factor
            const increaseFactor = increaseFactors[metric] || 1.1

            // Calculate the predicted value with compounding increase
            const predictedValue = city.baselineValue * Math.pow(increaseFactor, yearIndex + 1)

            dataPoint[city.location] = Math.round(predictedValue)
          }
        })

        return dataPoint
      })

      console.log("Chart data:", combinedData)
      setChartData(combinedData)
    } catch (error) {
      console.error("Error processing data:", error)
    }
  }, [data, selectedLocations, metric])

  // Find the year where predictions start
  const predictionStartYear = "2025"

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analysis</CardTitle>
          <CardDescription>No data available for prediction</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please ensure data is loaded correctly to view predictions.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analysis</CardTitle>
          <CardDescription>
            Prediction model showing gradual increase in air quality metrics from 2025-2028
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Metric</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Locations</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    {selectedLocations.length > 0
                      ? `${selectedLocations.length} location${selectedLocations.length > 1 ? "s" : ""} selected`
                      : "Select locations..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search locations..." />
                    <CommandList>
                      <CommandEmpty>No location found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {locations.map((location) => (
                          <CommandItem
                            key={location}
                            value={location}
                            onSelect={() => {
                              setSelectedLocations((current) =>
                                current.includes(location)
                                  ? current.filter((l) => l !== location)
                                  : [...current, location],
                              )
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLocations.includes(location) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {location}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[500px]">
          {chartData.length > 0 && cityInfo.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge
                  variant="outline"
                  className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
                >
                  Prediction Model: Gradual Increase
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {metric === "Good Days"
                    ? "Showing projected 5% annual decrease in Good Days (worsening air quality)"
                    : "Showing projected 10-15% annual increase in metric (worsening air quality)"}
                </span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                  />
                  <XAxis dataKey="year" stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
                  <YAxis stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />

                  {/* Add a reference line to mark the start of predictions */}
                  <ReferenceLine
                    x={predictionStartYear}
                    stroke={isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
                    strokeDasharray="3 3"
                    label={{
                      value: "Predictions →",
                      position: "top",
                      fill: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                    }}
                  />

                  {/* Add a shaded area for the prediction period */}
                  <ReferenceArea
                    x1={predictionStartYear}
                    x2="2028"
                    fill={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
                  />

                  <Tooltip />
                  <Legend />

                  {/* Render a single line for each city */}
                  {cityInfo.map((city) => (
                    <Line
                      key={city.location}
                      type="monotone"
                      dataKey={city.location}
                      name={city.location}
                      stroke={city.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

              <div className="flex items-center justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-gray-500"></div>
                  <span className="text-sm">Historical Data (2019-2024)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-gray-500 border-dashed border-2"></div>
                  <span className="text-sm">Predicted Data (2025-2028)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Not enough data available to generate predictions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
