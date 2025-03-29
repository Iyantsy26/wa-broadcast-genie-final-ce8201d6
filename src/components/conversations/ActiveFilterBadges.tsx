
import React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

interface ActiveFilterBadgesProps {
  statusFilter: string;
  dateRange?: DateRange;
  assigneeFilter?: string;
  tagFilter?: string;
  setStatusFilter: (status: string) => void;
  setDateRange?: (range: DateRange | undefined) => void;
  setAssigneeFilter?: (assignee: string) => void;
  setTagFilter?: (tag: string) => void;
}

const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({
  statusFilter,
  dateRange,
  assigneeFilter,
  tagFilter,
  setStatusFilter,
  setDateRange,
  setAssigneeFilter,
  setTagFilter
}) => {
  const activeFilterCount = [
    statusFilter !== 'all',
    !!dateRange?.from,
    !!assigneeFilter,
    !!tagFilter,
  ].filter(Boolean).length;

  if (activeFilterCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {statusFilter !== 'all' && (
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          Status: {statusFilter}
          <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
        </Badge>
      )}
      
      {dateRange?.from && (
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          Date: {format(dateRange.from, "MMM d")} 
          {dateRange.to && ` - ${format(dateRange.to, "MMM d")}`}
          <X className="h-3 w-3 cursor-pointer" onClick={() => setDateRange && setDateRange(undefined)} />
        </Badge>
      )}
      
      {assigneeFilter && (
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          Assignee: {assigneeFilter}
          <X className="h-3 w-3 cursor-pointer" onClick={() => setAssigneeFilter && setAssigneeFilter('')} />
        </Badge>
      )}
      
      {tagFilter && (
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          Tag: {tagFilter}
          <X className="h-3 w-3 cursor-pointer" onClick={() => setTagFilter && setTagFilter('')} />
        </Badge>
      )}
    </div>
  );
};

export default ActiveFilterBadges;
