import { type NextRequest, NextResponse } from "next/server"
import { db, entrepriseTable } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { verifyA2FCode } from "@/lib/a2f"
import { parse } from "csv-parse/sync"
import { eq, and } from "drizzle-orm"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const csvFile = formData.get("file") as File
    const a2fCode = formData.get("a2fCode") as string

    if (!csvFile || !a2fCode) {
      return NextResponse.json({ error: "Fichier CSV et code A2F requis" }, { status: 400 })
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

    // Lire le contenu du fichier
    const csvText = await csvFile.text()

    // Parser le CSV
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    })

    // Compteurs pour le rapport
    let added = 0
    let skipped = 0
    let errors = 0

    // Traiter chaque ligne
    for (const record of records) {
      try {
        // Vérifier si l'entreprise existe déjà
        const existingEnterprise = await db
          .select()
          .from(entrepriseTable)
          .where(eq(entrepriseTable.nom, record.nom))
          .limit(1)

        if (existingEnterprise.length > 0) {
          skipped++
          continue
        }

        // Ajouter la nouvelle entreprise
        await db.insert(entrepriseTable).values({
          nom: record.nom,
          adresse: record.adresse,
          telephone: record.telephone,
          couleur: record.couleur || "#22c55e", // Utiliser la couleur fournie ou la couleur par défaut
        })

        added++
      } catch (error) {
        console.error("Erreur lors de l'importation d'une entreprise:", error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Importation terminée: ${added} ajoutées, ${skipped} ignorées, ${errors} erreurs`,
    })
  } catch (error) {
    console.error("Erreur lors de l'importation des entreprises:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
