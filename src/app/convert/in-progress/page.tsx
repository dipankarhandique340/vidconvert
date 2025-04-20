"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { RefreshCw as RefreshIcon, StopCircleIcon, AlertCircleIcon } from "lucide-react";

export default function InProgressPage() {
  const { inProgressConversions, setInProgressConversions } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch in-progress conversions
    fetchConversions();
    
    // Set up polling
    const interval = setInterval(fetchConversions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would normally fetch from an API
      // For demo, we'll just use the store data or mock data if empty
      if (inProgressConversions.length === 0) {
        // Mock data for demonstration
        setInProgressConversions([
          { 
            id: "conv-1", 
            filename: "demo_video.mp4", 
            progress: 45, 
            targetFormat: "HLS", 
            startTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            estimatedCompletionTime: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
            sourcePath: "/videos/demo_video.mp4",
            targetFolder: "converted_videos" 
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching conversions:", error);
      setError("Failed to load conversions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelConversion = async (id: string) => {
    try {
      // This would normally call an API to cancel the conversion
      setInProgressConversions(
        inProgressConversions.filter(conv => conv.id !== id)
      );
    } catch (error) {
      console.error("Error canceling conversion:", error);
      setError("Failed to cancel conversion");
    }
  };

  // Calculate estimated time remaining
  const getTimeRemaining = (conv: any) => {
    if (!conv.estimatedCompletionTime) return "Calculating...";
    
    const now = new Date();
    const completion = new Date(conv.estimatedCompletionTime);
    const diffMs = completion.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Almost done...";
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s remaining`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">In-Progress Conversions</h1>
          <Button variant="outline" size="sm" onClick={fetchConversions} disabled={isLoading}>
            <RefreshIcon className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center">
            <AlertCircleIcon className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {inProgressConversions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-[300px] text-center p-6">
            <div className="text-muted-foreground mb-2">
              No conversions in progress
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
            {inProgressConversions.map((conversion) => (
              <Card key={conversion.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{conversion.filename}</CardTitle>
                      <CardDescription>
                        Converting to {conversion.targetFormat} • Started {new Date(conversion.startTime).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600"
                      onClick={() => cancelConversion(conversion.id)}
                    >
                      <StopCircleIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{conversion.progress}%</span>
                      <span className="text-muted-foreground">{getTimeRemaining(conversion)}</span>
                    </div>
                    <Progress value={conversion.progress} />
                    <div className="text-xs text-muted-foreground mt-2">
                      Target folder: {conversion.targetFolder}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 