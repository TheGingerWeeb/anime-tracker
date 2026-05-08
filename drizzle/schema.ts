import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Anime streaming sites table for tracking availability status.
 */
export const animeSites = mysqlTable("anime_sites", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull().unique(),
  description: text("description"),
  genre: mysqlEnum("genre", ["legal", "unofficial"]).default("unofficial").notNull(),
  contentType: mysqlEnum("contentType", ["subbed", "dubbed", "both"]).default("both").notNull(),
  status: mysqlEnum("status", ["Active", "Down", "Unknown"]).default("Unknown").notNull(),
  lastChecked: timestamp("lastChecked"),
  notes: text("notes"),
  siteGroup: varchar("siteGroup", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnimeSite = typeof animeSites.$inferSelect;
export type InsertAnimeSite = typeof animeSites.$inferInsert;
