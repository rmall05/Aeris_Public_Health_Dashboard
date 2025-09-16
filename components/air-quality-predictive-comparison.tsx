"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import type { AQIData } from "@/lib/types"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AirQualityPredictiveComparisonProps {
  data: AQIData[]
}

export function AirQualityPredictiveComparison({ data }: AirQualityPredictiveComparisonProps) {
  const [metric, setMetric] = useState("Median AQI")
  const [open, setOpen] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
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

  // Generate chart data
  const chartData = (() => {
    if (!data || data.length === 0) {
      return null
    }

    // If no locations are selected, use all locations
    const locationsToUse = selectedLocations.length > 0 ? selectedLocations : locations

    // Define future years to predict
    const futureYears = [2025, 2026, 2027, 2028]

    // Colors for each city
    const colors = [
      "#3b82f6", // Blue
      "#22c55e", // Green
      "#ef4444", // Red
      "#eab308", // Yellow
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#14b8a6", // Teal
      "#f97316", // Orange
    ]

    // Process each location
    const cityPredictions = locationsToUse
      .map((location, index) => {
        // Filter data for this location
        const locationData = data.filter((item) => item.CBSA === location)

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

        // Skip if not enough data
        if (years.length < 2) {
          return null
        }

        try {
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

          // Define increase factors for each year (10% increase per year)
          const increaseFactors = {
            "Median AQI": 1.1,
            "90th Percentile AQI": 1.1,
            "Unhealthy Days": 1.15,
            "Good Days": 0.95, // For Good Days, we want a decrease (which means worse air quality)
          }

          // Get the appropriate increase factor
          const increaseFactor = increaseFactors[metric] || 1.1

          // Generate predictions with gradual increase
          const predictions = futureYears.map((year, i) => {
            const yearIndex = year - 2025
            const predictedValue = baselineValue * Math.pow(increaseFactor, yearIndex + 1)
            return {
              year,
              value: Math.round(predictedValue),
            }
          })

          return {
            city: location,
            color: colors[index % colors.length],
            predictions,
          }
        } catch (error) {
          console.error(`Error predicting for ${location}:`, error)
          return null
        }
      })
      .filter(Boolean)

    // Format data for the chart
    // We'll create one data point per year with all cities' values
    const formattedData = futureYears.map((year) => {
      const dataPoint: Record<string, any> = { year: year.toString() }

      cityPredictions.forEach((city) => {
        if (!city) return
        const prediction = city.predictions.find((p) => p.year === year)
        if (prediction) {
          dataPoint[city.city] = prediction.value
        }
      })

      return dataPoint
    })

    return {
      chartData: formattedData,
      cities: cityPredictions.filter(Boolean),
    }
  })()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>City Comparison Forecast</CardTitle>
          <CardDescription>No data available for comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please ensure data is loaded correctly to view predictions.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>City Comparison Forecast</CardTitle>
        <CardDescription>Comparing predicted {metric} trends across cities from 2025-2028</CardDescription>
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
                    : "All locations"}
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
      <CardContent className="h-[600px]">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
            Prediction Range: 2025-2028
          </Badge>
          <span className="text-sm text-muted-foreground">
            {metric === "Good Days"
              ? "Showing projected 5% annual decrease in Good Days (worsening air quality)"
              : "Showing projected 10-15% annual increase in metric (worsening air quality)"}
          </span>
        </div>

        {chartData && chartData.chartData && chartData.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
              />
              <XAxis dataKey="year" stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
              <YAxis stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
              <Tooltip />
              <Legend />

              {chartData.cities.map((city) => (
                <Line
                  key={city.city}
                  type="monotone"
                  dataKey={city.city}
                  name={city.city}
                  stroke={city.color}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Not enough data available to generate predictions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
