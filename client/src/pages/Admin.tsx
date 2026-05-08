import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Edit2, Plus, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type FormData = {
  name: string;
  url: string;
  description: string;
  genre: "legal" | "unofficial";
  contentType: "subbed" | "dubbed" | "both";
  notes: string;
};

const initialFormData: FormData = {
  name: "",
  url: "",
  description: "",
  genre: "unofficial",
  contentType: "both",
  notes: "",
};

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Fetch all sites
  const { data: sites = [], isLoading, refetch } = trpc.admin.getAllSites.useQuery();

  // Create site mutation
  const createSite = trpc.admin.createSite.useMutation({
    onSuccess: () => {
      toast.success("Site created successfully!");
      setFormData(initialFormData);
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create site");
    },
  });

  // Update site mutation
  const updateSite = trpc.admin.updateSite.useMutation({
    onSuccess: () => {
      toast.success("Site updated successfully!");
      setFormData(initialFormData);
      setEditingId(null);
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update site");
    },
  });

  // Delete site mutation
  const deleteSite = trpc.admin.deleteSite.useMutation({
    onSuccess: () => {
      toast.success("Site deleted successfully!");
      setDeleteConfirmId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete site");
    },
  });

  // Check all status mutation
  const checkAllStatus = trpc.sites.checkAllStatus.useMutation({
    onSuccess: () => {
      toast.success("Status check completed!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check status");
    },
  });

  // Check authorization
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-cyber flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-8">You don't have permission to access this page.</p>
          <Button onClick={() => navigate("/")} className="bg-pink-500 hover:bg-pink-600">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleOpenDialog = (site?: (typeof sites)[0]) => {
    if (site) {
      setEditingId(site.id);
      setFormData({
        name: site.name,
        url: site.url,
        description: site.description || "",
        genre: site.genre,
        contentType: site.contentType,
        notes: site.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.url) {
      toast.error("Name and URL are required");
      return;
    }

    if (editingId) {
      updateSite.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createSite.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cyber">
      {/* Header */}
      <header className="border-b-2 border-pink-500 py-8 px-4 md:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-black text-pink-500 text-glow mb-2">ADMIN PANEL</h1>
              <p className="text-cyan-400 text-glow-cyan">Manage anime streaming sites</p>
            </div>
            <div className="flex gap-4">
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
                    Check All Status
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="border-pink-500 text-pink-500"
              >
                Back to Tracker
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Add New Site Button */}
        <div className="mb-8">
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Site
          </Button>
        </div>

        {/* Sites Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-8">No sites added yet.</p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-pink-500 hover:bg-pink-600 text-black font-bold"
            >
              Add First Site
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="cyber-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-pink-500">
                    <th className="text-left py-4 px-4 text-pink-500 font-bold">Name</th>
                    <th className="text-left py-4 px-4 text-pink-500 font-bold">URL</th>
                    <th className="text-left py-4 px-4 text-pink-500 font-bold">Genre</th>
                    <th className="text-left py-4 px-4 text-pink-500 font-bold">Content</th>
                    <th className="text-left py-4 px-4 text-pink-500 font-bold">Status</th>
                    <th className="text-left py-4 px-4 text-pink-500 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site) => (
                    <tr key={site.id} className="border-b border-gray-700 hover:bg-gray-900/50">
                      <td className="py-4 px-4">{site.name}</td>
                      <td className="py-4 px-4">
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 truncate"
                        >
                          {site.url}
                        </a>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                          {site.genre === "legal" ? "Legal" : "Unofficial"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                          {site.contentType === "both"
                            ? "Sub & Dub"
                            : site.contentType === "subbed"
                              ? "Subbed"
                              : "Dubbed"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {site.status === "Active" && (
                          <span className="badge-active">Active</span>
                        )}
                        {site.status === "Down" && <span className="badge-down">Down</span>}
                        {site.status === "Unknown" && (
                          <span className="badge-unknown">Unknown</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOpenDialog(site)}
                            size="sm"
                            variant="outline"
                            className="border-cyan-400 text-cyan-400 hover:bg-cyan-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirmId(site.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-2 border-pink-500 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-pink-500 text-2xl">
              {editingId ? "Edit Site" : "Add New Site"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Site Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Crunchyroll"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">URL *</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the site"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Genre</label>
              <Select value={formData.genre} onValueChange={(v: any) => setFormData({ ...formData, genre: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="unofficial">Unofficial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Content Type</label>
              <Select value={formData.contentType} onValueChange={(v: any) => setFormData({ ...formData, contentType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subbed">Subbed</SelectItem>
                  <SelectItem value="dubbed">Dubbed</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., shut down March 2026"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createSite.isPending || updateSite.isPending}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
            >
              {createSite.isPending || updateSite.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-card border-2 border-red-500 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-2xl">Delete Site</DialogTitle>
          </DialogHeader>

          <p className="text-gray-300 my-4">
            Are you sure you want to delete this site? This action cannot be undone.
          </p>

          <DialogFooter>
            <Button
              onClick={() => setDeleteConfirmId(null)}
              variant="outline"
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteConfirmId) {
                  deleteSite.mutate({ id: deleteConfirmId });
                }
              }}
              disabled={deleteSite.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleteSite.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
