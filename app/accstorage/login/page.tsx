import { LoginForm } from "@/ui/components/login-form"
import { db, entrepriseTable } from "@/lib/db/schema"

export default async function LoginPage() {
  // Récupérer la liste des entreprises pour l'arrière-plan
  const entreprises = await db.select().from(entrepriseTable)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="absolute inset-0 z-0 filter blur-sm opacity-30">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
          {entreprises.map((entreprise) => (
            <div
              key={entreprise.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center justify-center"
            >
              <h3 className="text-lg font-semibold">{entreprise.nom}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
