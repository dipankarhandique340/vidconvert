"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FolderIcon, 
  FileIcon, 
  ArrowUpIcon, 
  RefreshCw as RefreshIcon,
  MoreHorizontalIcon,
  VideoIcon,
  AlertCircleIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  CopyIcon,
  FolderInputIcon,
  ChevronRight,
  FolderOpen,
  File,
  Video as VideoIconLucide,
  Upload,
  MoreVertical,
  Pencil,
  MoveRight,
  Copy,
  Trash,
  ArrowLeft
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { listFiles, FileEntry } from "@/lib/ftp-service";
import { formatFileSize } from "@/lib/utils";
import Link from "next/link";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Player } from '@/components/Player';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

function DrivePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = searchParams?.get("path") || "/";
  
  const { 
    files, 
    setFiles, 
    isLoadingFiles, 
    setIsLoadingFiles, 
    setCurrentPath 
  } = useAppStore();
  
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [fileActionDialogOpen, setFileActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'rename'|'move'|'copy'|'convert'|null>(null);
  const [actionInput, setActionInput] = useState('');
  const [actionTargetPath, setActionTargetPath] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    setError(null);
    
    try {
      const fileList = await listFiles(path);
      
      if (fileList.length === 0 && path !== "/") {
        setError("Directory may be empty or inaccessible");
      }
      
      setFiles(fileList);
    } catch (error) {
      console.error("Error loading files:", error);
      setError("Failed to load files. Please try again later.");
    } finally {
      setIsLoadingFiles(false);
    }
  }, [path, setFiles]);
  
  useEffect(() => {
    loadFiles();
    setCurrentPath(path);
    
    // Preload common directories for faster navigation later
    import('@/lib/ftp-service').then(({ preloadCommonDirectories }) => {
      preloadCommonDirectories().catch(console.error);
    });
  }, [path, setCurrentPath, loadFiles]);

  // Add this to manage clean connections when component unmounts
  useEffect(() => {
    return () => {
      // Clean up FTP connections when component unmounts
      import('@/lib/ftp-service').then(({ closeAllConnections }) => {
        closeAllConnections().catch(console.error);
      });
    };
  }, []);
  
  const navigateToFolder = (folderPath: string) => {
    router.push(`/drive?path=${encodeURIComponent(folderPath)}`);
  };
  
  const navigateUp = () => {
    if (path === "/") return;
    
    const segments = path.split("/").filter(Boolean);
    segments.pop();
    const parentPath = segments.length === 0 ? "/" : `/${segments.join("/")}`;
    
    navigateToFolder(parentPath);
  };
  
  const isVideoFile = (file: FileEntry) => {
    const videoExtensions = ["mp4", "mkv", "mov", "avi", "wmv", "flv", "webm"];
    return file.type === "file" && file.extension && videoExtensions.includes(file.extension);
  };
  
  const refreshFiles = () => {
    loadFiles();
  };
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const targetPath = path ? `${path}/${newFolderName}` : newFolderName;
      const response = await fetch('/api/ftp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createDirectory',
          path: targetPath,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }
      
      toast({
        title: "Success",
        description: `Folder "${newFolderName}" created successfully`,
      });
      setCreateFolderDialogOpen(false);
      setNewFolderName('');
      loadFiles();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };
  
  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('path', path);
      
      const response = await fetch('/api/ftp', {
        method: 'POST',
        body: JSON.stringify({
          action: 'upload',
          path: path ? `${path}/${uploadFile.name}` : uploadFile.name,
          fileContent: await uploadFile.arrayBuffer(),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      toast({
        title: "Success",
        description: `File "${uploadFile.name}" uploaded successfully`,
      });
      setUploadDialogOpen(false);
      setUploadFile(null);
      loadFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };
  
  const handleFileAction = async () => {
    if (!selectedFile || !actionType) return;
    
    try {
      const sourcePath = path ? `${path}/${selectedFile.name}` : selectedFile.name;
      
      let response;
      
      if (actionType === 'rename' && actionInput) {
        const targetPath = path ? `${path}/${actionInput}` : actionInput;
        
        response = await fetch('/api/ftp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'move',
            sourcePath,
            targetPath,
          }),
        });
      } 
      else if (actionType === 'move' && actionTargetPath) {
        const targetPath = `${actionTargetPath}/${selectedFile.name}`;
        
        response = await fetch('/api/ftp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'move',
            sourcePath,
            targetPath,
          }),
        });
      }
      else if (actionType === 'copy' && actionTargetPath) {
        const targetPath = `${actionTargetPath}/${selectedFile.name}`;
        
        response = await fetch('/api/ftp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'copy',
            sourcePath,
            targetPath,
          }),
        });
      }
      else if (actionType === 'convert' && actionInput) {
        window.location.href = `/convert?selected=${encodeURIComponent(sourcePath)}&target=${encodeURIComponent(actionInput)}`;
        return;
      }
      
      if (!response?.ok) {
        throw new Error(`Failed to ${actionType} file`);
      }
      
      toast({
        title: "Success",
        description: `File successfully ${actionType === 'rename' ? 'renamed' : actionType === 'move' ? 'moved' : actionType === 'copy' ? 'copied' : 'processed'}`,
      });
      
      loadFiles();
    } catch (error) {
      console.error(`Error during ${actionType} operation:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} file`,
        variant: "destructive",
      });
    } finally {
      setFileActionDialogOpen(false);
      setActionType(null);
      setActionInput('');
      setActionTargetPath('');
      setSelectedFile(null);
    }
  };
  
  const handleDelete = async (filePath: string) => {
    if (!confirm(`Are you sure you want to delete "${filePath}"?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/ftp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'rm', 
          path: filePath 
        })
      });
      
      if (response.ok) {
        refreshFiles();
      } else {
        setError("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Failed to delete file");
    }
  };
  
  const openActionDialog = (file: FileEntry, type: 'rename'|'move'|'copy'|'convert') => {
    setSelectedFile(file);
    setActionType(type);
    setActionInput(type === 'rename' ? file.name : '');
    setFileActionDialogOpen(true);
  };
  
  const handleConvert = (filePath: string) => {
    openActionDialog({
      name: path.split('/').pop() || '',
      path: filePath,
      type: 'file',
      size: 0,
      modifiedDate: new Date()
    }, 'convert');
  };
  
  const renderBreadcrumbs = () => {
    if (!path) {
      return <div className="text-xl font-bold mb-4">My Drive</div>;
    }
    
    const parts = path.split('/');
    
    return (
      <div className="flex items-center text-sm mb-4 overflow-x-auto">
        <Link href="/drive" className="font-medium hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Root
        </Link>
        {parts.map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          return (
            <div key={path} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <Link href={`/drive?path=${path}`} className="font-medium hover:underline">
                {part}
              </Link>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Drive</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshFiles} disabled={isLoadingFiles}>
              <RefreshIcon className={`h-4 w-4 mr-2 ${isLoadingFiles ? "animate-spin" : ""}`} />
              {isLoadingFiles ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
        
        <Card className="overflow-hidden">
          <div className="bg-muted/50 p-3 border-b">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={navigateUp}
                disabled={path === "/" || isLoadingFiles}
              >
                <ArrowUpIcon className="h-4 w-4 mr-2" />
                Up
              </Button>
              <div className="ml-4 text-sm font-medium">{path}</div>
            </div>
          </div>
          
        </Card>
        
        <div className="flex space-x-4 mb-6">
          <Button onClick={() => setCreateFolderDialogOpen(true)}>
            <FolderOpen className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
        
        <Card>
          {isLoadingFiles ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 border-b border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircleIcon className="h-4 w-4 mr-2" />
                  <span>{error}</span>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingFiles ? (
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full max-w-[250px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        {error ? (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircleIcon className="h-10 w-10 mb-2 text-red-500/60" />
                            <p>Error loading files</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-4"
                              onClick={refreshFiles}
                            >
                              Try Again
                            </Button>
                          </div>
                        ) : (
                          "No files found in this directory"
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    files.map((file) => (
                      <TableRow key={file.path}>
                        <TableCell>
                          {file.type === "directory" ? (
                            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded">
                              <FolderIcon className="h-5 w-5 text-blue-500" />
                            </div>
                          ) : isVideoFile(file) ? (
                            <div className="bg-purple-50 dark:bg-purple-950 p-2 rounded">
                              <VideoIcon className="h-5 w-5 text-purple-500" />
                            </div>
                          ) : (
                            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                              <FileIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {file.type === "directory" ? (
                            <button
                              className="text-sm font-medium hover:underline text-left"
                              onClick={() => navigateToFolder(file.path)}
                            >
                              {file.name}
                            </button>
                          ) : isVideoFile(file) ? (
                            <Link
                              href={`/player${file.path}`}
                              className="text-sm font-medium hover:underline text-left text-purple-600 dark:text-purple-400 flex items-center"
                            >
                              {file.name}
                              <PlayIcon className="h-3.5 w-3.5 ml-2 inline-block" />
                            </Link>
                          ) : (
                            <span className="text-sm">{file.name}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {file.type === "directory" ? "—" : formatFileSize(file.size)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {file.modifiedDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isVideoFile(file) && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleConvert(file.path)}
                                    className="cursor-pointer"
                                  >
                                    <VideoIcon className="h-4 w-4 mr-2" />
                                    Convert to HLS
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem className="cursor-pointer">
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <FolderInputIcon className="h-4 w-4 mr-2" />
                                Move to...
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <CopyIcon className="h-4 w-4 mr-2" />
                                Copy to...
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(file.path)}
                                className="text-red-600 cursor-pointer"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function DrivePage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Drive</h1>
          </div>
          <Card className="overflow-hidden">
            <div className="h-[500px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    }>
      <DrivePageContent />
    </Suspense>
  );
} 