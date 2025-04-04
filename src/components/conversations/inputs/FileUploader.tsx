
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
    if (file) {
      onFileSelect(file);
    }
  };

  const initiateFileUpload = (type: string) => {
    setActiveAttachmentType(type);
    if (fileInputRef.current) {
      switch (type) {
        case 'image':
          fileInputRef.current.accept = 'image/*';
          break;
        case 'video':
          fileInputRef.current.accept = 'video/*';
          break;
        case 'document':
          fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
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
