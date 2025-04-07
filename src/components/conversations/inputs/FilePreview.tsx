
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  type: string | null;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, type, onRemove }) => {
  const fileUrl = URL.createObjectURL(file);
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <div className="mt-3 p-3 border rounded-md bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-sm">
          {type === 'image' ? 'Image Attachment' : 
           type === 'video' ? 'Video Attachment' : 
           'Document Attachment'}
        </span>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {type === 'image' && (
        <div className="relative">
          <img 
            src={fileUrl} 
            alt="Preview" 
            className="max-h-32 rounded object-contain"
          />
        </div>
      )}
      
      {type === 'video' && (
        <div className="relative">
          <video 
            src={fileUrl} 
            controls 
            className="max-h-32 w-full rounded" 
          />
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-1">
        {file.name} • {formatFileSize(file.size)}
      </div>
    </div>
  );
};

export default FilePreview;
