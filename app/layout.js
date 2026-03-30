'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Toaster } from 'sonner';
import '@/app/globals.css';


function RootLayout({ children }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount, not on every render
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkAuth();
    }
  }, []); // Empty dependency array - run once on mount

  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white overflow-x-hidden">
        <Toaster position="top-right" theme="dark" />
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
