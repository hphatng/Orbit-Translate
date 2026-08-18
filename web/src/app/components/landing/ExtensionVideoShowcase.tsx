'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Maximize2, Sparkles, VolumeX, RefreshCw } from 'lucide-react';

interface ExtensionVideoShowcaseProps {
  videoSrc?: string;
  className?: string;
}

export default function ExtensionVideoShowcase({
  videoSrc = '/videos/orbit-extension-demo.mp4',
  className = '',
}: ExtensionVideoShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedData = () => setIsLoaded(true);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadeddata', handleLoadedData);

    // Auto-attempt playback with safety
    video.play().catch(() => {
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
  };

  return (
    <div
      className={`relative group rounded-2xl p-1 sm:p-2 bg-gradient-to-b from-white/15 via-white/5 to-white/0 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Ambient Video Backlight Glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/20 via-sky-500/15 to-emerald-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none -z-10" />

      {/* Modern macOS / Browser Window Chrome */}
      <div className="bg-[#0D111A] rounded-xl overflow-hidden border border-white/10 relative">
        
        {/* Top Window Header Bar */}
        <div className="h-10 px-4 bg-[#141923]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between select-none">
          
          {/* macOS Window Controls */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20" />
          </div>

          {/* Centered URL / Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-400">orbit://</span>
            <span className="text-indigo-300 font-semibold">extension/smart-reading-demo</span>
          </div>

          {/* Right Live Tag */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="hidden md:inline text-gray-300">Live Experience 0.1s</span>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full aspect-video bg-[#0B0F17] flex items-center justify-center overflow-hidden">
          
          {/* Loading Shimmer Placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F17] z-10 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
              <span className="text-xs text-gray-400 font-mono tracking-wider">Đang tải demo video...</span>
            </div>
          )}

          {/* HTML5 High-Performance Video Element */}
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
          />

          {/* Muted Indicator Pill (Top Right of Video) */}
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-gray-300 font-medium">
              <VolumeX className="w-3 h-3 text-gray-400" />
              <span>Không tiếng (Preview)</span>
            </div>
          </div>

          {/* Interactive Hover Control Bar */}
          <div
            className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Play/Pause & Restart Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
                aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={handleRestart}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                title="Phát lại từ đầu"
                aria-label="Phát lại video"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Video Live Badge */}
            <div className="flex items-center gap-2 text-xs text-gray-200 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Chế độ xem tương tác Extension</span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors backdrop-blur-md"
              title="Xem toàn màn hình"
              aria-label="Toàn màn hình"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-30">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
