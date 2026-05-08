/**
 * Batch Status Check Script
 * Checks the status of all anime sites and updates the database
 */

import mysql from 'mysql2/promise';

const STATUS_TIMEOUT = 10000; // 10 seconds per site
const MAX_CONCURRENT = 5; // Check 5 sites simultaneously

async function checkSiteStatus(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STATUS_TIMEOUT);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 2xx and 3xx are considered Active
    if (response.status >= 200 && response.status < 400) {
      return 'Active';
    }
    // 4xx and 5xx are considered Down
    return 'Down';
  } catch (error) {
    // Timeout or network error = Down
    return 'Down';
  }
}

async function batchCheckSites() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('[Status Check] Fetching all sites...');
    
    const [sites] = await connection.execute(
      'SELECT id, name, url FROM anime_sites ORDER BY name'
    );

    console.log(`[Status Check] Found ${sites.length} sites\n`);
    console.log('[Status Check] Starting batch status checks...\n');

    let active = 0;
    let down = 0;
    let checked = 0;

    // Process sites in batches
    for (let i = 0; i < sites.length; i += MAX_CONCURRENT) {
      const batch = sites.slice(i, i + MAX_CONCURRENT);

      const results = await Promise.all(
        batch.map(async (site) => ({
          id: site.id,
          name: site.name,
          url: site.url,
          status: await checkSiteStatus(site.url),
        }))
      );

      // Update database with results
      for (const result of results) {
        await connection.execute(
          'UPDATE anime_sites SET status = ?, lastChecked = NOW() WHERE id = ?',
          [result.status, result.id]
        );

        const statusEmoji = result.status === 'Active' ? '✓' : '✗';
        console.log(`[Status Check] ${statusEmoji} ${result.name}: ${result.status}`);

        if (result.status === 'Active') {
          active++;
        } else {
          down++;
        }
        checked++;
      }

      // Progress update
      console.log(`[Status Check] Progress: ${checked}/${sites.length}\n`);
    }

    console.log(`\n[Status Check] Complete!`);
    console.log(`[Status Check] Active: ${active} | Down: ${down} | Total: ${checked}`);
    process.exit(0);
  } catch (error) {
    console.error('[Status Check] Fatal error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

batchCheckSites();
