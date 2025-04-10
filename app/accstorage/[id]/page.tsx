import { notFound } from "next/navigation"
import { db, entrepriseTable, dataTable } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/ui/components/navbar"
import { DataTable } from "@/ui/components/data-table"
import { AddDataButton } from "@/ui/components/add-data-button"

export default async function EnterprisePage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }

  const entrepriseId = Number.parseInt(params.id)

  if (isNaN(entrepriseId)) {
    return notFound()
  }

  // Récupérer les informations de l'entreprise
  const entreprise = await db.select().from(entrepriseTable).where(eq(entrepriseTable.id, entrepriseId)).limit(1)

  if (entreprise.length === 0) {
    return notFound()
  }

  // Récupérer les données de l'entreprise
  const data = await db.select().from(dataTable).where(eq(dataTable.entrepriseId, entrepriseId))

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar title={entreprise[0].nom} showBackButton={true} backUrl="/accstorage" icon="Building" />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des comptes</h1>
          <AddDataButton entrepriseId={entrepriseId} />
        </div>

        <DataTable data={data} entrepriseId={entrepriseId} />
      </main>
    </div>
  )
}
