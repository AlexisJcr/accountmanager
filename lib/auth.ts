import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { db, loginTable } from "./db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

//Secret key pour JWT (à mettre dans les variables d'environnement en production)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "energix-secret-key-in-prod")

//Validité du token
const TOKEN_EXPIRY = "30m"

//Génération du JWT
export async function signToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

//Vérif du JWT
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

//Cookie avec le JWT
export async function setAuthCookie(userId: number, role: string) {
  const token = await signToken({ userId, role })
  const cookieStore = await cookies()

  cookieStore.set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    path: "/accstorage",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 60,
  })

  return token
}

//Supression du cookie d'Auth
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

//Vérif de identifiants de connexion
export async function verifyCredentials(identifiant: string, motDePasse: string) {
  const user = await db.select().from(loginTable).where(eq(loginTable.identifiant, identifiant)).limit(1)

  if (user.length === 0) {
    return null
  }

  const isPasswordValid = await bcrypt.compare(motDePasse, user[0].motDePasse)

  if (!isPasswordValid) {
    return null
  }

  return user[0]
}

// Middleware pour vérifier l'authentification
export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return false
  }

  const payload = await verifyToken(token)
  return !!payload
}

// Obtenir l'utilisateur actuel à partir du token
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const payload = await verifyToken(token)

  if (!payload || !payload.userId) {
    return null
  }

  const user = await db
    .select()
    .from(loginTable)
    .where(eq(loginTable.id, payload.userId as number))
    .limit(1)

  if (user.length === 0) {
    return null
  }

  return {
    id: user[0].id,
    nom: user[0].nom,
    prenom: user[0].prenom,
    identifiant: user[0].identifiant,
    role: user[0].role,
  }
}
