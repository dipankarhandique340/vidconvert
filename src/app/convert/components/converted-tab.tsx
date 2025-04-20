"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { CheckCircleIcon, VideoIcon, XCircleIcon, ExternalLinkIcon, CopyIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ConvertedTab() {
  const { conversionJobs } = useAppStore();
  
  const completedJobs = conversionJobs.filter(
    job => job.status === "completed" || job.status === "failed"
  );
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };
  
  if (completedJobs.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed">
        <CheckCircleIcon className="h-10 w-10 text-muted-foreground/60 mb-4" />
        <h3 className="text-lg font-medium">No Completed Conversions</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your completed video conversions will appear here.
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {completedJobs.map((job) => (
        <Card key={job.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${
              job.status === "completed" 
                ? "bg-green-50 dark:bg-green-950" 
                : "bg-red-50 dark:bg-red-950"
            }`}>
              {job.status === "completed" ? (
                <CheckCircleIcon className="h-7 w-7 text-green-500" />
              ) : (
                <XCircleIcon className="h-7 w-7 text-red-500" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{job.sourceFile.split('/').pop()}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Folder: {job.targetFolder}
                  </p>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {job.endTime && formatDistanceToNow(job.endTime, { addSuffix: true })}
                </div>
              </div>
              
              {job.status === "completed" && job.hlsLink && (
                <div className="mt-4 bg-muted/40 p-3 rounded-md flex justify-between items-center">
                  <div className="text-sm truncate max-w-[70%]">
                    {job.hlsLink}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(job.hlsLink!)}>
                      <CopyIcon className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" asChild>
                      <a href={job.hlsLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon className="h-4 w-4 mr-1" />
                        Open
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              
              {job.status === "failed" && job.error && (
                <div className="mt-4 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
                  Error: {job.error}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 