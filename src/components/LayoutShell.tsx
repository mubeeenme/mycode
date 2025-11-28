'use client';

import { ReactNode } from 'react';

interface LayoutShellProps {
  children: ReactNode;
  className?: string;
}

export function LayoutShell({ children, className }: LayoutShellProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}