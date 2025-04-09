"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/ui/design-system/dialog"
import { Button } from "@/ui/design-system/button"
import { useToast } from "@/hooks/use-toast"
import { A2FVerificationDialog } from "@/ui/components/a2f-verification-dialog"
import type { Data } from "@/lib/db/schema"

interface DeleteDataDialogProps {
  data: Data
  onClose: () => void
}

export function DeleteDataDialog({ data, onClose }: DeleteDataDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [showA2FDialog, setShowA2FDialog] = useState(false)

  const handleDelete = () => {
    // Ouvrir la boîte de dialogue de vérification A2F
    setShowA2FDialog(true)
  }

  const handleA2FVerification = async (a2fCode: string) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/data/${data.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          a2fCode,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Erreur lors de la suppression de la donnée")
      }

      toast({
        title: "Succès",
        description: "Donnée supprimée avec succès",
      })

      // Fermer les boîtes de dialogue
      setShowA2FDialog(false)
      onClose()

      // Rafraîchir la page
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de la suppression de la donnée:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression de la donnée",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer la donnée</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette donnée ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <p>
                <strong>Nom :</strong> {data.nom}
              </p>
              <p>
                <strong>Prénom :</strong> {data.prenom}
              </p>
              <p>
                <strong>Type :</strong> {data.typeInfo}
              </p>
              <p>
                <strong>Identifiant :</strong> {data.identifiant}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Suppression en cours..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showA2FDialog && (
        <A2FVerificationDialog
          onVerify={handleA2FVerification}
          onCancel={() => setShowA2FDialog(false)}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
