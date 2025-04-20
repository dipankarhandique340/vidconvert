"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  VideoIcon, 
  CheckCircleIcon,
  Clock3Icon,
  FolderIcon,
  FilterIcon,
  PlayIcon,
  LayoutGridIcon,
  SearchIcon
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { triggerVideoConversion } from "@/lib/github-service"
import { listFiles, FileEntry } from "@/lib/ftp-service"
import ConvertingTab from "./components/converting-tab"
import ConvertedTab from "./components/converted-tab"
import Link from "next/link"
import { formatFileSize } from "@/lib/utils"

export default function ConvertPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("converting")
  const [currentPath, setCurrentPath] = useState("/")
  const [files, setFiles] = useState<FileEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [targetFolder, setTargetFolder] = useState("")
  const [isConverting, setIsConverting] = useState(false)
  
  const { 
    conversionJobs, 
    addConversionJob,
    settings
  } = useAppStore()
  
  useEffect(() => {
    loadFiles(currentPath)
  }, [currentPath])
  
  const loadFiles = async (path: string) => {
    setIsLoading(true)
    try {
      const fileList = await listFiles(path)
      setFiles(fileList)
    } catch (error) {
      console.error("Error loading files:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  
  const navigateToFolder = (path: string) => {
    setCurrentPath(path)
  }
  
  const isVideoFile = (file: FileEntry) => {
    const videoExtensions = ["mp4", "mkv", "mov", "avi", "wmv", "flv", "webm"]
    return file.type === "file" && file.extension && videoExtensions.includes(file.extension)
  }
  
  const toggleVideoSelection = (path: string) => {
    if (selectedVideos.includes(path)) {
      setSelectedVideos(selectedVideos.filter(v => v !== path))
    } else {
      setSelectedVideos([...selectedVideos, path])
    }
  }
  
  const handleConvertClick = () => {
    if (selectedVideos.length === 0) return
    setShowConvertDialog(true)
  }
  
  const handleConvert = async () => {
    if (!settings.githubApiKey) {
      alert("Please set your GitHub API key in Settings first")
      router.push("/settings")
      return
    }
    
    if (!targetFolder) {
      alert("Please enter a target folder name")
      return
    }
    
    setIsConverting(true)
    
    try {
      // Process each selected video
      for (const videoPath of selectedVideos) {
        const job = await triggerVideoConversion(videoPath, targetFolder)
        
        if (job) {
          addConversionJob(job)
        }
      }
      
      // Reset selections and close dialog
      setSelectedVideos([])
      setShowConvertDialog(false)
      
      // Navigate to conversions tab
      router.push("/convert/in-progress")
    } catch (error) {
      console.error("Error starting conversion:", error)
      alert("Failed to start conversion. Please try again.")
    } finally {
      setIsConverting(false)
    }
  }
  
  const videoFiles = files.filter(file => isVideoFile(file))
  const folders = files.filter(file => file.type === "directory")
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VideoIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Video Converter</h1>
          </div>
          
          {selectedVideos.length > 0 && (
            <Button onClick={handleConvertClick}>
              Convert {selectedVideos.length} video{selectedVideos.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-center h-40">
            <VideoIcon className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-lg">Convert Videos to HLS</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Convert your videos to HLS format for streaming
            </p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-center h-40">
            <Clock3Icon className="h-8 w-8 text-purple-500 mb-3" />
            <h3 className="font-semibold text-lg">Queue Processing</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your video conversion progress
            </p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-100 dark:border-emerald-900 text-center h-40">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-lg">Video Library</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Access and share your converted videos
            </p>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Select Videos</CardTitle>
                <CardDescription>
                  Browse and select videos to convert
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => loadFiles(currentPath)}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center">
              <div className="text-sm text-muted-foreground flex items-center">
                <FolderIcon className="h-4 w-4 mr-1" />
                Current path: {currentPath}
              </div>
            </div>
            
            {isLoading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Folders */}
                {folders.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Folders</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {folders.map((folder) => (
                        <Card key={folder.path} className="p-2 hover:bg-accent cursor-pointer" onClick={() => navigateToFolder(folder.path)}>
                          <div className="flex items-center">
                            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded mr-2">
                              <FolderIcon className="h-5 w-5 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium truncate">{folder.name}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Videos */}
                {videoFiles.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Videos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {videoFiles.map((file) => (
                        <Card 
                          key={file.path} 
                          className={`overflow-hidden cursor-pointer border-2 transition-colors ${
                            selectedVideos.includes(file.path) 
                              ? 'border-blue-500 dark:border-blue-400' 
                              : 'border-transparent'
                          }`}
                          onClick={() => toggleVideoSelection(file.path)}
                        >
                          <div className="relative">
                            <div className="aspect-video bg-muted flex items-center justify-center">
                              <VideoIcon className="h-10 w-10 text-muted-foreground/60" />
                            </div>
                            {selectedVideos.includes(file.path) && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                <CheckCircleIcon className="h-4 w-4" />
                              </div>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                              asChild
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <Link href={`/player${file.path}`}>
                                <PlayIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-sm truncate">{file.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatFileSize(file.size)} • {file.extension?.toUpperCase()}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <VideoIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>No video files found in this folder</p>
                    <p className="text-sm mt-1">Navigate to a folder containing videos, or upload videos to your FTP server</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <Tabs defaultValue="converting" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="converting">Converting</TabsTrigger>
              <TabsTrigger value="converted">Converted</TabsTrigger>
            </TabsList>
            
            <TabsContent value="converting" className="mt-6">
              <ConvertingTab />
            </TabsContent>
            
            <TabsContent value="converted" className="mt-6">
              <ConvertedTab />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Convert Dialog */}
        <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert Videos to HLS</DialogTitle>
              <DialogDescription>
                {selectedVideos.length} video{selectedVideos.length > 1 ? 's' : ''} selected for conversion
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="target-folder">Target Folder Name</Label>
                <Input
                  id="target-folder"
                  placeholder="Enter folder name for converted videos"
                  value={targetFolder}
                  onChange={(e) => setTargetFolder(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This folder will be created in the same location as the original video
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="text-sm font-medium mb-2">Selected Videos:</h4>
                <div className="max-h-[150px] overflow-y-auto space-y-1">
                  {selectedVideos.map((path) => (
                    <div key={path} className="text-xs text-muted-foreground">
                      {path.split('/').pop()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConvertDialog(false)} disabled={isConverting}>
                Cancel
              </Button>
              <Button onClick={handleConvert} disabled={!targetFolder || isConverting}>
                {isConverting ? 'Starting Conversion...' : 'Start Conversion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
