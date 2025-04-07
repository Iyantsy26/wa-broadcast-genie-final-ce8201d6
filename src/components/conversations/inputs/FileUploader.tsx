
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from '@/components/ui/popover';
import { 
  Paperclip, 
  Image, 
  FileText, 
  Video, 
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
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setActiveAttachmentType(e.target.name);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start" sideOffset={5}>
        <div className="space-y-1">
          <button 
            className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md transition-colors text-left"
            onClick={() => imageInputRef.current?.click()}
          >
            <Image className="h-4 w-4" />
            <span>Photo</span>
          </button>
          <input 
            type="file"
            name="image"
            ref={imageInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <button 
            className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md transition-colors text-left"
            onClick={() => videoInputRef.current?.click()}
          >
            <Video className="h-4 w-4" />
            <span>Video</span>
          </button>
          <input 
            type="file"
            name="video"
            ref={videoInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
          
          <button 
            className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md transition-colors text-left"
            onClick={() => documentInputRef.current?.click()}
          >
            <FileText className="h-4 w-4" />
            <span>Document</span>
          </button>
          <input 
            type="file"
            name="document"
            ref={documentInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {onLocationShare && (
            <button 
              className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md transition-colors text-left"
              onClick={onLocationShare}
            >
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FileUploader;
