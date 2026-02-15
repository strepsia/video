"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoCard from "./VideoCard";
import type { Video } from "@/types";

interface VideoCarouselProps {
  title: string;
  videos: Video[];
  favoriteIds?: Set<string>;
  onToggleFavorite?: (videoId: string) => void;
}

export default function VideoCarousel({ title, videos, favoriteIds = new Set(), onToggleFavorite }: VideoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 20);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  if (!videos.length) return null;

  return (
    <section className="relative group/row mb-8 md:mb-10">
      <h2 className="text-base md:text-xl font-bold text-white mb-3 px-5 md:px-12 lg:px-16 flex items-center gap-2 group-hover/row:text-red-400 transition-colors">
        {title}
        <ChevronRight className="w-4 h-4 text-red-400 opacity-0 -translate-x-2 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all" />
      </h2>
      <div className="relative">
        {showLeftArrow && (
          <button onClick={() => scroll("left")} className="absolute left-0 top-0 bottom-8 z-20 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}
        <div ref={scrollRef} onScroll={handleScroll} className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-5 md:px-12 lg:px-16 scroll-smooth pb-2">
          {videos.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} isFavorite={favoriteIds.has(video.id)} onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
        {showRightArrow && (
          <button onClick={() => scroll("right")} className="absolute right-0 top-0 bottom-8 z-20 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
      </div>
    </section>
  );
}
