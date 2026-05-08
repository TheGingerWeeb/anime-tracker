/**
 * Free Anime Streaming Sites with TLD Variations
 * Only includes free browser-based streaming (no paid subscriptions)
 */

import mysql from 'mysql2/promise';

const FREE_ANIME_SITES = [
  // 9Anime - Multiple TLDs
  { name: '9Anime', url: 'https://9anime.to', description: 'Popular free anime streaming with HD quality', genre: 'unofficial', contentType: 'both', notes: 'Multiple TLD variations available' },
  { name: '9Anime (RU)', url: 'https://9anime.ru', description: 'Popular free anime streaming with HD quality', genre: 'unofficial', contentType: 'both', notes: 'Russian mirror' },
  { name: '9Anime (ME)', url: 'https://9anime.me', description: 'Popular free anime streaming with HD quality', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },
  { name: '9Anime (ID)', url: 'https://9anime.id', description: 'Popular free anime streaming with HD quality', genre: 'unofficial', contentType: 'both', notes: 'Indonesian mirror' },
  { name: '9Anime (SH)', url: 'https://9anime.sh', description: 'Popular free anime streaming with HD quality', genre: 'unofficial', contentType: 'both', notes: 'Alternative domain' },

  // AniWatch - Multiple TLDs
  { name: 'AniWatch', url: 'https://aniwatch.to', description: 'HD anime streaming with minimal buffering', genre: 'unofficial', contentType: 'both', notes: 'Multiple server options' },
  { name: 'AniWatch (ME)', url: 'https://aniwatch.me', description: 'HD anime streaming with minimal buffering', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },
  { name: 'AniWatch (SH)', url: 'https://aniwatch.sh', description: 'HD anime streaming with minimal buffering', genre: 'unofficial', contentType: 'both', notes: 'Alternative domain' },

  // GogoAnime - Multiple TLDs
  { name: 'GogoAnime', url: 'https://gogoanime.info', description: 'Vast library of anime in multiple resolutions', genre: 'unofficial', contentType: 'both', notes: 'Frequently updated' },
  { name: 'GogoAnime (SE)', url: 'https://gogoanime.se', description: 'Vast library of anime in multiple resolutions', genre: 'unofficial', contentType: 'both', notes: 'Swedish mirror' },
  { name: 'GogoAnime (PE)', url: 'https://gogoanime.pe', description: 'Vast library of anime in multiple resolutions', genre: 'unofficial', contentType: 'both', notes: 'Peru mirror' },
  { name: 'GogoAnime (AI)', url: 'https://gogoanime.ai', description: 'Vast library of anime in multiple resolutions', genre: 'unofficial', contentType: 'both', notes: 'AI domain' },

  // HiAnime - Multiple TLDs
  { name: 'HiAnime', url: 'https://hianime.to', description: 'Modern interface with clean design', genre: 'unofficial', contentType: 'both', notes: 'Good UX' },
  { name: 'HiAnime (ME)', url: 'https://hianime.me', description: 'Modern interface with clean design', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },
  { name: 'HiAnime (SH)', url: 'https://hianime.sh', description: 'Modern interface with clean design', genre: 'unofficial', contentType: 'both', notes: 'Alternative domain' },

  // AnimeHeaven - Multiple TLDs
  { name: 'AnimeHeaven', url: 'https://animeheaven.ru', description: 'High-quality anime with latest episodes', genre: 'unofficial', contentType: 'both', notes: 'Fast updates' },
  { name: 'AnimeHeaven (ME)', url: 'https://animeheaven.me', description: 'High-quality anime with latest episodes', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Zoro - Multiple TLDs
  { name: 'Zoro', url: 'https://zoro.to', description: 'Modern anime streaming platform', genre: 'unofficial', contentType: 'both', notes: 'Clean interface' },
  { name: 'Zoro (ME)', url: 'https://zoro.me', description: 'Modern anime streaming platform', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Animenana - Multiple TLDs
  { name: 'Animenana', url: 'https://animenana.com', description: 'Ad-free anime streaming', genre: 'unofficial', contentType: 'both', notes: 'No ads' },
  { name: 'Animenana (TO)', url: 'https://animenana.to', description: 'Ad-free anime streaming', genre: 'unofficial', contentType: 'both', notes: 'Alternative TLD' },

  // 4Anime - Multiple TLDs
  { name: '4Anime', url: 'https://4anime.to', description: 'Free anime streaming alternative', genre: 'unofficial', contentType: 'both', notes: 'Multiple mirrors' },
  { name: '4Anime (ME)', url: 'https://4anime.me', description: 'Free anime streaming alternative', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Twist - Multiple TLDs
  { name: 'Twist', url: 'https://twist.moe', description: 'Minimalist anime streaming', genre: 'unofficial', contentType: 'subbed', notes: 'Subbed only' },
  { name: 'Twist (SH)', url: 'https://twist.sh', description: 'Minimalist anime streaming', genre: 'unofficial', contentType: 'subbed', notes: 'Alternative domain' },

  // Animekisa - Multiple TLDs
  { name: 'Animekisa', url: 'https://animekisa.tv', description: 'Free anime with good quality', genre: 'unofficial', contentType: 'both', notes: 'Regular updates' },
  { name: 'Animekisa (IN)', url: 'https://animekisa.in', description: 'Free anime with good quality', genre: 'unofficial', contentType: 'both', notes: 'India mirror' },

  // AnimeFreak - Multiple TLDs
  { name: 'AnimeFreak', url: 'https://animefreak.tv', description: 'Community-focused anime platform', genre: 'unofficial', contentType: 'both', notes: 'Community reviews' },
  { name: 'AnimeFreak (ME)', url: 'https://animefreak.me', description: 'Community-focused anime platform', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Kissanime - Multiple TLDs
  { name: 'Kissanime', url: 'https://kissanime.ru', description: 'Classic anime streaming site', genre: 'unofficial', contentType: 'both', notes: 'Long-running platform' },
  { name: 'Kissanime (AI)', url: 'https://kissanime.ai', description: 'Classic anime streaming site', genre: 'unofficial', contentType: 'both', notes: 'AI domain' },

  // Anime44 - Multiple TLDs
  { name: 'Anime44', url: 'https://anime44.com', description: 'Free anime with multiple servers', genre: 'unofficial', contentType: 'both', notes: 'Backup servers' },
  { name: 'Anime44 (TO)', url: 'https://anime44.to', description: 'Free anime with multiple servers', genre: 'unofficial', contentType: 'both', notes: 'Alternative TLD' },

  // AnimeXin - Multiple TLDs
  { name: 'AnimeXin', url: 'https://animexin.info', description: 'Anime streaming with Asian focus', genre: 'unofficial', contentType: 'both', notes: 'Asian content' },
  { name: 'AnimeXin (ME)', url: 'https://animexin.me', description: 'Anime streaming with Asian focus', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Animeflv - Multiple TLDs
  { name: 'Animeflv', url: 'https://animeflv.net', description: 'Spanish anime streaming', genre: 'unofficial', contentType: 'dubbed', notes: 'Spanish platform' },
  { name: 'Animeflv (TO)', url: 'https://animeflv.to', description: 'Spanish anime streaming', genre: 'unofficial', contentType: 'dubbed', notes: 'Alternative TLD' },

  // Monoschinos - Multiple TLDs
  { name: 'Monoschinos', url: 'https://monoschinos.com', description: 'Latin American anime platform', genre: 'unofficial', contentType: 'dubbed', notes: 'Spanish/Portuguese' },
  { name: 'Monoschinos (TO)', url: 'https://monoschinos.to', description: 'Latin American anime platform', genre: 'unofficial', contentType: 'dubbed', notes: 'Alternative TLD' },

  // Animeid - Multiple TLDs
  { name: 'Animeid', url: 'https://animeid.tv', description: 'Indonesian anime streaming', genre: 'unofficial', contentType: 'both', notes: 'Indonesian content' },
  { name: 'Animeid (ME)', url: 'https://animeid.me', description: 'Indonesian anime streaming', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Animeindo - Multiple TLDs
  { name: 'Animeindo', url: 'https://animeindo.info', description: 'Indonesian anime with subtitles', genre: 'unofficial', contentType: 'both', notes: 'Indonesian subs' },
  { name: 'Animeindo (ME)', url: 'https://animeindo.me', description: 'Indonesian anime with subtitles', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Samehadaku - Multiple TLDs
  { name: 'Samehadaku', url: 'https://samehadaku.tv', description: 'Indonesian anime streaming', genre: 'unofficial', contentType: 'both', notes: 'Indonesian platform' },
  { name: 'Samehadaku (ME)', url: 'https://samehadaku.me', description: 'Indonesian anime streaming', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Oploverz - Multiple TLDs
  { name: 'Oploverz', url: 'https://oploverz.in', description: 'Indonesian anime alternative', genre: 'unofficial', contentType: 'both', notes: 'Indonesian site' },
  { name: 'Oploverz (ME)', url: 'https://oploverz.me', description: 'Indonesian anime alternative', genre: 'unofficial', contentType: 'both', notes: 'Alternative mirror' },

  // Jkanime - Multiple TLDs
  { name: 'Jkanime', url: 'https://jkanime.net', description: 'Spanish language anime streaming', genre: 'unofficial', contentType: 'dubbed', notes: 'Spanish content' },
  { name: 'Jkanime (TO)', url: 'https://jkanime.to', description: 'Spanish language anime streaming', genre: 'unofficial', contentType: 'dubbed', notes: 'Alternative TLD' },

  // AnimeFenix - Multiple TLDs
  { name: 'AnimeFenix', url: 'https://animefenix.com', description: 'Latin American anime focus', genre: 'unofficial', contentType: 'dubbed', notes: 'Spanish dubbing' },
  { name: 'AnimeFenix (TO)', url: 'https://animefenix.to', description: 'Latin American anime focus', genre: 'unofficial', contentType: 'dubbed', notes: 'Alternative TLD' },

  // Animekakalot - Multiple TLDs
  { name: 'Animekakalot', url: 'https://animekakalot.com', description: 'Anime and manga platform', genre: 'unofficial', contentType: 'both', notes: 'Also manga' },
  { name: 'Animekakalot (TO)', url: 'https://animekakalot.to', description: 'Anime and manga platform', genre: 'unofficial', contentType: 'both', notes: 'Alternative TLD' },

  // Animesimple - Multiple TLDs
  { name: 'Animesimple', url: 'https://animesimple.com', description: 'Simple anime streaming interface', genre: 'unofficial', contentType: 'both', notes: 'Simple design' },
  { name: 'Animesimple (TO)', url: 'https://animesimple.to', description: 'Simple anime streaming interface', genre: 'unofficial', contentType: 'both', notes: 'Alternative TLD' },

  // Free Legal Options (Ad-Supported)
  { name: 'Tubi', url: 'https://tubitv.com/category/anime', description: 'Free ad-supported anime streaming', genre: 'legal', contentType: 'both', notes: 'Free with ads' },
  { name: 'AnimePlanet', url: 'https://www.animeplanet.com', description: 'Free anime streaming with community features', genre: 'legal', contentType: 'both', notes: 'Free with ads' },
  { name: 'RetroCrush', url: 'https://www.retrocrush.tv', description: 'Retro and classic anime focus', genre: 'legal', contentType: 'subbed', notes: 'Free with ads' },
  { name: 'Plex', url: 'https://www.plex.tv', description: 'Free streaming service with anime', genre: 'legal', contentType: 'both', notes: 'Free with ads' },
  { name: 'Pluto TV', url: 'https://www.plutotv.com', description: 'Free TV with anime channels', genre: 'legal', contentType: 'both', notes: 'Free channels' },
  { name: 'Freevee', url: 'https://www.freevee.com', description: 'Amazon free streaming with anime', genre: 'legal', contentType: 'both', notes: 'Free with ads' },
];

async function seedDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log(`[Seed] Clearing old sites and adding ${FREE_ANIME_SITES.length} free anime sites with TLD variations...\n`);

    // Delete all existing sites to start fresh
    await connection.execute('DELETE FROM anime_sites');
    console.log('[Seed] Cleared existing sites\n');

    let added = 0;
    let skipped = 0;

    for (const site of FREE_ANIME_SITES) {
      try {
        // Check if site already exists
        const [existing] = await connection.execute(
          'SELECT id FROM anime_sites WHERE url = ?',
          [site.url]
        );

        if (existing.length > 0) {
          console.log(`[Seed] ⊘ Already exists: ${site.name} (${site.url})`);
          skipped++;
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
            site.notes,
          ]
        );

        console.log(`[Seed] ✓ Added: ${site.name} (${site.url})`);
        added++;
      } catch (error) {
        console.error(`[Seed] ✗ Error adding ${site.name}:`, error.message);
      }
    }

    console.log(`\n[Seed] Complete! Added: ${added}, Skipped: ${skipped}`);
    console.log(`[Seed] Total sites in database: ${added}`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Fatal error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
