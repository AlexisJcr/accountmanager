// lib/crypto.ts
import crypto from "crypto"

const algorithm = "aes-256-cbc"
const key = Buffer.from(process.env.AES_SECRET_KEY!, "hex")
const iv = Buffer.from(process.env.ENCRYPTION_IV!, "hex")

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return encrypted
}

export function decrypt(text: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(text, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
