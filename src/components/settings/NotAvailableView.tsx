
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Lock } from "lucide-react";

interface NotAvailableViewProps {
  title: string;
  message: string;
  requiredRole: string;
}

const NotAvailableView: React.FC<NotAvailableViewProps> = ({ title, message, requiredRole }) => {
  return (
    <Card className="w-full py-12">
      <CardContent className="flex flex-col items-center justify-center text-center p-6">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          {requiredRole === 'super_admin' ? (
            <ShieldAlert className="h-6 w-6 text-muted-foreground" />
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-md">
          {message}
        </p>
      </CardContent>
    </Card>
  );
};

export default NotAvailableView;
