"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Loader2, AlertCircle,
} from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  posterUrl?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({ videoId, title, posterUrl, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    async function fetchUrl() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/video-url?id=${videoId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error cargando video");
        }
        const data = await res.json();
        setVideoUrl(data.url);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUrl();
  }, [videoId]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    resetControlsTimeout();
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [playing, resetControlsTimeout]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); }
    else { video.pause(); setPlaying(false); }
  };

  const toggleMute = () => setMuted((m) => !m);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      if (videoRef.current && "webkitEnterFullscreen" in videoRef.current) {
        (videoRef.current as any).webkitEnterFullscreen();
      } else {
        await container.requestFullscreen();
      }
      setFullscreen(true);
      try { await (screen.orientation as any)?.lock?.("landscape"); } catch {}
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
      try { screen.orientation?.unlock?.(); } catch {}
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "f": e.preventDefault(); toggleFullscreen(); break;
        case "m": e.preventDefault(); toggleMute(); break;
        case "ArrowLeft": e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 10); break;
        case "ArrowRight": e.preventDefault(); video.currentTime = Math.min(duration, video.currentTime + 10); break;
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [duration]);

  if (loading) {
    return (
      <div className="relative aspect-video w-full bg-black/90 flex items-center justify-center rounded-xl overflow-hidden">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Cargando video...</p>
        </div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="relative aspect-video w-full bg-black/90 flex items-center justify-center rounded-xl overflow-hidden">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-zinc-300 font-medium">{error || "No se pudo cargar el video"}</p>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative aspect-video w-full bg-black rounded-xl overflow-hidden group select-none"
      onMouseMove={resetControlsTimeout} onTouchStart={resetControlsTimeout}
      onClick={(e) => { if (e.detail === 2) toggleFullscreen(); }}>

      <video ref={videoRef} src={videoUrl} poster={posterUrl || undefined} autoPlay={autoPlay}
        playsInline preload="metadata" className="w-full h-full object-contain" onClick={togglePlay}
        onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
        onDurationChange={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
        onProgress={() => { const v = videoRef.current; if (v && v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1)); }}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setShowControls(true); }} />

      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 pointer-events-none ${showControls ? "opacity-100" : "opacity-0"}`} />

      {title && (
        <div className={`absolute top-0 left-0 right-0 p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
          <h2 className="text-white font-semibold text-lg drop-shadow-lg truncate">{title}</h2>
        </div>
      )}

      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${showControls && !playing ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button onClick={togglePlay} className="w-16 h-16 md:w-20 md:h-20 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95">
          <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" />
        </button>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div ref={progressRef} className="relative h-1.5 group/progress cursor-pointer mb-3 hover:h-2.5 transition-all" onClick={handleProgressClick}>
          <div className="absolute inset-0 bg-white/20 rounded-full" />
          <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${(buffered / duration) * 100}%` }} />
          <div className="absolute inset-y-0 left-0 bg-red-500 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-red-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={togglePlay} className="p-1.5 text-white hover:text-red-400 transition-colors">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={() => skip(-10)} className="p-1.5 text-white/80 hover:text-white transition-colors hidden sm:block">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => skip(10)} className="p-1.5 text-white/80 hover:text-white transition-colors hidden sm:block">
              <SkipForward className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 group/vol">
              <button onClick={toggleMute} className="p-1.5 text-white/80 hover:text-white transition-colors">
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); if (muted) setMuted(false); }}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-red-500 hidden md:block" />
            </div>
            <span className="text-white/70 text-xs tabular-nums ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <button onClick={toggleFullscreen} className="p-1.5 text-white/80 hover:text-white transition-colors">
            {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
