"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw as RefreshIcon, 
  Download as DownloadIcon, 
  FileVideo as FileVideoIcon, 
  Trash2 as TrashIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle2 as CheckCircleIcon
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical as MoreIcon } from "lucide-react";

export default function CompletedPage() {
  const { completedConversions, setCompletedConversions } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedConversions();
  }, []);

  const fetchCompletedConversions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would normally fetch from an API
      // For demo, we'll just use the store data or mock data if empty
      if (completedConversions.length === 0) {
        // Mock data for demonstration
        setCompletedConversions([
          { 
            id: "comp-1", 
            filename: "presentation.mp4", 
            originalFormat: "MP4",
            targetFormat: "WEBM", 
            completionTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            fileSize: "15.2 MB",
            outputPath: "/converted/presentation.webm",
            duration: "4:32",
            success: true
          },
          { 
            id: "comp-2", 
            filename: "meeting_recording.mkv", 
            originalFormat: "MKV",
            targetFormat: "MP4", 
            completionTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            fileSize: "230.5 MB",
            outputPath: "/converted/meeting_recording.mp4",
            duration: "35:18",
            success: true
          },
          { 
            id: "comp-3", 
            filename: "animation.avi", 
            originalFormat: "AVI",
            targetFormat: "HLS", 
            completionTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            fileSize: "45.8 MB",
            outputPath: "/converted/animation/master.m3u8",
            duration: "2:45",
            success: false,
            error: "Encoding failed: Error in audio stream"
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching completed conversions:", error);
      setError("Failed to load completed conversions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (conversion: any) => {
    // This would normally trigger a download
    alert(`Downloading ${conversion.filename}`);
  };

  const handlePlayVideo = (conversion: any) => {
    // This would normally open the video player
    window.location.href = `/player?file=${encodeURIComponent(conversion.outputPath)}`;
  };

  const handleDelete = (id: string) => {
    // Remove the conversion from the list
    setCompletedConversions(completedConversions.filter(conv => conv.id !== id));
  };

  const clearAllCompleted = () => {
    // Clear all completed conversions
    setCompletedConversions([]);
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Completed Conversions</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={fetchCompletedConversions} disabled={isLoading}>
              <RefreshIcon className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
            {completedConversions.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 hover:text-red-600"
                onClick={clearAllCompleted}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center">
            <AlertCircleIcon className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {completedConversions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-[300px] text-center p-6">
            <div className="text-muted-foreground mb-2">
              No completed conversions
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Start a new conversion from the Convert tab or by selecting files in My Drive.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.href = "/convert"}
            >
              Go to Convert
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {completedConversions.map((conversion) => (
              <Card key={conversion.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      {conversion.success ? (
                        <CheckCircleIcon className="h-5 w-5 mt-1 text-green-500" />
                      ) : (
                        <AlertCircleIcon className="h-5 w-5 mt-1 text-red-500" />
                      )}
                      <div>
                        <CardTitle className="text-base flex items-center">
                          {conversion.filename}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {conversion.originalFormat} → {conversion.targetFormat}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Completed {getTimeAgo(conversion.completionTime)} • {conversion.fileSize} • {conversion.duration}
                        </CardDescription>
                        {!conversion.success && (
                          <div className="text-sm text-red-500 mt-1">
                            {conversion.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {conversion.success && (
                          <>
                            <DropdownMenuItem onClick={() => handlePlayVideo(conversion)}>
                              <FileVideoIcon className="mr-2 h-4 w-4" />
                              Play Video
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(conversion)}>
                              <DownloadIcon className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(conversion.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {conversion.success && (
                    <div className="flex mt-2 space-x-2">
                      <Button size="sm" variant="secondary" onClick={() => handlePlayVideo(conversion)}>
                        <FileVideoIcon className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDownload(conversion)}>
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 