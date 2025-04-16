import { type NextRequest, NextResponse } from "next/server"
import { db, entrepriseTable, dataTable } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

import { getCurrentUser } from "@/lib/auth"
import { verifyA2FCode } from "@/lib/a2f"
import { sql } from "drizzle-orm"


export const runtime = "nodejs"

//=== DETAILS ENTREPRISE ===//
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const entrepriseId = Number.parseInt(params.id)

    if (isNaN(entrepriseId)) {
      return NextResponse.json({ error: "ID d'entreprise invalide" }, { status: 400 })
    }

    //Récupérer l'entreprise
    const entreprise = await db.select().from(entrepriseTable).where(eq(entrepriseTable.id, entrepriseId)).limit(1)

    if (entreprise.length === 0) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      entreprise: entreprise[0],
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}


//=== MAJ ENTREPRISE ===//
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const entrepriseId = Number.parseInt(params.id)
    const { nom, adresse, telephone, couleur, a2fCode } = await request.json()

    if (isNaN(entrepriseId)) {
      return NextResponse.json({ error: "ID d'entreprise invalide" }, { status: 400 })
    }

    //Vérifier les données requises
    if (!nom || !adresse || !telephone || !a2fCode) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    //Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    //Vérifier le code A2F
    const isA2FValid = await verifyA2FCode(a2fCode)

    if (!isA2FValid) {
      return NextResponse.json({ error: "Code de vérification incorrect" }, { status: 401 })
    }

    //Vérifier si l'entreprise existe
    const entreprise = await db.select().from(entrepriseTable).where(eq(entrepriseTable.id, entrepriseId)).limit(1)

    if (entreprise.length === 0) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 })
    }

    //Vérifier si le nouveau nom existe déjà pour une autre entreprise
    if (nom !== entreprise[0].nom) {
      const existingEnterprise = await db
        .select()
        .from(entrepriseTable)
        .where(and(eq(entrepriseTable.nom, nom), eq(entrepriseTable.id, entrepriseId)))
        .limit(1)

      if (existingEnterprise.length > 0) {
        return NextResponse.json({ error: "Une entreprise avec ce nom existe déjà" }, { status: 409 })
      }
    }

    //Mettre à jour l'entreprise
    await db
      .update(entrepriseTable)
      .set({
        nom,
        adresse,
        telephone,
        couleur: couleur || entreprise[0].couleur,
        updatedAt: new Date(),
      })
      .where(eq(entrepriseTable.id, entrepriseId))

    return NextResponse.json({
      success: true,
      message: "Entreprise mise à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

//=== SUPRESSION ENTREPRISE ===//
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {

  try {
    const entrepriseId = Number.parseInt((await context.params).id)
    const { a2fCode } = await request.json()

    if (isNaN(entrepriseId)) {
      return NextResponse.json({ error: "ID d'entreprise invalide" }, { status: 400 })
    }

    // Vérifier si le code A2F est fourni
    if (!a2fCode) {
      return NextResponse.json({ error: "Code de vérification requis" }, { status: 400 })
    }

    // Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()
    console.log('Utilisateur actuel:', currentUser)

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier le code A2F
    const isA2FValid = await verifyA2FCode(a2fCode)

    if (!isA2FValid) {
      return NextResponse.json({ error: "Code de vérification incorrect" }, { status: 401 })
    }

    // Vérifier si l'entreprise existe
    const entreprise = await db.select().from(entrepriseTable).where(eq(entrepriseTable.id, entrepriseId)).limit(1)

    if (entreprise.length === 0) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 })
    }

    // Vérifier s'il existe des données liées à cette entreprise
    const dataCount = await db
      .select({ count: sql`count(*)` })
      .from(dataTable)
      .where(eq(dataTable.entrepriseId, entrepriseId))

    console.log("Résultat de la requête dataCount :", dataCount)

    if (dataCount.length > 0 && Number(dataCount[0].count) > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer l'entreprise car des données y sont liées" },
        { status: 409 },
      )
    }
  

    

    // Supprimer l'entreprise
    await db.delete(entrepriseTable).where(eq(entrepriseTable.id, entrepriseId))

    return NextResponse.json({
      success: true,
      message: "Entreprise supprimée avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}