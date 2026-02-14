'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMobile } from '@/hooks/useMobile';

export function MobileRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useMobile();

  useEffect(() => {
    // Only redirect on the login page
    if (pathname === '/login' && isMobile) {
      // Check if we're already on the mobile login page
      if (!pathname.includes('mobile')) {
        // Redirect to mobile login page
        router.push('/login/mobile');
      }
    }
  }, [pathname, isMobile, router]);

  return null; // This component doesn't render anything
}

