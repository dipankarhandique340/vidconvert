"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Download, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, getFileExtension } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  
  // Parse the path from URL parameters
  const pathArray = Array.isArray(params.path) ? params.path : [];
  const filePath = pathArray.join("/");
  const fileName = pathArray[pathArray.length - 1] || "Unknown";
  
  // References and state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileInfo, setFileInfo] = useState<{size: number, type: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Video stream URL with proper path encoding
  const videoUrl = `/api/stream/${filePath}`;
  
  // Format time in HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h > 0 ? h.toString().padStart(2, '0') : null,
      (h > 0 ? m.toString().padStart(2, '0') : m.toString()),
      s.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  // Initialize video player and handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set up event handlers
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      // Try to get file info after video loads metadata
      fetchFileInfo();
    };
    const handleError = (e: any) => {
      console.error("Video error:", e);
      setIsLoading(false);
    };
    
    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Cleanup
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Get file information
  const fetchFileInfo = async () => {
    try {
      // Here we would typically make an API call to get file info
      // For now, let's just estimate based on video properties
      const video = videoRef.current;
      if (video) {
        const fileType = getFileExtension(fileName).toUpperCase().replace('.', '');
        setFileInfo({
          // This is an estimate, real size should come from API
          size: Math.round(video.duration * 1000000), // Rough estimate
          type: fileType
        });
      }
    } catch (error) {
      console.error("Error fetching file info:", error);
    }
  };
  
  // Play/pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.error("Error playing video:", err));
    }
  };
  
  // Mute/unmute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };
  
  // Toggle fullscreen
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
  
  // Seek in video
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };
  
  // Handle download
  const handleDownload = () => {
    // Create a temporary anchor to download the file
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Handle back navigation
  const handleBack = () => {
    router.back();
  };
  
  return (
    <div className="container mx-auto my-4 px-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-card pb-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-center truncate max-w-[70%]">{fileName}</CardTitle>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 relative bg-black flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[70vh]"
            playsInline
            controls={false}
            preload="metadata"
            onClick={togglePlay}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/x-msvideo" />
            <source src={videoUrl} type="video/quicktime" />
            <source src={videoUrl} type="video/x-matroska" />
            <source src={videoUrl} type="video/x-flv" />
            <source src={videoUrl} type="video/x-ms-wmv" />
            <source src={videoUrl} type="video/3gpp" />
            Your browser does not support the video tag.
          </video>
          
          {/* Overlay with play/pause indicator */}
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying && (
                <div className="bg-black/60 rounded-full p-4">
                  <Play className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col p-4 gap-4">
          {/* Progress bar */}
          <div 
            className="w-full h-2 bg-secondary rounded-full overflow-hidden cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-primary" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Time display and controls */}
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="icon" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* File information */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">File Name:</div>
            <div className="truncate">{fileName}</div>
            
            <div className="text-muted-foreground">Duration:</div>
            <div>{formatTime(duration)}</div>
            
            {fileInfo && (
              <>
                <div className="text-muted-foreground">File Size:</div>
                <div>{formatFileSize(fileInfo.size)}</div>
                
                <div className="text-muted-foreground">Format:</div>
                <div>{fileInfo.type}</div>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 