
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  PaperclipIcon, 
  Image, 
  File, 
  Film, 
  MapPin 
} from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onLocationShare?: () => void;
  activeAttachmentType: string | null;
  setActiveAttachmentType: (type: string | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  onLocationShare,
  activeAttachmentType,
  setActiveAttachmentType
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const handleOpenFileDialog = (type: string) => {
    setActiveAttachmentType(type);
    
    switch (type) {
      case 'image':
        imageInputRef.current?.click();
        break;
      case 'document':
        documentInputRef.current?.click();
        break;
      case 'video':
        videoInputRef.current?.click();
        break;
      case 'location':
        if (onLocationShare) {
          onLocationShare();
        }
        break;
      default:
        break;
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = ''; // Reset input value
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start" sideOffset={5}>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="flex flex-col gap-1 h-16 items-center justify-center"
              onClick={() => handleOpenFileDialog('image')}
            >
              <Image className="h-5 w-5" />
              <span className="text-xs">Image</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col gap-1 h-16 items-center justify-center"
              onClick={() => handleOpenFileDialog('document')}
            >
              <File className="h-5 w-5" />
              <span className="text-xs">Document</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col gap-1 h-16 items-center justify-center"
              onClick={() => handleOpenFileDialog('video')}
            >
              <Film className="h-5 w-5" />
              <span className="text-xs">Video</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col gap-1 h-16 items-center justify-center"
              onClick={() => handleOpenFileDialog('location')}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-xs">Location</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default FileUploader;
