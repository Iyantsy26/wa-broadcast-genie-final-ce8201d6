
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { LanguageSelector } from "@/components/ui/language-selector";
import { ButtonEditor, TemplateButton } from "./ButtonEditor";
import { addTemplate } from "@/services/templates/templateService";
import { toast } from "sonner";
import { Image, Video, File } from "lucide-react";
import FilePreview from "@/components/conversations/inputs/FilePreview";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateTemplateDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('text');
  const [language, setLanguage] = useState('en');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | null>(null);
  
  // Reset form when dialog opens or closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);
  
  const resetForm = () => {
    setTemplateName('');
    setTemplateContent('');
    setSelectedCategory('text');
    setLanguage('en');
    setMediaFile(null);
    setMediaCaption('');
    setButtons([]);
    setMediaType(null);
  };
  
  const handleCreateTemplate = async () => {
    // Validate inputs
    if (!templateName.trim()) {
      toast.error('Please provide a name for your template');
      return;
    }

    if (!templateContent.trim() && selectedCategory !== 'media') {
      toast.error('Please provide content for your template');
      return;
    }
    
    if (selectedCategory === 'media' && !mediaFile) {
      toast.error('Please select a media file for your template');
      return;
    }
    
    if (selectedCategory === 'interactive' && buttons.length === 0) {
      toast.error('Please add at least one button for your interactive template');
      return;
    }

    setIsLoading(true);
    
    try {
      await addTemplate(
        {
          name: templateName,
          status: 'pending',
          type: selectedCategory as 'text' | 'media' | 'interactive',
          language,
          content: selectedCategory === 'media' ? mediaCaption : templateContent,
          buttons: selectedCategory === 'interactive' ? buttons : undefined,
        },
        selectedCategory === 'media' ? mediaFile : null
      );
      
      toast.success('Template submitted for approval');
      resetForm();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (type: 'image' | 'video' | 'document') => {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    
    switch (type) {
      case 'image':
        fileInput.accept = 'image/jpeg,image/png,image/gif,image/webp';
        break;
      case 'video':
        fileInput.accept = 'video/mp4,video/webm,video/ogg';
        break;
      case 'document':
        fileInput.accept = 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
        break;
    }
    
    // Add a change event listener to handle the selected file
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setMediaFile(files[0]);
        setMediaType(type);
        toast.success(`${type} added successfully`);
      }
    };
    
    // Trigger the file input click to open the file selection dialog
    fileInput.click();
  };
  
  const clearMediaFile = () => {
    setMediaFile(null);
    setMediaType(null);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Design your WhatsApp template for business messaging
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., Welcome Message"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Template names can only contain lowercase letters, numbers, and underscores
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Template Category</Label>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="interactive">Interactive</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="text-content">Template Content</Label>
                  <Textarea
                    id="text-content"
                    placeholder="Hello {{1}}, thank you for your interest in our services. We're happy to assist you with {{2}}."
                    className="min-h-[120px]"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{{number}}"} for variables. Example: Hello {"{{1}}"}, your appointment is on {"{{2}}"}.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="media" className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Media</Label>
                    
                    {mediaFile ? (
                      <FilePreview
                        file={mediaFile}
                        onClear={clearMediaFile}
                        type={mediaType || undefined}
                      />
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleFileSelect('image')}>
                            <Image className="h-4 w-4 mr-2" />
                            Add Image
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleFileSelect('video')}>
                            <Video className="h-4 w-4 mr-2" />
                            Add Video
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleFileSelect('document')}>
                            <File className="h-4 w-4 mr-2" />
                            Add Document
                          </Button>
                        </div>
                        
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Drag and drop your media here, or click a button above to browse
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="media-caption">Caption (Optional)</Label>
                    <Textarea
                      id="media-caption"
                      placeholder="Check out our new product lineup!"
                      className="min-h-[80px]"
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use {"{{number}}"} for variables in the caption too.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="interactive" className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interactive-content">Message Content</Label>
                    <Textarea
                      id="interactive-content"
                      placeholder="Would you like to schedule an appointment with us?"
                      className="min-h-[80px]"
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {"{{number}}"} for variables in your message.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Buttons</Label>
                    <ButtonEditor 
                      buttons={buttons} 
                      onChange={setButtons}
                      maxButtons={3} 
                    />
                    <p className="text-xs text-muted-foreground">
                      You can add up to 3 buttons to your template.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <LanguageSelector value={language} onValueChange={setLanguage} />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTemplate}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
