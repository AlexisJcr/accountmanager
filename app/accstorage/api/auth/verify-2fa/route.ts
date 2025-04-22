import { type NextRequest, NextResponse } from "next/server"
import { verifyA2FCode } from "@/lib/a2f" // Assure-toi d'importer la fonction
import { setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId, role, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json({ error: "Utilisateur et code requis" }, { status: 400 })
    }

    // Vérifier le code A2F avec la fonction verifyA2FCode
    const validCode = await verifyA2FCode(code)

    if (!validCode) {
      return NextResponse.json({ error: "Code de vérification incorrect" }, { status: 401 })
    }

    // Définir le cookie d'authentification
    const token = await setAuthCookie(userId, role)

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error("Erreur de vérification 2FA:", error)
    return NextResponse.json({ error: "Erreur de vérification" }, { status: 500 })
  }
}
