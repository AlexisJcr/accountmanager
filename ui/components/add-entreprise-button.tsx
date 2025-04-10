"use client"

import { useState } from "react"
import { Button } from "@/ui/design-system/button"
import { Plus } from "lucide-react"
import { AddEnterpriseDialog } from "@/ui/components/add-entreprise-dialog"

export function AddEnterpriseButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une entreprise
      </Button>

      {isDialogOpen && <AddEnterpriseDialog onClose={() => setIsDialogOpen(false)} />}
    </>
  )
}
