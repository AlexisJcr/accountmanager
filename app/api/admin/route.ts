import { type NextRequest, NextResponse } from "next/server"
import { db, loginTable } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { verifyA2FCode } from "@/lib/a2f"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"

// Récupérer tous les administrateurs
export async function GET(request: NextRequest) {

  try {
    // Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()

    // Récupérer tous les administrateurs
    const admins = await db
      .select({
        id: loginTable.id,
        nom: loginTable.nom,
        prenom: loginTable.prenom,
        identifiant: loginTable.identifiant,
        role: loginTable.role,
        createdAt: loginTable.createdAt,
        updatedAt: loginTable.updatedAt,
      })
      .from(loginTable)
    console.log("Admins:", admins)

    return NextResponse.json({
      success: true,
      admins,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des administrateurs:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Ajouter un nouvel administrateur
export async function POST(request: NextRequest) {
  try {
    const { nom, prenom, identifiant, motDePasse, role, a2fCode } = await request.json()

    // Vérifier les données requises
    if (!nom || !prenom || !identifiant || !motDePasse || !role || !a2fCode) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    // Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier le code A2F
    const isA2FValid = await verifyA2FCode(a2fCode)

    if (!isA2FValid) {
      return NextResponse.json({ error: "Code de vérification incorrect" }, { status: 401 })
    }

    // Vérifier si l'identifiant existe déjà
    const existingAdmin = await db.select().from(loginTable).where(eq(loginTable.identifiant, identifiant)).limit(1)

    if (existingAdmin.length > 0) {
      return NextResponse.json({ error: "Cet identifiant existe déjà" }, { status: 409 })
    }

    //Hashe l'id et le mot de passe
    const hashedIdentifiant = await bcrypt.hash(identifiant, 10)
    const hashedPassword = await bcrypt.hash(motDePasse, 10)

    // Ajouter le nouvel administrateur
    await db.insert(loginTable).values({
      nom,
      prenom,
      identifiant: hashedIdentifiant,
      motDePasse: hashedPassword,
      role,
    })

    return NextResponse.json({
      success: true,
      message: "Administrateur ajouté avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'administrateur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
