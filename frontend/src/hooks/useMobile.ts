import { useState, useEffect } from 'react';

interface MobileInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  hasTouch: boolean;
  hasHover: boolean;
}

export function useMobile(): MobileInfo {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    hasTouch: false,
    hasHover: false,
  });

  useEffect(() => {
    const detectMobile = () => {
      if (typeof window === 'undefined') return;

      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Detect mobile device
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // Detect specific platforms
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      
      // Detect browsers
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      
      // Get screen dimensions
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Determine orientation
      const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
      
      // Detect touch capability
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Detect hover capability
      const hasHover = window.matchMedia('(hover: hover)').matches;
      
      // Determine if it's mobile based on screen size and device detection
      const isMobile = isMobileDevice || screenWidth <= 768;

      setMobileInfo({
        isMobile,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        screenWidth,
        screenHeight,
        orientation,
        hasTouch,
        hasHover,
      });
    };

    // Initial detection
    detectMobile();

    // Listen for resize events
    window.addEventListener('resize', detectMobile);
    
    // Listen for orientation change
    window.addEventListener('orientationchange', detectMobile);

    return () => {
      window.removeEventListener('resize', detectMobile);
      window.removeEventListener('orientationchange', detectMobile);
    };
  }, []);

  return mobileInfo;
}

// Hook for mobile-specific styles
export function useMobileStyles() {
  const { isMobile, isIOS, isAndroid } = useMobile();

  const mobileStyles = {
    // Touch-friendly button styles
    button: {
      minHeight: isMobile ? '44px' : 'auto',
      minWidth: isMobile ? '44px' : 'auto',
      fontSize: isMobile ? '16px' : '14px',
      padding: isMobile ? '12px 24px' : '8px 16px',
      borderRadius: isMobile ? '8px' : '6px',
    },
    
    // Mobile-friendly input styles
    input: {
      height: isMobile ? '48px' : '40px',
      fontSize: isMobile ? '16px' : '14px', // Prevents zoom on iOS
      borderRadius: isMobile ? '8px' : '6px',
      padding: isMobile ? '12px 16px' : '8px 12px',
    },
    
    // Mobile-friendly card styles
    card: {
      margin: isMobile ? '8px' : '16px',
      borderRadius: isMobile ? '12px' : '8px',
      padding: isMobile ? '16px' : '24px',
    },
    
    // Mobile-friendly spacing
    spacing: {
      gap: isMobile ? '16px' : '24px',
      margin: isMobile ? '8px' : '16px',
      padding: isMobile ? '16px' : '24px',
    },
    
    // Platform-specific styles
    platform: {
      ios: isIOS ? {
        // iOS-specific styles
        appearance: 'none',
        webkitAppearance: 'none',
      } : {},
      android: isAndroid ? {
        // Android-specific styles
        appearance: 'none',
      } : {},
    },
  };

  return mobileStyles;
}

// Hook for mobile gestures
export function useMobileGestures() {
  const { hasTouch } = useMobile();

  const gestures = {
    // Touch-friendly event handlers
    touchHandlers: hasTouch ? {
      onTouchStart: (e: React.TouchEvent) => {
        // Add touch feedback
        const target = e.currentTarget as HTMLElement;
        target.style.transform = 'scale(0.98)';
      },
      onTouchEnd: (e: React.TouchEvent) => {
        // Remove touch feedback
        const target = e.currentTarget as HTMLElement;
        target.style.transform = 'scale(1)';
      },
      onTouchCancel: (e: React.TouchEvent) => {
        // Handle touch cancel
        const target = e.currentTarget as HTMLElement;
        target.style.transform = 'scale(1)';
      },
    } : {},
    
    // Swipe detection
    swipeThreshold: 50,
    swipeVelocity: 0.3,
  };

  return gestures;
}

