import { type NextRequest, NextResponse } from "next/server"
import { db, a2fTable } from "@/lib/db/schema"
import { setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId, role, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json({ error: "Utilisateur et code requis" }, { status: 400 })
    }

    // Vérifier le code A2F
    const a2fCodes = await db.select().from(a2fTable)

    if (a2fCodes.length === 0 || a2fCodes[0].code !== code) {
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
