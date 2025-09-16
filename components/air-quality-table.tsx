"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AQIData } from "@/lib/types"

interface AirQualityTableProps {
  data: AQIData[]
}

export function AirQualityTable({ data }: AirQualityTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<AQIData>[] = [
    {
      accessorKey: "CBSA",
      header: "Location",
      cell: ({ row }) => <div className="font-medium">{row.getValue("CBSA")}</div>,
    },
    {
      accessorKey: "Year",
      header: "Year",
      cell: ({ row }) => {
        const year = row.getValue("Year") as string
        const isProjected = year === "2024" || year === "2025"

        return (
          <div className="flex items-center gap-2">
            {year}
            {isProjected && (
              <Badge
                variant="outline"
                className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
              >
                Projected
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "Days with AQI",
      header: "Days with AQI",
    },
    {
      accessorKey: "Good Days",
      header: "Good Days",
    },
    {
      accessorKey: "Moderate Days",
      header: "Moderate Days",
    },
    {
      accessorKey: "Unhealthy for Sensitive Groups Days",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="p-0 hover:bg-transparent"
            >
              Unhealthy for Sensitive Groups
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: "Unhealthy Days",
      header: "Unhealthy Days",
    },
    {
      accessorKey: "Max AQI",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="p-0 hover:bg-transparent"
            >
              Max AQI
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: "Median AQI",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="p-0 hover:bg-transparent"
            >
              Median AQI
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Air Quality Data</CardTitle>
        <CardDescription>Detailed air quality metrics for all locations and years</CardDescription>
        <div className="flex items-center py-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={
                      row.getValue("Year") === "2024" || row.getValue("Year") === "2025"
                        ? "bg-yellow-50 dark:bg-yellow-950/20"
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
