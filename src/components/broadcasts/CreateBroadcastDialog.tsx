
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Image, Video, File, X } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { fetchTemplates } from "@/services/templates/templateService";
import { addBroadcast } from "@/services/broadcasts/broadcastService";
import { toast } from "sonner";
import { Template } from "@/services/templates/templateService";
import { AudienceUploader } from "@/components/broadcasts/AudienceUploader";
import FilePreview from "@/components/conversations/inputs/FilePreview";
import { getFileTypeCategory } from "@/utils/fileUpload";

interface CreateBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateBroadcastDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateBroadcastDialogProps) {
  const [campaignName, setCampaignName] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedAudience, setSelectedAudience] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [schedulingOption, setSchedulingOption] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<string>('12:00');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAudienceUploader, setShowAudienceUploader] = useState<boolean>(false);
  
  // Fetch templates
  useEffect(() => {
    if (open) {
      const loadTemplates = async () => {
        try {
          const data = await fetchTemplates();
          setTemplates(data.filter(t => t.status === 'approved'));
        } catch (error) {
          console.error('Error loading templates:', error);
        }
      };
      loadTemplates();
    }
  }, [open]);
  
  const handleCreateCampaign = async () => {
    // Validate inputs
    if (!campaignName) {
      toast.error('Please provide a campaign name');
      return;
    }

    if (!selectedTemplate && !messageContent) {
      toast.error('Please select a template or create a custom message');
      return;
    }

    if (!selectedAudience) {
      toast.error('Please select an audience for your broadcast');
      return;
    }
    
    if (!selectedDevice) {
      toast.error('Please select a WhatsApp account to send from');
      return;
    }
    
    // Calculate scheduled datetime
    let scheduledDateTime: string = '';
    if (schedulingOption === 'later' && scheduledDate) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const scheduled = new Date(scheduledDate);
      scheduled.setHours(hours, minutes);
      scheduledDateTime = scheduled.toISOString();
    }
    
    setIsLoading(true);
    
    try {
      await addBroadcast(
        {
          name: campaignName,
          status: schedulingOption === 'later' ? 'scheduled' : 'draft',
          template: selectedTemplate || undefined,
          audience: selectedAudience,
          sent: 0,
          delivered: 0,
          read: 0,
          responded: 0,
          scheduled: scheduledDateTime,
          message_content: messageContent,
          media_type: mediaType
        },
        mediaFile
      );
      
      // Reset form
      resetForm();
      
      // Close dialog and notify parent
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating broadcast:', error);
      toast.error('Failed to create broadcast campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCampaignName('');
    setSelectedTemplate('');
    setSelectedAudience('');
    setMessageContent('');
    setSelectedDevice('');
    setSchedulingOption('now');
    setScheduledDate(undefined);
    setScheduledTime('12:00');
    setMediaFile(null);
    setMediaType(null);
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

  const handleAudienceUploadComplete = (contacts: any[]) => {
    // In a real application, you would save these contacts to the database
    // and create a new audience with them
    const audienceName = `Imported Audience (${contacts.length} contacts)`;
    
    toast.success(`Created new audience: ${audienceName}`);
    setSelectedAudience('imported-audience');
    setShowAudienceUploader(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Broadcast Campaign</DialogTitle>
          <DialogDescription>
            Set up your campaign details, select a template or create a custom message.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="e.g., Summer Promotion 2023"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          
          <div>
            <Label className="mb-2 block">Message Content</Label>
            <Tabs defaultValue="template">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">Use Template</TabsTrigger>
                <TabsTrigger value="custom">Custom Message</TabsTrigger>
              </TabsList>
              
              <TabsContent value="template" className="space-y-4 py-4">
                <Select 
                  value={selectedTemplate} 
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedTemplate && templates.find(t => t.id === selectedTemplate) && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">
                      {templates.find(t => t.id === selectedTemplate)?.content}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4 py-4">
                <Textarea
                  placeholder="Type your message here..."
                  className="min-h-[120px]"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
                
                <div className="space-y-4">
                  {mediaFile ? (
                    <FilePreview
                      file={mediaFile}
                      onClear={clearMediaFile}
                      type={mediaType || undefined}
                    />
                  ) : (
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
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="audience">Audience</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAudienceUploader(true)}
              >
                Create New
              </Button>
            </div>
            
            {showAudienceUploader ? (
              <div className="mt-4 border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Upload New Audience</h3>
                <AudienceUploader onUploadComplete={handleAudienceUploadComplete} />
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAudienceUploader(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Select
                value={selectedAudience}
                onValueChange={setSelectedAudience}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-customers">All Customers (2,548)</SelectItem>
                  <SelectItem value="new-customers">New Customers (489)</SelectItem>
                  <SelectItem value="premium">Premium Members (356)</SelectItem>
                  <SelectItem value="inactive">Inactive Users (712)</SelectItem>
                  {selectedAudience === 'imported-audience' && (
                    <SelectItem value="imported-audience">Imported Audience</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp-account">Send From</Label>
            <Select
              value={selectedDevice}
              onValueChange={setSelectedDevice}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select WhatsApp account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business-1">Business Account 1 (+1 555-123-4567)</SelectItem>
                <SelectItem value="marketing">Marketing Account (+1 555-987-6543)</SelectItem>
                <SelectItem value="support">Support Account (+1 555-456-7890)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <div className="space-y-3">
              <Select
                value={schedulingOption}
                onValueChange={(value) => setSchedulingOption(value as 'now' | 'later')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="When to send" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Send immediately</SelectItem>
                  <SelectItem value="later">Schedule for later</SelectItem>
                </SelectContent>
              </Select>
              
              {schedulingOption === 'later' && (
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </div>
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
            onClick={handleCreateCampaign}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
