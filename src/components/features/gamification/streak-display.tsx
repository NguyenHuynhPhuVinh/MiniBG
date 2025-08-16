"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  maxDisplay = 10,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-sm',
    md: 'w-6 h-6 text-base',
    lg: 'w-8 h-8 text-lg'
  };

  const displayCount = Math.min(streak, maxDisplay);
  const hasMore = streak > maxDisplay;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Fire Icons */}
      <div className="flex items-center">
        {Array.from({ length: displayCount }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center text-orange-500 dark:text-orange-400",
              sizeClasses[size]
            )}
          >
            🔥
          </div>
        ))}
      </div>
      
      {/* Streak Number */}
      <span className={cn(
        "font-bold text-orange-600 dark:text-orange-400 ml-1",
        size === 'sm' && "text-sm",
        size === 'md' && "text-base",
        size === 'lg' && "text-lg"
      )}>
        {streak}
      </span>

      {/* More indicator */}
      {hasMore && (
        <span className="text-orange-500 dark:text-orange-400 text-xs">
          +
        </span>
      )}
    </div>
  );
};

export default StreakDisplay;
