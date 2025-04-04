
import React from 'react';

const AIResponseLoader: React.FC = () => {
  return (
    <div className="mt-2 p-2 bg-gray-100 rounded-md">
      <div className="flex items-center gap-2">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-gray-300 rounded"></div>
            <div className="h-2 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">AI is writing...</span>
      </div>
    </div>
  );
};

export default AIResponseLoader;
