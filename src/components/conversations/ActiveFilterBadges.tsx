
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { X, Calendar, User, Tag, Building2, UserRound, Users } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { ChatType } from '@/types/conversation';

interface ActiveFilterBadgesProps {
  chatTypeFilter: ChatType | 'all';
  dateRange?: DateRange;
  assigneeFilter?: string;
  tagFilter?: string;
  setChatTypeFilter: (type: ChatType | 'all') => void;
  setDateRange?: (range: DateRange | undefined) => void;
  setAssigneeFilter?: (assignee: string) => void;
  setTagFilter?: (tag: string) => void;
}

const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({
  chatTypeFilter,
  dateRange,
  assigneeFilter,
  tagFilter,
  setChatTypeFilter,
  setDateRange,
  setAssigneeFilter,
  setTagFilter
}) => {
  const hasActiveFilters = 
    chatTypeFilter !== 'all' ||
    dateRange?.from !== undefined ||
    assigneeFilter !== '' ||
    tagFilter !== '';

  if (!hasActiveFilters) return null;
  
  const getTypeIcon = () => {
    switch (chatTypeFilter) {
      case 'client': return <Building2 className="h-3 w-3 mr-1" />;
      case 'lead': return <UserRound className="h-3 w-3 mr-1" />;
      case 'team': return <Users className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
      {chatTypeFilter !== 'all' && (
        <Badge variant="secondary" className="flex items-center gap-1">
          {getTypeIcon()}
          {chatTypeFilter === 'client' ? 'Clients' : 
           chatTypeFilter === 'lead' ? 'Leads' : 'Team'}
          <button 
            onClick={() => setChatTypeFilter('all')} 
            className="ml-1 hover:bg-muted rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      {dateRange?.from && setDateRange && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="h-3 w-3 mr-1" />
          {format(dateRange.from, 'MMM d')}
          {dateRange.to && ` - ${format(dateRange.to, 'MMM d')}`}
          <button 
            onClick={() => setDateRange(undefined)} 
            className="ml-1 hover:bg-muted rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      {assigneeFilter && setAssigneeFilter && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <User className="h-3 w-3 mr-1" />
          {assigneeFilter}
          <button 
            onClick={() => setAssigneeFilter('')} 
            className="ml-1 hover:bg-muted rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      {tagFilter && setTagFilter && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Tag className="h-3 w-3 mr-1" />
          {tagFilter}
          <button 
            onClick={() => setTagFilter('')} 
            className="ml-1 hover:bg-muted rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
};

export default ActiveFilterBadges;
