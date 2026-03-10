// src/pages/superadmin/SuperAdminDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Trash2, Eye, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newsDialog, setNewsDialog] = useState(false);
  const [searchNews, setSearchNews] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Accès refusé
  if (user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        🚫 Accès refusé - SuperAdmin uniquement
      </div>
    );
  }

  useEffect(() => {
    loadDashboard();
    fetchMedia();
  }, []);

  useEffect(() => {
  if (!scrollRef.current) return;

  const interval = setInterval(() => {
    if (!isHovered) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  }, 3000); // défile toutes les 3 secondes

  return () => clearInterval(interval);
}, [isHovered]);

  // Charger dashboard
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, newsRes, usersRes] = await Promise.all([
        api.get("/superadmin/dashboard").catch(() => ({ data: null })),
        api.get("/superadmin/news").catch(() => ({ data: [] })),
        api.get("/superadmin/users").catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setNews(newsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger médias récents
  const fetchMedia = async () => {
    try {
      const res = await api.get("/media?limit=8");
      setMedia(res.data.media || []);
    } catch (error) {
      console.error("Erreur chargement médias:", error);
    }
  };

  // Filtrage
  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchNews.toLowerCase())
  );

  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name} ${user.email}`
      .toLowerCase()
      .includes(searchUsers.toLowerCase())
  );

  const handleDeleteNews = async (id) => {
    if (!confirm("Supprimer cette news ?")) return;
    try {
      await api.delete(`/superadmin/news/${id}`);
      setNews(news.filter((n) => n.id !== id));
    } catch (error) {
      alert("Erreur suppression");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/superadmin/user/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      alert("Erreur suppression");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">SuperAdmin Dashboard</h2>
        <Dialog open={newsDialog} onOpenChange={setNewsDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Nouvelle News
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <NewsForm
              onSuccess={() => {
                setNewsDialog(false);
                loadDashboard();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.users?.total || 0}</CardTitle>
              <p>Utilisateurs total</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.users?.students || 0}</CardTitle>
              <p>Étudiants</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.payments?.total_amount?.toLocaleString() || 0} FCFA</CardTitle>
              <p>Chiffre d&apos;affaires</p>
            </CardHeader>
          </Card>
        </div>
      ) : null}

      {/* Médias récents en carrousel */}
      <Card>
        <CardHeader>
          <CardTitle>Médias récents ({media.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {media.length ? (
            <div className="relative">
              {/* Bouton précédent */}
              <button
                onClick={() => scrollRef.current.scrollBy({ left: -200, behavior: "smooth" })}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Conteneur scrollable */}
              <div
                ref={scrollRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex space-x-4 overflow-x-auto py-2 scroll-smooth scrollbar-hide"
              >
                {media.map((m) => (
                  <div key={m.id} className="flex-shrink-0 w-40 border rounded p-2 text-center">
                    {m.type?.startsWith("image") ? (
                      <img
                        src={m.url}
                        alt={m.filename}
                        className="w-full h-24 object-cover rounded"
                      />
                    ) : (
                      <video
                        src={m.url}
                        className="w-full h-24 object-cover rounded"
                        controls
                      />
                    )}
                    <p className="text-xs truncate mt-1">{m.filename}</p>
                  </div>
                ))}
              </div>

              {/* Bouton suivant */}
              <button
                onClick={() => scrollRef.current.scrollBy({ left: 200, behavior: "smooth" })}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Aucun média trouvé.</p>
          )}
        </CardContent>
      </Card>

      {/* Gestion News & Users (inchangés) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              News ({filteredNews.length})
              <Input
                placeholder="Rechercher news..."
                value={searchNews}
                onChange={(e) => setSearchNews(e.target.value)}
                className="max-w-sm"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredNews.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.slice(0, 5).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        {item.image_url && (
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteNews(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucune news. Créez-en une !</p>
            )}
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Utilisateurs ({filteredUsers.length})
              <Input
                placeholder="Rechercher utilisateur..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="max-w-sm"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.slice(0, 5).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{user.email}</TableCell>
                      <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucun utilisateur trouvé</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Formulaire création news
function NewsForm({ onSuccess }) {
  const [formData, setFormData] = useState({ title: "", content: "", excerpt: "", is_active: true });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([k, v]) => submitData.append(k, v));
    if (file) submitData.append("media", file);

    try {
      await api.post("/superadmin/news", submitData);
      onSuccess();
      setFormData({ title: "", content: "", excerpt: "", is_active: true });
      setFile(null);
    } catch (err) {
      alert("Erreur création news");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Titre news"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Contenu (HTML accepté)"
        className="w-full p-3 border rounded-lg min-h-[120px]"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        required
      />
      <Input
        placeholder="Extrait (optionnel)"
        value={formData.excerpt}
        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
      />
      <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
        <label htmlFor="is_active">Publier immédiatement</label>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Créer News"}
      </Button>
    </form>
  );
}