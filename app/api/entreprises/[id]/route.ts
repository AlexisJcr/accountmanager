import { NextResponse } from "next/server"
import { db, entrepriseTable } from "@/lib/db/schema"

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
