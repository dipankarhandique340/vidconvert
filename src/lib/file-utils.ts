/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string with appropriate unit
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gets the file extension from a filename
 * @param filename The filename to extract extension from
 * @returns The extension (without the dot) or empty string if none
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Determines if a file is a video based on its extension
 * @param filename The filename to check
 * @returns True if the file has a video extension
 */
export function isVideoFile(filename: string): boolean {
  const videoExtensions = [
    '.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', 
    '.3gp', '.ts', '.m4v', '.mpg', '.mpeg', '.ogv'
  ];
  
  const ext = getFileExtension(filename);
  return videoExtensions.includes(ext);
}

/**
 * Determines the MIME type based on file extension
 * @param filename The filename to get MIME type for
 * @returns The MIME type string
 */
export function getMimeType(filename: string): string {
  const extension = getFileExtension(filename);
  
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    '3gp': 'video/3gpp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    json: 'application/json',
    txt: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
} 