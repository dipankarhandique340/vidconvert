"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pause, Play, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";

interface PlayerProps {
  src: string;
  title?: string;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  className?: string;
}

export function Player({ src, title, autoplay = false, width = "100%", height = "auto", controls = true, className = "" }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (autoplay) {
      video.play().catch(err => console.error("Autoplay failed:", err));
    }
    
    // Set up event handlers
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);
    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Cleanup
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [autoplay]);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.error("Play failed:", err));
    }
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };
  
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative bg-black">
        <video
          ref={videoRef}
          style={{ width, height }}
          className="w-full"
          controls={controls}
          onClick={!controls ? togglePlay : undefined}
        >
          <source src={src} type="video/mp4" />
          <source src={src} type="video/webm" />
          <source src={src} type="video/x-matroska" />
          Your browser does not support the video tag.
        </video>
        
        {!controls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/30 rounded-full mb-4">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            
            <div className="flex justify-between items-center">
              {title && (
                <div className="text-white text-sm truncate max-w-[50%]">{title}</div>
              )}
              
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 