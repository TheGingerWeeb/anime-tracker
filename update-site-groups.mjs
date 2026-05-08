/**
 * Update all sites with siteGroup values based on their base domain
 */

import mysql from 'mysql2/promise';

function extractBaseDomain(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    
    if (parts.length >= 2) {
      return parts[0];
    }
    return hostname;
  } catch {
    return '';
  }
}

async function updateSiteGroups() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('[Update] Fetching all sites...');
    
    const [sites] = await connection.execute(
      'SELECT id, name, url FROM anime_sites ORDER BY name'
    );

    console.log(`[Update] Found ${sites.length} sites\n`);

    let updated = 0;

    for (const site of sites) {
      const baseDomain = extractBaseDomain(site.url);
      
      // Extract site group name (e.g., "9Anime (RU)" -> "9Anime")
      const groupName = site.name.split('(')[0].trim();
      
      await connection.execute(
        'UPDATE anime_sites SET siteGroup = ? WHERE id = ?',
        [groupName, site.id]
      );

      console.log(`[Update] ✓ ${site.name} -> Group: "${groupName}"`);
      updated++;
    }

    console.log(`\n[Update] Complete! Updated ${updated} sites with siteGroup values`);
    process.exit(0);
  } catch (error) {
    console.error('[Update] Fatal error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

updateSiteGroups();
