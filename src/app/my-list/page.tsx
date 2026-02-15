"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import VideoCard from "@/components/video/VideoCard";
import { BookmarkPlus, Loader2 } from "lucide-react";
import type { Video } from "@/types";

export default function MyListPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from("user_favorites")
      .select("video_id, video:videos(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const vids = data.map((f: any) => f.video).filter(Boolean);
      setFavorites(vids);
      setFavoriteIds(new Set(vids.map((v: Video) => v.id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const handleToggleFavorite = async (videoId: string) => {
    if (!user) return;
    const supabase = createClient();
    const newSet = new Set(favoriteIds);
    if (newSet.has(videoId)) {
      newSet.delete(videoId);
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("video_id", videoId);
    } else {
      newSet.add(videoId);
      await supabase.from("user_favorites").insert({ user_id: user.id, video_id: videoId });
    }
    setFavoriteIds(newSet);
    fetchFavorites();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-20 md:pt-24 px-5 md:px-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Mi Lista</h1>
        <p className="text-zinc-500">Inicia sesion para ver tu lista</p>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 px-5 md:px-12">
      <h1 className="text-2xl font-bold text-white mb-6">Mi Lista</h1>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <BookmarkPlus className="w-12 h-12 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm">Agrega videos a tu lista para verlos despues</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {favorites.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} isFavorite={true} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
