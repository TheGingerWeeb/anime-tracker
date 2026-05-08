# Anime Stream Tracker

A real-time status monitoring dashboard for free anime streaming websites, built with a cyberpunk aesthetic. Track which sites are active, down, or unknown with live status checking and an admin panel for managing the site list.

## Features

### Public Dashboard
- **Real-time Status Display**: See which anime streaming sites are currently active, down, or unknown
- **Cyberpunk Design**: Deep black background with vibrant neon pink and cyan typography, HUD-style elements, and glowing effects
- **Search & Filter**: Find sites by name or filter by status (All / Active / Down / Unknown)
- **Auto-Refresh**: Enable automatic status updates every 30 seconds
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Site Information**: View site details including genre (legal/unofficial), content type (subbed/dubbed), and important notes

### Admin Panel
- **Owner-Only Access**: Secure admin interface for managing the site list
- **Add Sites**: Create new anime streaming site entries with full metadata
- **Edit Sites**: Update existing site information
- **Delete Sites**: Remove sites from the tracker
- **Manual Status Check**: Trigger immediate status checks for all sites
- **Site Management Table**: View all sites with their current status and metadata

### Backend Features
- **HTTP Status Checking**: Automatically ping sites to determine availability
- **Error Handling**: Graceful handling of timeouts, network errors, and HTTP errors
- **Database Storage**: Persistent storage of site data and status history
- **tRPC API**: Type-safe backend procedures for all operations
- **Role-Based Access Control**: Admin-only operations protected by authentication

## Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **Styling**: Cyberpunk-themed CSS with custom animations and effects

## Project Structure

```
anime-tracker/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Public dashboard
│   │   │   └── Admin.tsx         # Admin panel
│   │   ├── index.css             # Cyberpunk theme and global styles
│   │   └── App.tsx               # Route configuration
│   └── public/
├── server/
│   ├── routers.ts                # tRPC procedures
│   ├── db.ts                     # Database query helpers
│   └── statusChecker.ts          # Site availability checking logic
├── drizzle/
│   └── schema.ts                 # Database schema
├── seed-sites.mjs                # Database seeding script
└── todo.md                       # Project task tracking
```

## Database Schema

### anime_sites Table
- `id`: Primary key (auto-increment)
- `name`: Site name (e.g., "Crunchyroll")
- `url`: Site URL
- `description`: Brief description
- `genre`: "legal" or "unofficial"
- `contentType`: "subbed", "dubbed", or "both"
- `status`: "Active", "Down", or "Unknown"
- `lastChecked`: Timestamp of last status check
- `notes`: Important notes (e.g., "shut down March 2026")
- `createdAt`, `updatedAt`: Timestamps

## API Endpoints

### Public Procedures
- `sites.list`: Get all sites with optional filters (status, search)
- `sites.getById`: Get a single site by ID
- `sites.checkStatus`: Check status of a single site
- `sites.checkAllStatus`: Check status of all sites

### Admin Procedures (Admin-only)
- `admin.createSite`: Add a new site
- `admin.updateSite`: Edit an existing site
- `admin.deleteSite`: Delete a site
- `admin.getAllSites`: Get all sites for admin panel

## Cyberpunk Design Elements

The interface features a distinctive cyberpunk aesthetic with:
- **Deep black background** with gradient overlay
- **Neon pink (#FF007F)** and **electric cyan (#00FFFF)** text
- **Glowing text effects** with outer glow shadows
- **Neon borders** on cards and elements
- **HUD-style frames** and corner brackets
- **Scan line animations** for a retro-futuristic feel
- **Bold, geometric sans-serif fonts** (Orbitron for headings, Space Mono for body)
- **Color-coded status indicators**: Green for Active, Red for Down, Gray for Unknown

## Getting Started

### Prerequisites
- Node.js 22+
- MySQL/TiDB database
- Manus OAuth credentials

### Installation
1. Install dependencies: `pnpm install`
2. Set up environment variables in `.env`
3. Run database migrations: `pnpm drizzle-kit generate && pnpm drizzle-kit migrate`
4. Seed initial data: `node seed-sites.mjs`
5. Start dev server: `pnpm dev`

### Seeding Data
The project includes 10 popular anime streaming sites pre-configured:
- Crunchyroll (Legal)
- AniWatch (Unofficial)
- 9Anime (Unofficial)
- Gogoanime (Unofficial)
- Tubi (Legal)
- AnimeHeaven (Unofficial)
- RetroCrush (Legal)
- AnimePlanet (Legal)
- Animenana (Unofficial)
- HiAnime (Unofficial - marked as shut down)

## Status Checking

The status checker uses HTTP HEAD requests with:
- **Timeout**: 10 seconds per request
- **Concurrency**: 5 simultaneous checks
- **Status Codes**: 2xx-3xx = Active, 4xx-5xx = Down, Timeout/Error = Unknown
- **Error Handling**: Graceful fallback for network errors and timeouts

## Testing

Run the test suite with: `pnpm test`

The project includes comprehensive vitest tests for:
- Authentication procedures
- Site listing and filtering
- Status checking operations
- Admin CRUD operations
- Error handling

## Deployment

1. Create a checkpoint: `webdev_save_checkpoint`
2. Click the "Publish" button in the Manus UI
3. The site will be deployed to a public URL

## Future Enhancements

- Scheduled status checks via cron jobs
- Email notifications for site status changes
- Historical status data and uptime charts
- User ratings and reviews for sites
- Community-contributed site additions
- Advanced filtering by genre and content type
- Site performance metrics and load times

## License

This project is built on the Manus platform and follows the platform's terms of service.

## Notes

- All status checks respect site terms of service and use appropriate User-Agent headers
- The tracker is for informational purposes only
- Users should verify site legality and safety before visiting
- Some sites may be geographically restricted or subject to takedown
