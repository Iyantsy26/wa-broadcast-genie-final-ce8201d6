
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  file: File;
  type: string | null;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, type, onRemove }) => {
  const fileURL = URL.createObjectURL(file);
  
  const renderPreview = () => {
    if (type === 'image' || file.type.startsWith('image/')) {
      return (
        <div className="relative">
          <img 
            src={fileURL} 
            alt="File preview" 
            className="object-cover rounded-md max-h-32"
          />
        </div>
      );
    } else if (type === 'video' || file.type.startsWith('video/')) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
            <VideoIcon className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
            <FileText className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={cn(
      "mt-2 p-2 border rounded-md relative",
      type === 'image' || file.type.startsWith('image/') ? 'inline-block' : 'flex items-center'
    )}>
      {renderPreview()}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 absolute top-1 right-1 bg-white rounded-full shadow-sm" 
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default FilePreview;
