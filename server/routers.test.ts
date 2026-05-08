import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as statusChecker from "./statusChecker";

// Mock database and status checker
vi.mock("./db");
vi.mock("./statusChecker");

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(isAdmin: boolean = false): { ctx: TrpcContext; clearedCookies: Array<{ name: string; options: Record<string, unknown> }> } {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: isAdmin ? "admin" : "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth router", () => {
  it("returns current user", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toEqual(ctx.user);
  });

  it("clears session cookie on logout", async () => {
    const { ctx, clearedCookies } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});

describe("sites router - public procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists all sites", async () => {
    const mockSites = [
      {
        id: 1,
        name: "Crunchyroll",
        url: "https://crunchyroll.com",
        description: "Popular anime streaming",
        genre: "legal" as const,
        contentType: "both" as const,
        status: "Active" as const,
        lastChecked: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getAllAnimeSites).mockResolvedValue(mockSites);

    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sites.list({ status: "All" });

    expect(result).toEqual(mockSites);
    expect(db.getAllAnimeSites).toHaveBeenCalled();
  });

  it("filters sites by status", async () => {
    const mockActiveSites = [
      {
        id: 1,
        name: "Crunchyroll",
        url: "https://crunchyroll.com",
        description: "Popular anime streaming",
        genre: "legal" as const,
        contentType: "both" as const,
        status: "Active" as const,
        lastChecked: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getAllAnimeSites).mockResolvedValue(mockActiveSites);

    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sites.list({ status: "Active" });

    expect(result).toEqual(mockActiveSites);
  });

  it("searches sites by name", async () => {
    const mockSearchResults = [
      {
        id: 1,
        name: "Crunchyroll",
        url: "https://crunchyroll.com",
        description: "Popular anime streaming",
        genre: "legal" as const,
        contentType: "both" as const,
        status: "Active" as const,
        lastChecked: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.searchAnimeSites).mockResolvedValue(mockSearchResults);

    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sites.list({ search: "Crunchyroll" });

    expect(result).toEqual(mockSearchResults);
    expect(db.searchAnimeSites).toHaveBeenCalledWith("Crunchyroll");
  });

  it("checks status of a single site", async () => {
    const mockSite = {
      id: 1,
      name: "Crunchyroll",
      url: "https://crunchyroll.com",
      description: "Popular anime streaming",
      genre: "legal" as const,
      contentType: "both" as const,
      status: "Unknown" as const,
      lastChecked: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedSite = { ...mockSite, status: "Active" as const, lastChecked: new Date() };

    vi.mocked(db.getAnimeSiteById).mockResolvedValue(mockSite);
    vi.mocked(statusChecker.checkSiteStatus).mockResolvedValue("Active");
    vi.mocked(db.updateAnimeSiteStatus).mockResolvedValue(updatedSite);

    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sites.checkStatus({ id: 1 });

    expect(result).toEqual(updatedSite);
    expect(statusChecker.checkSiteStatus).toHaveBeenCalledWith("https://crunchyroll.com");
    expect(db.updateAnimeSiteStatus).toHaveBeenCalledWith(1, "Active");
  });

  it("checks status of all sites", async () => {
    const mockSites = [
      {
        id: 1,
        name: "Crunchyroll",
        url: "https://crunchyroll.com",
        description: "Popular anime streaming",
        genre: "legal" as const,
        contentType: "both" as const,
        status: "Unknown" as const,
        lastChecked: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getAllAnimeSites).mockResolvedValue(mockSites);
    vi.mocked(statusChecker.checkMultipleSites).mockResolvedValue(new Map([[1, "Active"]]));
    vi.mocked(db.updateAnimeSiteStatus).mockResolvedValue({
      ...mockSites[0],
      status: "Active" as const,
      lastChecked: new Date(),
    });

    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sites.checkAllStatus();

    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe("Active");
  });
});

describe("admin router - protected procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies non-admin access to createSite", async () => {
    const { ctx } = createContext(false);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.createSite({
        name: "Test Site",
        url: "https://test.com",
      })
    ).rejects.toThrow("Admin access required");
  });

  it("allows admin to create a site", async () => {
    const newSite = {
      id: 1,
      name: "Test Site",
      url: "https://test.com",
      description: "Test description",
      genre: "unofficial" as const,
      contentType: "both" as const,
      status: "Unknown" as const,
      lastChecked: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.createAnimeSite).mockResolvedValue(newSite);

    const { ctx } = createContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.createSite({
      name: "Test Site",
      url: "https://test.com",
      description: "Test description",
    });

    expect(result).toEqual(newSite);
    expect(db.createAnimeSite).toHaveBeenCalled();
  });

  it("allows admin to update a site", async () => {
    const updatedSite = {
      id: 1,
      name: "Updated Site",
      url: "https://updated.com",
      description: "Updated description",
      genre: "legal" as const,
      contentType: "subbed" as const,
      status: "Active" as const,
      lastChecked: new Date(),
      notes: "Updated notes",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.getAnimeSiteById).mockResolvedValue(updatedSite);
    vi.mocked(db.updateAnimeSite).mockResolvedValue(updatedSite);

    const { ctx } = createContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateSite({
      id: 1,
      name: "Updated Site",
      url: "https://updated.com",
    });

    expect(result).toEqual(updatedSite);
  });

  it("allows admin to delete a site", async () => {
    const mockSite = {
      id: 1,
      name: "Test Site",
      url: "https://test.com",
      description: "Test description",
      genre: "unofficial" as const,
      contentType: "both" as const,
      status: "Unknown" as const,
      lastChecked: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.getAnimeSiteById).mockResolvedValue(mockSite);
    vi.mocked(db.deleteAnimeSite).mockResolvedValue(true);

    const { ctx } = createContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteSite({ id: 1 });

    expect(result).toEqual({ success: true });
    expect(db.deleteAnimeSite).toHaveBeenCalledWith(1);
  });

  it("allows admin to get all sites", async () => {
    const mockSites = [
      {
        id: 1,
        name: "Crunchyroll",
        url: "https://crunchyroll.com",
        description: "Popular anime streaming",
        genre: "legal" as const,
        contentType: "both" as const,
        status: "Active" as const,
        lastChecked: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getAllAnimeSites).mockResolvedValue(mockSites);

    const { ctx } = createContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getAllSites();

    expect(result).toEqual(mockSites);
  });
});
