
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
  RefreshCw,
  SlidersHorizontal,
  User,
  X,
  Tag,
  Users,
  UserRound,
  Building2,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import DateRangePicker from './DateRangePicker';
import { ChatType } from '@/types/conversation';

interface ConversationFiltersProps {
  chatTypeFilter: ChatType | 'all';
  setChatTypeFilter: (type: ChatType | 'all') => void;
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
  chatTypeFilter,
  setChatTypeFilter,
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
    chatTypeFilter !== 'all',
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
                <User className="h-4 w-4 mr-2" />
                Contact Type: {chatTypeFilter === 'all' ? 'All' : chatTypeFilter}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={chatTypeFilter} onValueChange={(value) => setChatTypeFilter(value as ChatType | 'all')}>
                    <DropdownMenuRadioItem value="all">All Contacts</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="client">
                      <Building2 className="h-4 w-4 text-emerald-600 mr-2" />
                      Clients
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="lead">
                      <UserRound className="h-4 w-4 text-amber-600 mr-2" />
                      Leads
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="team">
                      <Users className="h-4 w-4 text-indigo-600 mr-2" />
                      Team
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
          variant={chatTypeFilter === 'all' ? "secondary" : "outline"} 
          size="sm" 
          className="text-xs"
          onClick={() => setChatTypeFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={chatTypeFilter === 'client' ? "secondary" : "outline"}
          size="sm" 
          className="text-xs"
          onClick={() => setChatTypeFilter('client')}
        >
          <Building2 className="h-3 w-3 mr-1 text-emerald-600" />
          Clients
        </Button>
        <Button 
          variant={chatTypeFilter === 'lead' ? "secondary" : "outline"}
          size="sm" 
          className="text-xs"
          onClick={() => setChatTypeFilter('lead')}
        >
          <UserRound className="h-3 w-3 mr-1 text-amber-600" />
          Leads
        </Button>
        <Button 
          variant={chatTypeFilter === 'team' ? "secondary" : "outline"}
          size="sm" 
          className="text-xs"
          onClick={() => setChatTypeFilter('team')}
        >
          <Users className="h-3 w-3 mr-1 text-indigo-600" />
          Team
        </Button>
      </div>
    </div>
  );
};

export default ConversationFilters;
