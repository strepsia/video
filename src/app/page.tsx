"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import HeroSection from "@/components/video/HeroSection";
import VideoCarousel from "@/components/video/VideoCarousel";
import { Loader2 } from "lucide-react";
import type { Video, CategoryRow } from "@/types";

export default function HomePage() {
  const [featured, setFeatured] = useState<Video | null>(null);
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: featuredData, error: featErr } = await supabase
        .from("videos").select("*, category:categories(*)").eq("is_featured", true).eq("is_published", true)
        .order("created_at", { ascending: false }).limit(1).single();
      
      if (featErr) console.warn("Featured error:", featErr.message);
      if (featuredData) setFeatured(featuredData);

      const { data: categories, error: catErr } = await supabase
        .from("categories").select("*").neq("slug", "my-list").order("sort_order");

      if (catErr) {
        console.error("Categories error:", catErr.message);
        setError(catErr.message);
        setLoading(false);
        return;
      }

      if (categories) {
        const categoryRows: CategoryRow[] = [];
        for (const cat of categories) {
          const { data: vids } = await supabase
            .from("videos").select("*").eq("category_id", cat.id).eq("is_published", true)
            .order("created_at", { ascending: false }).limit(20);
          if (vids && vids.length > 0) categoryRows.push({ category: cat, videos: vids });
        }
        setRows(categoryRows);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: favs } = await supabase.from("user_favorites").select("video_id").eq("user_id", user.id);
        if (favs) setFavoriteIds(new Set(favs.map((f: any) => f.video_id)));
      }
    } catch (err: any) {
      console.error("Error loading home:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleFavorite = async (videoId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newSet = new Set(favoriteIds);
    if (newSet.has(videoId)) {
      newSet.delete(videoId);
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("video_id", videoId);
    } else {
      newSet.add(videoId);
      await supabase.from("user_favorites").insert({ user_id: user.id, video_id: videoId });
    }
    setFavoriteIds(newSet);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-zinc-500 text-sm">Cargando catalogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <p className="text-red-400 font-medium">Error: {error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm cursor-pointer">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {featured && (
        <HeroSection video={featured} isFavorite={favoriteIds.has(featured.id)} onToggleFavorite={handleToggleFavorite} />
      )}
      <div className="-mt-16 relative z-10 space-y-2">
        {rows.map((row) => (
          <VideoCarousel key={row.category.id} title={row.category.name} videos={row.videos} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
        ))}
      </div>
      {!featured && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">🎬</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Catalogo vacio</h2>
          <p className="text-zinc-500 text-sm max-w-sm">No hay videos disponibles todavia.</p>
        </div>
      )}
    </div>
  );
}
