"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/ui/design-system/card"
import { Building, Edit, Trash2 } from "lucide-react"
import { Button } from "@/ui/design-system/button"
import type { Entreprise } from "@/lib/db/schema"
import { EditEnterpriseDialog } from "@/ui/components/Entreprise/edit-entreprise-dialog"
import { DeleteEnterpriseDialog } from "@/ui/components/Entreprise/delete-entreprise-dialog"

interface EnterpriseGridProps {
  entreprises: Entreprise[]
}

export function EnterpriseGrid({ entreprises }: EnterpriseGridProps) {
  const [editingEnterprise, setEditingEnterprise] = useState<Entreprise | null>(null)
  const [deletingEnterprise, setDeletingEnterprise] = useState<Entreprise | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {entreprises.map((entreprise) => (
          <Card key={entreprise.id} className="hover:shadow-md hover:shadow-gray-400 transition-shadow h-full">
          <CardContent className="flex flex-col items-center justify-between p-6 h-full">
            <div className="flex flex-col items-center">
              <Building
                className="h-12 w-12 mb-4"
                style={{ color: entreprise.couleur || "#22c55e" }}
              />
              <Link href={`/accstorage/${entreprise.id}`} className="w-full text-center">
                <h2 className="text-xl font-semibold mb-2">{entreprise.nom}</h2>
                <p className="text-center text-primary text-sm">{entreprise.adresse}</p>
                <p className="text-center text-gray-700 text-sm mt-1">{entreprise.telephone}</p>
              </Link>
            </div>
        
            <div className="mt-4 flex justify-center space-x-2">
              <Button
                variant="default"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault()
                  setEditingEnterprise(entreprise)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault()
                  setDeletingEnterprise(entreprise)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
            </div>
          </CardContent>
        </Card>
        ))}
      </div>
      {editingEnterprise && (
        <EditEnterpriseDialog entreprise={editingEnterprise} onClose={() => setEditingEnterprise(null)} />
      )}

      {deletingEnterprise && (
        <DeleteEnterpriseDialog entreprise={deletingEnterprise} onClose={() => setDeletingEnterprise(null)} />
      )}
    </>
  )
}
