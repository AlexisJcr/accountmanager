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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/design-system/select"

interface AddAdminDialogProps {
  onClose: () => void
}

export function AddAdminDialog({ onClose }: AddAdminDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [identifiant, setIdentifiant] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [role, setRole] = useState("sous-admin")
  const [isLoading, setIsLoading] = useState(false)
  const [showA2FDialog, setShowA2FDialog] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier que tous les champs sont remplis
    if (!nom || !prenom || !identifiant || !motDePasse || !role) {
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

      const response = await fetch(`/api/admin`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          nom,
          prenom,
          identifiant,
          motDePasse,
          role,
          a2fCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout de l'administrateur")
      }

      toast({
        title: "Succès",
        description: "Administrateur ajouté avec succès",
      })

      // Fermer les boîtes de dialogue
      setShowA2FDialog(false)
      onClose()

      // Rafraîchir la page
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'administrateur:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'administrateur",
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
            <DialogTitle>Ajouter un nouvel administrateur</DialogTitle>
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

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sous-admin">Sous-admin</SelectItem>
                </SelectContent>
              </Select>
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
