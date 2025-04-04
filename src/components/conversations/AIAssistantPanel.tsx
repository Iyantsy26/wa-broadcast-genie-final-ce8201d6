
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Languages, Edit, Upload, X } from 'lucide-react';

interface AIAssistantPanelProps {
  onRequestAIAssistance: (prompt: string) => Promise<string>;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onRequestAIAssistance,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await onRequestAIAssistance(prompt);
      setResponse(result);
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      setResponse('Sorry, there was an error processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-96 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Personal AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 p-2">
          <TabsTrigger value="write" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            <span>Write</span>
          </TabsTrigger>
          <TabsTrigger value="translate" className="flex items-center gap-1">
            <Languages className="h-4 w-4" />
            <span>Translate</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            <span>Files</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="flex-1 flex flex-col p-3 space-y-3">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-3">
            <div className="space-y-1">
              <Label htmlFor="prompt">What do you need help with?</Label>
              <Textarea
                id="prompt"
                placeholder="Write a professional response to customer asking about pricing..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 min-h-[100px]"
              />
            </div>
            
            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading ? 'Processing...' : 'Generate Response'}
            </Button>
            
            {response && (
              <div className="space-y-1">
                <Label>AI Response</Label>
                <div className="border rounded-md p-3 bg-gray-50 text-sm overflow-auto max-h-[200px]">
                  {response}
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => {
                    if (response) {
                      navigator.clipboard.writeText(response);
                    }
                  }}>
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            )}
          </form>
        </TabsContent>
        
        <TabsContent value="translate" className="flex-1 p-3 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="text-to-translate">Text to Translate</Label>
            <Textarea
              id="text-to-translate"
              placeholder="Enter text to translate..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="target-language">Target Language</Label>
            <select id="target-language" className="w-full border rounded-md p-2">
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
          
          <Button>Translate</Button>
        </TabsContent>
        
        <TabsContent value="files" className="flex-1 p-3 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Upload Training Files</CardTitle>
              <CardDescription>
                Upload files to train your personal AI assistant with company-specific knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="file-upload">Upload Files (PDF, DOC, TXT)</Label>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    multiple 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div>
                    <Label>Uploaded Files:</Label>
                    <div className="mt-2 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between border rounded-md p-2">
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={uploadedFiles.length === 0}>
                Train Assistant with Files
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistantPanel;
