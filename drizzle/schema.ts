import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const genreEnum = pgEnum("genre", ["legal", "unofficial"]);
export const contentTypeEnum = pgEnum("contentType", ["subbed", "dubbed", "both"]);
export const statusEnum = pgEnum("status", ["Active", "Down", "Unknown"]);

export const users = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const animeSites = pgTable("anime_sites", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull().unique(),
  description: text("description"),
  genre: genreEnum("genre").default("unofficial").notNull(),
  contentType: contentTypeEnum("contentType").default("both").notNull(),
  status: statusEnum("status").default("Unknown").notNull(),
  lastChecked: timestamp("lastChecked"),
  notes: text("notes"),
  siteGroup: varchar("siteGroup", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AnimeSite = typeof animeSites.$inferSelect;
export type InsertAnimeSite = typeof animeSites.$inferInsert;