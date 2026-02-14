'use client';

import { useEffect } from 'react';
import Head from 'next/head';

export function MobileDetection() {
  useEffect(() => {
    // Add mobile-specific meta tags dynamically
    const addMobileMetaTags = () => {
      // Check if meta tags already exist
      if (document.querySelector('meta[name="mobile-web-app-capable"]')) {
        return;
      }

      // Add mobile-specific meta tags
      const metaTags = [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'InventoryApp' },
        { name: 'msapplication-TileColor', content: '#3b82f6' },
        { name: 'theme-color', content: '#3b82f6' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover' }
      ];

      metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      });

      // Add mobile-specific CSS
      const mobileCSS = `
        @media (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
        @supports (-webkit-touch-callout: none) {
          input, select, textarea {
            -webkit-appearance: none;
            border-radius: 8px;
          }
        }
      `;

      if (!document.querySelector('#mobile-css')) {
        const style = document.createElement('style');
        style.id = 'mobile-css';
        style.textContent = mobileCSS;
        document.head.appendChild(style);
      }
    };

    // Add mobile-specific event listeners
    const addMobileEventListeners = () => {
      // Prevent zoom on double tap
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      // Handle orientation change
      const handleOrientationChange = () => {
        // Add a small delay to ensure proper rendering
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      };

      window.addEventListener('orientationchange', handleOrientationChange);

      // Handle viewport resize
      const handleResize = () => {
        // Ensure proper mobile layout
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const scale = Math.min(width / 375, height / 667, 1);
          viewport.setAttribute('content', `width=device-width, initial-scale=${scale}, maximum-scale=5, user-scalable=yes, viewport-fit=cover`);
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize(); // Initial call

      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleResize);
      };
    };

    // Initialize mobile features
    addMobileMetaTags();
    const cleanup = addMobileEventListeners();

    return cleanup;
  }, []);

  return (
    <Head>
      {/* Mobile-specific meta tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="InventoryApp" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
    </Head>
  );
}

