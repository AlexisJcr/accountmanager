"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/design-system/dialog"
import { Button } from "@/ui/design-system//button"
import { Input } from "@/ui/design-system/input"
import { Label } from "@/ui/design-system/label"

interface A2FVerificationDialogProps {
  onVerify: (code: string) => void
  onCancel: () => void
  isLoading: boolean
}

export function A2FVerificationDialog({ onVerify, onCancel, isLoading }: A2FVerificationDialogProps) {
  const [code, setCode] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (code) {
      onVerify(code)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vérification de sécurité</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="a2fCode">Code de vérification</Label>
            <Input id="a2fCode" value={code} onChange={(e) => setCode(e.target.value)} required autoFocus />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !code}>
              {isLoading ? "Vérification en cours..." : "Vérifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
