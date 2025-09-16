"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import type { AQIData } from "@/lib/types"

interface AirQualityComparisonProps {
  data: AQIData[]
}

export function AirQualityComparison({ data }: AirQualityComparisonProps) {
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
    // Group by location and calculate average for the selected metric
    const locationData: Record<string, { sum: number; count: number; hasProjectedData: boolean }> = {}

    data.forEach((item) => {
      const location = item.CBSA
      const value = Number.parseInt(item[metric] || "0", 10)
      const isProjectedYear = item.Year === "2024" || item.Year === "2025"

      if (!locationData[location]) {
        locationData[location] = { sum: 0, count: 0, hasProjectedData: false }
      }

      locationData[location].sum += value
      locationData[location].count += 1

      if (isProjectedYear) {
        locationData[location].hasProjectedData = true
      }
    })

    // Convert to array and sort by value
    return Object.entries(locationData)
      .map(([location, { sum, count, hasProjectedData }]) => ({
        location,
        value: Math.round(sum / count),
        hasProjectedData,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 locations
  }, [data, metric])

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

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Top 10 Locations by {metric}</CardTitle>
          <CardDescription>Comparing air quality metrics across different metropolitan areas</CardDescription>
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
      <CardContent className="h-[500px]">
        <ChartContainer
          config={{
            [metric]: {
              label: metric,
              color: chartColor,
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 150, bottom: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
              />
              <XAxis type="number" stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
              <YAxis
                type="category"
                dataKey="location"
                width={140}
                stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"}
                tickFormatter={(value) => {
                  // Truncate long location names
                  return value.length > 20 ? value.substring(0, 20) + "..." : value
                }}
                tick={(props) => {
                  const { x, y, payload } = props
                  const item = chartData.find((d) => d.location === payload.value)
                  const hasProjectedData = item?.hasProjectedData

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-3} y={0} dy={4} textAnchor="end" fill={props.stroke}>
                        {payload.value.length > 20 ? payload.value.substring(0, 20) + "..." : payload.value}
                        {hasProjectedData && " *"}
                      </text>
                    </g>
                  )
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => {
                      const item = props.payload
                      return [value, `${name}${item.hasProjectedData ? " (includes projected data)" : ""}`]
                    }}
                  />
                }
              />
              <Legend />
              <Bar
                dataKey="value"
                name={metric}
                fill={chartColor}
                radius={[0, 4, 4, 0]}
                fillOpacity={(data) => (data.hasProjectedData ? 0.7 : 1)}
                stroke={(data) => (data.hasProjectedData ? chartColor : "none")}
                strokeWidth={(data) => (data.hasProjectedData ? 1 : 0)}
                strokeDasharray={(data) => (data.hasProjectedData ? "5 5" : "0")}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="text-xs text-muted-foreground mt-4">* Includes projected data for 2024-2025</div>
      </CardContent>
    </Card>
  )
}
