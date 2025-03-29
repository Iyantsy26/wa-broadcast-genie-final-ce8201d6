
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from 'lucide-react';

interface StorageUsageProps {
  used: number;
  limit: number;
}

export const StorageUsage: React.FC<StorageUsageProps> = ({ used, limit }) => {
  const usagePercent = (used / limit) * 100;
  const isLow = usagePercent <= 50;
  const isWarning = usagePercent > 50 && usagePercent <= 75;
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md cursor-help">
          <div className="w-[120px]">
            <div className="text-xs text-muted-foreground mb-0.5 flex justify-between">
              <span>Storage</span>
              <span>{used.toFixed(1)}GB/{limit}GB</span>
            </div>
            <Progress 
              value={usagePercent} 
              className={`h-1.5 ${isLow ? 'bg-green-100' : isWarning ? 'bg-amber-100' : 'bg-red-100'}`}
              indicatorClassName={`${isLow ? 'bg-green-500' : isWarning ? 'bg-amber-500' : 'bg-red-500'}`}
            />
          </div>
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Storage Usage</h4>
          <p className="text-sm text-muted-foreground">
            You are currently using {used.toFixed(1)}GB of your {limit}GB storage limit.
            {usagePercent > 75 && " Consider upgrading your plan or cleaning up old files."}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
