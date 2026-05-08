import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sites = [
  {
    name: 'Crunchyroll',
    url: 'https://www.crunchyroll.com',
    description: 'Largest legal anime streaming platform with simulcasts and extensive library',
    genre: 'legal',
    contentType: 'both',
    notes: null,
  },
  {
    name: 'AniWatch',
    url: 'https://aniwatch.to',
    description: 'Popular free anime streaming with HD quality and minimal buffering',
    genre: 'unofficial',
    contentType: 'both',
    notes: null,
  },
  {
    name: '9Anime',
    url: 'https://9anime.to',
    description: 'Extensive library of anime with clean interface and high-quality streams',
    genre: 'unofficial',
    contentType: 'both',
    notes: null,
  },
  {
    name: 'Gogoanime',
    url: 'https://gogoanime.sk',
    description: 'Vast collection of anime and movies with multiple resolution options',
    genre: 'unofficial',
    contentType: 'both',
    notes: null,
  },
  {
    name: 'Tubi',
    url: 'https://tubitv.com/category/anime',
    description: 'Fully licensed, ad-supported streaming platform with growing anime library',
    genre: 'legal',
    contentType: 'both',
    notes: null,
  },
  {
    name: 'AnimeHeaven',
    url: 'https://animeheaven.ru',
    description: 'High-quality anime streaming with latest episodes and HD support',
    genre: 'unofficial',
    contentType: 'both',
    notes: null,
  },
  {
    name: 'RetroCrush',
    url: 'https://www.retrocrush.tv',
    description: 'Legal platform specializing in classic and retro anime',
    genre: 'legal',
    contentType: 'both',
    notes: null,
  },
  {
    name: 'AnimePlanet',
    url: 'https://www.animeplanet.com',
    description: 'Community-driven anime platform with streaming and database features',
    genre: 'legal',
    contentType: 'both',
    notes: null,
  },
  {
    name: 'Animenana',
    url: 'https://animenana.com',
    description: 'Ad-free anime streaming with easy navigation and bookmarking',
    genre: 'unofficial',
    contentType: 'both',
    notes: null,
  },
  {
    name: 'HiAnime',
    url: 'https://hianime.to',
    description: 'Popular unofficial anime streaming platform',
    genre: 'unofficial',
    contentType: 'both',
    notes: 'Shut down in March 2026',
  },
];

async function seedDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('Starting database seeding...');

    for (const site of sites) {
      const query = `
        INSERT INTO anime_sites (name, url, description, genre, contentType, status, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 'Unknown', ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          description = VALUES(description),
          genre = VALUES(genre),
          contentType = VALUES(contentType),
          notes = VALUES(notes),
          updatedAt = NOW()
      `;

      await connection.execute(query, [
        site.name,
        site.url,
        site.description,
        site.genre,
        site.contentType,
        site.notes,
      ]);

      console.log(`✓ Seeded: ${site.name}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
