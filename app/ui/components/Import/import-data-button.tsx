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
import { RadioGroup, RadioGroupItem } from "@/app/ui/design-system/radio-group"

interface ImportDataButtonProps {
  entrepriseId: number
}

export function ImportDataButton({ entrepriseId }: ImportDataButtonProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isEncrypted, setIsEncrypted] = useState(true)
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
      formData.append("isEncrypted", isEncrypted.toString())

      const response = await fetch(`/api/entreprises/${entrepriseId}/data/import`, {
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
        description: data.message || "Importation des données réussie",
      })

      // Fermer les boîtes de dialogue
      setShowA2FDialog(false)
      setIsDialogOpen(false)

      // Rafraîchir la page
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de l'importation des données:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'importation des données",
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
        <DialogContent className="sm:max-w-md lg:min-w-xl">
          <DialogHeader>
            <DialogTitle>Importer des données</DialogTitle>
            <DialogDescription>
              Sélectionnez un fichier CSV contenant les données à importer. Le fichier doit contenir les colonnes: nom,
              prenom, typeInfo, identifiant, motDePasse.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">Fichier CSV</Label>
              <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} required />
            </div>

            <div className="space-y-2">
              <Label>État des données dans le fichier</Label>
              <RadioGroup
                value={isEncrypted ? "encrypted" : "clear"}
                onValueChange={(v) => setIsEncrypted(v === "encrypted")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="encrypted" id="data-encrypted" />
                  <Label htmlFor="data-encrypted">Données déjà cryptées (provenant de cette application)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clear" id="data-clear" />
                  <Label htmlFor="data-clear">Données en clair</Label>
                </div>
                <p className="text-sm text-red-500 font-normal">
                Les données sont cryptées avec une clé propre à l’application. 
                Seuls les fichiers exportés depuis cette même application peuvent être importés ici.
                <br/>Des données cryptées importées en mode "clair" ne seront pas consultables.
                </p>
              </RadioGroup>
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
