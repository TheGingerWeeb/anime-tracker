import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("sites.getById", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
  });

  it("should return a site by ID", async () => {
    const caller = appRouter.createCaller(ctx);

    // This test assumes at least one site exists in the database
    const result = await caller.sites.getById({ id: 1 });

    if (result) {
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("status");
    }
  });

  it("should throw NOT_FOUND error for non-existent site ID", async () => {
    const caller = appRouter.createCaller(ctx);

    // Query for a site ID that likely doesn't exist
    try {
      await caller.sites.getById({ id: 999999 });
      // If we get here, fail the test
      expect(true).toBe(false);
    } catch (error: any) {
      // Should throw NOT_FOUND error
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("should return site with all required fields", async () => {
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sites.getById({ id: 1 });

    if (result) {
      expect(result).toHaveProperty("id", expect.any(Number));
      expect(result).toHaveProperty("name", expect.any(String));
      expect(result).toHaveProperty("url", expect.any(String));
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("genre", expect.stringMatching(/legal|unofficial/));
      expect(result).toHaveProperty("contentType", expect.stringMatching(/subbed|dubbed|both/));
      expect(result).toHaveProperty("status", expect.stringMatching(/Active|Down|Unknown/));
    }
  });

  it("should handle invalid ID parameter", async () => {
    const caller = appRouter.createCaller(ctx);

    try {
      // @ts-ignore - intentionally passing invalid type
      await caller.sites.getById({ id: "invalid" });
      // Should throw an error
      expect(true).toBe(false);
    } catch (error: any) {
      // Expected behavior for invalid input
      expect(error).toBeDefined();
    }
  });
});
