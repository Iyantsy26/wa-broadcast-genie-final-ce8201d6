
/**
 * Utility functions for file uploads
 */

export const getFileTypeCategory = (mimeType: string): 'image' | 'video' | 'document' | 'audio' | 'other' => {
  if (!mimeType) return 'other';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType.startsWith('application/pdf') ||
    mimeType.startsWith('application/msword') ||
    mimeType.startsWith('application/vnd.openxmlformats-officedocument') ||
    mimeType.startsWith('text/')
  ) {
    return 'document';
  }
  
  return 'other';
};

export const validateFileSize = (file: File, maxSizeMB = 10): boolean => {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (allowedTypes.length === 0) return true;
  return allowedTypes.some(type => file.type.startsWith(type));
};
