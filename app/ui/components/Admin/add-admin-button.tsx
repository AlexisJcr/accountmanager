"use client"

import { useState } from "react"
import { Button } from "@/app/ui/design-system/button"
import { Plus } from "lucide-react"
import { AddAdminDialog } from "@/app/ui/components/Admin/add-admin-dialog"

export function AddAdminButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un administrateur
      </Button>

      {isDialogOpen && <AddAdminDialog onClose={() => setIsDialogOpen(false)} />}
    </>
  )
}
