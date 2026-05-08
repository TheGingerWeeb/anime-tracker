import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkSiteStatus } from "./statusChecker";

// Mock fetch for testing
global.fetch = vi.fn();

describe("statusChecker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkSiteStatus", () => {
    it("should return 'Active' for successful response (200)", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        ok: true,
      });

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Active");
    });

    it("should return 'Active' for redirect response (301, 302)", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 302,
        ok: true,
      });

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Active");
    });

    it("should return 'Down' for 404 Not Found", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 404,
        ok: false,
      });

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Down");
    });

    it("should return 'Down' for 500 Server Error", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 500,
        ok: false,
      });

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Down");
    });

    it("should return 'Down' for 503 Service Unavailable", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 503,
        ok: false,
      });

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Down");
    });

    it("should return 'Down' for timeout (AbortError)", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      (global.fetch as any).mockRejectedValueOnce(abortError);

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Down");
    });

    it("should return 'Down' for network error (TypeError)", async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new TypeError("Failed to fetch")
      );

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Down");
    });

    it("should return 'Unknown' for unexpected errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error("Unexpected error")
      );

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Unknown");
    });

    it("should add https:// prefix if URL lacks protocol", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        ok: true,
      });

      await checkSiteStatus("example.com");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://"),
        expect.any(Object)
      );
    });

    it("should use HEAD request method", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        ok: true,
      });

      await checkSiteStatus("https://example.com");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "HEAD",
        })
      );
    });

    it("should set appropriate timeout", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        ok: true,
      });

      await checkSiteStatus("https://example.com");

      // Verify fetch was called with signal (timeout mechanism)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(Object),
        })
      );
    });

    it("should include User-Agent header", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        ok: true,
      });

      await checkSiteStatus("https://example.com");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "User-Agent": expect.stringContaining("Mozilla"),
          }),
        })
      );
    });

    it("should handle multiple consecutive checks", async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ status: 200, ok: true })
        .mockResolvedValueOnce({ status: 404, ok: false })
        .mockResolvedValueOnce({ status: 500, ok: false });

      const result1 = await checkSiteStatus("https://site1.com");
      const result2 = await checkSiteStatus("https://site2.com");
      const result3 = await checkSiteStatus("https://site3.com");

      expect(result1).toBe("Active");
      expect(result2).toBe("Down");
      expect(result3).toBe("Down");
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("should return 'Down' for 403 Forbidden", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 403,
        ok: false,
      });

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Down");
    });

    it("should return 'Down' for 429 Too Many Requests", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 429,
        ok: false,
      });

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Down");
    });

    it("should handle generic errors as Unknown", async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error("Generic error")
      );

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Unknown");
    });

    it("should handle connection errors as Unknown", async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error("Connection failed")
      );

      const result = await checkSiteStatus("https://example.com");
      expect(result).toBe("Unknown");
    });
  });
});
