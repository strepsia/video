"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import VideoCarousel from "@/components/video/VideoCarousel";
import { Loader2, Tv } from "lucide-react";
import type { Site, Video, SiteWithVideos } from "@/types";

export default function SitesPage() {
  const [sites, setSites] = useState<SiteWithVideos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSites() {
      const supabase = createClient();
      const { data: sitesData } = await supabase
        .from("sites").select("*").order("sort_order");

      if (sitesData) {
        const sitesWithVids: SiteWithVideos[] = [];
        for (const site of sitesData) {
          const { data: videoSites } = await supabase
            .from("video_sites")
            .select("video_id, video:videos(*)")
            .eq("site_id", site.id);

          const videos = videoSites?.map((vs: any) => vs.video).filter(Boolean) || [];
          if (videos.length > 0) {
            sitesWithVids.push({ site, videos });
          }
        }
        setSites(sitesWithVids);
      }
      setLoading(false);
    }
    fetchSites();
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
      <h1 className="text-2xl font-bold text-white mb-6 px-5 md:px-12">Sitios</h1>

      {/* Site logos grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-5 md:px-12 mb-10">
        {sites.map(({ site }) => (
          <a key={site.id} href={`#site-${site.slug}`}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] cursor-pointer">
            {site.logo_url ? (
              <img src={site.logo_url} alt={site.name} className="h-10 md:h-12 object-contain opacity-80 hover:opacity-100 transition-opacity invert" />
            ) : (
              <Tv className="w-10 h-10 text-zinc-500" />
            )}
            <span className="text-zinc-400 text-xs font-medium">{site.name}</span>
          </a>
        ))}
      </div>

      {/* Videos by site */}
      <div className="space-y-2">
        {sites.map(({ site, videos }) => (
          <div key={site.id} id={`site-${site.slug}`}>
            <VideoCarousel title={site.name} videos={videos} />
          </div>
        ))}
      </div>

      {sites.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-6">
          <Tv className="w-12 h-12 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm">No hay sitios disponibles</p>
        </div>
      )}
    </div>
  );
}
