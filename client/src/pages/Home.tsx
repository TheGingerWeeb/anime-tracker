import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

type Status = "All" | "Active" | "Down" | "Unknown";

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("All");
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch sites based on filters
  const { data: sites = [], isLoading, refetch } = trpc.sites.list.useQuery(
    {
      status: status !== "All" ? status : undefined,
      search: search || undefined,
    },
    { refetchInterval: autoRefresh ? 30000 : false }
  );

  // Manual check status mutation
  const checkAllStatus = trpc.sites.checkAllStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Get status badge styling
  const getStatusBadge = (siteStatus: string) => {
    switch (siteStatus) {
      case "Active":
        return <span className="badge-active">Active</span>;
      case "Down":
        return <span className="badge-down">Down</span>;
      case "Unknown":
        return <span className="badge-unknown">Unknown</span>;
      default:
        return <span className="badge-unknown">Unknown</span>;
    }
  };

  // Count sites by status
  const activeSites = sites.filter(s => s.status === "Active").length;
  const downSites = sites.filter(s => s.status === "Down").length;
  const unknownSites = sites.filter(s => s.status === "Unknown").length;

  // Reset to page 1 when filters change
  const handleFilterChange = (newStatus: Status) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(sites.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, sites.length);
  const paginatedSites = sites.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-cyber">
      {/* Header */}
      <header className="border-b-2 border-pink-500 py-8 px-4 md:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-pink-500 text-glow mb-2">
                ANIME STREAM TRACKER
              </h1>
              <p className="text-cyan-400 text-glow-cyan text-lg">
                Real-time status monitoring of free anime streaming platforms
              </p>
            </div>
            <div className="flex gap-4">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Link href="/profile">
                    <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-900">
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-pink-500 hover:bg-pink-600 text-black font-bold">
                    Sign In
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="cyber-card text-center">
              <div className="text-3xl font-bold text-green-400">{activeSites}</div>
              <div className="text-sm text-gray-400 mt-2">ACTIVE</div>
            </div>
            <div className="cyber-card text-center">
              <div className="text-3xl font-bold text-red-500">{downSites}</div>
              <div className="text-sm text-gray-400 mt-2">DOWN</div>
            </div>
            <div className="cyber-card text-center">
              <div className="text-3xl font-bold text-gray-400">{unknownSites}</div>
              <div className="text-sm text-gray-400 mt-2">UNKNOWN</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Controls */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search sites by name..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => checkAllStatus.mutate()}
              disabled={checkAllStatus.isPending}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
            >
              {checkAllStatus.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status Now
                </>
              )}
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              className={autoRefresh ? "bg-pink-500 text-black" : "border-pink-500 text-pink-500"}
            >
              {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
            </Button>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {(["All", "Active", "Down", "Unknown"] as const).map((s) => (
              <Button
                key={s}
                onClick={() => handleFilterChange(s)}
                variant={status === s ? "default" : "outline"}
                className={
                  status === s
                    ? "bg-pink-500 text-black"
                    : "border-pink-500 text-pink-500 hover:bg-pink-900"
                }
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Sites Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No sites found matching your filters.</p>
          </div>
        ) : (
          <>
            {/* Pagination Info */}
            <div className="mb-6 text-center text-gray-400 text-sm">
              Showing {startIndex + 1} - {endIndex} of {sites.length} sites
            </div>

            {/* Sites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSites.map((site) => (
                <div key={site.id} className="cyber-card group hover:shadow-lg transition-all">
                  {/* Status Indicator */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-pink-500 flex-1">{site.name}</h3>
                    {getStatusBadge(site.status)}
                  </div>

                  {/* Description */}
                  {site.description && (
                    <p className="text-gray-300 text-sm mb-4">{site.description}</p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                      {site.genre === "legal" ? "Legal" : "Unofficial"}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                      {site.contentType === "both"
                        ? "Sub & Dub"
                        : site.contentType === "subbed"
                          ? "Subbed"
                          : "Dubbed"}
                    </span>
                  </div>

                  {/* Notes */}
                  {site.notes && (
                    <p className="text-xs text-yellow-400 mb-4 italic">⚠️ {site.notes}</p>
                  )}

                  {/* Last Checked */}
                  {site.lastChecked && (
                    <p className="text-xs text-gray-500 mb-4">
                      Last checked: {new Date(site.lastChecked).toLocaleString()}
                    </p>
                  )}

                  {/* URL Link */}
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold mt-4 group"
                  >
                    Visit Site
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4 flex-wrap">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="border-pink-500 text-pink-500 hover:bg-pink-900"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={
                        currentPage === page
                          ? "bg-pink-500 text-black"
                          : "border-pink-500 text-pink-500 hover:bg-pink-900"
                      }
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="border-pink-500 text-pink-500 hover:bg-pink-900"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-pink-500 mt-20 py-8 px-4 md:px-8">
        <div className="container max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>
            Last updated: {new Date().toLocaleString()} | Status checks run automatically
          </p>
        </div>
      </footer>
    </div>
  );
}
