import { type NextRequest, NextResponse } from "next/server"
import { verifyCredentials } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { identifiant, motDePasse } = await request.json()

    if (!identifiant || !motDePasse) {
      return NextResponse.json({ error: "Identifiant et mot de passe requis" }, { status: 400 })
    }

    const user = await verifyCredentials(identifiant, motDePasse)

    if (!user) {
      return NextResponse.json({ error: "Identifiant ou mot de passe incorrect" }, { status: 401 })
    }

    // Ne pas définir de cookie ici, attendre la validation 2FA

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        identifiant: user.identifiant,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Erreur de connexion:", error)
    return NextResponse.json({ error: "Erreur de connexion" }, { status: 500 })
  }
}
