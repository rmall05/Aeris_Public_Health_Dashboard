"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Thermometer, AlertTriangle, Gauge } from "lucide-react"
import type { AQIData } from "@/lib/types"

interface AirQualityOverviewProps {
  data: AQIData[]
}

export function AirQualityOverview({ data }: AirQualityOverviewProps) {
  // Calculate averages and statistics
  const calculateStats = () => {
    if (data.length === 0) return null

    const totalLocations = new Set(data.map((item) => item.CBSA)).size

    const avgGoodDays = Math.round(
      data.reduce((sum, item) => sum + Number.parseInt(item["Good Days"] || "0", 10), 0) / data.length,
    )

    const avgModerateDays = Math.round(
      data.reduce((sum, item) => sum + Number.parseInt(item["Moderate Days"] || "0", 10), 0) / data.length,
    )

    const avgUnhealthyDays = Math.round(
      data.reduce((sum, item) => {
        const sensitiveGroupDays = Number.parseInt(item["Unhealthy for Sensitive Groups Days"] || "0", 10)
        const unhealthyDays = Number.parseInt(item["Unhealthy Days"] || "0", 10)
        const veryUnhealthyDays = Number.parseInt(item["Very Unhealthy Days"] || "0", 10)
        const hazardousDays = Number.parseInt(item["Hazardous Days"] || "0", 10)
        return sum + sensitiveGroupDays + unhealthyDays + veryUnhealthyDays + hazardousDays
      }, 0) / data.length,
    )

    const maxAQI = Math.max(...data.map((item) => Number.parseInt(item["Max AQI"] || "0", 10)))
    const medianAQI = Math.round(
      data.reduce((sum, item) => sum + Number.parseInt(item["Median AQI"] || "0", 10), 0) / data.length,
    )

    // Calculate pollutant days
    const totalOzoneDays = data.reduce((sum, item) => sum + Number.parseInt(item["Days Ozone"] || "0", 10), 0)
    const totalPM25Days = data.reduce((sum, item) => sum + Number.parseInt(item["Days PM2.5"] || "0", 10), 0)
    const totalPM10Days = data.reduce((sum, item) => sum + Number.parseInt(item["Days PM10"] || "0", 10), 0)
    const totalCODays = data.reduce((sum, item) => sum + Number.parseInt(item["Days CO"] || "0", 10), 0)
    const totalNO2Days = data.reduce((sum, item) => sum + Number.parseInt(item["Days NO2"] || "0", 10), 0)

    const totalPollutantDays = totalOzoneDays + totalPM25Days + totalPM10Days + totalCODays + totalNO2Days

    return {
      totalLocations,
      avgGoodDays,
      avgModerateDays,
      avgUnhealthyDays,
      maxAQI,
      medianAQI,
      pollutants: {
        ozone: {
          days: totalOzoneDays,
          percentage: totalPollutantDays > 0 ? (totalOzoneDays / totalPollutantDays) * 100 : 0,
        },
        pm25: {
          days: totalPM25Days,
          percentage: totalPollutantDays > 0 ? (totalPM25Days / totalPollutantDays) * 100 : 0,
        },
        pm10: {
          days: totalPM10Days,
          percentage: totalPollutantDays > 0 ? (totalPM10Days / totalPollutantDays) * 100 : 0,
        },
        co: {
          days: totalCODays,
          percentage: totalPollutantDays > 0 ? (totalCODays / totalPollutantDays) * 100 : 0,
        },
        no2: {
          days: totalNO2Days,
          percentage: totalPollutantDays > 0 ? (totalNO2Days / totalPollutantDays) * 100 : 0,
        },
      },
    }
  }

  const stats = calculateStats()

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>Please adjust your filters to see air quality data.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", color: "bg-green-500" }
    if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500" }
    if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-500" }
    if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500" }
    if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500" }
    return { label: "Hazardous", color: "bg-rose-900" }
  }

  const maxAQICategory = getAQICategory(stats.maxAQI)
  const medianAQICategory = getAQICategory(stats.medianAQI)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Locations</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9Z" />
            <path d="M12 7v5l3 3" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLocations}</div>
          <p className="text-xs text-muted-foreground">Metropolitan areas in the dataset</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Max AQI</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.maxAQI}</div>
          <div className="mt-2 flex items-center">
            <Badge className={`${maxAQICategory.color} text-white`}>{maxAQICategory.label}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Median AQI</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.medianAQI}</div>
          <div className="mt-2 flex items-center">
            <Badge className={`${medianAQICategory.color} text-white`}>{medianAQICategory.label}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unhealthy Days</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgUnhealthyDays}</div>
          <p className="text-xs text-muted-foreground">Average days with unhealthy air quality</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Air Quality Distribution</CardTitle>
          <CardDescription>Average number of days in each air quality category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span>Good</span>
                </div>
                <span className="font-medium">{stats.avgGoodDays} days</span>
              </div>
              <Progress value={stats.avgGoodDays} max={365} className="h-2 bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span>Moderate</span>
                </div>
                <span className="font-medium">{stats.avgModerateDays} days</span>
              </div>
              <Progress value={stats.avgModerateDays} max={365} className="h-2 bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span>Unhealthy</span>
                </div>
                <span className="font-medium">{stats.avgUnhealthyDays} days</span>
              </div>
              <Progress value={stats.avgUnhealthyDays} max={365} className="h-2 bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Main Pollutants</CardTitle>
          <CardDescription>Distribution of days where each pollutant was the main contributor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span>Ozone (O₃)</span>
                </div>
                <span className="font-medium">{stats.pollutants.ozone.days} days</span>
              </div>
              <Progress value={stats.pollutants.ozone.percentage} className="h-2 bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-500" />
                  <span>Fine Particles (PM2.5)</span>
                </div>
                <span className="font-medium">{stats.pollutants.pm25.days} days</span>
              </div>
              <Progress value={stats.pollutants.pm25.percentage} className="h-2 bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span>Coarse Particles (PM10)</span>
                </div>
                <span className="font-medium">{stats.pollutants.pm10.days} days</span>
              </div>
              <Progress value={stats.pollutants.pm10.percentage} className="h-2 bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500" />
                  <span>Carbon Monoxide (CO)</span>
                </div>
                <span className="font-medium">{stats.pollutants.co.days} days</span>
              </div>
              <Progress value={stats.pollutants.co.percentage} className="h-2 bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span>Nitrogen Dioxide (NO₂)</span>
                </div>
                <span className="font-medium">{stats.pollutants.no2.days} days</span>
              </div>
              <Progress value={stats.pollutants.no2.percentage} className="h-2 bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
