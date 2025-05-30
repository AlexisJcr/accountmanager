"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/design-system/dialog"
import { Button } from "@/ui/design-system/button"
import { Input } from "@/ui/design-system/input"
import { Label } from "@/ui/design-system/label"
import { useToast } from "@/hooks/use-toast"
import { A2FVerificationDialog } from "@/ui/components/Auth/a2f-verification-dialog"
import { Building } from "lucide-react"
import type { Entreprise } from "@/lib/db/schema"

interface EditEnterpriseDialogProps {
  entreprise: Entreprise
  onClose: () => void
}

export function EditEnterpriseDialog({ entreprise, onClose }: EditEnterpriseDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [nom, setNom] = useState(entreprise.nom)
  const [adresse, setAdresse] = useState(entreprise.adresse)
  const [telephone, setTelephone] = useState(entreprise.telephone)
  const [couleur, setCouleur] = useState(entreprise.couleur || "#22c55e")
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

      const response = await fetch(`/api/entreprises/${entreprise.id}`, {
        method: "PUT",
        headers,
        credentials: "include", // Inclure les cookies
        body: JSON.stringify({
          nom,
          adresse,
          telephone,
          couleur,
          a2fCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la modification de l'entreprise")
      }

      toast({
        title: "Succès",
        description: "Entreprise modifiée avec succès",
      })

      // Fermer les boîtes de dialogue
      setShowA2FDialog(false)
      onClose()

      // Rafraîchir la page
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de la modification de l'entreprise:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la modification de l'entreprise",
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
            <DialogTitle>Modifier l'entreprise</DialogTitle>
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

            <div className="space-y-2">
              <Label htmlFor="couleur">Couleur de l'icône</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="couleur"
                  type="color"
                  value={couleur}
                  onChange={(e) => setCouleur(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Building className="h-8 w-8" style={{ color: couleur }} />
                <span className="text-sm">{couleur}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Modification en cours..." : "Modifier"}
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
