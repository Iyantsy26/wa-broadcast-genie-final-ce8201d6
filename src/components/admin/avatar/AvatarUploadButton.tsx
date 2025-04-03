
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface AvatarUploadButtonProps {
  uploading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AvatarUploadButton = ({ uploading, onUpload }: AvatarUploadButtonProps) => {
  return (
    <div className="mt-4 text-center">
      <label htmlFor="avatar-upload" className="cursor-pointer">
        <Button 
          variant="outline" 
          className="mt-2"
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Change Avatar"}
        </Button>
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
        disabled={uploading}
      />
    </div>
  );
};

export default AvatarUploadButton;
