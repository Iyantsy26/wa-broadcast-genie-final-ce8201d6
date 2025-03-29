
import React from 'react';
import { MessageSquare, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export const getStatusColor = (status: string): string => {
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

export const getStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'new':
      return <MessageSquare className="h-4 w-4 text-blue-600" />;
    case 'active':
      return <RefreshCw className="h-4 w-4 text-green-600" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4 text-purple-600" />;
    case 'waiting':
      return <Clock className="h-4 w-4 text-amber-600" />;
    default:
      return null;
  }
};
