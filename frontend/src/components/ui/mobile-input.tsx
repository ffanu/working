'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

export interface MobileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, type, label, error, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
    const { isMobile, isIOS } = useMobile();
    const [isFocused, setIsFocused] = useState(false);

    const baseClasses = cn(
      "flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Mobile-specific styles
      isMobile && "text-base touch-manipulation",
      // iOS-specific styles
      isIOS && "appearance-none",
      // Icon positioning
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      // Focus states
      isFocused && "ring-2 ring-ring ring-offset-2",
      // Error states
      error && "border-destructive focus-visible:ring-destructive",
      className
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={baseClasses}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation p-1"
              aria-label="Toggle input action"
            >
              {rightIcon}
            </button>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = "MobileInput";

export { MobileInput };

