"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/design-system/dialog"
import { Button } from "@/ui/design-system/button"
import { Input } from "@/ui/design-system/input"
import { Label } from "@/ui/design-system/label"
import { useToast } from "@/hooks/use-toast"
import { A2FVerificationDialog } from "@/ui/components/a2f-verification-dialog"

interface AddDataDialogProps {
  entrepriseId: number
  onClose: () => void
}

export function AddDataDialog({ entrepriseId, onClose }: AddDataDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [typeInfo, setTypeInfo] = useState("")
  const [identifiant, setIdentifiant] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showA2FDialog, setShowA2FDialog] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier que tous les champs sont remplis
    if (!nom || !prenom || !typeInfo || !identifiant || !motDePasse) {
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
      const response = await fetch(`/api/entreprises/${entrepriseId}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          prenom,
          typeInfo,
          identifiant,
          motDePasse,
          a2fCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout de la donnée")
      }

      toast({
        title: "Succès",
        description: "Donnée ajoutée avec succès",
      })

      // Fermer les boîtes de dialogue
      setShowA2FDialog(false)
      onClose()

      // Rafraîchir la page
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de l'ajout de la donnée:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout de la donnée",
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
            <DialogTitle>Ajouter une nouvelle donnée</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeInfo">Type d'information</Label>
              <Input id="typeInfo" value={typeInfo} onChange={(e) => setTypeInfo(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifiant">Identifiant</Label>
              <Input id="identifiant" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motDePasse">Mot de passe</Label>
              <Input
                id="motDePasse"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
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
