import { type NextRequest, NextResponse } from "next/server"
import { db, dataTable } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth"
import { verifyA2FCode } from "@/lib/a2f"
import { encrypt } from "@/lib/crypto"

export const runtime = 'nodejs';

//=======================================//
//=== Système Mise à jour des données ===//
//=======================================//

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const dataId = Number.parseInt(params.id)
    const { nom, prenom, typeInfo, identifiant, motDePasse, a2fCode } = await request.json()

    // Vérifier les données requises
    if (!nom || !prenom || !typeInfo || !identifiant || !a2fCode) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    //Vérification de l'authentification de l'utilisateur
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    //Vérification du A2F
    const isA2FValid = await verifyA2FCode(a2fCode)

    if (!isA2FValid) {
      return NextResponse.json({ error: "Code de vérification incorrect" }, { status: 401 })
    }

    //Vérification que la donnée existe
    const existingData = await db.select().from(dataTable).where(eq(dataTable.id, dataId)).limit(1)

    if (existingData.length === 0) {
      return NextResponse.json({ error: "Donnée non trouvée" }, { status: 404 })
    }

    //Encryption des données
    const encryptedNom = encrypt(nom)
    const encryptedPrenom = encrypt(prenom)
    const encryptedId = encrypt(identifiant)

    // Préparer l'objet à mettre à jour
    const updateData: any = {
      nom: encryptedNom,
      prenom: encryptedPrenom,
      typeInfo,
      identifiant: encryptedId,
      updatedAt: new Date(),
    }

    //Encryption du mot de passe séparément
    if (motDePasse) {
      updateData.motDePasse = encrypt(motDePasse)
    }

    //Mise à jour de la BDD
    await db.update(dataTable).set(updateData).where(eq(dataTable.id, dataId))

    return NextResponse.json({
      success: true,
      message: "Donnée mise à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la donnée:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Supprimer une donnée
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const dataId = Number.parseInt(params.id)
    const { a2fCode } = await request.json()

    // Vérifier si le code A2F est fourni
    if (!a2fCode) {
      return NextResponse.json({ error: "Code de vérification requis" }, { status: 400 })
    }

    // Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    //Vérification du A2F
    const isA2FValid = await verifyA2FCode(a2fCode)

    if (!isA2FValid) {
      return NextResponse.json({ error: "Code de vérification incorrect" }, { status: 401 })
    }

    // Vérifier si la donnée existe
    const existingData = await db.select().from(dataTable).where(eq(dataTable.id, dataId)).limit(1)

    if (existingData.length === 0) {
      return NextResponse.json({ error: "Donnée non trouvée" }, { status: 404 })
    }

    // Supprimer la donnée
    await db.delete(dataTable).where(eq(dataTable.id, dataId))

    return NextResponse.json({
      success: true,
      message: "Donnée supprimée avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de la donnée:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
