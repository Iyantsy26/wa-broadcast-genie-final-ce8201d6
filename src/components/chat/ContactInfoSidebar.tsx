
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Conversation } from '@/types/conversation';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Smartphone, 
  Plus, 
  Calendar,
  Clock,
  MessageCircle,
  Image,
  FileText,
  Paperclip
} from 'lucide-react';

interface ContactInfoSidebarProps {
  conversation: Conversation;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose?: () => void;
}

const ContactInfoSidebar: React.FC<ContactInfoSidebarProps> = ({
  conversation,
  isOpen,
  onOpenChange,
  onClose
}) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'team': return 'Team Member';
      case 'client': return 'Client';
      case 'lead': return 'Lead';
      default: return 'Contact';
    }
  };
  
  const getTypeClass = (type: string) => {
    switch (type) {
      case 'team': return 'bg-indigo-100 text-indigo-800';
      case 'client': return 'bg-emerald-100 text-emerald-800';
      case 'lead': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Use conversation.contact.type instead of conversation.chatType
  const contactType = conversation.contact.type;
  
  const contactDetails = {
    email: contactType === 'team' ? 'employee@company.com' : 
           contactType === 'client' ? 'client@example.com' : 
           'lead@prospect.com',
    address: contactType === 'client' ? '123 Business St, New York, NY 10001' : null,
    company: contactType === 'client' ? 'ABC Corporation' : 
             contactType === 'lead' ? 'XYZ Prospects Inc.' : null,
    website: contactType === 'client' ? 'www.abccorp.com' : null,
    notes: contactType === 'lead' ? 'Interested in our premium service package.' : null,
    firstContact: '2023-03-15',
    totalConversations: 23,
    sharedFiles: 8,
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={open => {
      if (onOpenChange) onOpenChange(open);
      if (!open && onClose) onClose();
    }}>
      <SheetContent className="sm:max-w-sm p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Contact Information</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage src={conversation.contact.avatar} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {conversation.contact.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-semibold">{conversation.contact.name}</h3>
              
              <Badge className={`mt-1 ${getTypeClass(contactType)}`}>
                {getTypeLabel(contactType)}
              </Badge>
              
              {conversation.contact.role && (
                <Badge variant="outline" className="mt-1">
                  {conversation.contact.role}
                </Badge>
              )}
              
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
                  <Phone className="h-5 w-5" />
                </Button>
                {contactDetails.email && (
                  <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
                    <Mail className="h-5 w-5" />
                  </Button>
                )}
                {contactDetails.address && (
                  <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
                    <MapPin className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Contact Details</h4>
              
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span>{conversation.contact.phone}</span>
                </div>
              </div>
              
              {contactDetails.email && (
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contactDetails.email}</span>
                  </div>
                </div>
              )}
              
              {contactDetails.address && (
                <div>
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{contactDetails.address}</span>
                  </div>
                </div>
              )}
              
              {contactDetails.company && (
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{contactDetails.company}</span>
                  </div>
                </div>
              )}
              
              {contactDetails.website && (
                <div>
                  <Label className="text-xs text-muted-foreground">Website</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={`https://${contactDetails.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {contactDetails.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {conversation.tags && conversation.tags.length > 0 && (
              <>
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Tags</h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {conversation.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {contactDetails.notes && (
              <>
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Notes</h4>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Edit
                    </Button>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    {contactDetails.notes}
                  </div>
                </div>
              </>
            )}
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Conversation Stats</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    First Contact
                  </div>
                  <div className="font-medium">{contactDetails.firstContact}</div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    Last Activity
                  </div>
                  <div className="font-medium">Today</div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MessageCircle className="h-4 w-4" />
                    Total Conversations
                  </div>
                  <div className="font-medium">{contactDetails.totalConversations}</div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Paperclip className="h-4 w-4" />
                    Shared Files
                  </div>
                  <div className="font-medium">{contactDetails.sharedFiles}</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Shared Files</h4>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  View All
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                  <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-md shrink-0">
                    <Image className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-medium text-sm truncate">photo.jpg</div>
                    <div className="text-xs text-muted-foreground">1.2 MB • Yesterday</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                  <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-md shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-medium text-sm truncate">agreement.pdf</div>
                    <div className="text-xs text-muted-foreground">845 KB • Last week</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ContactInfoSidebar;
