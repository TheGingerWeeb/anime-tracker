import { describe, it, expect } from "vitest";
import {
  extractBaseDomain,
  generateTldVariations,
  extractSiteGroup,
} from "./tldDiscovery";

describe("tldDiscovery", () => {
  describe("extractBaseDomain", () => {
    it("should extract base domain from full URL", () => {
      const result = extractBaseDomain("https://9anime.to");
      expect(result).toBe("9anime");
    });

    it("should handle different TLDs", () => {
      expect(extractBaseDomain("https://9anime.ru")).toBe("9anime");
      expect(extractBaseDomain("https://9anime.me")).toBe("9anime");
      expect(extractBaseDomain("https://9anime.sh")).toBe("9anime");
    });

    it("should handle subdomains", () => {
      const result = extractBaseDomain("https://www.example.com");
      expect(result).toBe("www");
    });

    it("should handle invalid URLs", () => {
      const result = extractBaseDomain("not-a-url");
      expect(result).toBe("");
    });

    it("should handle URLs without protocol", () => {
      const result = extractBaseDomain("9anime.to");
      expect(result).toBe("");
    });
  });

  describe("generateTldVariations", () => {
    it("should generate multiple TLD variations", () => {
      const variations = generateTldVariations("9anime");
      expect(variations.length).toBeGreaterThan(10);
      expect(variations).toContain("https://9anime.to");
      expect(variations).toContain("https://9anime.ru");
      expect(variations).toContain("https://9anime.me");
    });

    it("should not generate variations for empty domain", () => {
      const variations = generateTldVariations("");
      expect(variations).toEqual([]);
    });

    it("should include common TLDs", () => {
      const variations = generateTldVariations("test");
      const urls = variations.map(v => new URL(v).hostname);
      expect(urls).toContain("test.to");
      expect(urls).toContain("test.ru");
      expect(urls).toContain("test.me");
      expect(urls).toContain("test.sh");
      expect(urls).toContain("test.ai");
      expect(urls).toContain("test.xyz");
    });

    it("should generate HTTPS URLs", () => {
      const variations = generateTldVariations("anime");
      variations.forEach(url => {
        expect(url).toMatch(/^https:\/\//);
      });
    });
  });

  describe("extractSiteGroup", () => {
    it("should extract group name from site name with TLD variation", () => {
      const result = extractSiteGroup("https://9anime.ru", "9Anime (RU)");
      expect(result).toBe("9Anime");
    });

    it("should handle site names without variations", () => {
      const result = extractSiteGroup("https://9anime.to", "9Anime");
      expect(result).toBe("9Anime");
    });

    it("should handle multiple parentheses", () => {
      const result = extractSiteGroup("https://test.com", "Test (Mirror) (Backup)");
      expect(result).toBe("Test");
    });

    it("should trim whitespace", () => {
      const result = extractSiteGroup("https://test.com", "Test  (ME)  ");
      expect(result).toBe("Test");
    });

    it("should return site name if extraction fails", () => {
      const result = extractSiteGroup("invalid", "TestSite");
      expect(result).toBe("TestSite");
    });

    it("should handle empty site name", () => {
      const result = extractSiteGroup("https://test.com", "");
      // Falls back to base domain when site name is empty
      expect(result).toBe("test");
    });
  });
});
