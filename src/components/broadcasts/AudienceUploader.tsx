
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, File, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AudienceUploaderProps {
  onUploadComplete?: (contacts: any[]) => void;
}

export function AudienceUploader({ onUploadComplete }: AudienceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a valid CSV file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 5MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + Math.random() * 15;
        return next > 95 ? 95 : next;
      });
    }, 500);
    
    try {
      // Simulate file reading and processing
      const contacts = await readCSVFile(file);
      
      // Simulate network request
      await new Promise(r => setTimeout(r, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(contacts);
      }
      
      toast.success(`Successfully uploaded ${contacts.length} contacts`);
      
      // Reset after successful upload
      setTimeout(() => {
        setFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error uploading CSV:', error);
      toast.error('Failed to process CSV file. Please check the format.');
      setIsUploading(false);
    }
  };
  
  const readCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;
          const rows = csvText.split('\n');
          const headers = rows[0].split(',').map(header => header.trim());
          
          const contacts = rows.slice(1).map(row => {
            if (!row.trim()) return null; // Skip empty rows
            
            const values = row.split(',').map(value => value.trim());
            const contact: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              contact[header] = values[index] || '';
            });
            
            return contact;
          }).filter(Boolean); // Remove null entries
          
          // Validate required fields
          const allValid = contacts.every(contact => 
            contact && 
            contact.name && 
            contact.phone && 
            /^\+?\d+$/.test(contact.phone)
          );
          
          if (!allValid) {
            reject(new Error('Some contacts are missing required fields or have invalid phone numbers'));
            return;
          }
          
          resolve(contacts);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };
  
  const clearFile = () => {
    setFile(null);
  };
  
  return (
    <div className="space-y-4">
      {!file ? (
        <>
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Make sure your CSV includes name, phone (with country code), and optional email columns
            </p>
          </div>
          
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            Select CSV File
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
            <File className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100 ? 'Processing...' : 'Upload complete!'}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={handleUpload} className="flex-1">
                Upload Contacts
              </Button>
            </div>
          )}
          
          <div className="rounded-md bg-yellow-50 p-3 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="text-yellow-700">
                <p>CSV file requirements:</p>
                <ul className="list-disc list-inside mt-1 pl-1 space-y-1">
                  <li>First row must contain column headers</li>
                  <li>Must include 'name' and 'phone' columns</li>
                  <li>Phone numbers should include country code</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
