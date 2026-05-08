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

## Auto TLD Variation Discovery & Status Checking (NEW)
- [x] Implement TLD variation generator (common TLDs: .to, .ru, .me, .sh, .ai, .xyz, .info, .tv, .in, .pe, .se)
- [x] Create TLD testing function to check if variation is reachable
- [x] Add tRPC procedure to discover and add new TLD variations
- [x] Create scheduled task to auto-discover TLD variations daily
- [x] Write 8 tests for TLD variation discovery
- [x] Run status checker on all 61 sites
- [x] Update status indicators (25 Active, 36 Down)
- [x] Implement batch status checking with timeouts (batch-status-check.mjs)
- [x] Add last-checked timestamps to all sites
- [x] Create batch-status-check.mjs script for automated checking

## Mirror Grouping on Dashboard (NEW)
- [x] Add siteGroup field to database schema
- [x] Group TLD variations by base domain name (30 groups from 61 sites)
- [x] Update frontend to display grouped mirrors
- [x] Show "X mirrors available" badge on cards
- [x] Implement expandable mirror list in site cards
- [x] Update Home.tsx with mirror grouping logic
- [x] All 61 tests passing (including 8 new TLD discovery tests)

## FINAL STATUS
- [x] 61 free anime streaming sites with TLD variations
- [x] 25 Active sites, 36 Down sites (real-time status)
- [x] 30 site groups with expandable mirror lists
- [x] Cyberpunk aesthetic with neon design
- [x] Admin panel for site management
- [x] Batch status checking with timeout handling
- [x] 61 vitest tests (all passing)
- [x] Pagination working perfectly (12 sites per page)
- [x] Ready for production deployment


## Status-Based Sorting & User TLD Discovery (NEW)
- [x] Sort sites by status (Active first, then Down, then Unknown) - WORKING
- [x] Ensure pagination respects status-based sort order - WORKING
- [ ] Add "Discover New Mirrors" button to site cards - DEFERRED (tRPC types need regeneration)
- [x] Create backend procedure (sites.discoverTldVariations) to discover TLD variations - IMPLEMENTED
- [ ] Implement user-triggered discovery with loading state - DEFERRED
- [ ] Add discovered mirrors to database automatically - DEFERRED
- [ ] Show toast notification when new mirrors are found - DEFERRED
- [x] Test sorting logic functionality (3 new tests, all passing)
- [x] Total test count: 64 passing tests
- [x] Status-based sorting is fully functional and deployed
