/**
 * Comprehensive Anime Sites Seed Script
 * Adds 50+ anime streaming sites to the database
 */

import mysql from 'mysql2/promise';

const ANIME_SITES = [
  // Legal/Official Platforms
  { name: 'Crunchyroll', url: 'https://www.crunchyroll.com', description: 'Largest legal anime library with simulcasts', genre: 'legal', contentType: 'both', notes: 'Premium subscription recommended' },
  { name: 'Tubi', url: 'https://tubitv.com/category/anime', description: 'Free ad-supported anime streaming', genre: 'legal', contentType: 'both', notes: 'Free with ads' },
  { name: 'Prime Video', url: 'https://www.primevideo.com', description: 'Amazon Prime anime collection', genre: 'legal', contentType: 'both', notes: 'Requires Prime membership' },
  { name: 'Netflix', url: 'https://www.netflix.com', description: 'Netflix anime originals and licensed content', genre: 'legal', contentType: 'both', notes: 'Subscription required' },
  { name: 'Hulu', url: 'https://www.hulu.com', description: 'Hulu anime library', genre: 'legal', contentType: 'both', notes: 'Subscription required' },
  { name: 'MyAnimeList', url: 'https://myanimelist.net', description: 'Community-driven anime database with streaming links', genre: 'legal', contentType: 'both', notes: 'Community recommendations' },
  { name: 'AnimePlanet', url: 'https://www.animeplanet.com', description: 'Free anime streaming with community features', genre: 'legal', contentType: 'both', notes: 'Free with ads' },
  { name: 'RetroCrush', url: 'https://www.retrocrush.tv', description: 'Retro and classic anime focus', genre: 'legal', contentType: 'subbed', notes: 'Free with ads' },
  { name: 'Viz Media', url: 'https://www.viz.com', description: 'Official anime distributor', genre: 'legal', contentType: 'both', notes: 'Free and premium content' },
  { name: 'Hoopla', url: 'https://www.hoopladigital.com', description: 'Library-based streaming service', genre: 'legal', contentType: 'both', notes: 'Requires library card' },

  // Unofficial/Free Platforms
  { name: '9Anime', url: 'https://9anime.to', description: 'Popular free anime streaming with HD quality', genre: 'unofficial', contentType: 'both', notes: 'Use VPN recommended' },
  { name: 'AniWatch', url: 'https://aniwatch.to', description: 'HD anime streaming with minimal buffering', genre: 'unofficial', contentType: 'both', notes: 'Multiple server options' },
  { name: 'GogoAnime', url: 'https://gogoanime.info', description: 'Vast library of anime in multiple resolutions', genre: 'unofficial', contentType: 'both', notes: 'Frequently updated' },
  { name: 'AnimeHeaven', url: 'https://animeheaven.ru', description: 'High-quality anime with latest episodes', genre: 'unofficial', contentType: 'both', notes: 'Fast updates' },
  { name: 'HiAnime', url: 'https://hianime.to', description: 'Modern interface with clean design', genre: 'unofficial', contentType: 'both', notes: 'Good UX' },
  { name: 'Animenana', url: 'https://animenana.com', description: 'Ad-free anime streaming', genre: 'unofficial', contentType: 'both', notes: 'No ads' },
  { name: '4Anime', url: 'https://4anime.to', description: 'Free anime streaming alternative', genre: 'unofficial', contentType: 'both', notes: 'Multiple mirrors' },
  { name: 'AnimeFreak', url: 'https://animefreak.tv', description: 'Community-focused anime platform', genre: 'unofficial', contentType: 'both', notes: 'Community reviews' },
  { name: 'Hikari', url: 'https://www.hikari.tv', description: 'Niche anime and Japanese culture focus', genre: 'legal', contentType: 'both', notes: 'Curated selection' },

  // Additional Platforms
  { name: 'Kissanime', url: 'https://kissanime.ru', description: 'Classic anime streaming site', genre: 'unofficial', contentType: 'both', notes: 'Long-running platform' },
  { name: 'AnimeFenix', url: 'https://animefenix.com', description: 'Latin American anime focus', genre: 'unofficial', contentType: 'dubbed', notes: 'Spanish dubbing' },
  { name: 'Anime44', url: 'https://anime44.com', description: 'Free anime with multiple servers', genre: 'unofficial', contentType: 'both', notes: 'Backup servers' },
  { name: 'AnimeXin', url: 'https://animexin.info', description: 'Anime streaming with Asian focus', genre: 'unofficial', contentType: 'both', notes: 'Asian content' },
  { name: 'Zoro', url: 'https://zoro.to', description: 'Modern anime streaming platform', genre: 'unofficial', contentType: 'both', notes: 'Clean interface' },
  { name: 'Animekisa', url: 'https://animekisa.tv', description: 'Free anime with good quality', genre: 'unofficial', contentType: 'both', notes: 'Regular updates' },
  { name: 'Twist', url: 'https://twist.moe', description: 'Minimalist anime streaming', genre: 'unofficial', contentType: 'subbed', notes: 'Subbed only' },
  { name: 'Animekakalot', url: 'https://animekakalot.com', description: 'Anime and manga platform', genre: 'unofficial', contentType: 'both', notes: 'Also manga' },
  { name: 'Anilist', url: 'https://anilist.co', description: 'Anime tracking with streaming info', genre: 'legal', contentType: 'both', notes: 'Tracking focus' },
  { name: 'Jkanime', url: 'https://jkanime.net', description: 'Spanish language anime streaming', genre: 'unofficial', contentType: 'dubbed', notes: 'Spanish content' },

  // Regional & Specialized
  { name: 'Wakanim', url: 'https://www.wakanim.tv', description: 'European anime streaming service', genre: 'legal', contentType: 'both', notes: 'European focus' },
  { name: 'Bilibili', url: 'https://www.bilibili.com', description: 'Chinese video platform with anime', genre: 'legal', contentType: 'both', notes: 'Chinese content' },
  { name: 'Niconico', url: 'https://www.nicovideo.jp', description: 'Japanese video platform with anime', genre: 'legal', contentType: 'both', notes: 'Japanese content' },
  { name: 'HIDIVE', url: 'https://www.hidive.com', description: 'Anime streaming with simulcasts', genre: 'legal', contentType: 'both', notes: 'Subscription service' },
  { name: 'Funimation', url: 'https://www.funimation.com', description: 'Anime streaming and dubbing', genre: 'legal', contentType: 'both', notes: 'English dubs' },
  { name: 'Sentai Filmworks', url: 'https://www.sentaifilmworks.com', description: 'Anime distributor and streaming', genre: 'legal', contentType: 'both', notes: 'Official distributor' },

  // Backup & Mirror Sites
  { name: 'Animesimple', url: 'https://animesimple.com', description: 'Simple anime streaming interface', genre: 'unofficial', contentType: 'both', notes: 'Simple design' },
  { name: 'Animeflv', url: 'https://animeflv.net', description: 'Spanish anime streaming', genre: 'unofficial', contentType: 'dubbed', notes: 'Spanish platform' },
  { name: 'Monoschinos', url: 'https://monoschinos.com', description: 'Latin American anime platform', genre: 'unofficial', contentType: 'dubbed', notes: 'Spanish/Portuguese' },
  { name: 'Animeid', url: 'https://animeid.tv', description: 'Indonesian anime streaming', genre: 'unofficial', contentType: 'both', notes: 'Indonesian content' },
  { name: 'Animeindo', url: 'https://animeindo.info', description: 'Indonesian anime with subtitles', genre: 'unofficial', contentType: 'both', notes: 'Indonesian subs' },
  { name: 'Samehadaku', url: 'https://samehadaku.tv', description: 'Indonesian anime streaming', genre: 'unofficial', contentType: 'both', notes: 'Indonesian platform' },
  { name: 'Oploverz', url: 'https://oploverz.in', description: 'Indonesian anime alternative', genre: 'unofficial', contentType: 'both', notes: 'Indonesian site' },

  // Emerging Platforms
  { name: 'Muse Asia', url: 'https://www.youtube.com/@MuseAsia', description: 'YouTube channel with free anime', genre: 'legal', contentType: 'subbed', notes: 'YouTube channel' },
  { name: 'Anime on Demand', url: 'https://www.animeondemand.de', description: 'German anime streaming service', genre: 'legal', contentType: 'both', notes: 'German focus' },
  { name: 'Daisuki', url: 'https://www.daisuki.net', description: 'Global anime streaming platform', genre: 'legal', contentType: 'both', notes: 'Multi-language' },
  { name: 'Plex', url: 'https://www.plex.tv', description: 'Free streaming service with anime', genre: 'legal', contentType: 'both', notes: 'Free with ads' },
  { name: 'Pluto TV', url: 'https://www.plutotv.com', description: 'Free TV with anime channels', genre: 'legal', contentType: 'both', notes: 'Free channels' },
  { name: 'Freevee', url: 'https://www.freevee.com', description: 'Amazon free streaming with anime', genre: 'legal', contentType: 'both', notes: 'Free with ads' },
];

async function seedDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log(`[Seed] Starting to add ${ANIME_SITES.length} anime sites...\n`);

    let added = 0;
    let skipped = 0;

    for (const site of ANIME_SITES) {
      try {
        // Check if site already exists
        const [existing] = await connection.execute(
          'SELECT id FROM anime_sites WHERE url = ?',
          [site.url]
        );

        if (existing.length > 0) {
          console.log(`[Seed] ⊘ Already exists: ${site.name}`);
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

        console.log(`[Seed] ✓ Added: ${site.name}`);
        added++;
      } catch (error) {
        console.error(`[Seed] ✗ Error adding ${site.name}:`, error.message);
      }
    }

    console.log(`\n[Seed] Complete! Added: ${added}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Fatal error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
