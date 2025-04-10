import bcrypt from "bcryptjs"
import { db, a2fTable } from "./db/schema"

export async function verifyA2FCode(code: string): Promise<boolean> {
  try {
    const a2fCodes = await db.select().from(a2fTable)

    if (a2fCodes.length === 0) {
      return false
    }

    const storedHash = a2fCodes[0].code
    return await bcrypt.compare(code, storedHash)
  } catch (error) {
    console.error("Erreur lors de la vérification du code A2F:", error)
    return false
  }
}
