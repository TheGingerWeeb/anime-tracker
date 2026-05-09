"use client";

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, ExternalLink, ChevronDown } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

type Status = "All" | "Active" | "Down" | "Unknown";

export default function Home() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("All");
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { data: sites = [], isLoading, refetch } = trpc.sites.list.useQuery(
    {
      status: status !== "All" ? status : undefined,
      search: search || undefined,
    },
    { refetchInterval: autoRefresh ? 30000 : false }
  );

  const checkAllStatus = trpc.sites.checkAllStatus.useMutation({
    onSuccess: () => { refetch(); },
  });

  const getStatusBadge = (siteStatus: string) => {
    switch (siteStatus) {
      case "Active": return <span className="badge-active">Active</span>;
      case "Down": return <span className="badge-down">Down</span>;
      default: return <span className="badge-unknown">Unknown</span>;
    }
  };

  const groupedSites = sites.reduce((acc, site) => {
    const group = site.siteGroup || site.name;
    if (!acc[group]) acc[group] = [];
    acc[group].push(site);
    return acc;
  }, {} as Record<string, typeof sites>);

  const getPrimarySite = (groupSites: typeof sites) => {
    return groupSites.find(s => s.status === "Active")
      || groupSites.find(s => s.status === "Down")
      || groupSites[0];
  };

  const sortedGroupEntries = Object.entries(groupedSites).sort(([, groupA], [, groupB]) => {
    const statusOrder = { Active: 0, Down: 1, Unknown: 2 };
    const orderA = statusOrder[getPrimarySite(groupA).status as keyof typeof statusOrder] ?? 3;
    const orderB = statusOrder[getPrimarySite(groupB).status as keyof typeof statusOrder] ?? 3;
    return orderA - orderB;
  });

  const activeSites = sites.filter(s => s.status === "Active").length;
  const downSites = sites.filter(s => s.status === "Down").length;
  const unknownSites = sites.filter(s => s.status === "Unknown").length;

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) newExpanded.delete(groupName);
    else newExpanded.add(groupName);
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-cyber">
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

      <main className="container max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search sites by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => checkAllStatus.mutate()}
              disabled={checkAllStatus.isPending}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
            >
              {checkAllStatus.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" />Check Status Now</>
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
          <div className="flex flex-wrap gap-2">
            {(["All", "Active", "Down", "Unknown"] as const).map((s) => (
              <Button
                key={s}
                onClick={() => setStatus(s)}
                variant={status === s ? "default" : "outline"}
                className={status === s ? "bg-pink-500 text-black" : "border-pink-500 text-pink-500 hover:bg-pink-900"}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No sites found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGroupEntries.map(([groupName, groupSites]) => {
              const primarySite = getPrimarySite(groupSites);
              const isExpanded = expandedGroups.has(groupName);
              const mirrorCount = groupSites.length;

              return (
                <div key={groupName} className="cyber-card group hover:shadow-lg transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-pink-500 flex-1">{groupName}</h3>
                      {getStatusBadge(primarySite.status)}
                    </div>
                    {primarySite.description && (
                      <p className="text-gray-300 text-sm mb-4">{primarySite.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                        {primarySite.genre === "legal" ? "Legal" : "Unofficial"}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                        {primarySite.contentType === "both" ? "Sub & Dub" : primarySite.contentType === "subbed" ? "Subbed" : "Dubbed"}
                      </span>
                      {mirrorCount > 1 && (
                        <span className="text-xs px-2 py-1 bg-cyan-900 text-cyan-300 rounded font-bold">
                          {mirrorCount} mirrors
                        </span>
                      )}
                    </div>
                    {primarySite.notes && (
                      <p className="text-xs text-yellow-400 mb-4 italic">⚠️ {primarySite.notes}</p>
                    )}
                    {primarySite.lastChecked && (
                      <p className="text-xs text-gray-500 mb-4">
                        Last checked: {new Date(primarySite.lastChecked).toLocaleString()}
                      </p>
                    )}
                    
                      href={primarySite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold mt-4 group"
                  
                      Visit Site
                      <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    {mirrorCount > 1 && (
                      <button
                        onClick={() => toggleGroup(groupName)}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold border border-cyan-400 rounded px-3 py-2 hover:bg-cyan-900/20 transition-colors"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        {isExpanded ? "Hide Mirrors" : `Show ${mirrorCount - 1} More Mirrors`}
                      </button>
                    )}
                  </div>
                  {isExpanded && mirrorCount > 1 && (
                    <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
                      {groupSites.map((mirror, idx) => {
                        if (idx === 0) return null;
                        return (
                          <div key={mirror.id} className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex-1">
                              <p className="text-sm text-gray-300">{mirror.name}</p>
                              <p className="text-xs text-gray-500">{new URL(mirror.url).hostname}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(mirror.status)}
                              <a href={mirror.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}