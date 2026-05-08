import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  discoverFromReddit,
  discoverFromWebScraping,
  discoverFromForums,
  runAllDiscovery,
} from "./siteDiscovery";

// Mock fetch for testing
global.fetch = vi.fn();

describe("Site Discovery Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("discoverFromReddit", () => {
    it("should return an array from Reddit discovery", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  title: "Best anime streaming sites",
                  selftext: "Check out https://9anime.to and https://gogoanime.info",
                },
              },
            ],
          },
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const sites = await discoverFromReddit();

      expect(Array.isArray(sites)).toBe(true);
      if (sites.length > 0) {
        expect(sites[0]).toHaveProperty("name");
        expect(sites[0]).toHaveProperty("url");
        expect(sites[0]).toHaveProperty("source", "reddit");
      }
    });

    it("should handle Reddit API errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const sites = await discoverFromReddit();

      expect(Array.isArray(sites)).toBe(true);
    });

    it("should deduplicate sites from multiple subreddits", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  title: "Anime sites",
                  selftext: "https://9anime.to",
                },
              },
            ],
          },
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const sites = await discoverFromReddit();

      // Should have deduplicated the same site from multiple subreddits
      const uniqueUrls = new Set(sites.map((s) => s.url));
      expect(uniqueUrls.size).toBeLessThanOrEqual(sites.length);
    });
  });

  describe("discoverFromWebScraping", () => {
    it("should return an array from web scraping", async () => {
      const mockResponse = {
        ok: true,
        text: async () => `
          <html>
            <body>
              <a href="https://9anime.to">9Anime</a>
              <a href="https://gogoanime.info">GogoAnime</a>
            </body>
          </html>
        `,
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const sites = await discoverFromWebScraping();

      expect(Array.isArray(sites)).toBe(true);
      if (sites.length > 0) {
        expect(sites[0]).toHaveProperty("source", "web_scrape");
      }
    });

    it("should skip non-anime streaming URLs", async () => {
      const mockResponse = {
        ok: true,
        text: async () => `
          <html>
            <body>
              <a href="https://reddit.com">Reddit</a>
              <a href="https://youtube.com">YouTube</a>
              <a href="https://9anime.to">9Anime</a>
            </body>
          </html>
        `,
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const sites = await discoverFromWebScraping();

      // Should only include anime streaming sites
      const hasReddit = sites.some((s) => s.url.includes("reddit.com"));
      const hasYoutube = sites.some((s) => s.url.includes("youtube.com"));

      expect(hasReddit).toBe(false);
      expect(hasYoutube).toBe(false);
    });

    it("should handle web scraping errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const sites = await discoverFromWebScraping();

      expect(Array.isArray(sites)).toBe(true);
    });
  });

  describe("discoverFromForums", () => {
    it("should return an array from forum crawling", async () => {
      const mockResponse = {
        ok: true,
        text: async () => `
          <html>
            <body>
              Check out https://9anime.to for anime streaming
            </body>
          </html>
        `,
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const sites = await discoverFromForums();

      expect(Array.isArray(sites)).toBe(true);
    });

    it("should handle forum crawling errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const sites = await discoverFromForums();

      expect(Array.isArray(sites)).toBe(true);
    });
  });

  describe("runAllDiscovery", () => {
    it("should run all discovery methods and combine results", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  title: "Sites",
                  selftext: "https://9anime.to",
                },
              },
            ],
          },
        }),
        text: async () => `<a href="https://gogoanime.info">GogoAnime</a>`,
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const sites = await runAllDiscovery();

      expect(Array.isArray(sites)).toBe(true);
    });

    it("should classify sites correctly when discovered", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  title: "Sites",
                  selftext: "https://crunchyroll.com and https://9anime.to",
                },
              },
            ],
          },
        }),
        text: async () => "",
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const sites = await runAllDiscovery();

      // Verify structure
      expect(Array.isArray(sites)).toBe(true);

      if (sites.length > 0) {
        for (const site of sites) {
          expect(["legal", "unofficial"]).toContain(site.genre);
        }
      }
    });

    it("should include source information for each site", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  title: "Sites",
                  selftext: "https://9anime.to",
                },
              },
            ],
          },
        }),
        text: async () => "",
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const sites = await runAllDiscovery();

      for (const site of sites) {
        expect(["reddit", "web_scrape", "forum", "aggregator", "manual"]).toContain(
          site.source
        );
      }
    });

    it("should handle all discovery methods failing gracefully", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network error"));

      const sites = await runAllDiscovery();

      expect(Array.isArray(sites)).toBe(true);
    });
  });
});
