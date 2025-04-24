export const dynamic = "force-dynamic";

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { db, entrepriseTable } from "@/lib/db/schema"
import { EnterpriseGrid } from "@/ui/components/Entreprise/entreprise-grid"
import { Navbar } from "@/ui/components/navbar"
import { Footer } from "@/ui/components/footer"
import { AddEnterpriseButton } from "@/ui/components/Entreprise/add-entreprise-button"
import Link from "next/link"
import { Button } from "@/ui/design-system/button"
import { Users } from "lucide-react"

import { ExportEnterprisesButton } from "@/ui/components/Export/export-entreprises-button"
import { ImportEnterprisesButton } from "@/ui/components/Import/import-entreprises-button"


export default async function AccStoragePage() {
  const user = await getCurrentUser()

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    redirect("accstorage/login")
  }
  
  const isSuperAdmin = user.role === "superadmin"

  // Récupérer la liste des entreprises
  const entreprises = await db.select().from(entrepriseTable)

  return (
    <div className="min-h-screen flex flex-col bg-gray-200 dark:bg-gray-600">
      <Navbar title={`${user.nom} ${user.prenom}`} showBackButton={true} backUrl="/" />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Sélectionnez une entreprise</h1>
          <div className="flex space-x-4">
            <div className={`${user.role === "superadmin" ? "" : "hidden"}`}>
            <Link href="/accstorage/admin">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Gérer les administrateurs
              </Button>
            </Link>
            </div>
            <ExportEnterprisesButton isSuperAdmin={isSuperAdmin} />
            <ImportEnterprisesButton />
            <AddEnterpriseButton />
          </div>
        </div>
        <EnterpriseGrid entreprises={entreprises} />
      </main>
      <Footer />
    </div>
  )
}