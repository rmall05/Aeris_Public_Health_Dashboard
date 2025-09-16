import type { AQIData } from "./types"

// Function to generate sample data for demonstration
export function generateExtendedAQIData(): AQIData[] {
  // List of major metropolitan areas
  const cities = [
    { name: "Los Angeles-Long Beach-Anaheim CA", code: "31080" },
    { name: "New York-Newark-Jersey City NY-NJ-PA", code: "35620" },
    { name: "Chicago-Naperville-Elgin IL-IN-WI", code: "16980" },
    { name: "Phoenix-Mesa-Chandler AZ", code: "38060" },
    { name: "Houston-The Woodlands-Sugar Land TX", code: "26420" },
    { name: "San Francisco-Oakland-Berkeley CA", code: "41860" },
    { name: "Denver-Aurora-Lakewood CO", code: "19740" },
    { name: "Seattle-Tacoma-Bellevue WA", code: "42660" },
  ]

  // Base values for each city (from our sample data)
  const baseValues: Record<
    string,
    {
      daysWithAQI: number
      goodDays: number
      moderateDays: number
      unhealthySensitiveDays: number
      unhealthyDays: number
      veryUnhealthyDays: number
      hazardousDays: number
      maxAQI: number
      percentile90AQI: number
      medianAQI: number
      daysCO: number
      daysNO2: number
      daysOzone: number
      daysPM25: number
      daysPM10: number
    }
  > = {
    "Los Angeles-Long Beach-Anaheim CA": {
      daysWithAQI: 365,
      goodDays: 100,
      moderateDays: 220,
      unhealthySensitiveDays: 38,
      unhealthyDays: 5,
      veryUnhealthyDays: 0,
      hazardousDays: 0,
      maxAQI: 160,
      percentile90AQI: 102,
      medianAQI: 60,
      daysCO: 0,
      daysNO2: 0,
      daysOzone: 178,
      daysPM25: 187,
      daysPM10: 0,
    },
    "New York-Newark-Jersey City NY-NJ-PA": {
      daysWithAQI: 365,
      goodDays: 155,
      moderateDays: 200,
      unhealthySensitiveDays: 10,
      unhealthyDays: 0,
      veryUnhealthyDays: 0,
      hazardousDays: 0,
      maxAQI: 122,
      percentile90AQI: 80,
      medianAQI: 47,
      daysCO: 0,
      daysNO2: 0,
      daysOzone: 118,
      daysPM25: 247,
      daysPM10: 0,
    },
    "Chicago-Naperville-Elgin IL-IN-WI": {
      daysWithAQI: 365,
      goodDays: 170,
      moderateDays: 185,
      unhealthySensitiveDays: 10,
      unhealthyDays: 0,
      veryUnhealthyDays: 0,
      hazardousDays: 0,
      maxAQI: 120,
      percentile90AQI: 77,
      medianAQI: 44,
      daysCO: 0,
      daysNO2: 0,
      daysOzone: 133,
      daysPM25: 232,
      daysPM10: 0,
    },
    "Phoenix-Mesa-Chandler AZ": {
      daysWithAQI: 365,
      goodDays: 122,
      moderateDays: 213,
      unhealthySensitiveDays: 25,
      unhealthyDays: 5,
      veryUnhealthyDays: 0,
      hazardousDays: 0,
      maxAQI: 156,
      percentile90AQI: 96,
      medianAQI: 56,
      daysCO: 0,
      daysNO2: 0,
      daysOzone: 151,
      daysPM25: 164,
      daysPM10: 50,
    },
    "Houston-The Woodlands-Sugar Land TX": {
      daysWithAQI: 365,
      goodDays: 136,
      moderateDays: 204,
      unhealthySensitiveDays: 22,
      unhealthyDays: 3,
      veryUnhealthyDays: 0,
      hazardousDays: 0,
      maxAQI: 145,
      percentile90AQI: 90,
      medianAQI: 52,
      daysCO: 0,
      daysNO2: 0,
      daysOzone: 160,
      daysPM25: 155,
      daysPM10: 50,
    },
    "San Francisco-Oakland-Berkeley CA": {
      daysWithAQI: 365,
      goodDays: 182,
      moderateDays: 173,
      unhealthySensitiveDays: 10,
      unhealthyDays: 0,
      veryUnhealthyDays: 0,
      hazardousDays: 0,
      maxAQI: 119,
      percentile90AQI: 74,
      medianAQI: 41,
      daysCO: 0,
      daysNO2: 0,
      daysOzone: 109,
      daysPM25: 206,
      daysPM10: 50,
    },
    "Denver-Aurora-Lakewood CO": {
      daysWithAQI: 365,
      goodDays: 148,
      moderateDays: 192,
      unhealthySensitiveDays: 22,
      unhealthyDays: 3,
      veryUnhealthyDays: 0,
      hazardousDays: 0,
      maxAQI: 146,
      percentile90AQI: 89,
      medianAQI: 51,
      daysCO: 0,
      daysNO2: 0,
      daysOzone: 141,
      daysPM25: 174,
      daysPM10: 50,
    },
    "Seattle-Tacoma-Bellevue WA": {
      daysWithAQI: 365,
      goodDays: 188,
      moderateDays: 167,
      unhealthySensitiveDays: 10,
      unhealthyDays: 0,
      veryUnhealthyDays: 0,
      hazardousDays: 0,
      maxAQI: 119,
      percentile90AQI: 73,
      medianAQI: 41,
      daysCO: 0,
      daysNO2: 0,
      daysOzone: 101,
      daysPM25: 214,
      daysPM10: 50,
    },
  }

  // Years to generate data for (stopping at 2024)
  const years = [2019, 2020, 2021, 2022, 2023, 2024]

  // Generate data for all cities and years
  let allData: AQIData[] = []

  for (const year of years) {
    // Generate data with slight variations based on year
    const yearData = cities.map((city) => {
      const base = baseValues[city.name]

      // Apply trend factors based on year
      let yearFactor = 1.0

      if (year >= 2023) {
        // Different trends for different cities
        if (["Los Angeles-Long Beach-Anaheim CA", "Phoenix-Mesa-Chandler AZ"].includes(city.name)) {
          // Slight worsening trend for these cities
          yearFactor = 1.05 + (year - 2023) * 0.02
        } else if (["New York-Newark-Jersey City NY-NJ-PA", "Chicago-Naperville-Elgin IL-IN-WI"].includes(city.name)) {
          // Slight improvement trend for these cities
          yearFactor = 0.95 - (year - 2023) * 0.01
        } else {
          // Neutral trend with small random variation
          yearFactor = 1.0 + (Math.random() * 0.04 - 0.02)
        }
      }

      // Apply random variation to make data look realistic
      const randomFactor = () => 1.0 + (Math.random() * 0.06 - 0.03)

      // Calculate days with leap year adjustment
      const daysInYear = year % 4 === 0 ? 366 : 365

      return {
        CBSA: city.name,
        "CBSA Code": city.code,
        Year: year.toString(),
        "Days with AQI": daysInYear.toString(),
        "Good Days": Math.round(base.goodDays * yearFactor * randomFactor()).toString(),
        "Moderate Days": Math.round(base.moderateDays * yearFactor * randomFactor()).toString(),
        "Unhealthy for Sensitive Groups Days": Math.round(
          base.unhealthySensitiveDays * yearFactor * randomFactor(),
        ).toString(),
        "Unhealthy Days": Math.round(base.unhealthyDays * yearFactor * randomFactor()).toString(),
        "Very Unhealthy Days": "0",
        "Hazardous Days": "0",
        "Max AQI": Math.round(base.maxAQI * yearFactor * randomFactor()).toString(),
        "90th Percentile AQI": Math.round(base.percentile90AQI * yearFactor * randomFactor()).toString(),
        "Median AQI": Math.round(base.medianAQI * yearFactor * randomFactor()).toString(),
        "Days CO": base.daysCO.toString(),
        "Days NO2": base.daysNO2.toString(),
        "Days Ozone": Math.round(base.daysOzone * yearFactor * randomFactor()).toString(),
        "Days PM2.5": Math.round(base.daysPM25 * yearFactor * randomFactor()).toString(),
        "Days PM10": base.daysPM10.toString(),
      }
    })

    allData = [...allData, ...yearData]
  }

  return allData
}
