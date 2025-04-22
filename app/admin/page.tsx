export const dynamic = "force-dynamic";

import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { db, loginTable } from "@/lib/db/schema"
import { Navbar } from "@/ui/components/navbar"
import { AdminTable } from "@/ui/components/Admin/admin-table"
import { AddAdminButton } from "@/ui/components/Admin/add-admin-button"

export default async function AdminsPage() {
  const user = await getCurrentUser()

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    redirect("/accstorage/login")
  }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin`)
    const result = await response.json()
  
    if (!response.ok) {
      return notFound()
    }

  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      <Navbar title="Gestion des Administrateurs" showBackButton={true} backUrl="/accstorage" />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
          <h1 className="text-2xl font-bold">Liste des administrateurs</h1>
          <h2 className="text-red-600">Cette fonctionnalité n'est accessible que par le SuperAdmin</h2>
          </div>
          <AddAdminButton />
        </div>

        <AdminTable admins={result.admins} />
      </main>
    </div>
  )
}
