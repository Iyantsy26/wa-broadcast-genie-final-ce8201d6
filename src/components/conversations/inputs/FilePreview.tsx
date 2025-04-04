
import React from 'react';
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  file: File;
  type: string | null;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, type, onRemove }) => {
  if (!file) return null;
  
  return (
    <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
      {type === 'image' && (
        <img 
          src={URL.createObjectURL(file)} 
          alt="Selected file" 
          className="h-16 w-16 object-cover rounded-md mr-2"
        />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRemove}
      >
        Remove
      </Button>
    </div>
  );
};

export default FilePreview;
