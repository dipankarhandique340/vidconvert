"use client"

import { useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderIcon, VideoIcon, SettingsIcon, FilesIcon, ArrowRightIcon } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { listFiles } from "@/lib/ftp-service"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const { setFiles, setIsLoadingFiles } = useAppStore()
  
  useEffect(() => {
    const loadRootFiles = async () => {
      setIsLoadingFiles(true)
      try {
        const fileList = await listFiles('/')
        setFiles(fileList)
      } catch (error) {
        console.error("Error loading files:", error)
      } finally {
        setIsLoadingFiles(false)
      }
    }
    
    loadRootFiles()
  }, [setFiles, setIsLoadingFiles])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your video converter dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-100 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                <FolderIcon className="h-5 w-5 mr-2" />
                My Drive
              </CardTitle>
              <CardDescription>
                Browse your files and folders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Access all your media files and organize them in folders
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/drive">
                  Browse Files
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-100 dark:border-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                <VideoIcon className="h-5 w-5 mr-2" />
                Convert Videos
              </CardTitle>
              <CardDescription>
                Convert videos to HLS format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Select videos to convert to HLS format for streaming
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/convert">
                  Convert Videos
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-100 dark:border-emerald-900">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-emerald-700 dark:text-emerald-300">
                <SettingsIcon className="h-5 w-5 mr-2" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure your API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Set up your GitHub API keys and manage preferences
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/settings">
                  Open Settings
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
      </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Follow these steps to convert your first video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center text-primary font-medium">
                    1
          </div>
                  <div>
                    <h3 className="font-medium">Configure GitHub API</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add your GitHub API key in the settings page to enable video conversion
                    </p>
          </div>
        </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center text-primary font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Browse Your Files</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Navigate through your FTP folders and locate the videos you want to convert
                    </p>
                </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center text-primary font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Convert Videos</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select videos, specify the output folder, and start the conversion process
                    </p>
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
