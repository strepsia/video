"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import VideoCarousel from "@/components/video/VideoCarousel";
import { Loader2, Users } from "lucide-react";
import type { Actor, Video, ActorWithVideos } from "@/types";

export default function ActorsPage() {
  const [actors, setActors] = useState<ActorWithVideos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActors() {
      const supabase = createClient();
      const { data: actorsData } = await supabase
        .from("actors").select("*").order("name");

      if (actorsData) {
        const actorsWithVids: ActorWithVideos[] = [];
        for (const actor of actorsData) {
          const { data: videoActors } = await supabase
            .from("video_actors")
            .select("video_id, video:videos(*)")
            .eq("actor_id", actor.id);

          const videos = videoActors?.map((va: any) => va.video).filter(Boolean) || [];
          if (videos.length > 0) {
            actorsWithVids.push({ actor, videos });
          }
        }
        setActors(actorsWithVids);
      }
      setLoading(false);
    }
    fetchActors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24">
      <h1 className="text-2xl font-bold text-white mb-6 px-5 md:px-12">Actores</h1>

      {/* Actor avatars grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 px-5 md:px-12 mb-10">
        {actors.map(({ actor }) => (
          <a key={actor.id} href={`#actor-${actor.slug}`}
            className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-red-500 transition-all group-hover:scale-105">
              {actor.photo_url ? (
                <img src={actor.photo_url} alt={actor.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-zinc-600" />
                </div>
              )}
            </div>
            <span className="text-zinc-400 group-hover:text-white text-xs font-medium text-center transition-colors">{actor.name}</span>
          </a>
        ))}
      </div>

      {/* Videos by actor */}
      <div className="space-y-2">
        {actors.map(({ actor, videos }) => (
          <div key={actor.id} id={`actor-${actor.slug}`}>
            <VideoCarousel title={actor.name} videos={videos} />
          </div>
        ))}
      </div>

      {actors.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-6">
          <Users className="w-12 h-12 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm">No hay actores disponibles</p>
        </div>
      )}
    </div>
  );
}
