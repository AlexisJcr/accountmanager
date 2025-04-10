import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

// Création du pool PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Tu as déjà bien défini .env.local
});

// Connexion à la DB
export const db = drizzle(pool);

// Les tables comme tu les as définies :
export const loginTable = pgTable("login", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  prenom: varchar("prenom", { length: 255 }).notNull(),
  identifiant: varchar("identifiant", { length: 255 }).notNull().unique(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("sous-admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const a2fTable = pgTable("a2f", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 100 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const entrepriseTable = pgTable("entreprise", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull().unique(),
  adresse: varchar("adresse", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataTable = pgTable("data", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  prenom: varchar("prenom", { length: 255 }).notNull(),
  entrepriseId: integer("entreprise_id").references(() => entrepriseTable.id).notNull(),
  typeInfo: varchar("type_info", { length: 255 }).notNull(),
  identifiant: varchar("identifiant", { length: 255 }).notNull(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types
export type Login = typeof loginTable.$inferSelect;
export type Entreprise = typeof entrepriseTable.$inferSelect;
export type Data = typeof dataTable.$inferSelect;
export type A2F = typeof a2fTable.$inferSelect;
