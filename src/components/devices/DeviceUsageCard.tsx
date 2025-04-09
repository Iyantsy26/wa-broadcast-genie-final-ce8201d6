
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle } from 'lucide-react';

interface DeviceUsageCardProps {
  userPlan: string;
  accountLimit: { canAdd: boolean; currentCount: number; limit: number };
  planFeatures: {
    [key: string]: {
      name: string;
      devices: number;
      color: string;
    };
  };
  onUpgrade?: () => void;
}

const DeviceUsageCard = ({ userPlan, accountLimit, planFeatures, onUpgrade }: DeviceUsageCardProps) => {
  const { currentCount, limit } = accountLimit;
  const usage = Math.min(Math.round((currentCount / limit) * 100), 100);
  const isAtLimit = currentCount >= limit;
  
  const canUpgrade = userPlan !== 'enterprise';
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">Device Usage</CardTitle>
            <CardDescription>
              Your current plan: <span className="capitalize">{planFeatures[userPlan]?.name || userPlan}</span>
            </CardDescription>
          </div>
          {canUpgrade && onUpgrade && (
            <Button variant="outline" size="sm" onClick={onUpgrade}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>{currentCount} of {limit} devices used</span>
            <span className={isAtLimit ? 'text-red-500' : ''}>{usage}%</span>
          </div>
          <Progress value={usage} className={`h-2 ${
            isAtLimit ? 'bg-red-100' : ''
          }`} />
          <div className={`text-xs ${
            isAtLimit ? 'text-red-500' : 'text-muted-foreground'
          }`}>
            {isAtLimit
              ? 'You\'ve reached your device limit. Upgrade your plan to add more devices.'
              : 'You can add more devices within your current plan.'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceUsageCard;
