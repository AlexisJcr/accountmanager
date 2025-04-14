"use client"

import Link from "next/link"
import { Card, CardContent } from "@/ui/design-system/card"
import { Building } from "lucide-react"
import type { Entreprise } from "@/lib/db/schema"

interface EnterpriseGridProps {
  entreprises: Entreprise[]
}

export function EnterpriseGrid({ entreprises }: EnterpriseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {entreprises.map((entreprise) => (
        <Link key={entreprise.id} href={`/accstorage/${entreprise.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <Building className="h-12 w-12 mb-4 text-green-600" />
              <h2 className="text-xl font-semibold mb-2">{entreprise.nom}</h2>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">{entreprise.adresse}</p>
              <p className="text-center text-gray-500 dark:text-gray-500 text-sm mt-1">{entreprise.telephone}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
