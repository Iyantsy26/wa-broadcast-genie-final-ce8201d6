
/**
 * Utility functions for file uploads
 */

// File type constants
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

// File size limits in MB
export const MAX_IMAGE_SIZE = 5; // 5MB
export const MAX_VIDEO_SIZE = 20; // 20MB
export const MAX_DOCUMENT_SIZE = 10; // 10MB

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

// Combined validation function
export const validateFile = (file: File, allowedTypes: string[], maxSizeMB = 10): boolean => {
  const isValidType = validateFileType(file, allowedTypes);
  const isValidSize = validateFileSize(file, maxSizeMB);
  
  if (!isValidType) {
    console.error('Invalid file type:', file.type);
    return false;
  }
  
  if (!isValidSize) {
    console.error('File too large:', file.size / (1024 * 1024), 'MB (max:', maxSizeMB, 'MB)');
    return false;
  }
  
  return true;
};

// Mock file upload function that would be replaced with actual implementation
export const uploadFile = async (file: File): Promise<string> => {
  // This is a placeholder - in a real app you would upload to a server
  return new Promise(resolve => {
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file);
      resolve(mockUrl);
    }, 1000);
  });
};
