"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { formatFileSize } from "@/lib/utils";
import { checkConversionProgress } from "@/lib/github-service";
import { VideoIcon, ClockIcon } from "lucide-react";

export default function ConvertingTab() {
  const { conversionJobs, updateConversionJob } = useAppStore();
  
  const convertingJobs = conversionJobs.filter(
    job => job.status === "pending" || job.status === "converting"
  );
  
  useEffect(() => {
    // Poll for conversion progress updates
    const interval = setInterval(async () => {
      for (const job of convertingJobs) {
        try {
          const progress = await checkConversionProgress(job.id);
          
          updateConversionJob(job.id, {
            progress: progress.progress,
            status: progress.status
          });
          
          // If job is complete, update accordingly
          if (progress.status === "completed") {
            updateConversionJob(job.id, {
              endTime: new Date(),
              hlsLink: `https://cdn.pixelfile.in/${job.targetFolder}/${job.sourceFile.split('/').pop()}/index.m3u8`
            });
          }
        } catch (error) {
          console.error(`Error checking progress for job ${job.id}:`, error);
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [convertingJobs, updateConversionJob]);
  
  if (convertingJobs.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed">
        <VideoIcon className="h-10 w-10 text-muted-foreground/60 mb-4" />
        <h3 className="text-lg font-medium">No Active Conversions</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select videos from your drive and start converting them to HLS format.
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {convertingJobs.map((job) => (
        <Card key={job.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <VideoIcon className="h-7 w-7 text-blue-500" />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{job.sourceFile.split('/').pop()}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Target: {job.targetFolder}
                  </p>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <ClockIcon className="h-3.5 w-3.5 mr-1" />
                  <span>
                    Started {job.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>Converting to HLS...</span>
                  <span>{job.progress}%</span>
                </div>
                <Progress value={job.progress} className="h-2 mt-2" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 