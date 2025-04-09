"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/design-system/table"
import { Button } from "@/ui/design-system/button"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import type { Data } from "@/lib/db/schema"
import { EditDataDialog } from "@/ui/components/edit-data-dialog"
import { DeleteDataDialog } from "@/ui/components/delete-data-dialog"

interface DataTableProps {
  data: Data[]
  entrepriseId: number
}

export function DataTable({ data, entrepriseId }: DataTableProps) {
  const [editingData, setEditingData] = useState<Data | null>(null)
  const [deletingData, setDeletingData] = useState<Data | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({})

  // Fonction pour basculer la visibilité du mot de passe
  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Identifiant</TableHead>
              <TableHead>Mot de passe</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  Aucune donnée disponible
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nom}</TableCell>
                  <TableCell>{item.prenom}</TableCell>
                  <TableCell>{item.typeInfo}</TableCell>
                  <TableCell>{item.identifiant}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{visiblePasswords[item.id] ? item.motDePasse : "••••••••"}</span>
                      <Button variant="ghost" size="icon" onClick={() => togglePasswordVisibility(item.id)}>
                        {visiblePasswords[item.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => setEditingData(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setDeletingData(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingData && (
        <EditDataDialog data={editingData} entrepriseId={entrepriseId} onClose={() => setEditingData(null)} />
      )}

      {deletingData && <DeleteDataDialog data={deletingData} onClose={() => setDeletingData(null)} />}
    </>
  )
}
