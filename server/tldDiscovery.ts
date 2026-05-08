/**
 * TLD Variation Discovery Module
 * Automatically discovers and tests new TLD variations of anime streaming sites
 */

const COMMON_TLDS = [
  '.to', '.ru', '.me', '.sh', '.ai', '.xyz', '.info', '.tv', '.in', '.pe',
  '.se', '.net', '.com', '.org', '.cc', '.ws', '.biz', '.mobi', '.asia',
  '.click', '.download', '.fun', '.online', '.site', '.space', '.tech',
  '.world', '.zone', '.link', '.host', '.cloud', '.pro', '.app'
];

/**
 * Extract base domain from a URL
 * e.g., "9anime.to" -> "9anime"
 */
export function extractBaseDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    
    // Handle cases like "9anime.to" -> "9anime"
    if (parts.length >= 2) {
      return parts[0];
    }
    return hostname;
  } catch {
    return '';
  }
}

/**
 * Generate TLD variations for a base domain
 * e.g., "9anime" -> ["9anime.to", "9anime.ru", "9anime.me", ...]
 */
export function generateTldVariations(baseDomain: string): string[] {
  if (!baseDomain || baseDomain.length === 0) {
    return [];
  }

  return COMMON_TLDS.map(tld => `https://${baseDomain}${tld}`);
}

/**
 * Test if a URL is reachable (returns 2xx or 3xx status)
 */
export async function testUrlReachability(url: string, timeoutMs: number = 10000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Consider 2xx and 3xx as reachable
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    // Timeout, network error, or other fetch error
    return false;
  }
}

/**
 * Discover new TLD variations for a given base domain
 * Returns list of reachable URLs
 */
export async function discoverTldVariations(
  baseDomain: string,
  existingUrls: string[] = [],
  maxConcurrent: number = 5
): Promise<string[]> {
  const variations = generateTldVariations(baseDomain);
  
  // Filter out URLs that already exist
  const existingDomains = new Set(
    existingUrls.map(url => {
      try {
        return new URL(url).hostname;
      } catch {
        return '';
      }
    })
  );

  const newVariations = variations.filter(url => {
    try {
      const hostname = new URL(url).hostname;
      return !existingDomains.has(hostname);
    } catch {
      return true;
    }
  });

  // Test URLs concurrently with limit
  const reachableUrls: string[] = [];
  
  for (let i = 0; i < newVariations.length; i += maxConcurrent) {
    const batch = newVariations.slice(i, i + maxConcurrent);
    const results = await Promise.all(
      batch.map(async (url) => ({
        url,
        reachable: await testUrlReachability(url),
      }))
    );

    results.forEach(({ url, reachable }) => {
      if (reachable) {
        reachableUrls.push(url);
      }
    });
  }

  return reachableUrls;
}

/**
 * Extract site group name from URL
 * e.g., "https://9anime.to" -> "9Anime"
 */
export function extractSiteGroup(url: string, siteName: string): string {
  try {
    const baseDomain = extractBaseDomain(url);
    
    // If site name is like "9Anime (RU)", extract just "9Anime"
    const groupName = siteName.split('(')[0].trim();
    
    return groupName || baseDomain;
  } catch {
    return siteName;
  }
}

/**
 * Batch discover TLD variations for multiple sites
 */
export async function batchDiscoverTldVariations(
  sites: Array<{ name: string; url: string }>,
  maxConcurrent: number = 3
): Promise<Array<{ baseDomain: string; newUrls: string[] }>> {
  const results: Array<{ baseDomain: string; newUrls: string[] }> = [];
  const processedDomains = new Set<string>();

  for (let i = 0; i < sites.length; i += maxConcurrent) {
    const batch = sites.slice(i, i + maxConcurrent);

    const batchResults = await Promise.all(
      batch.map(async (site) => {
        const baseDomain = extractBaseDomain(site.url);
        
        // Skip if already processed
        if (processedDomains.has(baseDomain)) {
          return null;
        }

        processedDomains.add(baseDomain);

        const existingUrls = sites
          .filter(s => extractBaseDomain(s.url) === baseDomain)
          .map(s => s.url);

        const newUrls = await discoverTldVariations(baseDomain, existingUrls);

        return { baseDomain, newUrls };
      })
    );

    batchResults.forEach((result) => {
      if (result && result.newUrls.length > 0) {
        results.push(result);
      }
    });
  }

  return results;
}
