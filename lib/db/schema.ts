import { sql } from "@vercel/postgres"
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core"
import { drizzle } from "drizzle-orm/vercel-postgres"

// Table Login pour les administrateurs
export const loginTable = pgTable("login", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  prenom: varchar("prenom", { length: 255 }).notNull(),
  identifiant: varchar("identifiant", { length: 255 }).notNull().unique(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("sous-admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Table A2F pour le code de double authentification
export const a2fTable = pgTable("a2f", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Table Entreprise
export const entrepriseTable = pgTable("entreprise", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull().unique(),
  adresse: varchar("adresse", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Table Data pour les informations de connexion
export const dataTable = pgTable("data", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  prenom: varchar("prenom", { length: 255 }).notNull(),
  entrepriseId: integer("entreprise_id")
    .references(() => entrepriseTable.id)
    .notNull(),
  typeInfo: varchar("type_info", { length: 255 }).notNull(),
  identifiant: varchar("identifiant", { length: 255 }).notNull(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Initialiser la connexion à la base de données
export const db = drizzle(sql)

// Types pour TypeScript
export type Login = typeof loginTable.$inferSelect
export type Entreprise = typeof entrepriseTable.$inferSelect
export type Data = typeof dataTable.$inferSelect
export type A2F = typeof a2fTable.$inferSelect
