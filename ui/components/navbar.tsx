"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/ui/design-system/button"
import { ArrowLeft, Building, Database, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface NavbarProps {
  title: string
  showBackButton?: boolean
  backUrl?: string
  icon?: "Building" | "Database"
}

export function Navbar({ title, showBackButton = false, backUrl = "/", icon }: NavbarProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null)

  // Fonction pour réinitialiser le timer d'inactivité
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    // Définir un nouveau timer (15 minutes)
    const newTimer = setTimeout(
      () => {
        handleLogout()
        toast({
          title: "Session expirée",
          description: "Vous avez été déconnecté en raison d'inactivité.",
          variant: "destructive",
        })
      },
      15 * 60 * 1000,
    )

    setInactivityTimer(newTimer)
  }

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      router.push("/accstorage/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  // Configurer les écouteurs d'événements pour réinitialiser le timer
  useEffect(() => {
    // Initialiser le timer
    resetInactivityTimer()

    // Ajouter des écouteurs d'événements pour réinitialiser le timer
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    const resetTimer = () => {
      resetInactivityTimer()
    }

    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    // Nettoyer les écouteurs d'événements
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [])

  // Rendre l'icône appropriée
  const IconComponent = icon === "Building" ? Building : icon === "Database" ? Database : null

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {IconComponent && <IconComponent className="h-6 w-6 text-green-600" />}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          {showBackButton && (
            <Button variant="outline" size="sm" asChild>
              <Link href={backUrl}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  )
}
