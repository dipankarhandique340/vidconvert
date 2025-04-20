import { NextRequest, NextResponse } from "next/server"
import { uploadFile, downloadFile, listFiles, createDirectory, removeFile } from '@/lib/ftp-service'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Create a temp directory for upload/download operations
const tempDir = path.join(os.tmpdir(), 'video-converter-temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

export async function GET(request: NextRequest) {
  try {
    // Extract the path from query parameters
    const searchParams = request.nextUrl.searchParams;
    const remotePath = searchParams.get('path') || '/';
    
    // List files in the directory
    const files = await listFiles(remotePath);
    
    // Return the file listing
    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("Error in FTP GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, path } = body;
    
    if (!action || !path) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }
    
    // Handle different FTP actions
    if (action === 'mkdir') {
      await createDirectory(path);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'rm') {
      await removeFile(path);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'upload' && body.localPath) {
      await uploadFile(body.localPath, path);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'download' && body.localPath) {
      await downloadFile(path, body.localPath);
      return NextResponse.json({ success: true });
    }
    
    // If action is not recognized
    return NextResponse.json(
      { success: false, error: "Invalid action or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in FTP POST:", error);
    return NextResponse.json(
      { success: false, error: "Server error processing request" },
      { status: 500 }
    );
  }
}
