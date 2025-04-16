"use client"

import { useState } from "react"
import { Button } from "@/ui/design-system/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/design-system/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/ui/design-system/dialog"
import { Label } from "@/ui/design-system/label"
import { Input } from "@/ui/design-system/input"
import { RadioGroup, RadioGroupItem } from "@/ui/design-system/radio-group"

interface ExportDataButtonProps {
  entrepriseId: number
  isSuperAdmin: boolean
}

export function ExportDataButton({ entrepriseId, isSuperAdmin }: ExportDataButtonProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [exportType, setExportType] = useState<"encrypted" | "clear">("encrypted")
  const [superadminPassword, setSuperadminPassword] = useState("")
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const handleExportClick = () => {
    if (!isSuperAdmin) {
      toast({
        title: "Accès refusé",
        description: "Seul le superadmin peut exporter les données",
        variant: "destructive",
      })
      return
    }

    setIsDialogOpen(true)
  }

  const handleExportTypeChange = (value: "encrypted" | "clear") => {
    setExportType(value)
    setShowPasswordConfirmation(value === "clear")
  }

  const handleExport = async () => {
    if (!isSuperAdmin) return

    // Vérifier si le mot de passe est requis et fourni
    if (exportType === "clear" && !superadminPassword) {
      toast({
        title: "Erreur",
        description: "Le mot de passe superadmin est requis pour l'exportation en clair",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/entreprises/${entrepriseId}/data/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exportType,
          superadminPassword: exportType === "clear" ? superadminPassword : undefined,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'exportation")
      }

      // Créer un lien pour télécharger le fichier
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `data_entreprise_${entrepriseId}_${exportType}_${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Succès",
        description: "Exportation des données réussie",
      })

      // Fermer la boîte de dialogue
      setIsDialogOpen(false)
      setSuperadminPassword("")
    } catch (error) {
      console.error("Erreur lors de l'exportation des données:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'exportation des données",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button variant="outline" disabled className="cursor-not-allowed">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Seul le superadmin peut exporter les données</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <>
      <Button variant="outline" onClick={handleExportClick}>
        <Download className="h-4 w-4 mr-2" />
        Exporter
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter les données</DialogTitle>
            <DialogDescription>
              Choisissez le format d'exportation des données. L'exportation en clair peut compromettre la sécurité de
              vos données.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Format d'exportation</Label>
              <RadioGroup
                value={exportType}
                onValueChange={(value) => handleExportTypeChange(value as "encrypted" | "clear")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="encrypted" id="encrypted" />
                  <Label htmlFor="encrypted">Données cryptées</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clear" id="clear" />
                  <Label htmlFor="clear">Données en clair (non sécurisé)</Label>
                </div>
              </RadioGroup>
            </div>

            {showPasswordConfirmation && (
              <div className="space-y-2">
                <Label htmlFor="superadminPassword">Mot de passe superadmin</Label>
                <Input
                  id="superadminPassword"
                  type="password"
                  value={superadminPassword}
                  onChange={(e) => setSuperadminPassword(e.target.value)}
                  required
                />
                <p className="text-sm text-red-600 font-medium">
                  Attention: Vous vous apprêtez à exporter les données sans cryptage, cela peut compromettre la sécurité
                  des données.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              className={`${exportType === "clear" ? "bg-red-600 text-white" : ""
              }`}
              onClick={handleExport}
              disabled={isLoading || (exportType === "clear" && !superadminPassword)}
              variant={exportType === "clear" ? "destructive" : "default"}
            >
              {isLoading ? "Exportation..." : "Exporter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
