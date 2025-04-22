import { type NextRequest, NextResponse } from "next/server"
import { db, loginTable } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { verifyA2FCode } from "@/lib/a2f"
import bcrypt from "bcryptjs"
import { eq, and } from "drizzle-orm"

export const runtime = "nodejs"

// Récupérer un administrateur spécifique
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const adminId = Number.parseInt(params.id)

    if (isNaN(adminId)) {
      return NextResponse.json({ error: "ID d'administrateur invalide" }, { status: 400 })
    }

    // Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer l'administrateur
    const admin = await db
      .select({
        id: loginTable.id,
        nom: loginTable.nom,
        prenom: loginTable.prenom,
        role: loginTable.role,
        createdAt: loginTable.createdAt,
        updatedAt: loginTable.updatedAt,
      })
      .from(loginTable)
      .where(eq(loginTable.id, adminId))
      .limit(1)

    if (admin.length === 0) {
      return NextResponse.json({ error: "Administrateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      admin: admin[0],
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'administrateur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Mettre à jour un administrateur
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const adminId = Number.parseInt(params.id)
    const { nom, prenom, identifiant, motDePasse, role, a2fCode } = await request.json()

    if (isNaN(adminId)) {
      return NextResponse.json({ error: "ID d'administrateur invalide" }, { status: 400 })
    }

    // Vérifier les données requises
    if (!nom || !prenom || !role || !a2fCode) {
      return NextResponse.json({ error: "Les champs nom, prénom et rôle sont requis" }, { status: 400 })
    }

    //Vérifier si l'utilisateur essai de modifier l'identifiant superadmin
    if (identifiant) {
      if (role === "superadmin") {
        return NextResponse.json({ error: "Vous ne pouvez pas modifier l'identifiant du superadmin." }, { status: 400 })
      }
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

    // Vérifier si l'administrateur existe
    const existingAdmin = await db.select().from(loginTable).where(eq(loginTable.id, adminId)).limit(1)

    if (existingAdmin.length === 0) {
      return NextResponse.json({ error: "Administrateur non trouvé" }, { status: 404 })
    }

    // Vérifier si l'identifiant existe déjà pour un autre administrateur
    if (identifiant !== existingAdmin[0].identifiant) {
      const duplicateIdentifiant = await db
        .select()
        .from(loginTable)
        .where(and(eq(loginTable.identifiant, identifiant), eq(loginTable.id, adminId)))
        .limit(1)

      if (duplicateIdentifiant.length > 0) {
        return NextResponse.json({ error: "Cet identifiant existe déjà" }, { status: 409 })
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {
      nom,
      prenom,
      identifiant,
      role,
      updatedAt: new Date(),
    }

    // Si un nouveau mot de passe est fourni, le hasher
    if (motDePasse) {
      updateData.motDePasse = await bcrypt.hash(motDePasse, 10)
    }

    if (identifiant) {
      updateData.identifiant = await bcrypt.hash(identifiant, 10)
    }

    // Mettre à jour l'administrateur
    await db.update(loginTable).set(updateData).where(eq(loginTable.id, adminId))

    return NextResponse.json({
      success: true,
      message: "Administrateur mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'administrateur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Supprimer un administrateur
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const adminId = Number.parseInt(params.id)
    const { a2fCode } = await request.json()

    if (isNaN(adminId)) {
      return NextResponse.json({ error: "ID d'administrateur invalide" }, { status: 400 })
    }

    // Vérifier si le code A2F est fourni
    if (!a2fCode) {
      return NextResponse.json({ error: "Code de vérification requis" }, { status: 400 })
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

    // Vérifier si l'administrateur existe
    const existingAdmin = await db.select().from(loginTable).where(eq(loginTable.id, adminId)).limit(1)

    if (existingAdmin.length === 0) {
      return NextResponse.json({ error: "Administrateur non trouvé" }, { status: 404 })
    }

    // Vérifier si c'est le compte superadmin
    if (existingAdmin[0].role === "superadmin") {
      return NextResponse.json({ error: "Impossible de supprimer le compte superadmin" }, { status: 403 })
    }

    // Supprimer l'administrateur
    await db.delete(loginTable).where(eq(loginTable.id, adminId))

    return NextResponse.json({
      success: true,
      message: "Administrateur supprimé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'administrateur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
