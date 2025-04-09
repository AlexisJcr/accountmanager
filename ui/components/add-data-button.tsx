"use client"

import { useState } from "react"
import { Button } from "@/ui/design-system/button"
import { Plus } from "lucide-react"
import { AddDataDialog } from "@/ui/components/add-data-dialog"

interface AddDataButtonProps {
  entrepriseId: number
}

export function AddDataButton({ entrepriseId }: AddDataButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une donnée
      </Button>

      {isDialogOpen && <AddDataDialog entrepriseId={entrepriseId} onClose={() => setIsDialogOpen(false)} />}
    </>
  )
}
