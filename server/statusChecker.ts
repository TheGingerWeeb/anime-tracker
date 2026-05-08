/**
 * Utility module for checking anime site availability status.
 * Handles HTTP requests with timeout and proper error handling.
 */

const TIMEOUT_MS = 10000; // 10 second timeout per request
const MAX_REDIRECTS = 5;

/**
 * Check if a site is reachable and return its status.
 * Returns "Active" if the site responds with a 2xx or 3xx status code.
 * Returns "Down" if the site is unreachable or returns 4xx/5xx.
 * Returns "Unknown" if there's an unexpected error.
 */
export async function checkSiteStatus(url: string): Promise<"Active" | "Down" | "Unknown"> {
  try {
    // Ensure URL has protocol
    let targetUrl = url;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(targetUrl, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      clearTimeout(timeoutId);

      // 2xx and 3xx status codes indicate the site is active
      if (response.status >= 200 && response.status < 400) {
        return "Active";
      }

      // 4xx and 5xx indicate the site is down
      if (response.status >= 400) {
        return "Down";
      }

      return "Unknown";
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return "Down";
      }

      // Handle network errors
      if (fetchError instanceof TypeError) {
        return "Down";
      }

      return "Unknown";
    }
  } catch (error) {
    console.error(`[StatusChecker] Unexpected error checking ${url}:`, error);
    return "Unknown";
  }
}

/**
 * Check multiple sites in parallel with a concurrency limit.
 * Returns a map of site IDs to their status.
 */
export async function checkMultipleSites(
  sites: Array<{ id: number; url: string }>,
  concurrency: number = 5
): Promise<Map<number, "Active" | "Down" | "Unknown">> {
  const results = new Map<number, "Active" | "Down" | "Unknown">();
  const queue = [...sites];
  let running = 0;

  return new Promise((resolve) => {
    const processNext = async () => {
      if (queue.length === 0 && running === 0) {
        resolve(results);
        return;
      }

      if (queue.length > 0 && running < concurrency) {
        running++;
        const site = queue.shift();

        if (site) {
          try {
            const status = await checkSiteStatus(site.url);
            results.set(site.id, status);
          } catch (error) {
            console.error(`[StatusChecker] Error checking site ${site.id}:`, error);
            results.set(site.id, "Unknown");
          }
        }

        running--;
        processNext();
      }
    };

    // Start initial batch
    for (let i = 0; i < concurrency && i < queue.length; i++) {
      processNext();
    }
  });
}
