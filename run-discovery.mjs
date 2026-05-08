/**
 * Run Site Discovery and Import to Database
 * This script discovers anime streaming sites from multiple sources
 * and imports them into the database
 */

import mysql from 'mysql2/promise';

// Anime site patterns for validation
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
  /hianime/i,
  /animefreak/i,
  /4anime/i,
  /kissanime/i,
  /animefenix/i,
];

const LEGAL_SITES = new Set([
  'crunchyroll.com',
  'tubitv.com',
  'primevideo.com',
  'viz.com',
  'myanimelist.net',
  'retrocrush.tv',
  'animeplanet.com',
  'netflix.com',
  'hulu.com',
  'disneyplus.com',
]);

/**
 * Discover sites from Reddit
 */
async function discoverFromReddit() {
  const sites = [];
  const subreddits = ['animepiracy', 'anime'];

  for (const subreddit of subreddits) {
    try {
      console.log(`[Discovery] Scraping r/${subreddit}...`);
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/.json?limit=100`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const posts = data.data?.children || [];

      for (const post of posts) {
        const postData = post.data;
        const text = `${postData.title} ${postData.selftext}`;

        // Extract URLs
        const urlMatches = text.match(/https?:\/\/[^\s\)]+/g) || [];
        for (const url of urlMatches) {
          const cleanUrl = url.replace(/[.,;:!?'")\]]/g, '');
          if (isValidAnimeStreamingUrl(cleanUrl)) {
            sites.push({
              name: extractSiteName(cleanUrl),
              url: cleanUrl,
              description: `Anime streaming platform`,
              genre: isLegalSite(cleanUrl) ? 'legal' : 'unofficial',
              contentType: 'both',
              source: 'reddit',
            });
          }
        }
      }
    } catch (error) {
      console.error(`[Discovery] Error scraping r/${subreddit}:`, error.message);
    }
  }

  return deduplicateSites(sites);
}

/**
 * Discover sites from web scraping
 */
async function discoverFromWeb() {
  const sites = [];
  const sources = [
    'https://troypoint.com/free-anime-streaming-sites/',
  ];

  for (const source of sources) {
    try {
      console.log(`[Discovery] Scraping ${source}...`);
      const response = await fetch(source, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Extract URLs
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const matches = html.match(urlRegex) || [];

      for (const url of matches) {
        const cleanUrl = url.replace(/[.,;:!?'")\]]/g, '');
        if (isValidAnimeStreamingUrl(cleanUrl)) {
          sites.push({
            name: extractSiteName(cleanUrl),
            url: cleanUrl,
            description: `Anime streaming platform`,
            genre: isLegalSite(cleanUrl) ? 'legal' : 'unofficial',
            contentType: 'both',
            source: 'web_scrape',
          });
        }
      }
    } catch (error) {
      console.error(`[Discovery] Error scraping ${source}:`, error.message);
    }
  }

  return deduplicateSites(sites);
}

/**
 * Validate anime streaming URL
 */
function isValidAnimeStreamingUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    const matchesPattern = ANIME_SITE_PATTERNS.some(pattern => pattern.test(hostname));

    const excluded = [
      'reddit.com',
      'youtube.com',
      'twitter.com',
      'facebook.com',
      'instagram.com',
      'discord.com',
      'github.com',
    ];

    const isExcluded = excluded.some(domain => hostname.includes(domain));

    return matchesPattern && !isExcluded;
  } catch {
    return false;
  }
}

/**
 * Check if site is legal
 */
function isLegalSite(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return Array.from(LEGAL_SITES).some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Extract site name from URL
 */
function extractSiteName(url) {
  try {
    const urlObj = new URL(url);
    let name = urlObj.hostname.replace(/^www\./, '');
    name = name.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return url;
  }
}

/**
 * Deduplicate sites
 */
function deduplicateSites(sites) {
  const seen = new Set();
  const unique = [];

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
 * Normalize URL
 */
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Import sites to database
 */
async function importSitesToDatabase(sites) {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log(`[Import] Importing ${sites.length} sites to database...`);

    for (const site of sites) {
      try {
        // Check if site already exists
        const [existing] = await connection.execute(
          'SELECT id FROM anime_sites WHERE url = ?',
          [site.url]
        );

        if (existing.length > 0) {
          console.log(`[Import] Site already exists: ${site.name}`);
          continue;
        }

        // Insert new site
        await connection.execute(
          `INSERT INTO anime_sites (name, url, description, genre, contentType, status, notes, lastChecked, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [
            site.name,
            site.url,
            site.description,
            site.genre,
            site.contentType,
            'Unknown',
            `Discovered from ${site.source}`,
          ]
        );

        console.log(`[Import] Added: ${site.name}`);
      } catch (error) {
        console.error(`[Import] Error adding ${site.name}:`, error.message);
      }
    }

    console.log('[Import] Import complete!');
  } finally {
    await connection.end();
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('[Discovery] Starting site discovery...\n');

    // Discover from all sources
    const redditSites = await discoverFromReddit();
    console.log(`[Discovery] Found ${redditSites.length} sites from Reddit\n`);

    const webSites = await discoverFromWeb();
    console.log(`[Discovery] Found ${webSites.length} sites from web\n`);

    // Combine and deduplicate
    const allSites = deduplicateSites([...redditSites, ...webSites]);
    console.log(`[Discovery] Total unique sites discovered: ${allSites.length}\n`);

    if (allSites.length === 0) {
      console.log('[Discovery] No sites discovered. Exiting.');
      process.exit(0);
    }

    // Import to database
    await importSitesToDatabase(allSites);

    console.log('[Discovery] Done!');
    process.exit(0);
  } catch (error) {
    console.error('[Discovery] Fatal error:', error);
    process.exit(1);
  }
}

main();
