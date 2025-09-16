"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import type { AQIData } from "@/lib/types"

interface AirQualityFiltersProps {
  data: AQIData[]
  selectedYear: string | null
  selectedLocation: string | null
  onYearChange: (year: string | null) => void
  onLocationChange: (location: string | null) => void
}

export function AirQualityFilters({
  data,
  selectedYear,
  selectedLocation,
  onYearChange,
  onLocationChange,
}: AirQualityFiltersProps) {
  const [yearOpen, setYearOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)

  const years = [...new Set(data.map((item) => item.Year))].sort().reverse()
  const locations = [...new Set(data.map((item) => item.CBSA))].sort()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Year</label>
            <Popover open={yearOpen} onOpenChange={setYearOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={yearOpen} className="w-full justify-between">
                  {selectedYear ? selectedYear : "Select year..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search year..." />
                  <CommandList>
                    <CommandEmpty>No year found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          onYearChange(null)
                          setYearOpen(false)
                        }}
                        className="justify-between"
                      >
                        All Years
                        {!selectedYear && <Check className="h-4 w-4" />}
                      </CommandItem>
                      {years.map((year) => (
                        <CommandItem
                          key={year}
                          onSelect={() => {
                            onYearChange(year)
                            setYearOpen(false)
                          }}
                          className="justify-between"
                        >
                          {year}
                          {selectedYear === year && <Check className="h-4 w-4" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={locationOpen}
                  className="w-full justify-between"
                >
                  {selectedLocation ? selectedLocation : "Select location..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search location..." />
                  <CommandList>
                    <CommandEmpty>No location found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          onLocationChange(null)
                          setLocationOpen(false)
                        }}
                        className="justify-between"
                      >
                        All Locations
                        {!selectedLocation && <Check className="h-4 w-4" />}
                      </CommandItem>
                      {locations.map((location) => (
                        <CommandItem
                          key={location}
                          onSelect={() => {
                            onLocationChange(location)
                            setLocationOpen(false)
                          }}
                          className="justify-between"
                        >
                          {location}
                          {selectedLocation === location && <Check className="h-4 w-4" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                onYearChange(null)
                onLocationChange(null)
              }}
              className="w-full sm:w-auto"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
