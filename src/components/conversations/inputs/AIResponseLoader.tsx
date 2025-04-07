
import React from 'react';

const AIResponseLoader: React.FC = () => {
  return (
    <div className="p-2 text-center">
      <div className="flex items-center justify-center gap-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">AI writing response...</p>
    </div>
  );
};

export default AIResponseLoader;
