/**
 * Site Discovery Engine
 * Discovers anime streaming sites from multiple sources:
 * - Reddit communities
 * - Web scraping
 * - Forum crawling
 * - Public aggregators
 */

import { JSDOM } from "jsdom";

// Use built-in fetch (Node.js 18+)

export interface DiscoveredSite {
  name: string;
  url: string;
  description?: string;
  genre: "legal" | "unofficial";
  contentType: "subbed" | "dubbed" | "both";
  source: "reddit" | "web_scrape" | "forum" | "aggregator" | "manual";
  discoveredAt: Date;
  metadata?: {
    region?: string;
    languages?: string[];
    hasAds?: boolean;
    quality?: string;
  };
}

// Common anime streaming site patterns
const ANIME_SITE_PATTERNS = [
  /anime/i,
  /streaming/i,
  /watch/i,
  /9anime/i,
  /gogoanime/i,
  /aniwatch/i,
  /animeheaven/i,
  /animenana/i,
  /animeplanet/i,
  /crunchyroll/i,
  /myanimelist/i,
  /kissanime/i,
  /animefenix/i,
  /hianime/i,
  /animefreak/i,
  /4anime/i,
];

const LEGAL_SITES = new Set([
  "crunchyroll.com",
  "tubitv.com",
  "primevideo.com",
  "viz.com",
  "myanimelist.net",
  "retrocrush.tv",
  "animeplanet.com",
  "netflix.com",
  "hulu.com",
  "disneyplus.com",
]);

/**
 * Discover sites from Reddit communities
 */
export async function discoverFromReddit(): Promise<DiscoveredSite[]> {
  const sites: DiscoveredSite[] = [];
  const subreddits = ["animepiracy", "anime", "AnimeReccomendations"];

  for (const subreddit of subreddits) {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/search.json?q=anime+streaming+site&limit=100`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (!response.ok) continue;

      const data = (await response.json()) as any;
      const posts = data.data?.children || [];

      for (const post of posts) {
        const postData = post.data;
        const text = `${postData.title} ${postData.selftext}`;

        // Extract URLs from post
        const urlMatches = text.match(/https?:\/\/[^\s\)]+/g) || [];
        for (const url of urlMatches) {
          const cleanUrl = url.replace(/[.,;:!?'")\]]/g, "");
          if (isValidAnimeStreamingUrl(cleanUrl)) {
            sites.push({
              name: extractSiteName(cleanUrl),
              url: cleanUrl,
              description: `Found in r/${subreddit}`,
              genre: isLegalSite(cleanUrl) ? "legal" : "unofficial",
              contentType: "both",
              source: "reddit",
              discoveredAt: new Date(),
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping r/${subreddit}:`, error);
    }
  }

  return deduplicateSites(sites);
}

/**
 * Discover sites from web scraping
 */
export async function discoverFromWebScraping(): Promise<DiscoveredSite[]> {
  const sites: DiscoveredSite[] = [];
  const sources = [
    "https://theindex.moe/",
    "https://troypoint.com/free-anime-streaming-sites/",
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract all links
      const links = document.querySelectorAll("a[href]");
      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && isValidAnimeStreamingUrl(href)) {
          const text = link.textContent || "";
          sites.push({
            name: extractSiteName(href),
            url: href,
            description: text.substring(0, 100),
            genre: isLegalSite(href) ? "legal" : "unofficial",
            contentType: "both",
            source: "web_scrape",
            discoveredAt: new Date(),
          });
        }
      });
    } catch (error) {
      console.error(`Error scraping ${source}:`, error);
    }
  }

  return deduplicateSites(sites);
}

/**
 * Discover sites from forum crawling
 */
export async function discoverFromForums(): Promise<DiscoveredSite[]> {
  const sites: DiscoveredSite[] = [];
  const forumUrls = [
    "https://www.reddit.com/r/animepiracy/",
    "https://www.reddit.com/r/anime/",
  ];

  for (const forumUrl of forumUrls) {
    try {
      const response = await fetch(forumUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Extract URLs using regex
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const matches = html.match(urlRegex) || [];

      for (const url of matches) {
        const cleanUrl = url.replace(/[.,;:!?'")\]]/g, "");
        if (isValidAnimeStreamingUrl(cleanUrl)) {
          sites.push({
            name: extractSiteName(cleanUrl),
            url: cleanUrl,
            genre: isLegalSite(cleanUrl) ? "legal" : "unofficial",
            contentType: "both",
            source: "forum",
            discoveredAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error(`Error crawling ${forumUrl}:`, error);
    }
  }

  return deduplicateSites(sites);
}

/**
 * Check if a URL is a valid anime streaming site
 */
function isValidAnimeStreamingUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check if URL matches anime site patterns
    const matchesPattern = ANIME_SITE_PATTERNS.some((pattern) =>
      pattern.test(hostname)
    );

    // Exclude common non-streaming domains
    const excluded = [
      "reddit.com",
      "youtube.com",
      "twitter.com",
      "facebook.com",
      "instagram.com",
      "discord.com",
      "github.com",
    ];

    const isExcluded = excluded.some((domain) => hostname.includes(domain));

    return matchesPattern && !isExcluded;
  } catch {
    return false;
  }
}

/**
 * Check if a site is a legal streaming platform
 */
function isLegalSite(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return Array.from(LEGAL_SITES).some((domain) =>
      hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

/**
 * Extract site name from URL
 */
function extractSiteName(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Remove www. prefix
    let name = hostname.replace(/^www\./, "");

    // Remove TLD
    name = name.split(".")[0];

    // Capitalize
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return url;
  }
}

/**
 * Deduplicate sites by URL
 */
function deduplicateSites(sites: DiscoveredSite[]): DiscoveredSite[] {
  const seen = new Set<string>();
  const unique: DiscoveredSite[] = [];

  for (const site of sites) {
    const key = normalizeUrl(site.url);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(site);
    }
  }

  return unique;
}

/**
 * Normalize URL for comparison
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Run all discovery methods
 */
export async function runAllDiscovery(): Promise<DiscoveredSite[]> {
  console.log("[Site Discovery] Starting discovery from all sources...");

  const allSites: DiscoveredSite[] = [];

  try {
    console.log("[Site Discovery] Discovering from Reddit...");
    const redditSites = await discoverFromReddit();
    allSites.push(...redditSites);
    console.log(`[Site Discovery] Found ${redditSites.length} sites from Reddit`);
  } catch (error) {
    console.error("[Site Discovery] Reddit discovery failed:", error);
  }

  try {
    console.log("[Site Discovery] Discovering from web scraping...");
    const webSites = await discoverFromWebScraping();
    allSites.push(...webSites);
    console.log(
      `[Site Discovery] Found ${webSites.length} sites from web scraping`
    );
  } catch (error) {
    console.error("[Site Discovery] Web scraping failed:", error);
  }

  try {
    console.log("[Site Discovery] Discovering from forums...");
    const forumSites = await discoverFromForums();
    allSites.push(...forumSites);
    console.log(`[Site Discovery] Found ${forumSites.length} sites from forums`);
  } catch (error) {
    console.error("[Site Discovery] Forum discovery failed:", error);
  }

  const uniqueSites = deduplicateSites(allSites);
  console.log(
    `[Site Discovery] Total unique sites discovered: ${uniqueSites.length}`
  );

  return uniqueSites;
}
