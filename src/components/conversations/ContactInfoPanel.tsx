import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Phone,
  Video,
  Star,
  Bell,
  BellOff,
  Trash,
  Image as ImageIcon,
  FileText,
  Film
} from 'lucide-react';
import { Contact } from '@/types/conversation';
import { useConversation } from '@/contexts/ConversationContext';
import { format } from 'date-fns';

interface ContactInfoPanelProps {
  contact: Contact;
  onChangeWallpaper?: (wallpaperUrl: string | null) => void;
  onToggleStar?: () => void;
  onToggleMute?: (isMuted: boolean) => void;
  onClearChat?: () => void;
  onToggleDisappearing?: (enabled: boolean) => void;
  onSetDisappearingTimeout?: (hours: number) => void;
}

const ContactInfoPanel: React.FC<ContactInfoPanelProps> = ({
  contact,
  onChangeWallpaper,
  onToggleStar,
  onToggleMute,
  onClearChat,
  onToggleDisappearing,
  onSetDisappearingTimeout
}) => {
  const {
    messages,
    toggleSidebar,
    toggleContactStar,
    muteContact,
    clearChat
  } = useConversation();
  
  const contactMessages = messages[contact.id] || [];
  
  const mediaCount = {
    images: contactMessages.filter(m => m.type === 'image').length,
    documents: contactMessages.filter(m => m.type === 'document').length,
    videos: contactMessages.filter(m => m.type === 'video').length
  };
  
  const getTypeColor = () => {
    switch (contact.type) {
      case 'team':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'client':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lead':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const handleToggleStar = () => {
    if (onToggleStar) {
      onToggleStar();
    } else {
      toggleContactStar(contact.id);
    }
  };
  
  const handleToggleMute = (muted: boolean) => {
    if (onToggleMute) {
      onToggleMute(muted);
    } else {
      muteContact(contact.id, muted);
    }
  };
  
  const handleClearChat = () => {
    if (onClearChat) {
      onClearChat();
    } else {
      clearChat(contact.id);
    }
  };
  
  return (
    <div className="w-72 flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-semibold">Contact Info</h3>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback className="text-lg">
                {contact.name.split(' ')
                  .map(n => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="font-semibold text-lg">{contact.name}</h3>
            
            <div className="text-sm text-muted-foreground mb-2">
              {contact.phone}
            </div>
            
            <div className="flex items-center mb-3">
              <Badge className={`${getTypeColor()} text-xs`}>
                {contact.type === 'team' ? 'Team Member' : 
                 contact.type === 'client' ? 'Client' : 'Lead'}
              </Badge>
              {contact.isOnline && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
                  Online
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {contact.type !== 'team' && (
                <>
                  <Button variant="outline" size="icon" title="Call">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Video call">
                    <Video className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button 
                variant={contact.isStarred ? "default" : "outline"}
                size="icon" 
                title={contact.isStarred ? "Remove from starred" : "Add to starred"}
                onClick={handleToggleStar}
              >
                <Star className={`h-4 w-4 ${contact.isStarred ? 'fill-primary-foreground' : ''}`} />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                title={contact.isMuted ? "Unmute notifications" : "Mute notifications"}
                onClick={() => handleToggleMute(!contact.isMuted)}
              >
                {contact.isMuted ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3">Media & Files</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="flex flex-col h-16 items-center justify-center">
                <ImageIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">{mediaCount.images}</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-16 items-center justify-center">
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-xs">{mediaCount.documents}</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-16 items-center justify-center">
                <Film className="h-5 w-5 mb-1" />
                <span className="text-xs">{mediaCount.videos}</span>
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {contact.role && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Role</h4>
              <p className="text-sm text-muted-foreground">{contact.role}</p>
            </div>
          )}
          
          {contact.lastSeen && !contact.isOnline && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Last seen</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(contact.lastSeen), 'PPp')}
              </p>
            </div>
          )}
          
          {contact.tags && contact.tags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          <div>
            <h4 className="text-sm font-medium text-destructive mb-3">Danger Zone</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
                onClick={handleClearChat}
              >
                <Trash className="h-4 w-4 mr-2" />
                Clear conversation
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContactInfoPanel;
