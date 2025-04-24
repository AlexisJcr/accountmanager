"use client"

import { useState } from "react"
import { Button } from "@/app/ui/design-system/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/ui/design-system/tooltip"

interface ExportEnterprisesButtonProps {
  isSuperAdmin: boolean
}

export function ExportEnterprisesButton({ isSuperAdmin }: ExportEnterprisesButtonProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Accès refusé",
        description: "Seul le superadmin peut exporter les données",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/entreprises/export", {
        method: "GET",
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
      a.download = `entreprises_${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Succès",
        description: "Exportation des entreprises réussie",
      })
    } catch (error) {
      console.error("Erreur lors de l'exportation des entreprises:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'exportation des entreprises",
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
    <Button variant="outline" onClick={handleExport} disabled={isLoading}>
      <Download className="h-4 w-4 mr-2" />
      {isLoading ? "Exportation..." : "Exporter"}
    </Button>
  )
}
