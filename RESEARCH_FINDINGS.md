# Anime Streaming Sites Research Findings

## Data Sources Identified

### Primary Sources
1. **TroyPoint** - Comprehensive list of 16+ anime streaming sites (updated May 2026)
2. **Reddit Communities**
   - r/animepiracy - Active community discussing streaming alternatives
   - r/anime - General anime community
   - r/AnimeReccomendations - Recommendations and discussions
3. **theindex.moe** - Aggregator listing all available streaming sites
4. **IGN** - Professional reviews of anime streaming services
5. **Kingshiper** - Guide to free anime streaming sites

### Sites Discovered

#### Legal/Official Platforms
- Crunchyroll (crunchyroll.com) - Largest legal anime library
- Tubi (tubitv.com) - Free, ad-supported, licensed content
- Prime Video (primevideo.com) - Amazon's anime collection
- Viz Media (viz.com) - Official anime distributor
- Hoopla - Library-based streaming
- Sling TV Freestream - Free tier available
- MyAnimeList (myanimelist.net) - Community + streaming
- RetroCrush (retrocrush.tv) - Retro anime focus
- AnimePlanet (animeplanet.com) - Community-driven
- Hikari - Niche anime service

#### Unofficial/Unverified Platforms
- AniWatch (aniwatch.to) - HD, subbed/dubbed
- 9Anime (9anime.to) - Large library, 1080p
- AnimeHeaven (animeheaven.ru) - Latest episodes
- Gogoanime (gogoanime.info) - Vast library, multiple resolutions
- Animenana (animenana.com) - No ads, clean interface
- 4Anime (4anime.to) - Popular alternative
- AnimeFreak (animefreak.tv) - Community features
- HiAnime (hianime.to) - Modern interface

### Key Insights

1. **Domain Variations**: Many sites use multiple TLDs (.to, .ru, .info, .tv, .com, .net)
2. **Shutdown Pattern**: Sites like KissAnime and AnimeFenix have been shut down
3. **Quality Indicators**: Resolution (1080p, 720p), ad frequency, interface design
4. **Content Types**: Subbed, dubbed, both, manga, games
5. **Update Frequency**: New episodes added frequently on active sites
6. **Community Indicators**: Reddit discussions mention working vs. non-working sites

## Discovery Strategy

### Phase 1: Automated Discovery
- Scrape Reddit communities for site mentions
- Monitor theindex.moe for new additions
- Crawl anime forums for site discussions
- Extract URLs and metadata

### Phase 2: Validation & Deduplication
- Test site availability (HTTP status)
- Identify domain variations (same site, different TLD)
- Extract metadata (genre, content type, region)
- Classify as legal vs. unofficial

### Phase 3: Daily Updates
- Schedule daily discovery runs
- Update status of existing sites
- Add new discovered sites
- Remove dead/offline sites

## Implementation Approach

1. **Reddit API Integration** - Scrape r/anime, r/animepiracy, r/AnimeReccomendations
2. **Web Scraping** - Extract from theindex.moe and anime forums
3. **URL Pattern Recognition** - Identify anime streaming domains
4. **Metadata Extraction** - Parse site content for genre, content type
5. **Status Checking** - Verify site availability daily
6. **Deduplication** - Merge duplicate entries with different TLDs

## Expected Results

- 50-100+ anime streaming sites
- Mix of legal and unofficial platforms
- Daily updates with status changes
- Comprehensive metadata for each site
- Source tracking (where discovered from)
