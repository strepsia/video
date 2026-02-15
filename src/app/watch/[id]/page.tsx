"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import VideoPlayer from "@/components/video/VideoPlayer";
import { ArrowLeft, Plus, Check, Share2 } from "lucide-react";
import type { Video } from "@/types";

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [isFav, setIsFav] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("videos").select("*, category:categories(*)").eq("id", id).single();
      if (data) setVideo(data);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: fav } = await supabase.from("user_favorites").select("id").eq("user_id", user.id).eq("video_id", id).maybeSingle();
        setIsFav(!!fav);
      }
    }
    load();
  }, [id, supabase]);

  const toggleFav = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (isFav) {
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("video_id", id);
    } else {
      await supabase.from("user_favorites").insert({ user_id: user.id, video_id: id });
    }
    setIsFav(!isFav);
  };

  return (
    <div className="min-h-screen bg-black">
      <button onClick={() => router.back()} className="fixed top-4 left-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all cursor-pointer">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="w-full md:max-w-5xl md:mx-auto md:pt-20">
        <VideoPlayer videoId={id} title={video?.title} posterUrl={video?.backdrop_url || video?.thumbnail_url || undefined} autoPlay />
      </div>
      {video && (
        <div className="px-5 md:max-w-5xl md:mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{video.title}</h1>
          <div className="flex items-center gap-3 text-sm text-zinc-400 mb-4">
            {video.rating > 0 && <span className="text-green-400 font-semibold">{Math.round(video.rating * 10)}% coincidencia</span>}
            {video.release_year && <span>{video.release_year}</span>}
            {video.maturity_rating && <span className="border border-zinc-600 px-1.5 py-0.5 rounded text-xs">{video.maturity_rating}</span>}
            {video.duration_seconds && <span>{Math.floor(video.duration_seconds / 60)} min</span>}
          </div>
          {video.description && <p className="text-zinc-300 text-sm leading-relaxed mb-6 max-w-2xl">{video.description}</p>}
          <div className="flex items-center gap-4">
            <button onClick={toggleFav} className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer">
              {isFav ? <Check className="w-6 h-6 text-green-400" /> : <Plus className="w-6 h-6" />}
              <span className="text-xs">Mi Lista</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
