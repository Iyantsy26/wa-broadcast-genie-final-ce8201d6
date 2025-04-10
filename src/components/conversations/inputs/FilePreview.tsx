
import { Button } from "@/components/ui/button";
import { X, Paperclip, Image, Video, FileText, File as FileIcon } from "lucide-react";
import { getFileTypeCategory } from "@/utils/fileUpload";

interface FilePreviewProps {
  file: File | null;
  onClear: () => void;
  type?: string | null; // Added type prop
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClear, type }) => {
  if (!file) return null;

  // Use the provided type if available, otherwise detect from file
  const fileTypeCategory = type || getFileTypeCategory(file.type);
  const fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
  
  // Create an object URL for image preview
  const getPreviewUrl = () => {
    if (fileTypeCategory === 'image') {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const getFileIcon = () => {
    switch (fileTypeCategory) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-2 rounded-lg bg-muted/30 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {fileTypeCategory === 'image' ? (
            <div className="h-12 w-12 rounded overflow-hidden bg-muted">
              <img
                src={getPreviewUrl()}
                alt="Preview"
                className="h-full w-full object-cover"
                onLoad={() => URL.revokeObjectURL(getPreviewUrl() || '')}
              />
            </div>
          ) : (
            <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
              {getFileIcon()}
            </div>
          )}

          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{fileSize}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onClear} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FilePreview;
