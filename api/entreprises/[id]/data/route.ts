import { type NextRequest, NextResponse } from "next/server"
import { db, dataTable, entrepriseTable } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth"
import { verifyA2FCode } from "@/lib/a2f"
import { encrypt, decrypt } from "@/lib/crypto"

export const runtime = 'nodejs';

// Récupérer les données d'une entreprise
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const entrepriseId = Number.parseInt(params.id)


    if (isNaN(entrepriseId)) {
      return NextResponse.json({ error: "ID d'entreprise invalide" }, { status: 400 })
    }

    // Vérifier si l'entreprise existe
    const entreprise = await db.select().from(entrepriseTable).where(eq(entrepriseTable.id, entrepriseId)).limit(1)

    if (entreprise.length === 0) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 })
    }

    // Récupérer les données de l'entreprise
    const data = await db.select().from(dataTable).where(eq(dataTable.entrepriseId, entrepriseId))

    const safeData = data
  .map((item) => ({
    ...item,
    nom: decrypt(item.nom),
    prenom: decrypt(item.prenom),
    identifiant: decrypt(item.identifiant),
    motDePasse: decrypt(item.motDePasse),
  }))
  .sort((a, b) => a.nom.localeCompare(b.nom));

    return NextResponse.json({
      success: true,
      data: safeData,
      entreprise: entreprise[0],
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Ajouter une nouvelle donnée
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {

    const entrepriseId = Number.parseInt((await context.params).id)

    const { nom, prenom, typeInfo, identifiant, motDePasse, a2fCode } = await request.json()

    //Vérifier les données requises
    if (!nom || !prenom || !typeInfo || !identifiant || !motDePasse || !a2fCode) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    //Vérifier si l'utilisateur est authentifié
    const currentUser = await getCurrentUser()
    console.log('Utilisateur actuel:', currentUser)

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

    //Cryptage des données
    const encryptedNom = encrypt(nom)
    const encryptedPrenom = encrypt(prenom)
    const encryptedId = encrypt(identifiant)
    const encryptedPassword = encrypt(motDePasse)

    await db.insert(dataTable).values({
      nom: encryptedNom,
      prenom: encryptedPrenom,
      entrepriseId,
      typeInfo,
      identifiant: encryptedId,
      motDePasse: encryptedPassword,
    })

    return NextResponse.json({
      success: true,
      message: "Donnée ajoutée avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout de la donnée:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
