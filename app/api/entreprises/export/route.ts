import { type NextRequest, NextResponse } from "next/server"
import { db, entrepriseTable } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { stringify } from "csv-stringify/sync"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est superadmin
    if (currentUser.role !== "superadmin") {
      return NextResponse.json({ error: "Seul le superadmin peut exporter les données" }, { status: 403 })
    }

    // Récupérer toutes les entreprises
    const entreprises = await db.select().from(entrepriseTable)

    // Convertir en CSV
    const csvData = stringify(entreprises, {
      header: true,
      columns: ["id", "nom", "adresse", "telephone", "couleur", "createdAt", "updatedAt"],
    })

    // Créer une réponse avec le CSV
    const response = new NextResponse(csvData)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set("Content-Disposition", `attachment; filename="entreprises_${Date.now()}.csv"`)

    return response
  } catch (error) {
    console.error("Erreur lors de l'exportation des entreprises:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
