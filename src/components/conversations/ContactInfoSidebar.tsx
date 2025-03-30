
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Conversation } from '@/types/conversation';

interface ContactInfoSidebarProps {
  conversation: Conversation;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose: () => void;
}

const ContactInfoSidebar: React.FC<ContactInfoSidebarProps> = ({
  conversation,
  isOpen = true,
  onOpenChange,
  onClose
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'text-blue-600 bg-blue-50';
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'resolved':
        return 'text-purple-600 bg-purple-50';
      case 'waiting':
        return 'text-amber-600 bg-amber-50';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <div className="h-4 w-4 text-blue-600" />;
      case 'active':
        return <div className="h-4 w-4 text-green-600" />;
      case 'resolved':
        return <div className="h-4 w-4 text-purple-600" />;
      case 'waiting':
        return <div className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => {
      if (onOpenChange) onOpenChange(open);
      if (!open) onClose();
    }}>
      <SheetContent>
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Contact Information</SheetTitle>
          <SheetDescription>
            View and manage customer details
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col items-center mb-4">
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={conversation.contact.avatar} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {conversation.contact.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-medium">{conversation.contact.name}</h3>
          <p className="text-muted-foreground">{conversation.contact.phone}</p>
          <div className="flex mt-2 gap-2">
            <Button variant="outline" size="sm">Edit Contact</Button>
            <Button variant="outline" size="sm">View Profile</Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Assigned To</h4>
            <div className="flex items-center gap-2">
              {conversation.assignedTo ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {conversation.assignedTo.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>{conversation.assignedTo}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
              <Button variant="ghost" size="sm">Change</Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Status</h4>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
              {getStatusIcon(conversation.status)}
              <span className="ml-1 capitalize">{conversation.status}</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {conversation.tags && conversation.tags.length > 0 ? (
                conversation.tags.map((tag, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">No tags</span>
              )}
              <Button variant="ghost" size="sm" className="ml-1 h-5 px-1">+</Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="space-y-4 py-4">
            <Textarea
              placeholder="Add a note about this contact..."
              className="min-h-[100px]"
            />
            <Button size="sm">Save Note</Button>
            
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-sm">Customer prefers afternoon appointments.</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    Added by Maria Lopez
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Jun 20, 2023
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="py-4">
            <div className="space-y-3">
              <div className="border-l-2 border-primary pl-3 py-1">
                <p className="text-sm">Conversation marked as active</p>
                <p className="text-xs text-muted-foreground">
                  Jun 23, 2023 at 10:15 AM
                </p>
              </div>
              <div className="border-l-2 border-gray-200 pl-3 py-1">
                <p className="text-sm">Assigned to Maria Lopez</p>
                <p className="text-xs text-muted-foreground">
                  Jun 23, 2023 at 09:30 AM
                </p>
              </div>
              <div className="border-l-2 border-gray-200 pl-3 py-1">
                <p className="text-sm">Conversation started</p>
                <p className="text-xs text-muted-foreground">
                  Jun 23, 2023 at 09:30 AM
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="py-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">sarah.johnson@example.com</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Added On</p>
                  <p className="text-sm">Jun 15, 2023</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Contacted</p>
                  <p className="text-sm">Jun 23, 2023</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm">Website</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ContactInfoSidebar;
