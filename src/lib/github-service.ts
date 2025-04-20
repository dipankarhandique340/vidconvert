"use client"

import { Octokit } from 'octokit';

interface ConversionRequest {
  inputFile: string
  outputFolder: string
  apiKey: string
}

interface ConversionStatus {
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  outputUrl?: string
  error?: string
}

interface ConversionJob {
  id: string;
  sourceFile: string;
  targetFolder: string;
  status: 'pending' | 'converting' | 'completed' | 'failed';
  progress: number;
  githubWorkflowId?: number;
  githubRunId?: number;
  hlsLink?: string;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

let octokit: Octokit | null = null;

export function setGithubApiKey(apiKey: string): void {
  octokit = new Octokit({ auth: apiKey });
}

export function getGithubClient(): Octokit | null {
  return octokit;
}

export async function isApiKeyValid(apiKey: string): Promise<boolean> {
  try {
    const tempOctokit = new Octokit({ auth: apiKey });
    await tempOctokit.rest.users.getAuthenticated();
    return true;
  } catch (error) {
    console.error('Error validating GitHub API key:', error);
    return false;
  }
}

export async function triggerVideoConversion(
  sourceFilePath: string,
  targetFolder: string,
  repository: string = 'user/video-converter-repo'
): Promise<ConversionJob | null> {
  if (!octokit) {
    throw new Error('GitHub API key not set. Please set API key in settings.');
  }

  try {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Trigger GitHub workflow for video conversion
    const response = await octokit.rest.actions.createWorkflowDispatch({
      owner: repository.split('/')[0],
      repo: repository.split('/')[1],
      workflow_id: 'convert-video.yml',
      ref: 'main',
      inputs: {
        source_file: sourceFilePath,
        target_folder: targetFolder,
        job_id: jobId,
      },
    });

    // Create a conversion job record
    const job: ConversionJob = {
      id: jobId,
      sourceFile: sourceFilePath,
      targetFolder,
      status: 'pending',
      progress: 0,
      startTime: new Date(),
    };

    return job;
  } catch (error) {
    console.error('Error triggering video conversion:', error);
    return null;
  }
}

export async function checkConversionProgress(
  jobId: string,
  repository: string = 'user/video-converter-repo'
): Promise<{ status: ConversionJob['status']; progress: number }> {
  if (!octokit) {
    throw new Error('GitHub API key not set');
  }

  try {
    // This would need to be implemented to query the status from GitHub Actions
    // In a real implementation, you might need to check workflow runs
    // For demo, we're returning a simulated progress
    
    // Mock implementation - in reality you'd check the actual GitHub workflow status
    return {
      status: 'converting',
      progress: Math.floor(Math.random() * 100),
    };
  } catch (error) {
    console.error('Error checking conversion progress:', error);
    return { status: 'failed', progress: 0 };
  }
}

// For storing jobs in memory (in a real app, use a database)
const conversionJobs = new Map<string, ConversionJob>();

export function saveJob(job: ConversionJob): void {
  conversionJobs.set(job.id, job);
}

export function getJob(jobId: string): ConversionJob | undefined {
  return conversionJobs.get(jobId);
}

export function getAllJobs(): ConversionJob[] {
  return Array.from(conversionJobs.values());
}

export function getConvertingJobs(): ConversionJob[] {
  return Array.from(conversionJobs.values()).filter(
    job => job.status === 'pending' || job.status === 'converting'
  );
}

export function getCompletedJobs(): ConversionJob[] {
  return Array.from(conversionJobs.values()).filter(
    job => job.status === 'completed' || job.status === 'failed'
  );
}

// Initialize GitHub API client
function getGitHubClient(apiKey: string) {
  return new Octokit({
    auth: apiKey
  })
}

// Create workflow dispatch to start conversion
export async function startVideoConversion(conversionRequest: ConversionRequest): Promise<string> {
  try {
    const octokit = getGitHubClient(conversionRequest.apiKey)

    // This would trigger a GitHub Actions workflow
    const response = await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
      owner: 'your-username',
      repo: 'video-converter-workflows',
      workflow_id: 'convert-video.yml',
      ref: 'main',
      inputs: {
        inputFile: conversionRequest.inputFile,
        outputFolder: conversionRequest.outputFolder
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    // Generate a unique ID for tracking this conversion
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  } catch (error) {
    console.error("Error starting conversion:", error)
    throw new Error("Failed to start video conversion")
  }
}

// Check status of conversion
export async function checkConversionStatus(conversionId: string, apiKey: string): Promise<ConversionStatus> {
  try {
    const octokit = getGitHubClient(apiKey)

    // This would check the status of a GitHub Actions workflow run
    // For simplicity, we're mocking the response based on the conversion ID
    // In a real implementation, you would query GitHub's API

    // Mock implementation
    const randomProgress = Math.floor(Math.random() * 100)

    // Simulate different statuses based on progress
    if (randomProgress < 25) {
      return {
        status: "pending",
        progress: randomProgress
      }
    } else if (randomProgress < 90) {
      return {
        status: "processing",
        progress: randomProgress
      }
    } else {
      return {
        status: "completed",
        progress: 100,
        outputUrl: `https://example.com/hls/${conversionId}/index.m3u8`
      }
    }
  } catch (error) {
    console.error("Error checking conversion status:", error)
    return {
      status: "failed",
      progress: 0,
      error: "Failed to check conversion status"
    }
  }
}

// Cancel a running conversion
export async function cancelConversion(conversionId: string, apiKey: string): Promise<boolean> {
  try {
    const octokit = getGitHubClient(apiKey)

    // This would cancel a GitHub Actions workflow run
    // For simplicity, we're just returning success
    // In a real implementation, you would make an API call to cancel the workflow

    return true
  } catch (error) {
    console.error("Error canceling conversion:", error)
    throw new Error("Failed to cancel video conversion")
  }
}

export type { ConversionRequest, ConversionStatus }
