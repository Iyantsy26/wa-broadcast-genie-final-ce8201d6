
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, File as FileIcon, X } from "lucide-react";

interface AudienceUploaderProps {
  onUploadComplete: (contacts: any[]) => void;
}

export function AudienceUploader({ onUploadComplete }: AudienceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size should be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // Simulate parsing CSV
        setTimeout(() => {
          parseCSV(file);
        }, 500);
      }
    }, 300);
  };

  const parseCSV = async (file: File) => {
    // In a real application, you would send this to your server or process it
    // Here we'll simulate successful parsing
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        // Basic CSV parsing
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        // Check for required headers
        const nameIndex = headers.findIndex(h => h.trim().toLowerCase() === 'name');
        const phoneIndex = headers.findIndex(h => h.trim().toLowerCase() === 'phone');
        
        if (nameIndex === -1 || phoneIndex === -1) {
          toast.error('CSV must contain "name" and "phone" columns');
          setIsUploading(false);
          return;
        }
        
        // Process rows
        const contacts = rows.slice(1).map((row, index) => {
          const columns = row.split(',');
          return {
            id: `imported-${index}`,
            name: columns[nameIndex].trim(),
            phone: columns[phoneIndex].trim(),
          };
        }).filter(contact => contact.name && contact.phone);
        
        toast.success(`Successfully imported ${contacts.length} contacts`);
        onUploadComplete(contacts);
        resetUploader();
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse CSV file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        onChange={handleFileSelection} 
        ref={fileInputRef}
      />
      
      {!file ? (
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
          onClick={triggerFileInput}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop your CSV file here, or click to browse
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
            Choose File
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Upload a CSV file with the following columns: name, phone
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="h-5 w-5 mr-2 text-blue-500" />
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500"
              onClick={resetUploader}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
          
          {!isUploading && (
            <div className="mt-4">
              <Button onClick={handleUpload} className="w-full">
                Upload and Process
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        <p>CSV files should contain a header row and contacts in the following format:</p>
        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">name,phone</code>
        <p className="mt-1">Phone numbers should include country code (e.g., +1 for USA).</p>
      </div>
    </div>
  );
}
