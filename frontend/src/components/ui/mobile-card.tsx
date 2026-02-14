'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

export interface MobileCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  interactive?: boolean;
  loading?: boolean;
}

const MobileCard = forwardRef<HTMLDivElement, MobileCardProps>(
  ({ 
    className, 
    variant = 'default', 
    interactive = false,
    loading = false,
    children,
    ...props 
  }, ref) => {
    const { isMobile, isIOS, isAndroid } = useMobile();

    const baseClasses = cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      // Mobile-specific styles
      isMobile && "mobile-card",
      // Platform-specific styles
      isIOS && "appearance-none",
      isAndroid && "appearance-none",
      // Variant styles
      variant === 'default' && "border-border",
      variant === 'outlined' && "border-2 border-border bg-transparent",
      variant === 'elevated' && "shadow-lg border-transparent",
      variant === 'flat' && "border-transparent shadow-none",
      // Interactive styles
      interactive && "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]",
      // Loading state
      loading && "opacity-75 pointer-events-none",
      className
    );

    return (
      <div
        className={baseClasses}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileCard.displayName = "MobileCard";

export interface MobileCardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const MobileCardHeader = forwardRef<HTMLDivElement, MobileCardHeaderProps>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobile();

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5 p-6",
          isMobile && "p-4",
          className
        )}
        {...props}
      />
    );
  }
);

MobileCardHeader.displayName = "MobileCardHeader";

export interface MobileCardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const MobileCardTitle = forwardRef<HTMLHeadingElement, MobileCardTitleProps>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobile();

    return (
      <h3
        ref={ref}
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight",
          isMobile && "text-xl",
          className
        )}
        {...props}
      />
    );
  }
);

MobileCardTitle.displayName = "MobileCardTitle";

export interface MobileCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const MobileCardDescription = forwardRef<HTMLParagraphElement, MobileCardDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobile();

    return (
      <p
        ref={ref}
        className={cn(
          "text-sm text-muted-foreground",
          isMobile && "text-xs",
          className
        )}
        {...props}
      />
    );
  }
);

MobileCardDescription.displayName = "MobileCardDescription";

export interface MobileCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const MobileCardContent = forwardRef<HTMLDivElement, MobileCardContentProps>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobile();

    return (
      <div
        ref={ref}
        className={cn(
          "p-6 pt-0",
          isMobile && "p-4 pt-0",
          className
        )}
        {...props}
      />
    );
  }
);

MobileCardContent.displayName = "MobileCardContent";

export interface MobileCardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const MobileCardFooter = forwardRef<HTMLDivElement, MobileCardFooterProps>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useMobile();

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center p-6 pt-0",
          isMobile && "p-4 pt-0",
          className
        )}
        {...props}
      />
    );
  }
);

MobileCardFooter.displayName = "MobileCardFooter";

export {
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardDescription,
  MobileCardContent,
  MobileCardFooter,
};

