"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/design-system/card"
import { Button } from "@/ui/design-system/button"
import { Input } from "@/ui/design-system/input"
import { Label } from "@/ui/design-system/label"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [identifiant, setIdentifiant] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [a2fCode, setA2FCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"login" | "a2f">("login")
  const [userId, setUserId] = useState<number | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log(identifiant, motDePasse);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiant, motDePasse }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion")
      }

      // Passer à l'étape de vérification A2F
      setUserId(data.user.id)
      setUserRole(data.user.role)
      setStep("a2f")
    } catch (error) {
      console.error("Erreur de connexion:", error)
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Identifiant ou mot de passe incorrect",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyA2F = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: userRole, code: a2fCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur de vérification")
      }

      // Rediriger vers la page principale
      router.push("/accstorage")
      router.refresh()
    } catch (error) {
      console.error("Erreur de vérification A2F:", error)
      toast({
        title: "Erreur de vérification",
        description: error instanceof Error ? error.message : "Code de vérification incorrect",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ENERGIX AccStorage</CardTitle>
        <CardDescription>
          {step === "login"
            ? "Connectez-vous pour accéder au gestionnaire de comptes"
            : "Entrez le code de double authentification"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyA2F} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="a2fCode">Code de vérification</Label>
              <Input id="a2fCode" value={a2fCode} onChange={(e) => setA2FCode(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Vérification en cours..." : "Vérifier"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          {step === "login" ? "Accès réservé aux administrateurs" : "Un code de vérification est requis pour continuer"}
        </p>
      </CardFooter>
    </Card>
  )
}
