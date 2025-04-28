import { type NextRequest, NextResponse } from "next/server"
import { db, dataTable, entrepriseTable } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { verifyA2FCode } from "@/lib/a2f"
import { eq } from "drizzle-orm"
import { parse } from "csv-parse/sync"
import { encrypt } from "@/lib/crypto"

export const runtime = "nodejs"

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const entrepriseId = Number.parseInt(params.id)

    if (isNaN(entrepriseId)) {
      return NextResponse.json({ error: "ID d'entreprise invalide" }, { status: 400 })
    }

    const formData = await request.formData()
    const csvFile = formData.get("file") as File
    const a2fCode = formData.get("a2fCode") as string
    const isEncrypted = formData.get("isEncrypted") === "true"

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

    // Vérifier si l'entreprise existe
    const entreprise = await db.select().from(entrepriseTable).where(eq(entrepriseTable.id, entrepriseId)).limit(1)

    if (entreprise.length === 0) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 })
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
    const skipped = 0
    let errors = 0

    // Traiter chaque ligne
    for (const record of records) {
      try {
        // Vérifier les données requises
        if (!record.nom || !record.prenom || !record.typeInfo || !record.identifiant || !record.motDePasse) {
          errors++
          continue
        }

        // Préparer le mot de passe (crypter si nécessaire)
        const motDePasse = isEncrypted ? record.motDePasse : encrypt(record.motDePasse)
        const identifiant = isEncrypted ? record.identifiant : encrypt(record.identifiant)
        const nom = isEncrypted ? record.nom : encrypt(record.nom)
        const prenom = isEncrypted ? record.prenom : encrypt(record.prenom)

        // Ajouter la nouvelle donnée
        await db.insert(dataTable).values({
          nom,
          prenom,
          entrepriseId,
          typeInfo: record.typeInfo,
          identifiant,
          motDePasse,
        })

        added++
      } catch (error) {
        console.error("Erreur lors de l'importation d'une donnée:", error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Importation terminée: ${added} ajoutées, ${skipped} ignorées, ${errors} erreurs`,
    })
  } catch (error) {
    console.error("Erreur lors de l'importation des données:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
