
import React from 'react';

export const PageHeader = ({ title, children }) => {
  return (
    <header className="w-full flex-shrink-0 sticky top-14 md:top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          {title}
        </h1>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </header>
  );
};
