"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  initialSeconds?: number;
  onProgress?: (watchedSeconds: number, totalSeconds: number) => void;
  onEnded?: () => void;
  className?: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  initialSeconds = 0,
  onProgress,
  onEnded,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSavedRef = useRef(0);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !initialSeconds) return;
    const onLoaded = () => {
      if (video.currentTime < 1 && initialSeconds > 0) {
        video.currentTime = initialSeconds;
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [initialSeconds, src]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
  const video = videoRef.current;
  if (!video) return;
  if (video.paused) {
    video.play().catch((err) => {
      if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
        console.error("Play error:", err);
      }
    });
  } else {
    video.pause();
  }
}, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, seconds));
  };

  const skip = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    seek(video.currentTime + delta);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  const changeSpeed = (s: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = s;
    setSpeed(s);
    setShowSpeedMenu(false);
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const t = video.currentTime;
    setCurrentTime(t);
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
    if (onProgress && Math.abs(t - lastSavedRef.current) >= 30) {
      lastSavedRef.current = t;
      onProgress(t, video.duration || 0);
    }
  };

  const onPause = () => {
    const video = videoRef.current;
    if (!video) return;
    setIsPlaying(false);
    if (onProgress) {
      lastSavedRef.current = video.currentTime;
      onProgress(video.currentTime, video.duration || 0);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "ArrowRight":
          skip(10);
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyF":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay, toggleMute]);

  const showControlsTemp = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-video overflow-hidden rounded-2xl bg-black",
        className
      )}
      onMouseMove={showControlsTemp}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
    <video
    ref={videoRef}
    src={src}
    className="h-full w-full"
    onClick={togglePlay}
    onPlay={() => setIsPlaying(true)}
    onPause={onPause}
    onTimeUpdate={onTimeUpdate}
    onLoadStart={() => console.log("[VideoPlayer] loadStart, src=", src)}
    onLoadedMetadata={(e) => {
    console.log("[VideoPlayer] metadata loaded, duration=", e.currentTarget.duration);
    setDuration(e.currentTarget.duration);
  }}
    onError={(e) => {
    const v = e.currentTarget;
    console.error("[VideoPlayer ERROR]", {
      error: v.error,
      errorCode: v.error?.code,
      errorMessage: v.error?.message,
      networkState: v.networkState,
      readyState: v.readyState,
      currentSrc: v.currentSrc,
      srcAttribute: v.src,
      propSrc: src,
    });
  }}
  onEnded={() => {
    setIsPlaying(false);
    if (onProgress && videoRef.current) {
      onProgress(videoRef.current.duration, videoRef.current.duration);
    }
    onEnded?.();
  }}
  playsInline
/>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="group/progress relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/15"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            seek(ratio * duration);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/25"
            style={{ width: `${bufferedPercent}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercent}% - 6px)` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
          </button>

          <button
            onClick={() => skip(-10)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
            aria-label="Voltar 10s"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => skip(10)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
            aria-label="Avancar 10s"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <div className="group/vol flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              aria-label={isMuted ? "Ativar som" : "Silenciar"}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/20 transition-all duration-300 group-hover/vol:w-20 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
            />
          </div>

          <span className="text-xs font-medium text-white/85 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu((v) => !v)}
                className="flex h-9 min-w-[44px] items-center justify-center rounded-md px-2 text-xs font-bold text-white transition hover:bg-white/15"
                aria-label="Velocidade"
              >
                {speed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 overflow-hidden rounded-lg border border-white/10 bg-black/90 backdrop-blur">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={cn(
                        "block w-full px-4 py-2 text-left text-xs font-medium transition hover:bg-white/10",
                        s === speed ? "text-accent" : "text-white"
                      )}
                    >
                      {s}x {s === 1 && "(Normal)"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              aria-label="Tela cheia"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-0 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
          aria-label="Reproduzir"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-2xl transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 fill-primary-foreground text-primary-foreground ml-1" />
          </span>
        </button>
      )}
    </div>
  );
}