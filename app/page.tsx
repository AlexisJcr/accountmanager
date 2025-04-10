import Link from "next/link"
import { Card, CardContent, CardTitle } from "@/ui/design-system/card"
import { Database, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-around bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center">Portail d'Applications</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        <Link href="http://192.168.1.203/front/central.php" target="_blank" rel="noopener noreferrer">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <Database className="h-16 w-16 mb-4 text-blue-600" />
              <h2 className="text-2xl text-black font-semibold mb-2">GLPI</h2>
              <p className="text-center text-primary">
                Gestion de l'inventaire du parc informatique
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/accstorage">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <Shield className="h-16 w-16 mb-4 text-red-600" />
              <h2 className="text-2xl text-black font-semibold mb-2">Account Storage</h2>
              <p className="text-center text-primary">Gestionnaire de comptes et mots de passe</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      <footer>
          SARL ENERGIX - Service Informatique - 2025
        </footer>
    </div>
  )
}
