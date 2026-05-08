/**
 * Daily Site Discovery Task
 * Runs daily to discover new anime streaming sites and update the database
 * This script is designed to be run as a scheduled task
 * Uses built-in Node.js fetch (18+)
 */

// Use built-in fetch from Node.js 18+
const TIMEOUT_MS = 10000;

/**
 * Discover sites from Reddit communities
 */
async function discoverFromReddit() {
  const sites = [];
  const subreddits = ['animepiracy', 'anime', 'AnimeReccomendations'];

  for (const subreddit of subreddits) {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/search.json?q=anime+streaming+site&limit=50`,
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

        // Extract URLs from post
        const urlMatches = text.match(/https?:\/\/[^\s\)]+/g) || [];
        for (const url of urlMatches) {
          const cleanUrl = url.replace(/[.,;:!?'")\]]/g, '');
          if (isValidAnimeStreamingUrl(cleanUrl)) {
            sites.push({
              name: extractSiteName(cleanUrl),
              url: cleanUrl,
              description: `Found in r/${subreddit}`,
              genre: isLegalSite(cleanUrl) ? 'legal' : 'unofficial',
              contentType: 'both',
              source: 'reddit',
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping r/${subreddit}:`, error.message);
    }
  }

  return deduplicateSites(sites);
}

/**
 * Discover sites from web scraping
 */
async function discoverFromWebScraping() {
  const sites = [];
  const sources = [
    'https://troypoint.com/free-anime-streaming-sites/',
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Extract URLs using regex
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const matches = html.match(urlRegex) || [];

      for (const url of matches) {
        const cleanUrl = url.replace(/[.,;:!?'")\]]/g, '');
        if (isValidAnimeStreamingUrl(cleanUrl)) {
          sites.push({
            name: extractSiteName(cleanUrl),
            url: cleanUrl,
            description: 'Found via web scraping',
            genre: isLegalSite(cleanUrl) ? 'legal' : 'unofficial',
            contentType: 'both',
            source: 'web_scrape',
          });
        }
      }
    } catch (error) {
      console.error(`Error scraping ${source}:`, error.message);
    }
  }

  return deduplicateSites(sites);
}

/**
 * Check if a URL is a valid anime streaming site
 */
function isValidAnimeStreamingUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    const patterns = [
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
    ];

    const matchesPattern = patterns.some(pattern => pattern.test(hostname));

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
 * Check if a site is a legal streaming platform
 */
function isLegalSite(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    const legalSites = [
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
    ];

    return legalSites.some(domain => hostname.includes(domain));
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
    const hostname = urlObj.hostname;

    let name = hostname.replace(/^www\./, '');
    name = name.split('.')[0];

    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return url;
  }
}

/**
 * Deduplicate sites by URL
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
 * Normalize URL for comparison
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
 * Main discovery task
 */
async function runDiscovery() {
  try {
    console.log(`[${new Date().toISOString()}] Starting daily site discovery...`);

    const endpoint = process.env.SCHEDULED_TASK_ENDPOINT_BASE;
    const cookie = process.env.SCHEDULED_TASK_COOKIE;

    if (!endpoint || !cookie) {
      console.error('Missing SCHEDULED_TASK_ENDPOINT_BASE or SCHEDULED_TASK_COOKIE');
      process.exit(1);
    }

    // Run all discovery methods
    console.log('Discovering from Reddit...');
    const redditSites = await discoverFromReddit();
    console.log(`Found ${redditSites.length} sites from Reddit`);

    console.log('Discovering from web scraping...');
    const webSites = await discoverFromWebScraping();
    console.log(`Found ${webSites.length} sites from web scraping`);

    // Combine and deduplicate
    const allSites = deduplicateSites([...redditSites, ...webSites]);
    console.log(`Total unique sites discovered: ${allSites.length}`);

    // Send discovered sites to the API for processing
    if (allSites.length > 0) {
      console.log('Sending discovered sites to API...');
      const response = await fetch(`${endpoint}/api/trpc/admin.addDiscoveredSites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `app_session_id=${cookie}`,
        },
        body: JSON.stringify({
          input: {
            sites: allSites,
          },
        }),
      });

      if (response.ok) {
        console.log('Successfully sent discovered sites to database');
      } else {
        console.error(`API error: ${response.status}`);
      }
    }

    console.log(`[${new Date().toISOString()}] Daily discovery completed`);
  } catch (error) {
    console.error('Error in daily discovery:', error);
    process.exit(1);
  }
}

// Run the discovery task
runDiscovery();
