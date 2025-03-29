import React, { useState } from 'react';
import { Conversation } from '@/types/conversation';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  X,
  Clock,
  PinIcon,
  User,
  Tag,
  MoreVertical,
  Archive,
  Pin,
  UserPlus,
  Trash2,
} from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
  assigneeFilter?: string;
  setAssigneeFilter?: (assignee: string) => void;
  tagFilter?: string;
  setTagFilter?: (tag: string) => void;
  resetAllFilters: () => void;
  pinConversation: (conversationId: string, isPinned: boolean) => void;
  archiveConversation: (conversationId: string, isArchived: boolean) => void;
}

interface FilteredTagsResult {
  displayTags: string[];
  remaining: number;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  setActiveConversation,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  assigneeFilter,
  setAssigneeFilter,
  tagFilter,
  setTagFilter,
  resetAllFilters,
  pinConversation,
  archiveConversation
}) => {
  const [showArchived, setShowArchived] = useState(false);
  
  const assignees = Array.from(new Set(conversations.filter(c => c.assignedTo).map(c => c.assignedTo as string)));
  const tags = Array.from(new Set(conversations.flatMap(c => c.tags || [])));
  
  const visibleConversations = showArchived 
    ? conversations.filter(c => c.isArchived) 
    : conversations.filter(c => !c.isArchived);
  
  const getFilteredTags = (conversation: Conversation): FilteredTagsResult => {
    if (!conversation.tags) return { displayTags: [], remaining: 0 };
    
    // Show max 2 tags to keep the UI clean
    const displayTags = conversation.tags.slice(0, 2);
    const remaining = conversation.tags.length > 2 ? conversation.tags.length - 2 : 0;
    
    return { displayTags, remaining };
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-amber-500';
      case 'resolved': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
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
      case 'team': return 'bg-indigo-100 text-indigo-700';
      case 'client': return 'bg-emerald-100 text-emerald-700';
      case 'lead': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const hasActiveFilters = 
    statusFilter !== 'all' || 
    searchTerm !== '' || 
    dateRange !== undefined || 
    assigneeFilter !== '' || 
    tagFilter !== '';

  return (
    <div className="w-80 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Search and filter bar */}
      <div className="p-3 border-b">
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations"
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute right-2.5 top-2.5"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={hasActiveFilters ? "default" : "outline"} size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={statusFilter === 'all' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                      className="h-8"
                    >
                      All
                    </Button>
                    <Button 
                      variant={statusFilter === 'new' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatusFilter('new')}
                      className="h-8"
                    >
                      New
                    </Button>
                    <Button 
                      variant={statusFilter === 'active' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatusFilter('active')}
                      className="h-8"
                    >
                      Active
                    </Button>
                    <Button 
                      variant={statusFilter === 'waiting' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatusFilter('waiting')}
                      className="h-8"
                    >
                      Waiting
                    </Button>
                    <Button 
                      variant={statusFilter === 'resolved' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatusFilter('resolved')}
                      className="h-8"
                    >
                      Resolved
                    </Button>
                  </div>
                </div>
                
                {setDateRange && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Date</h4>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      className="border rounded-md p-3"
                    />
                  </div>
                )}
                
                {setAssigneeFilter && assignees.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Assigned to</h4>
                    <div className="flex flex-wrap gap-2">
                      {assigneeFilter && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAssigneeFilter('')}
                          className="h-8"
                        >
                          Clear
                        </Button>
                      )}
                      {assignees.map((assignee) => (
                        <Button 
                          key={assignee}
                          variant={assigneeFilter === assignee ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setAssigneeFilter(assignee)}
                          className="h-8"
                        >
                          {assignee}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {setTagFilter && tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {tagFilter && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setTagFilter('')}
                          className="h-8"
                        >
                          Clear
                        </Button>
                      )}
                      {tags.map((tag) => (
                        <Button 
                          key={tag}
                          variant={tagFilter === tag ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setTagFilter(tag)}
                          className="h-8"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetAllFilters}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            {visibleConversations.length} conversation{visibleConversations.length !== 1 ? 's' : ''}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
        </div>
      </div>
      
      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="p-2 bg-muted/40 flex flex-wrap gap-2">
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1 h-6">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('all')}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {dateRange?.from && (
            <Badge variant="secondary" className="flex items-center gap-1 h-6">
              <Clock className="h-3 w-3 mr-1" />
              {format(dateRange.from, 'MMM d, y')}
              {dateRange.to && ` - ${format(dateRange.to, 'MMM d, y')}`}
              <button onClick={() => setDateRange && setDateRange(undefined)}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {assigneeFilter && (
            <Badge variant="secondary" className="flex items-center gap-1 h-6">
              <User className="h-3 w-3 mr-1" />
              {assigneeFilter}
              <button onClick={() => setAssigneeFilter && setAssigneeFilter('')}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {tagFilter && (
            <Badge variant="secondary" className="flex items-center gap-1 h-6">
              <Tag className="h-3 w-3 mr-1" />
              {tagFilter}
              <button onClick={() => setTagFilter && setTagFilter('')}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
        </div>
      )}
      
      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {visibleConversations.length > 0 ? (
            visibleConversations.map((conversation) => {
              const { displayTags, remaining } = getFilteredTags(conversation);
              const isActive = activeConversation?.id === conversation.id;
              
              // Format timestamp
              const timestamp = new Date(conversation.lastMessage.timestamp);
              const now = new Date();
              const isToday = timestamp.toDateString() === now.toDateString();
              const displayTime = isToday 
                ? format(timestamp, 'h:mm a') 
                : format(timestamp, 'MMM d');
                
              return (
                <div
                  key={conversation.id}
                  className={`relative p-3 hover:bg-muted/50 cursor-pointer
                    ${isActive ? 'bg-muted' : ''}
                    ${conversation.unreadCount ? 'bg-blue-50/50' : ''}
                  `}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={conversation.contact.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conversation.contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="overflow-hidden">
                        <div className="font-medium truncate flex items-center gap-1.5">
                          {conversation.contact.name}
                          {conversation.contact.isOnline && (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0"></span>
                          )}
                          {conversation.isPinned && (
                            <PinIcon className="h-3 w-3 text-amber-500 -rotate-45 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <Badge variant="outline" className={`px-1 py-0 h-4 text-[10px] ${getTypeClass(conversation.chatType)}`}>
                            {getTypeLabel(conversation.chatType)}
                          </Badge>
                          {conversation.contact.phone}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="text-right">{displayTime}</div>
                      <div className="flex items-center justify-end gap-1 mt-0.5 h-4">
                        {conversation.status && (
                          <span className={`h-2 w-2 rounded-full ${getStatusClass(conversation.status)}`} 
                            title={`Status: ${conversation.status}`}
                          />
                        )}
                        
                        {conversation.unreadCount ? (
                          <span className="h-4 w-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-white font-medium">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        ) : (
                          conversation.lastMessage.isOutbound && (
                            <span className="text-xs text-primary">
                              {conversation.lastMessage.isRead ? 'Read' : 'Sent'}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-12 -mt-1">
                    <div className="text-xs truncate text-muted-foreground">
                      {conversation.lastMessage.isOutbound && 'You: '}{conversation.lastMessage.content}
                    </div>
                    
                    {(displayTags.length > 0 || conversation.assignedTo) && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {displayTags.map(tag => (
                          <Badge key={tag} variant="outline" className="px-1 py-0 h-4 text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                        
                        {remaining > 0 && (
                          <Badge variant="outline" className="px-1 py-0 h-4 text-[10px]">
                            +{remaining} more
                          </Badge>
                        )}
                        
                        {conversation.assignedTo && (
                          <Badge variant="secondary" className="px-1 py-0 h-4 text-[10px] ml-auto">
                            Assigned: {conversation.assignedTo}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Conversation actions menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 absolute top-2 right-2 opacity-0 hover:opacity-100 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        pinConversation(conversation.id, !conversation.isPinned);
                      }}>
                        <Pin className="mr-2 h-4 w-4" />
                        {conversation.isPinned ? 'Unpin conversation' : 'Pin conversation'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        archiveConversation(conversation.id, !conversation.isArchived);
                      }}>
                        <Archive className="mr-2 h-4 w-4" />
                        {conversation.isArchived ? 'Unarchive conversation' : 'Archive conversation'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign to team member
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <div className="mb-3 mx-auto bg-muted h-12 w-12 rounded-full flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No conversations found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {showArchived 
                  ? "You don't have any archived conversations" 
                  : "We couldn't find any conversations matching your filters"}
              </p>
              {hasActiveFilters && (
                <Button onClick={resetAllFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
