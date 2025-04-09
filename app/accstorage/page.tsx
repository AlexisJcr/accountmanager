import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { db, entrepriseTable } from "@/lib/db/schema"
import { EnterpriseGrid } from "@/ui/components/entreprise-grid"
import { Navbar } from "@/ui/components/navbar"

export default async function AccStoragePage() {
  const user = await getCurrentUser()

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    redirect("/accstorage/login")
  }

  // Récupérer la liste des entreprises
  const entreprises = await db.select().from(entrepriseTable)

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar title="Gestionnaire de Comptes" showBackButton={true} backUrl="/" />

      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Sélectionnez une entreprise</h1>

        <EnterpriseGrid entreprises={entreprises} />
      </main>
    </div>
  )
}
