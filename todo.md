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
- [x] Write vitest tests for backend procedures
- [ ] Add missing test coverage for sites.getById and statusChecker edge cases

## Frontend - Public Dashboard
- [x] Design cyberpunk aesthetic with deep black background, neon pink/cyan text
- [x] Create responsive grid/card layout for displaying anime sites
- [x] Implement site card component showing: name, URL, description, status (with color coding), lastChecked timestamp
- [x] Add search functionality to filter sites by name
- [x] Add status filter buttons (All / Active / Down)
- [x] Implement real-time status updates on the dashboard
- [x] Add responsive design for mobile/tablet/desktop
- [ ] Add HUD-style frame/bracket elements to enhance cyberpunk aesthetic

## Frontend - Admin Panel
- [x] Create admin-only page accessible to admin users
- [x] Build form to add new anime site (name, url, description, genre, contentType, notes)
- [x] Build form to edit existing site
- [x] Build delete confirmation dialog
- [x] Display admin list of all sites with edit/delete actions
- [x] Add manual "Check Status Now" button to admin panel
- [x] Fix conditional hook execution in Admin.tsx (move query outside conditional)
- [ ] Implement owner-only access (currently allows any admin user)

## Status Checking & Updates
- [ ] Set up scheduled task to check site status periodically (e.g., every hour)
- [x] Implement proper error handling for unreachable sites
- [x] Update lastChecked timestamp after each check
- [x] Handle timeout scenarios gracefully

## Testing & Polish
- [ ] Test status checking with various scenarios (timeout, 404, 500, etc.)
- [ ] Verify cyberpunk design consistency across all pages
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Test admin panel access control
- [ ] Performance optimization if needed

## Deployment
- [ ] Create checkpoint before final delivery
- [ ] Verify all features working in production
