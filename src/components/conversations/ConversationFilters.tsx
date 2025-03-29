
import React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  Clock,
  SlidersHorizontal,
  User,
  X,
  Tag,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import DateRangePicker from './DateRangePicker';

interface ConversationFiltersProps {
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
  assignees: string[];
  tags: string[];
  resetAllFilters: () => void;
}

const ConversationFilters: React.FC<ConversationFiltersProps> = ({
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
  assignees,
  tags,
  resetAllFilters
}) => {
  const activeFilterCount = [
    statusFilter !== 'all',
    !!dateRange?.from,
    !!assigneeFilter,
    !!tagFilter,
  ].filter(Boolean).length;

  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex mt-3 gap-1 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <SlidersHorizontal className="h-3 w-3 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 min-w-4 px-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Conversation Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MessageSquare className="h-4 w-4 mr-2" />
                Status: {statusFilter === 'all' ? 'All' : statusFilter}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="new">
                      <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                      New
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="active">
                      <RefreshCw className="h-4 w-4 text-green-600 mr-2" />
                      Active
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="resolved">
                      <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                      Resolved
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="waiting">
                      <Clock className="h-4 w-4 text-amber-600 mr-2" />
                      Waiting
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            {setAssigneeFilter && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <User className="h-4 w-4 mr-2" />
                  Assignee: {assigneeFilter ? assigneeFilter : 'All'}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setAssigneeFilter('')}>
                      All Assignees
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {assignees.map((assignee) => (
                      <DropdownMenuItem 
                        key={assignee} 
                        onClick={() => setAssigneeFilter(assignee)}
                      >
                        {assignee}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
            
            {setTagFilter && tags.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Tag className="h-4 w-4 mr-2" />
                  Tag: {tagFilter ? tagFilter : 'All'}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTagFilter('')}>
                      All Tags
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {tags.map((tag) => (
                      <DropdownMenuItem 
                        key={tag} 
                        onClick={() => setTagFilter(tag)}
                      >
                        {tag}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
            
            {setDateRange && (
              <DropdownMenuItem>
                <div className="w-full">
                  <DateRangePicker 
                    dateRange={dateRange} 
                    onDateRangeChange={setDateRange}
                    onReset={() => setDateRange(undefined)}
                  />
                </div>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={resetAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Reset all filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant={statusFilter === 'all' ? "secondary" : "outline"} 
          size="sm" 
          className="text-xs"
          onClick={() => setStatusFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={statusFilter === 'new' ? "secondary" : "outline"}
          size="sm" 
          className="text-xs"
          onClick={() => setStatusFilter('new')}
        >
          <MessageSquare className="h-3 w-3 mr-1 text-blue-600" />
          New
        </Button>
        <Button 
          variant={statusFilter === 'active' ? "secondary" : "outline"}
          size="sm" 
          className="text-xs"
          onClick={() => setStatusFilter('active')}
        >
          <RefreshCw className="h-3 w-3 mr-1 text-green-600" />
          Active
        </Button>
        
        <Button variant="outline" size="sm" className="text-xs">
          <Badge className="h-4 w-4 px-1 text-[10px] bg-blue-500">3</Badge>
          <span className="ml-1">Unread</span>
        </Button>
      </div>
    </div>
  );
};

export default ConversationFilters;
