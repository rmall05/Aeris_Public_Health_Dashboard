"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AirQualityOverview } from "@/components/air-quality-overview"
import { AirQualityTrends } from "@/components/air-quality-trends"
import { AirQualityComparison } from "@/components/air-quality-comparison"
import { AirQualityTable } from "@/components/air-quality-table"
import { AirQualityFilters } from "@/components/air-quality-filters"
import { AirQualityPredictive } from "@/components/air-quality-predictive"
import { AirQualityPredictiveComparison } from "@/components/air-quality-predictive-comparison"
import { Loader2 } from "lucide-react"
import { generateExtendedAQIData } from "@/lib/generate-epa-data"
import type { AQIData } from "@/lib/types"

export default function Dashboard() {
  const [data, setData] = useState<AQIData[]>([])
  const [filteredData, setFilteredData] = useState<AQIData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    const loadData = () => {
      try {
        // Generate extended EPA data
        const extendedData = generateExtendedAQIData()

        if (!extendedData || extendedData.length === 0) {
          throw new Error("Failed to generate data")
        }

        setData(extendedData)
        setFilteredData(extendedData)
        setDataLoaded(true)

        // Set initial year to the most recent one (2024)
        const years = [...new Set(extendedData.map((item) => item.Year))].sort().reverse()
        if (years.length > 0) {
          setSelectedYear(years[0])
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!data || data.length === 0) return

    let result = [...data]

    if (selectedYear) {
      result = result.filter((item) => item.Year === selectedYear)
    }

    if (selectedLocation) {
      result = result.filter((item) => item.CBSA === selectedLocation)
    }

    setFilteredData(result)
  }, [data, selectedYear, selectedLocation])

  const handleYearChange = (year: string | null) => {
    setSelectedYear(year)
  }

  const handleLocationChange = (location: string | null) => {
    setSelectedLocation(location)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading AQI data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4">Please try refreshing the page or check if the data source is available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Air Quality Index Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze and visualize annual Air Quality Index (AQI) data across different metropolitan areas.
        </p>
      </div>

      <AirQualityFilters
        data={data}
        selectedYear={selectedYear}
        selectedLocation={selectedLocation}
        onYearChange={handleYearChange}
        onLocationChange={handleLocationChange}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analysis</TabsTrigger>
          <TabsTrigger value="data">Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AirQualityOverview data={filteredData} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <AirQualityTrends data={data} selectedLocation={selectedLocation} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <AirQualityComparison data={filteredData} />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          {dataLoaded && (
            <>
              <AirQualityPredictive data={data} />
              <AirQualityPredictiveComparison data={data} />
            </>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <AirQualityTable data={filteredData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
