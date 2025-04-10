import { type NextRequest, NextResponse } from "next/server"
import { db, entrepriseTable } from "@/lib/db/schema"
import { verifyA2FCode } from "@/lib/a2f"
import { getCurrentUser } from "@/lib/auth"
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const entreprises = await db.select().from(entrepriseTable)

    return NextResponse.json({
      success: true,
      entreprises,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    // Afficher tous les cookies pour le débogage
    console.log("Cookies dans la requête POST entreprise:", request.cookies.getAll())

    const { nom, adresse, telephone, a2fCode } = await request.json()

    // Vérifier les données requises
    if (!nom || !adresse || !telephone || !a2fCode) {
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

    // Vérifier si l'entreprise existe déjà
    const existingEnterprise = await db
      .select()
      .from(entrepriseTable)
      .where(eq(entrepriseTable.nom, nom))
      .limit(1)

    if (existingEnterprise.length > 0) {
      return NextResponse.json({ error: "Une entreprise avec ce nom existe déjà" }, { status: 409 })
    }

    // Ajouter la nouvelle entreprise
    await db.insert(entrepriseTable).values({
      nom,
      adresse,
      telephone,
    })

    return NextResponse.json({
      success: true,
      message: "Entreprise ajoutée avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
