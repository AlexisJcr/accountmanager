"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/ui/design-system/table"
import { Button } from "@/app/ui/design-system/button"
import { Edit, Trash2 } from "lucide-react"
import { EditAdminDialog } from "@/app/ui/components/Admin/edit-admin-dialog"
import { DeleteAdminDialog } from "@/app/ui/components/Admin/delete-admin-dialog"

interface Admin {
  id: number
  nom: string
  prenom: string
  identifiant: string
  role: string
  createdAt: string
  updatedAt: string
}

interface AdminTableProps {
  admins: Admin[]
}

export function AdminTable({ admins }: AdminTableProps) {
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Identifiant</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  Aucun administrateur disponible
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <span
                      className={`px-2 py-1 ${admin.role === "superadmin" ? "text-red-600" : ""
                        }`}
                    >
                      {admin.nom}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 ${admin.role === "superadmin" ? "text-red-600" : ""
                        }`}
                    >
                      {admin.prenom}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs ${admin.role === "superadmin" ? "text-gray-800" : ""
                        }`}
                    >
                      {admin.identifiant}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${admin.role === "superadmin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {admin.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => setEditingAdmin(admin)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeletingAdmin(admin)}
                        disabled={admin.role === "superadmin"}
                      >
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

      {editingAdmin && <EditAdminDialog admin={editingAdmin} onClose={() => setEditingAdmin(null)} />}

      {deletingAdmin && <DeleteAdminDialog admin={deletingAdmin} onClose={() => setDeletingAdmin(null)} />}
    </>
  )
}
