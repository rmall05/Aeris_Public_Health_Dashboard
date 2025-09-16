import type { AQIData } from "./types"

export function parseAQIData(csvText: string): AQIData[] {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",")

  const data: AQIData[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = lines[i].split(",")
    const row: Record<string, string> = {}

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ""
    }

    data.push(row as AQIData)
  }

  return data
}
