"use client";

import { useState, useEffect } from "react";
import { Play, Plus, Info, Check } from "lucide-react";
import Link from "next/link";
import type { Video } from "@/types";

interface HeroSectionProps {
  video: Video;
  isFavorite?: boolean;
  onToggleFavorite?: (videoId: string) => void;
}

export default function HeroSection({ video, isFavorite = false, onToggleFavorite }: HeroSectionProps) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  return (
    <section className="relative w-full h-[85vh] md:h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        {video.backdrop_url ? (
          <img src={video.backdrop_url} alt={video.title}
            className={`w-full h-full object-cover transition-all duration-1000 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
            loading="eager" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
      </div>

      <div className={`relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 px-5 md:px-12 lg:px-16 max-w-4xl transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {video.maturity_rating && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-zinc-500/50 text-zinc-300 bg-zinc-900/50 backdrop-blur-sm w-fit mb-3">
            {video.maturity_rating}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-3">{video.title}</h1>
        <div className="flex items-center gap-3 text-sm text-zinc-400 mb-4">
          {video.release_year && <span>{video.release_year}</span>}
          {video.rating > 0 && <span className="flex items-center gap-1"><span className="text-green-400 font-semibold">{Math.round(video.rating * 10)}%</span> coincidencia</span>}
          {video.duration_seconds && <span>{Math.floor(video.duration_seconds / 60)} min</span>}
        </div>
        {video.description && (
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl mb-6">{video.description}</p>
        )}
        <div className="flex items-center gap-3">
          <Link href={`/watch/${video.id}`} className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black font-bold rounded-lg text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Play className="w-5 h-5" fill="currentColor" /> Reproducir
          </Link>
          <button onClick={() => onToggleFavorite?.(video.id)} className="flex items-center gap-2 px-5 py-3 bg-zinc-700/60 hover:bg-zinc-600/70 text-white font-semibold rounded-lg text-sm backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] border border-zinc-600/30">
            {isFavorite ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />} Mi Lista
          </button>
          <button className="flex items-center justify-center w-11 h-11 rounded-full border border-zinc-500/50 bg-zinc-800/50 hover:bg-zinc-700/60 text-white backdrop-blur-sm transition-all hover:scale-110">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}
