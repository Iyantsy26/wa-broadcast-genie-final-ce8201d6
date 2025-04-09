
import { useState } from 'react';
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
  
  const resetForm = () => {
    setTemplateName('');
    setTemplateContent('');
    setSelectedCategory('text');
    setLanguage('en');
    setMediaFile(null);
    setMediaCaption('');
    setButtons([]);
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
    } finally {
      setIsLoading(false);
    }
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
                    <FileUpload 
                      onFileChange={setMediaFile}
                      value={mediaFile}
                      maxSizeMB={10}
                    />
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
