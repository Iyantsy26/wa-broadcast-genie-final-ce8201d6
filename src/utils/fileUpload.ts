
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Supported file types
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const SUPPORTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf", 
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", 
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain"
];

// Max file sizes (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

// Helper to validate file type and size
export const validateFile = (file: File, supportedTypes: string[], maxSize: number): boolean => {
  // Check file type
  if (!supportedTypes.includes(file.type)) {
    toast.error(`Unsupported file type: ${file.type}`);
    return false;
  }
  
  // Check file size
  if (file.size > maxSize) {
    toast.error(`File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`);
    return false;
  }
  
  return true;
};

// Function to upload a file to Supabase Storage
export const uploadFile = async (
  file: File, 
  bucket: string = "media",
  folder: string = ""
): Promise<string | null> => {
  try {
    // Create a unique file path to avoid collisions
    const fileExt = file.name.split('.').pop();
    const filePath = folder 
      ? `${folder}/${uuidv4()}.${fileExt}`
      : `${uuidv4()}.${fileExt}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (uploadError) {
      toast.error(`Error uploading file: ${uploadError.message}`);
      return null;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    toast.error('Failed to upload file');
    return null;
  }
};

// Function to handle file drop or selection
export const handleFileSelection = (
  file: File,
  supportedTypes: string[],
  maxSize: number,
  onFileSelect: (file: File) => void
) => {
  if (validateFile(file, supportedTypes, maxSize)) {
    onFileSelect(file);
  }
};

// Helper to get the file type category from MIME type
export const getFileTypeCategory = (mimeType: string): 'image' | 'video' | 'document' | null => {
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
    return 'image';
  } else if (SUPPORTED_VIDEO_TYPES.includes(mimeType)) {
    return 'video';
  } else if (SUPPORTED_DOCUMENT_TYPES.includes(mimeType)) {
    return 'document';
  }
  return null;
};
