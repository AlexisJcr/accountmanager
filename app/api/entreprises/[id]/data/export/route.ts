import { type NextRequest, NextResponse } from "next/server"
import { db, dataTable, loginTable } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { stringify } from "csv-stringify/sync"
import { decrypt } from "@/lib/crypto"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const entrepriseId = Number.parseInt(context.params.id)
    const { exportType, superadminPassword } = await request.json()

    if (isNaN(entrepriseId)) {
      return NextResponse.json({ error: "ID d'entreprise invalide" }, { status: 400 })
    }

    // Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est superadmin
    if (currentUser.role !== "superadmin") {
      return NextResponse.json({ error: "Seul le superadmin peut exporter les données" }, { status: 403 })
    }

    // Si exportation en clair, vérifier le mot de passe du superadmin
    if (exportType === "clear") {
      // Récupérer le superadmin
      const superadmin = await db.select().from(loginTable).where(eq(loginTable.role, "superadmin")).limit(1)

      if (superadmin.length === 0) {
        return NextResponse.json({ error: "Compte superadmin introuvable" }, { status: 404 })
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(superadminPassword, superadmin[0].motDePasse)

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Mot de passe superadmin incorrect" }, { status: 401 })
      }
    }

    // Récupérer les données de l'entreprise
    const data = await db.select().from(dataTable).where(eq(dataTable.entrepriseId, entrepriseId))

    // Préparer les données pour l'exportation
    let exportData
    if (exportType === "clear") {
      // Décrypter les mots de passe pour l'exportation en clair
      exportData = data.map((item) => ({
        ...item,
        nom: decrypt(item.nom),
        prenom: decrypt(item.prenom),
        identifiant: decrypt(item.identifiant),
        motDePasse: decrypt(item.motDePasse),
      }))
    } else {
      // Garder les mots de passe cryptés
      exportData = data
    }

    // Convertir en CSV
    const csvData = stringify(exportData, {
      header: true,
      columns: [
        "id",
        "nom",
        "prenom",
        "entrepriseId",
        "typeInfo",
        "identifiant",
        "motDePasse",
        "createdAt",
        "updatedAt",
      ],
    })

    // Créer une réponse avec le CSV
    const response = new NextResponse(csvData)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="data_entreprise_${entrepriseId}_${exportType}_${Date.now()}.csv"`,
    )

    return response
  } catch (error) {
    console.error("Erreur lors de l'exportation des données:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
