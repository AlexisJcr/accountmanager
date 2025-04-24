"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/app/ui/design-system/dialog"
import { Button } from "@/app/ui/design-system/button"
import { useToast } from "@/hooks/use-toast"
import { A2FVerificationDialog } from "@/app/ui/components/Auth/a2f-verification-dialog"

interface Admin {
  id: number
  nom: string
  prenom: string
  identifiant: string
  role: string
}

interface DeleteAdminDialogProps {
  admin: Admin
  onClose: () => void
}

export function DeleteAdminDialog({ admin, onClose }: DeleteAdminDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [showA2FDialog, setShowA2FDialog] = useState(false)

  const handleDelete = () => {
    // Vérifier si c'est le compte superadmin
    if (admin.role === "superadmin") {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte superadmin",
        variant: "destructive",
      })
      return
    }

    // Ouvrir la boîte de dialogue de vérification A2F
    setShowA2FDialog(true)
  }

  const handleA2FVerification = async (a2fCode: string) => {
    setIsLoading(true)

    try {
      // Préparer les en-têtes avec le token d'authentification
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      const response = await fetch(`/api/admin/${admin.id}`, {
        method: "DELETE",
        headers,
        credentials: "include", // Inclure les cookies
        body: JSON.stringify({
          a2fCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression de l'administrateur")
      }

      toast({
        title: "Succès",
        description: "Administrateur supprimé avec succès",
      })

      // Fermer les boîtes de dialogue
      setShowA2FDialog(false)
      onClose()

      // Rafraîchir la page
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de la suppression de l'administrateur:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression de l'administrateur",
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
            <DialogTitle>Supprimer l'administrateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <p>
                <strong>Nom :</strong> {admin.nom}
              </p>
              <p>
                <strong>Prénom :</strong> {admin.prenom}
              </p>
              <p>
                <strong>Identifiant :</strong> {admin.identifiant}
              </p>
              <p>
                <strong>Rôle :</strong> {admin.role}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || admin.role === "superadmin"}
            >
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
