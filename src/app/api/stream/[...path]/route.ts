import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { downloadFile } from '@/lib/ftp-service';
import os from 'os';
import { promisify } from 'util';
import fs from 'fs';
import { getMimeType } from '@/lib/file-utils';

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const tmpDir = path.join(os.tmpdir(), 'video-converter-cache');

// Ensure the temp directory exists
try {
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create temp directory:', error);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Ensure params.path is properly handled
  const pathParam = await Promise.resolve(params.path);
  
  try {
    if (!pathParam || !Array.isArray(pathParam)) {
      return NextResponse.json({ error: 'Invalid path parameter' }, { status: 400 });
    }
    
    // Get the file path from the URL params
    const filePath = pathParam.join('/');
    
    // Create a cache filename using a hash of the path
    const cacheFilename = Buffer.from(filePath).toString('base64').replace(/[/+=]/g, '_');
    const cacheFilePath = path.join(tmpDir, cacheFilename);
    
    let fileSize = 0;
    
    // Check if we have the file cached already
    if (!fs.existsSync(cacheFilePath)) {
      console.log(`Cache miss for ${filePath}, downloading from FTP to ${cacheFilePath}`);
      try {
        // Download the file from FTP to cache
        const downloadSuccess = await downloadFile(filePath, { localPath: cacheFilePath });
        
        if (!downloadSuccess) {
          console.error(`Failed to download file: ${filePath}`);
          return NextResponse.json({ error: 'Failed to download file from FTP' }, { status: 500 });
        }
      } catch (error) {
        console.error('Failed to download file from FTP:', error);
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
      }
    } else {
      console.log(`Cache hit for ${filePath}, using ${cacheFilePath}`);
    }
    
    try {
      // Get the file stats to determine size
      const stats = await stat(cacheFilePath);
      fileSize = stats.size;
    } catch (error) {
      console.error('Failed to get file stats:', error);
      return NextResponse.json({ error: 'Failed to get file stats' }, { status: 500 });
    }
    
    // Get the filename from the path to determine content type
    const filename = path.basename(filePath);
    const contentType = getMimeType(filename);
    
    // Parse range header
    const rangeHeader = request.headers.get('range');
    
    if (rangeHeader) {
      // Handle range request
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      // Limit the chunk size to 1MB to prevent huge chunks
      const maxChunkSize = 1024 * 1024;
      const calculatedEnd = Math.min(end, start + maxChunkSize - 1);
      
      const chunkSize = calculatedEnd - start + 1;
      
      const headers = new Headers({
        'Content-Range': `bytes ${start}-${calculatedEnd}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': contentType,
      });
      
      // Create a readable stream for the specified range
      const stream = createReadStream(cacheFilePath, { start, end: calculatedEnd });
      
      // Return the stream as a partial response
      return new NextResponse(stream as any, {
        status: 206,
        headers,
      });
    } else {
      // Return the whole file if no range is specified
      const headers = new Headers({
        'Content-Length': fileSize.toString(),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      
      const stream = createReadStream(cacheFilePath);
      
      return new NextResponse(stream as any, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error('Streaming error:', error);
    return NextResponse.json({ error: 'Failed to stream video' }, { status: 500 });
  }
}

// Helper function to clean up cached files older than 24 hours
export async function cleanUpCacheFiles() {
  try {
    const files = await fs.promises.readdir(tmpDir);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (const file of files) {
      const filePath = path.join(tmpDir, file);
      const stats = await fs.promises.stat(filePath);
      
      if (now - stats.mtimeMs > oneDayMs) {
        await unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Error cleaning up cache files:', error);
  }
}

// Run cache cleanup every hour
setInterval(cleanUpCacheFiles, 60 * 60 * 1000);