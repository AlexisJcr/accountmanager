"use client"

import { useMemo, useState } from "react"
import { DataTable } from "@/app/ui/components/Data/data-table"

interface DataPageClientProps {
  data: any[]
  entrepriseId: number
}

export function DataSearchBar({ data, entrepriseId }: DataPageClientProps) {
  const [search, setSearch] = useState("")

  const filteredData = useMemo(() => {
    if (!search) return data
  
    const lowerSearch = search.toLowerCase()
  
    return data.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "string" && value.toLowerCase().includes(lowerSearch)
      )
    )
  }, [search, data])
  

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded border bg-white border-gray-300 shadow-sm"
        />
      </div>

      <DataTable data={filteredData} entrepriseId={entrepriseId} />
    </>
  )
}
