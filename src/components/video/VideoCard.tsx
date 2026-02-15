"use client";

import { useState } from "react";
import { Play, Plus, Check } from "lucide-react";
import Link from "next/link";
import type { Video } from "@/types";

interface VideoCardProps {
  video: Video;
  isFavorite?: boolean;
  onToggleFavorite?: (videoId: string) => void;
  index?: number;
}

export default function VideoCard({ video, isFavorite = false, onToggleFavorite, index = 0 }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="group relative flex-shrink-0 w-[140px] sm:w-[170px] md:w-[220px] lg:w-[240px] transition-all duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 shadow-lg">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-active:scale-110" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <Play className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Link href={`/watch/${video.id}`} className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-white/90 transition-transform hover:scale-110">
              <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
            </Link>
            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(video.id); }}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-400/50 bg-zinc-900/60 hover:bg-zinc-700 text-white transition-all hover:scale-110 backdrop-blur-sm">
              {isFavorite ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            {video.rating > 0 && <span className="text-green-400 font-bold">{Math.round(video.rating * 10)}%</span>}
            {video.maturity_rating && <span className="border border-zinc-500/50 px-1 rounded text-[9px]">{video.maturity_rating}</span>}
            {video.release_year && <span>{video.release_year}</span>}
          </div>
        </div>
        <div className="absolute top-2 right-2">
          {video.maturity_rating && (
            <span className="bg-black/60 backdrop-blur-sm text-[9px] font-bold px-1.5 py-0.5 rounded text-zinc-300">{video.maturity_rating}</span>
          )}
        </div>
      </div>
      <Link href={`/watch/${video.id}`} className="block mt-2">
        <h3 className="text-xs md:text-sm text-zinc-300 group-hover:text-white font-medium truncate transition-colors">{video.title}</h3>
      </Link>
    </div>
  );
}
