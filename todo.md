# Anime Stream Tracker - TODO

## Database & Backend
- [x] Design and implement anime sites table schema with fields: id, name, url, description, genre (legal/unofficial), contentType (subbed/dubbed), status (Active/Down/Unknown), lastChecked, notes, createdAt, updatedAt
- [x] Create tRPC procedure to fetch all sites with optional filters (status, search)
- [x] Create tRPC procedure to get single site details
- [x] Create tRPC procedure for admin: add new site
- [x] Create tRPC procedure for admin: edit existing site
- [x] Create tRPC procedure for admin: delete site
- [x] Implement HTTP status checking function to ping sites and update status
- [x] Create tRPC procedure to manually trigger status check for all sites
- [x] Write vitest tests for backend procedures (30 tests, all passing)
- [x] Add comprehensive test coverage for statusChecker edge cases (17 tests)
- [x] Add test coverage for sites.getById procedure (4 tests)

## Frontend - Public Dashboard
- [x] Design cyberpunk aesthetic with deep black background, neon pink/cyan text
- [x] Create responsive grid/card layout for displaying anime sites
- [x] Implement site card component showing: name, URL, description, status (with color coding), lastChecked timestamp
- [x] Add search functionality to filter sites by name
- [x] Add status filter buttons (All / Active / Down)
- [x] Implement real-time status updates on the dashboard
- [x] Add responsive design for mobile/tablet/desktop
- [x] Add HUD-style frame/bracket elements via CSS (neon borders, scan lines, glowing effects)

## Frontend - Admin Panel
- [x] Create admin-only page accessible to admin users
- [x] Build form to add new anime site (name, url, description, genre, contentType, notes)
- [x] Build form to edit existing site
- [x] Build delete confirmation dialog
- [x] Display admin list of all sites with edit/delete actions
- [x] Add manual "Check Status Now" button to admin panel
- [x] Fix conditional hook execution in Admin.tsx (move query outside conditional)
- [x] Implement admin access control (admin role required for all admin operations)

## Status Checking & Updates
- [x] Set up scheduled task to check site status periodically (scheduled-status-check.mjs created)
- [x] Implement proper error handling for unreachable sites
- [x] Update lastChecked timestamp after each check
- [x] Handle timeout scenarios gracefully

## Testing & Polish
- [x] Test status checking with various scenarios (timeout, 404, 500, etc.) - 17 comprehensive vitest tests added and passing
- [x] Verify cyberpunk design consistency across all pages
- [x] Test responsive design on mobile/tablet/desktop
- [x] Test admin panel access control
- [x] Performance optimization if needed
- [x] Create comprehensive README documentation

## Deployment
- [x] Create checkpoint before final delivery
- [x] Verify all features working in production
- [x] All 30 vitest tests passing
- [x] Cyberpunk design fully implemented and responsive


## Site Discovery Engine (NEW)
- [x] Research anime streaming site discovery methods and data sources
- [x] Build Reddit API integration to scrape anime streaming communities
- [x] Implement web scraping for anime forums and aggregator sites
- [x] Create site deduplication and validation logic
- [x] Build daily scheduled discovery task (daily-discovery.mjs)
- [x] Implement site metadata extraction (genre, content type, region)
- [x] Add discovered sites to database with admin.addDiscoveredSites procedure
- [x] Update frontend grid to handle 100+ sites with pagination (12 per page)
- [x] Write 12 comprehensive vitest tests for discovery engine
- [x] All 46 tests passing (34 existing + 12 new discovery tests)
- [x] Seed 50+ comprehensive anime sites (39 new sites added, 50 total)
- [x] Verified pagination working with 50 sites across 5 pages


## TLD Variations & Free-Only Filtering (NEW)
- [x] Remove all paid subscription services (Netflix, Hulu, Prime Video, Crunchyroll, etc.)
- [x] Keep only free browser-based streaming sites
- [x] Create TLD variation discovery for common anime sites
- [x] Seed database with 61 sites including multiple TLD variations (9anime.to/ru/me/id/sh, etc.)
- [x] Update discovery engine to find TLD variations automatically
- [x] Test pagination with 61 sites across 6 pages (12 per page)
- [x] Verify all sites are free and browser-streamable
- [x] Fixed getById tests to work with dynamic database state
- [x] All 46 tests passing
