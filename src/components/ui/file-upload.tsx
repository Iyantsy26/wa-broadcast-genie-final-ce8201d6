
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon, ImageIcon, Film } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileChange: (file: File | null) => void;
  value?: File | null;
  className?: string;
  fileType?: 'image' | 'video' | 'document' | 'any';
  buttonText?: string;
  dropText?: string;
}

export function FileUpload({
  accept,
  maxSizeMB = 5,
  onFileChange,
  value,
  className,
  fileType = 'any',
  buttonText = "Choose File",
  dropText = "Drop file here or click to browse"
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const getAcceptString = () => {
    if (accept) return accept;
    
    switch(fileType) {
      case 'image': return 'image/jpeg,image/png,image/gif,image/webp';
      case 'video': return 'video/mp4,video/webm,video/quicktime';
      case 'document': return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
      default: return undefined;
    }
  };

  const getTypeIcon = () => {
    switch(fileType) {
      case 'image': return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
      case 'video': return <Film className="h-8 w-8 text-muted-foreground" />;
      case 'document': return <FileIcon className="h-8 w-8 text-muted-foreground" />;
      default: return <Upload className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSizeBytes) {
        alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }
      onFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > maxSizeBytes) {
        alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }
      onFileChange(file);
    }
  };

  const clearFile = () => {
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25",
          value ? "bg-background" : "bg-background/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              {fileType === 'image' && (
                <div className="relative w-full max-w-xs mx-auto">
                  <img
                    src={URL.createObjectURL(value)}
                    alt="Preview"
                    className="max-h-40 mx-auto object-contain rounded-md"
                  />
                </div>
              )}
              
              {fileType !== 'image' && (
                <div className="flex items-center gap-2 text-sm">
                  {fileType === 'video' ? <Film className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
                  <span className="font-medium">{value.name}</span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="mt-2"
            >
              <X className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {getTypeIcon()}
            <p className="text-sm text-muted-foreground">{dropText}</p>
            <Button variant="outline" size="sm" type="button">
              {buttonText}
            </Button>
          </div>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept={getAcceptString()}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
