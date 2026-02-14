'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useMobile, useMobileGestures } from '@/hooks/useMobile';

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const { isMobile, isIOS, isAndroid } = useMobile();
    const { touchHandlers } = useMobileGestures();

    const baseClasses = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      // Mobile-specific styles
      isMobile && "touch-manipulation",
      // Platform-specific styles
      isIOS && "appearance-none",
      isAndroid && "appearance-none",
      // Variant styles
      variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
      variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      variant === 'outline' && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
      variant === 'link' && "text-primary underline-offset-4 hover:underline",
      // Size styles
      size === 'default' && "h-12 px-6 py-3 text-base",
      size === 'sm' && "h-9 rounded-md px-3",
      size === 'lg' && "h-14 rounded-md px-8 text-lg",
      size === 'icon' && "h-12 w-12",
      // Loading state
      loading && "opacity-75 cursor-not-allowed",
      className
    );

    const iconClasses = cn(
      "inline-flex items-center justify-center",
      leftIcon && "mr-2",
      rightIcon && "ml-2"
    );

    return (
      <button
        className={baseClasses}
        ref={ref}
        disabled={disabled || loading}
        {...touchHandlers}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        
        {!loading && leftIcon && (
          <span className={iconClasses}>
            {leftIcon}
          </span>
        )}
        
        {children}
        
        {!loading && rightIcon && (
          <span className={iconClasses}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

MobileButton.displayName = "MobileButton";

export { MobileButton };

