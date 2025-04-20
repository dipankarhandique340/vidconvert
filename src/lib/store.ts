"use client"

import { create } from "zustand"
import { FileEntry } from './ftp-service'

export interface ConversionJob {
  id: string
  sourceFile: string
  targetFolder: string
  status: 'pending' | 'converting' | 'completed' | 'failed'
  progress: number
  hlsLink?: string
  startTime: Date
  endTime?: Date
  error?: string
}

export interface InProgressConversion {
  id: string
  filename: string
  progress: number
  targetFormat: string
  startTime: string
  estimatedCompletionTime?: string
  sourcePath: string
  targetFolder: string
}

export interface CompletedConversion {
  id: string
  filename: string
  originalFormat: string
  targetFormat: string
  completionTime: string
  fileSize: string
  outputPath: string
  duration: string
  success: boolean
  error?: string
}

export interface Settings {
  githubApiKey: string
  githubRepository: string
  theme: 'dark' | 'light' | 'system'
}

interface AppState {
  // Current directory path
  currentPath: string
  // Files in the current directory
  files: FileEntry[]
  // Loading states
  isLoadingFiles: boolean
  // Conversion jobs
  conversionJobs: ConversionJob[]
  // Selected files
  selectedFiles: string[]
  // Settings
  settings: Settings
  // Conversion tracking
  inProgressConversions: InProgressConversion[]
  completedConversions: CompletedConversion[]

  // Actions
  setCurrentPath: (path: string) => void
  setFiles: (files: FileEntry[]) => void
  setIsLoadingFiles: (isLoading: boolean) => void
  addConversionJob: (job: ConversionJob) => void
  updateConversionJob: (id: string, updates: Partial<ConversionJob>) => void
  selectFile: (path: string) => void
  unselectFile: (path: string) => void
  clearSelectedFiles: () => void
  updateSettings: (settings: Partial<Settings>) => void
  setInProgressConversions: (conversions: InProgressConversion[]) => void
  setCompletedConversions: (conversions: CompletedConversion[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPath: '/',
  files: [],
  isLoadingFiles: false,
  conversionJobs: [],
  selectedFiles: [],
  settings: {
    githubApiKey: '',
    githubRepository: 'user/video-converter-repo',
    theme: 'system',
  },
  inProgressConversions: [],
  completedConversions: [],

  setCurrentPath: (path) => set({ currentPath: path }),
  
  setFiles: (files) => set({ files }),
  
  setIsLoadingFiles: (isLoading) => set({ isLoadingFiles: isLoading }),
  
  addConversionJob: (job) => 
    set((state) => ({ 
      conversionJobs: [...state.conversionJobs, job]
    })),
  
  updateConversionJob: (id, updates) => 
    set((state) => ({
      conversionJobs: state.conversionJobs.map((job) => 
        job.id === id ? { ...job, ...updates } : job
      )
    })),
  
  selectFile: (path) => 
    set((state) => ({ 
      selectedFiles: [...state.selectedFiles, path]
    })),
  
  unselectFile: (path) => 
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((p) => p !== path)
    })),
  
  clearSelectedFiles: () => set({ selectedFiles: [] }),
  
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    })),
    
  setInProgressConversions: (conversions) => set({ inProgressConversions: conversions }),
  
  setCompletedConversions: (conversions) => set({ completedConversions: conversions }),
}))
