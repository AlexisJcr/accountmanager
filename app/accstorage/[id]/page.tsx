export const dynamic = "force-dynamic";

import { notFound } from "next/navigation"
import { db, entrepriseTable, dataTable } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/ui/components/navbar"
import { Footer } from "@/ui/components/footer"
import { DataTable } from "@/ui/components/Data/data-table"
import { AddDataButton } from "@/ui/components/Data/add-data-button"

import { ExportDataButton } from "@/ui/components/Export/export-data-button"
import { ImportDataButton } from "@/ui/components/Import/import-data-button"


type PageParams = {
  params: {
    id: string
  }
}

export default async function EnterprisePage({ params }: { params: { id: string } }) {
  const awaitedparams = await params
  const entrepriseId = Number.parseInt(awaitedparams.id)

  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }

  if (isNaN(entrepriseId)) {
    return notFound()
  }

  const isSuperAdmin = user.role === "superadmin"

  // Récupérer les informations de l'entreprise
  const entreprise = await db.select().from(entrepriseTable).where(eq(entrepriseTable.id, entrepriseId)).limit(1)

  if (entreprise.length === 0) {
    return notFound()
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/entreprises/${entrepriseId}/data`)
  const result = await response.json()

  if (!response.ok) {
    return notFound()
  }


  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      <Navbar title={entreprise[0].nom} showBackButton={true} backUrl="/accstorage" icon="Building" />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion des comptes</h1>
            <h2 className="text-red-600">Les données visibles sont cryptées dans la base de données.</h2>
          </div>

          <div className="flex space-x-4">
            <ExportDataButton entrepriseId={entrepriseId} isSuperAdmin={isSuperAdmin} />
            <ImportDataButton entrepriseId={entrepriseId} />
            <AddDataButton entrepriseId={entrepriseId} />
          </div>
        </div>

        <DataTable data={result.data} entrepriseId={entrepriseId} />
      </main>
      <Footer />
    </div>
  )
}