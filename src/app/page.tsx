"use client";

import { useState, useEffect } from "react";
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
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: featuredData } = await supabase
          .from("videos").select("*, category:categories(*)").eq("is_featured", true).eq("is_published", true)
          .order("created_at", { ascending: false }).limit(1).single();
        if (featuredData) setFeatured(featuredData);

        const { data: categories } = await supabase
          .from("categories").select("*").neq("slug", "my-list").order("sort_order");

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
          if (favs) setFavoriteIds(new Set(favs.map((f) => f.video_id)));
        }
      } catch (err) {
        console.error("Error loading home:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  const handleToggleFavorite = async (videoId: string) => {
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
          <p className="text-zinc-500 text-sm max-w-sm">No hay videos disponibles todavia. Si eres administrador, sube contenido desde el panel de control.</p>
        </div>
      )}
    </div>
  );
}
