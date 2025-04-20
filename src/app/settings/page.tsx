"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAppStore } from "@/lib/store"
import { isApiKeyValid, setGithubApiKey } from "@/lib/github-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KeyIcon, GithubIcon, CloudIcon, Palette as ThemeIcon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const [apiKey, setApiKey] = useState(settings.githubApiKey)
  const [repository, setRepository] = useState(settings.githubRepository)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState("")
  
  const handleSaveGithubSettings = async () => {
    setIsValidating(true)
    setValidationError("")
    
    try {
      const isValid = await isApiKeyValid(apiKey)
      
      if (isValid) {
        updateSettings({ 
          githubApiKey: apiKey,
          githubRepository: repository
        })
        setGithubApiKey(apiKey)
      } else {
        setValidationError("Invalid GitHub API key. Please check and try again.")
      }
    } catch (error) {
      console.error("Error validating API key:", error)
      setValidationError("An error occurred while validating the API key.")
    } finally {
      setIsValidating(false)
    }
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and preferences
          </p>
        </div>
        
        <Tabs defaultValue="api-keys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="api-keys">
              <KeyIcon className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <ThemeIcon className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GithubIcon className="h-5 w-5 mr-2" />
                  GitHub API Settings
                </CardTitle>
                <CardDescription>
                  Configure your GitHub API connection for video conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">GitHub API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  />
                  {validationError && (
                    <p className="text-sm text-red-500">{validationError}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="repository">GitHub Repository</Label>
                  <Input
                    id="repository"
                    value={repository}
                    onChange={(e) => setRepository(e.target.value)}
                    placeholder="username/repository"
                  />
                  <p className="text-xs text-muted-foreground">
                    This repository should contain the workflow for video conversion
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveGithubSettings}
                  disabled={isValidating}
                >
                  {isValidating ? "Validating..." : "Save GitHub Settings"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CloudIcon className="h-5 w-5 mr-2" />
                  FTP Settings
                </CardTitle>
                <CardDescription>
                  FTP connection details for file storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>FTP Host</Label>
                      <Input 
                        value="ftp.pixelfile.in" 
                        disabled 
                      />
                    </div>
                    <div>
                      <Label>FTP Username</Label>
                      <Input 
                        value="api@cdn.pixelfile.in" 
                        disabled 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    FTP connection details are pre-configured and cannot be changed
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
