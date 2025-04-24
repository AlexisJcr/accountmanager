"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/app/ui/design-system/button"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/app/ui/design-system/dialog"
import { Label } from "@/app/ui/design-system/label"
import { Input } from "@/app/ui/design-system/input"
import { A2FVerificationDialog } from "@/app/ui/components/Auth/a2f-verification-dialog"

export function ImportEnterprisesButton() {
  const { toast } = useToast()
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [showA2FDialog, setShowA2FDialog] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier CSV",
        variant: "destructive",
      })
      return
    }

    // Vérifier l'extension du fichier
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Erreur",
        description: "Le fichier doit être au format CSV",
        variant: "destructive",
      })
      return
    }

    setShowA2FDialog(true)
  }

  const handleA2FVerification = async (a2fCode: string) => {
    if (!file) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("a2fCode", a2fCode)

      const response = await fetch("/api/entreprises/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'importation")
      }

      toast({
        title: "Succès",
        description: data.message || "Importation des entreprises réussie",
      })

      // Fermer les boîtes de dialogue
      setShowA2FDialog(false)
      setIsDialogOpen(false)

      // Rafraîchir la page
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de l'importation des entreprises:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'importation des entreprises",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Importer
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importer des entreprises</DialogTitle>
            <DialogDescription>
              Sélectionnez un fichier CSV contenant les entreprises à importer. Le fichier doit contenir les colonnes:
              nom, adresse, telephone, couleur.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">Fichier CSV</Label>
              <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} required />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading || !file}>
                {isLoading ? "Importation..." : "Importer"}
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
