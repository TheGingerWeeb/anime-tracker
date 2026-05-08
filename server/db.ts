import { eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, animeSites, InsertAnimeSite, AnimeSite } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ ANIME SITES QUERIES ============

export async function getAllAnimeSites(): Promise<AnimeSite[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get anime sites: database not available");
    return [];
  }

  try {
    return await db.select().from(animeSites).orderBy(animeSites.name);
  } catch (error) {
    console.error("[Database] Failed to get anime sites:", error);
    return [];
  }
}

export async function getAnimeSitesByStatus(status: "Active" | "Down" | "Unknown"): Promise<AnimeSite[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get anime sites: database not available");
    return [];
  }

  try {
    return await db.select().from(animeSites).where(eq(animeSites.status, status)).orderBy(animeSites.name);
  } catch (error) {
    console.error("[Database] Failed to get anime sites by status:", error);
    return [];
  }
}

export async function searchAnimeSites(query: string): Promise<AnimeSite[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search anime sites: database not available");
    return [];
  }

  try {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(animeSites)
      .where(
        or(
          like(animeSites.name, searchPattern),
          like(animeSites.description, searchPattern)
        )
      )
      .orderBy(animeSites.name);
  } catch (error) {
    console.error("[Database] Failed to search anime sites:", error);
    return [];
  }
}

export async function getAnimeSiteById(id: number): Promise<AnimeSite | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get anime site: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(animeSites).where(eq(animeSites.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get anime site:", error);
    return undefined;
  }
}

export async function createAnimeSite(site: InsertAnimeSite): Promise<AnimeSite | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create anime site: database not available");
    return null;
  }

  try {
    const result = await db.insert(animeSites).values(site);
    const id = result[0].insertId;
    return await getAnimeSiteById(Number(id)) || null;
  } catch (error) {
    console.error("[Database] Failed to create anime site:", error);
    return null;
  }
}

export async function updateAnimeSite(id: number, updates: Partial<InsertAnimeSite>): Promise<AnimeSite | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update anime site: database not available");
    return null;
  }

  try {
    await db.update(animeSites).set(updates).where(eq(animeSites.id, id));
    return await getAnimeSiteById(id) || null;
  } catch (error) {
    console.error("[Database] Failed to update anime site:", error);
    return null;
  }
}

export async function deleteAnimeSite(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete anime site: database not available");
    return false;
  }

  try {
    await db.delete(animeSites).where(eq(animeSites.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete anime site:", error);
    return false;
  }
}

export async function updateAnimeSiteStatus(id: number, status: "Active" | "Down" | "Unknown"): Promise<AnimeSite | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update anime site status: database not available");
    return null;
  }

  try {
    await db.update(animeSites).set({
      status,
      lastChecked: new Date(),
    }).where(eq(animeSites.id, id));
    return await getAnimeSiteById(id) || null;
  } catch (error) {
    console.error("[Database] Failed to update anime site status:", error);
    return null;
  }
}
