import Link from "next/link"
import { Card, CardContent } from "@/ui/design-system/card"
import { Database, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-center">ENERGIX - Portail d'Applications</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        <Link href="http://192.168.1.203/front/central.php" target="_blank" rel="noopener noreferrer">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <Database className="h-16 w-16 mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">GLPI</h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Gestion des services informatiques et des actifs
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/accstorage">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <Shield className="h-16 w-16 mb-4 text-green-600" />
              <h2 className="text-xl font-semibold mb-2">AccStorage</h2>
              <p className="text-center text-gray-600 dark:text-gray-400">Gestionnaire de comptes et mots de passe</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
