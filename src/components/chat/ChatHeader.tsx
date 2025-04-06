
import React from 'react';
import { Conversation } from '@/types/conversation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  MoreHorizontal,
  Smartphone,
  Archive,
  Bot,
  Tag,
  UserPlus,
  Trash2,
  Phone,
  Video,
  Lock,
  AlertCircle
} from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
  onOpenContactInfo: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onOpenContactInfo
}) => {
  const getLastSeenText = () => {
    if (conversation.contact.isOnline) {
      return <span className="text-green-500">Online</span>;
    } else if (conversation.contact.lastSeen) {
      return <>Last seen at {new Date(conversation.contact.lastSeen).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</>;
    }
    return null;
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'team': return 'Team';
      case 'client': return 'Client';
      case 'lead': return 'Lead';
      default: return '';
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
  
  return (
    <div className="p-3 border-b flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.contact.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {conversation.contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium flex items-center gap-2">
            {conversation.contact.name}
            {conversation.contact.isOnline && (
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
            )}
            <Badge className={getTypeClass(conversation.chatType)} variant="secondary">
              {getTypeLabel(conversation.chatType)}
            </Badge>
            {conversation.contact.role && (
              <Badge variant="outline">{conversation.contact.role}</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {conversation.contact.phone}
            </div>
            
            {getLastSeenText() && (
              <div className="flex items-center gap-1">
                {getLastSeenText()}
              </div>
            )}
            
            {conversation.isEncrypted && (
              <div className="flex items-center gap-1 text-green-600">
                <Lock className="h-3 w-3" />
                Encrypted
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {conversation.chatType === 'client' && (
          <>
            <Button variant="ghost" size="icon" title="Voice call">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Video call">
              <Video className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <Button variant="ghost" size="icon" onClick={onOpenContactInfo} title="Contact info">
          <User className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Archive className="mr-2 h-4 w-4" />
              Archive conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bot className="mr-2 h-4 w-4" />
              Transfer to bot
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Tag className="mr-2 h-4 w-4" />
              Manage tags
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign to team member
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlertCircle className="mr-2 h-4 w-4" />
              Mark as {conversation.status === 'resolved' ? 'unresolved' : 'resolved'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;
