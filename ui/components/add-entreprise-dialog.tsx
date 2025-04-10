"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/design-system/dialog"
import { Button } from "@/ui/design-system/button"
import { Input } from "@/ui/design-system/input"
import { Label } from "@/ui/design-system/label"
import { useToast } from "@/hooks/use-toast"
import { A2FVerificationDialog } from "@/ui/components/a2f-verification-dialog"

interface AddEnterpriseDialogProps {
  onClose: () => void
}

export function AddEnterpriseDialog({ onClose }: AddEnterpriseDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [nom, setNom] = useState("")
  const [adresse, setAdresse] = useState("")
  const [telephone, setTelephone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showA2FDialog, setShowA2FDialog] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier que tous les champs sont remplis
    if (!nom || !adresse || !telephone) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
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

      // Ajouter le token d'authentification s'il est disponible
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      console.log("En-têtes de la requête:", headers)

      const response = await fetch(`/api/entreprises`, {
        method: "POST",
        headers,
        credentials: "include", // Inclure les cookies
        body: JSON.stringify({
          nom,
          adresse,
          telephone,
          a2fCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout de l'entreprise")
      }

      toast({
        title: "Succès",
        description: "Entreprise ajoutée avec succès",
      })

      // Fermer les boîtes de dialogue
      setShowA2FDialog(false)
      onClose()

      // Rafraîchir la page
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'entreprise:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'entreprise",
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
            <DialogTitle>Ajouter une nouvelle entreprise</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de l'entreprise</Label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Ajout en cours..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
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
