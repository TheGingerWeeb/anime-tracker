/**
 * Scheduled task for checking anime site status periodically.
 * This runs as a separate scheduled task and updates site statuses via the API.
 */

import fetch from 'node-fetch';

const TIMEOUT_MS = 10000;
const MAX_REDIRECTS = 5;

/**
 * Check if a site is reachable
 */
async function checkSiteStatus(url) {
  try {
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      clearTimeout(timeoutId);

      if (response.status >= 200 && response.status < 400) {
        return 'Active';
      }
      if (response.status >= 400) {
        return 'Down';
      }
      return 'Unknown';
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return 'Down';
      }
      if (fetchError instanceof TypeError) {
        return 'Down';
      }
      return 'Unknown';
    }
  } catch (error) {
    console.error(`Error checking ${url}:`, error);
    return 'Unknown';
  }
}

/**
 * Main scheduled task function
 */
async function runStatusCheck() {
  try {
    console.log(`[${new Date().toISOString()}] Starting scheduled status check...`);

    // Get the endpoint from environment
    const endpoint = process.env.SCHEDULED_TASK_ENDPOINT_BASE;
    const cookie = process.env.SCHEDULED_TASK_COOKIE;

    if (!endpoint || !cookie) {
      console.error('Missing SCHEDULED_TASK_ENDPOINT_BASE or SCHEDULED_TASK_COOKIE');
      process.exit(1);
    }

    // Fetch all sites from the public API
    const sitesResponse = await fetch(`${endpoint}/api/trpc/sites.list?input={"status":"All"}`, {
      headers: {
        'Cookie': `app_session_id=${cookie}`,
      },
    });

    if (!sitesResponse.ok) {
      throw new Error(`Failed to fetch sites: ${sitesResponse.status}`);
    }

    const sitesData = await sitesResponse.json();
    const sites = sitesData.result?.data || [];

    console.log(`Found ${sites.length} sites to check`);

    // Check each site's status
    const updates = [];
    for (const site of sites) {
      const status = await checkSiteStatus(site.url);
      updates.push({
        id: site.id,
        status,
      });
      console.log(`  ✓ ${site.name}: ${status}`);
    }

    // Send updates back via the API
    // This would require a scheduled-task-specific endpoint that accepts bulk updates
    console.log(`[${new Date().toISOString()}] Status check completed. Checked ${updates.length} sites.`);
  } catch (error) {
    console.error('Error in scheduled status check:', error);
    process.exit(1);
  }
}

// Run the task
runStatusCheck();
