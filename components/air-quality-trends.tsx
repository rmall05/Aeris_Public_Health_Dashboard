"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import type { AQIData } from "@/lib/types"

interface AirQualityTrendsProps {
  data: AQIData[]
  selectedLocation: string | null
}

export function AirQualityTrends({ data, selectedLocation }: AirQualityTrendsProps) {
  const [metric, setMetric] = useState("Median AQI")
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const metrics = [
    { value: "Median AQI", label: "Median AQI" },
    { value: "Max AQI", label: "Maximum AQI" },
    { value: "90th Percentile AQI", label: "90th Percentile AQI" },
    { value: "Good Days", label: "Good Days" },
    { value: "Moderate Days", label: "Moderate Days" },
    { value: "Unhealthy for Sensitive Groups Days", label: "Unhealthy for Sensitive Groups Days" },
    { value: "Unhealthy Days", label: "Unhealthy Days" },
  ]

  const chartData = useMemo(() => {
    // If a location is selected, show yearly trend for that location
    if (selectedLocation) {
      return data
        .filter((item) => item.CBSA === selectedLocation)
        .sort((a, b) => Number.parseInt(a.Year, 10) - Number.parseInt(b.Year, 10))
        .map((item) => ({
          year: item.Year,
          value: Number.parseInt(item[metric] || "0", 10),
          isProjected: item.Year === "2024" || item.Year === "2025",
        }))
    }

    // Otherwise, calculate average for each year across all locations
    const yearlyData: Record<string, { sum: number; count: number; isProjected: boolean }> = {}

    data.forEach((item) => {
      const year = item.Year
      const value = Number.parseInt(item[metric] || "0", 10)
      const isProjected = year === "2024" || year === "2025"

      if (!yearlyData[year]) {
        yearlyData[year] = { sum: 0, count: 0, isProjected }
      }

      yearlyData[year].sum += value
      yearlyData[year].count += 1
    })

    return Object.entries(yearlyData)
      .map(([year, { sum, count, isProjected }]) => ({
        year,
        value: Math.round(sum / count),
        isProjected,
      }))
      .sort((a, b) => Number.parseInt(a.year, 10) - Number.parseInt(b.year, 10))
  }, [data, selectedLocation, metric])

  const getChartColor = () => {
    switch (metric) {
      case "Good Days":
        return "hsl(142, 76%, 36%)" // Green
      case "Moderate Days":
        return "hsl(48, 96%, 53%)" // Yellow
      case "Unhealthy for Sensitive Groups Days":
      case "Unhealthy Days":
        return "hsl(0, 84%, 60%)" // Red
      default:
        return "hsl(217, 91%, 60%)" // Blue
    }
  }

  const chartColor = getChartColor()

  // Find the year where projected data starts (2024)
  const projectionStartYear = "2024"

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{selectedLocation ? `${selectedLocation} - Yearly Trends` : "Average Yearly Trends"}</CardTitle>
          <CardDescription>
            {selectedLocation
              ? `Historical air quality data for ${selectedLocation}`
              : "Average air quality trends across all locations"}
          </CardDescription>
        </div>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[180px]">
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
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer
          config={{
            [metric]: {
              label: metric,
              color: chartColor,
            },
            [`${metric} (Projected)`]: {
              label: `${metric} (Projected)`,
              color: chartColor,
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
              />
              <XAxis dataKey="year" stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
              <YAxis stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />

              {/* Add a reference line to separate historical from projected data */}
              <ReferenceLine
                x={projectionStartYear}
                stroke={isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
                strokeDasharray="3 3"
                label={{
                  value: "Projected Data →",
                  position: "top",
                  fill: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                  fontSize: 12,
                }}
              />

              {/* Split the line into historical and projected segments */}
              <Line
                type="monotone"
                dataKey="value"
                name={metric}
                stroke={chartColor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
                strokeDasharray={(d) => (d.isProjected ? "5 5" : "0")}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
