
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Paperclip, 
  Image, 
  Video, 
  FileText,
} from 'lucide-react';
import { 
  SUPPORTED_IMAGE_TYPES, 
  SUPPORTED_VIDEO_TYPES, 
  SUPPORTED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
  validateFile
} from "@/utils/fileUpload";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  activeAttachmentType: string | null;
  setActiveAttachmentType: (type: string | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  activeAttachmentType, 
  setActiveAttachmentType 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate based on type
    let isValid = false;
    
    switch (activeAttachmentType) {
      case 'image':
        isValid = validateFile(file, SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE);
        break;
      case 'video':
        isValid = validateFile(file, SUPPORTED_VIDEO_TYPES, MAX_VIDEO_SIZE);
        break;
      case 'document':
        isValid = validateFile(file, SUPPORTED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE);
        break;
    }
    
    if (isValid) {
      onFileSelect(file);
    }
    
    // Reset the input value to allow the same file to be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const initiateFileUpload = (type: string) => {
    setActiveAttachmentType(type);
    if (fileInputRef.current) {
      switch (type) {
        case 'image':
          fileInputRef.current.accept = SUPPORTED_IMAGE_TYPES.join(',');
          break;
        case 'video':
          fileInputRef.current.accept = SUPPORTED_VIDEO_TYPES.join(',');
          break;
        case 'document':
          fileInputRef.current.accept = SUPPORTED_DOCUMENT_TYPES.join(',');
          break;
      }
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => initiateFileUpload('image')}>
            <Image className="mr-2 h-4 w-4" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => initiateFileUpload('video')}>
            <Video className="mr-2 h-4 w-4" />
            Video
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => initiateFileUpload('document')}>
            <FileText className="mr-2 h-4 w-4" />
            Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />
    </>
  );
};

export default FileUploader;
