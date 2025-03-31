
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface DeviceUsageCardProps {
  userPlan: 'starter' | 'professional' | 'enterprise';
  accountLimit: {
    canAdd: boolean;
    currentCount: number;
    limit: number;
  };
  planFeatures: {
    [key: string]: {
      name: string;
      devices: number;
      color: string;
    };
  };
}

const DeviceUsageCard = ({ userPlan, accountLimit, planFeatures }: DeviceUsageCardProps) => {
  const getPlanProgressColor = () => {
    const percentage = (accountLimit.currentCount / accountLimit.limit) * 100;
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Device Usage</CardTitle>
        <CardDescription>
          Your current plan: <span className="font-medium">{planFeatures[userPlan].name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Devices used: {accountLimit.currentCount} of {accountLimit.limit}</span>
              <span className="text-sm">{Math.round((accountLimit.currentCount / accountLimit.limit) * 100)}%</span>
            </div>
            <Progress value={(accountLimit.currentCount / accountLimit.limit) * 100} className={`h-2 ${getPlanProgressColor()}`} />
          </div>
          
          {accountLimit.currentCount >= accountLimit.limit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Plan Limit Reached</AlertTitle>
              <AlertDescription>
                You've reached the maximum number of devices for your current plan.
                Upgrade to add more devices.
              </AlertDescription>
            </Alert>
          )}
          
          {accountLimit.currentCount >= accountLimit.limit * 0.8 && accountLimit.currentCount < accountLimit.limit && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're approaching your plan limit. Consider upgrading soon to add more devices.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceUsageCard;
