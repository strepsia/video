"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Video } from "@/types";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchFavorites = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("user_favorites")
      .select("video_id, videos:video_id(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const vids = data.map((f: any) => f.videos).filter(Boolean);
      setFavorites(vids);
      setFavoriteIds(new Set(vids.map((v: Video) => v.id)));
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = async (videoId: string) => {
    if (!user) return;
    if (favoriteIds.has(videoId)) {
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("video_id", videoId);
    } else {
      await supabase.from("user_favorites").insert({ user_id: user.id, video_id: videoId });
    }
    fetchFavorites();
  };

  const isFavorite = (videoId: string) => favoriteIds.has(videoId);

  return { favorites, loading, toggleFavorite, isFavorite };
}
