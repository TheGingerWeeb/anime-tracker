import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllAnimeSites,
  getAnimeSitesByStatus,
  searchAnimeSites,
  getAnimeSiteById,
  createAnimeSite,
  updateAnimeSite,
  deleteAnimeSite,
  updateAnimeSiteStatus,
} from "./db";
import { checkSiteStatus, checkMultipleSites } from "./statusChecker";
import { TRPCError } from "@trpc/server";

// Admin-only procedure that checks if user is owner
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ PUBLIC ANIME SITES QUERIES ============
  sites: router({
    /**
     * Get all anime sites, optionally filtered by status or search query
     */
    list: publicProcedure
      .input(
        z.object({
          status: z.enum(["All", "Active", "Down", "Unknown"]).optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        let sites = await getAllAnimeSites();

        // Apply search filter
        if (input.search && input.search.trim()) {
          sites = await searchAnimeSites(input.search);
        }

        // Apply status filter
        if (input.status && input.status !== "All") {
          sites = sites.filter(site => site.status === input.status);
        }

        return sites;
      }),

    /**
     * Get a single site by ID
     */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const site = await getAnimeSiteById(input.id);
        if (!site) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Site not found" });
        }
        return site;
      }),

    /**
     * Manually check the status of a single site
     */
    checkStatus: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const site = await getAnimeSiteById(input.id);
        if (!site) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Site not found" });
        }

        const status = await checkSiteStatus(site.url);
        const updated = await updateAnimeSiteStatus(input.id, status);

        return updated;
      }),

    /**
     * Check status of all sites
     */
    checkAllStatus: publicProcedure.mutation(async () => {
      const sites = await getAllAnimeSites();
      const sitesToCheck = sites.map(s => ({ id: s.id, url: s.url }));

      const statusMap = await checkMultipleSites(sitesToCheck, 5);

      // Update all sites in database
      const updates = await Promise.all(
        Array.from(statusMap.entries()).map(([id, status]) =>
          updateAnimeSiteStatus(id, status)
        )
      );

      return updates.filter((u): u is NonNullable<typeof u> => u !== null);
    }),
  }),

  // ============ ADMIN OPERATIONS ============
  admin: router({
    /**
     * Create a new anime site (admin only)
     */
    createSite: adminProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          url: z.string().url("Invalid URL"),
          description: z.string().optional(),
          genre: z.enum(["legal", "unofficial"]).default("unofficial"),
          contentType: z.enum(["subbed", "dubbed", "both"]).default("both"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const site = await createAnimeSite({
          name: input.name,
          url: input.url,
          description: input.description || null,
          genre: input.genre,
          contentType: input.contentType,
          notes: input.notes || null,
          status: "Unknown",
        });

        if (!site) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create site" });
        }

        return site;
      }),

    /**
     * Update an existing anime site (admin only)
     */
    updateSite: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          url: z.string().url().optional(),
          description: z.string().optional(),
          genre: z.enum(["legal", "unofficial"]).optional(),
          contentType: z.enum(["subbed", "dubbed", "both"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const site = await getAnimeSiteById(input.id);
        if (!site) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Site not found" });
        }

        const updates: Record<string, any> = {};
        if (input.name !== undefined) updates.name = input.name;
        if (input.url !== undefined) updates.url = input.url;
        if (input.description !== undefined) updates.description = input.description || null;
        if (input.genre !== undefined) updates.genre = input.genre;
        if (input.contentType !== undefined) updates.contentType = input.contentType;
        if (input.notes !== undefined) updates.notes = input.notes || null;

        const updated = await updateAnimeSite(input.id, updates);
        if (!updated) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update site" });
        }

        return updated;
      }),

    /**
     * Delete an anime site (admin only)
     */
    deleteSite: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const site = await getAnimeSiteById(input.id);
        if (!site) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Site not found" });
        }

        const success = await deleteAnimeSite(input.id);
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete site" });
        }

        return { success: true };
      }),

    /**
     * Get all sites for admin panel
     */
    getAllSites: adminProcedure.query(async () => {
      return await getAllAnimeSites();
    }),

    /**
     * Add discovered sites from discovery engine
     */
    addDiscoveredSites: adminProcedure
      .input(
        z.object({
          sites: z.array(
            z.object({
              name: z.string(),
              url: z.string(),
              description: z.string().optional(),
              genre: z.enum(["legal", "unofficial"]),
              contentType: z.enum(["subbed", "dubbed", "both"]),
              source: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const results = [];
        let added = 0;
        let skipped = 0;

        for (const siteData of input.sites) {
          try {
            const existing = await searchAnimeSites(siteData.name);
            if (existing.length > 0) {
              skipped++;
              continue;
            }

            const site = await createAnimeSite({
              name: siteData.name,
              url: siteData.url,
              description: siteData.description || null,
              genre: siteData.genre,
              contentType: siteData.contentType,
              notes: `Discovered from ${siteData.source}`,
              status: "Unknown",
            });

            if (site) {
              added++;
              results.push(site);
            }
          } catch (error) {
            console.error(`Error adding site ${siteData.name}:`, error);
          }
        }

        return {
          added,
          skipped,
          total: input.sites.length,
          sites: results,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
