"use server"

import { Client, FileInfo, FileType } from 'basic-ftp'
import path from 'path'
import fs from 'fs'

// FTP connection details
const FTP_CONFIG = {
  host: 'ftp.pixelfile.in',
  user: 'api@cdn.pixelfile.in',
  password: 'Dipankar@123',
  secure: false,
  timeout: 30000, // Increase timeout to 30 seconds
}

export interface FileEntry {
  name: string
  type: 'file' | 'directory'
  size: number
  modifiedDate: Date
  path: string
  extension?: string
}

// Cache implementation for faster file listing
const CACHE_EXPIRY_MS = 60000; // 1 minute cache expiration
const directoryCache = new Map<string, { data: FileEntry[], timestamp: number }>();

// Connection pool implementation to avoid reconnections
let clientPool: Client[] = [];
const MAX_POOL_SIZE = 3;

/**
 * Get a client from the pool or create a new one if needed
 */
async function getClient(): Promise<Client> {
  try {
    // Check if we have an available client in the pool
    if (clientPool.length > 0) {
      const client = clientPool.pop()!;
      
      // Test if client is still connected
      try {
        await client.pwd();
        return client;
      } catch (error) {
        // Client is disconnected, close it and create a new one
        try { client.close(); } catch (e) { /* ignore */ }
      }
    }
    
    // Create a new client if pool is empty or existing client is disconnected
    const client = new Client();
    client.ftp.verbose = false;
    
    try {
      await client.access(FTP_CONFIG);
      return client;
    } catch (error) {
      console.error('Error connecting to FTP:', error);
      throw new Error('Failed to connect to FTP server. Please try again later.');
    }
  } catch (error) {
    console.error('Error in getClient:', error);
    throw new Error('Failed to establish FTP connection. Please try again later.');
  }
}

/**
 * Return a client to the pool
 */
function releaseClient(client: Client): void {
  try {
    // Only keep the pool up to MAX_POOL_SIZE
    if (clientPool.length < MAX_POOL_SIZE) {
      clientPool.push(client);
    } else {
      client.close();
    }
  } catch (error) {
    // If there's an error releasing the client, just close it
    try { client.close(); } catch (e) { /* ignore */ }
  }
}

/**
 * List files with caching for better performance
 */
export async function listFiles(remotePath = '/', maxRetries = 3): Promise<FileEntry[]> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Check cache first
      const cacheKey = remotePath;
      const cachedData = directoryCache.get(cacheKey);
      
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_EXPIRY_MS) {
        console.log(`Using cached data for ${remotePath}`);
        return cachedData.data;
      }
      
      // If not in cache or expired, fetch from FTP
      let client: Client | null = null;
      
      try {
        client = await getClient();
        
        // Explicitly set passive mode
        await client.send('PASV');
        
        let list;
        try {
          list = await client.list(remotePath);
        } catch (error) {
          console.error(`Error listing FTP files: ${error}`);
          throw error; // Will be caught by the retry mechanism
        }
        
        const fileEntries = list.map((item: FileInfo) => {
          const isDirectory = item.type === FileType.Directory;
          const extension = !isDirectory ? path.extname(item.name).slice(1).toLowerCase() : undefined;
          
          return {
            name: item.name,
            type: isDirectory ? 'directory' as const : 'file' as const,
            size: item.size,
            modifiedDate: item.modifiedAt || new Date(),
            path: remotePath === '/' 
              ? `/${item.name}` 
              : `${remotePath}/${item.name}`,
            extension
          };
        });
        
        // Save to cache
        directoryCache.set(cacheKey, {
          data: fileEntries,
          timestamp: Date.now()
        });
        
        return fileEntries;
      } catch (error) {
        console.error(`Error listing FTP files (attempt ${retries + 1}/${maxRetries}):`, error);
        throw error; // Re-throw to trigger retry
      } finally {
        if (client) releaseClient(client);
      }
    } catch (error) {
      retries++;
      
      if (retries < maxRetries) {
        console.log(`Retrying listFiles (${retries}/${maxRetries}) after error:`, error);
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      } else {
        console.error(`Max retries (${maxRetries}) reached for listing ${remotePath}`);
        return []; // Return empty array after max retries
      }
    }
  }
  
  return []; // Fallback return in case of error
}

// Upload a file to FTP server
export async function uploadFile(localFilePath: string, remoteFilePath: string): Promise<boolean> {
  let client: Client | null = null;
  
  try {
    client = await getClient();
    
    await client.uploadFrom(localFilePath, remoteFilePath);
    
    // Invalidate cache for the directory
    const dirPath = path.dirname(remoteFilePath);
    directoryCache.delete(dirPath);
    
    return true;
  } catch (error) {
    console.error('Error uploading file:', error);
    return false;
  } finally {
    if (client) releaseClient(client);
  }
}

// Create a directory on FTP server
export async function createDirectory(remotePath: string): Promise<boolean> {
  let client: Client | null = null;
  
  try {
    client = await getClient();
    
    await client.ensureDir(remotePath);
    
    // Invalidate cache for the parent directory
    const parentDir = path.dirname(remotePath);
    directoryCache.delete(parentDir);
    
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    return false;
  } finally {
    if (client) releaseClient(client);
  }
}

/**
 * Download a file from FTP to a specified local path or return as a buffer
 */
export async function downloadFile(remotePath: string, options: { localPath?: string, returnBuffer?: boolean } = {}, maxRetries = 3): Promise<Buffer | string | null> {
  const { localPath, returnBuffer = false } = options;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      let client: Client | null = null;
      
      try {
        client = await getClient();
        
        // Explicitly set binary mode for all files
        await client.send('TYPE I');
        
        // Use passive mode
        await client.send('PASV');
        
        if (returnBuffer) {
          // Return as buffer using a memory collector
          const chunks: Buffer[] = [];
          const writable = {
            write(chunk: Buffer | string) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              return true;
            }
          };
          
          try {
            await client.downloadTo(writable as any, remotePath);
            return Buffer.concat(chunks);
          } catch (error) {
            console.error(`Error during FTP download to buffer:`, error);
            throw error;
          }
        } else if (localPath) {
          // Ensure directory exists
          const dir = path.dirname(localPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          // Download to file
          await client.downloadTo(localPath, remotePath);
          return localPath;
        } else {
          throw new Error('Either localPath or returnBuffer must be specified');
        }
      } catch (error) {
        console.error(`Error downloading file ${remotePath}:`, error);
        throw error; // Re-throw to trigger retry
      } finally {
        if (client) releaseClient(client);
      }
    } catch (error) {
      retries++;
      
      if (retries < maxRetries) {
        console.log(`Retrying download (${retries}/${maxRetries}) after error:`, error);
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      } else {
        console.error(`Max retries (${maxRetries}) reached for downloading ${remotePath}`);
        return null;
      }
    }
  }
  
  return null;
}

// Remove a file from FTP server
export async function removeFile(path: string): Promise<boolean> {
  let client: Client | null = null;

  try {
    client = await getClient();
    await client.remove(path);
    return true;
  } catch (error) {
    console.error("Error removing file:", error);
    return false;
  } finally {
    if (client) releaseClient(client);
  }
}

// Clear cache for a specific path
export async function clearCache(remotePath?: string): Promise<void> {
  try {
    if (remotePath) {
      directoryCache.delete(remotePath);
    } else {
      directoryCache.clear();
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Preload common directories for faster navigation
export async function preloadCommonDirectories(): Promise<void> {
  try {
    const commonPaths = ['/', '/videos', '/documents'];
    
    for (const path of commonPaths) {
      try {
        await listFiles(path);
      } catch (error) {
        // Silently continue if a directory doesn't exist
        console.log(`Could not preload directory: ${path}`);
      }
    }
  } catch (error) {
    console.error('Error preloading directories:', error);
  }
}

// Close all connections in the pool
export async function closeAllConnections(): Promise<void> {
  try {
    for (const client of clientPool) {
      try {
        client.close();
      } catch (error) {
        console.error('Error closing client:', error);
      }
    }
    clientPool = [];
  } catch (error) {
    console.error('Error closing connections:', error);
  }
}

// Get file information from FTP without downloading
export async function getFileFromFtp(remotePath: string): Promise<{
  size: number;
  modifiedDate: Date;
  name: string;
  type: string;
}> {
  let client: Client | null = null;
  
  try {
    client = await getClient();
    
    // Get directory and filename
    const dirPath = path.dirname(remotePath);
    const fileName = path.basename(remotePath);
    
    // List the directory to find the file info
    await client.cd(dirPath);
    const list = await client.list();
    
    // Find the specific file
    const fileInfo = list.find(item => item.name === fileName);
    
    if (!fileInfo) {
      throw new Error(`File not found: ${remotePath}`);
    }
    
    // Get file extension
    const ext = path.extname(fileName).slice(1).toLowerCase();
    
    return {
      size: fileInfo.size,
      modifiedDate: fileInfo.modifiedAt || new Date(),
      name: fileName,
      type: ext
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  } finally {
    if (client) releaseClient(client);
  }
}
