// lib/hooks/useProtectedRoute.js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { storage } from '@/lib/storage';

export const useProtectedRoute = (requiredRole = null) => {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const hasInitialized = useRef(false);

  // First effect: Restore auth state from storage on mount ONLY
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkAuth();
    }
  }, []); // Empty dependency array - run once on mount

  // Second effect: Check access and redirect when user state changes
  useEffect(() => {
    const checkAccess = () => {
      const token = storage.getToken();
      const storedUserData = storage.getUserData();

      console.log('useProtectedRoute - Checking access...');
      console.log('Token:', !!token);
      console.log('Stored User:', storedUserData);
      console.log('Store User:', user);
      console.log('Required Role:', requiredRole);

      // If no token, redirect to login
      if (!token) {
        console.log('No token, redirecting to login');
        router.push('/login');
        setIsChecking(false);
        return;
      }

      // If no user data yet, wait (don't redirect)
      const currentUser = user || storedUserData;
      if (!currentUser) {
        console.log('No user data yet, waiting...');
        // Don't set isChecking false, wait for user data
        return;
      }

      console.log('Current User Role:', currentUser.role);

      // Check role if required
      if (requiredRole && currentUser?.role !== requiredRole) {
        console.log('Role mismatch, redirecting...');
        const roleRoutes = {
          admin: '/dashboard/admin',
          creator: '/dashboard/creator',
          brand: '/dashboard/brand',
        };
        const redirectPath = roleRoutes[currentUser?.role] || '/';
        console.log('Redirecting to:', redirectPath);
        router.push(redirectPath);
        setIsChecking(false);
        return;
      }

      console.log('Access granted');
      setIsChecking(false);
    };

    checkAccess();
  }, [user, requiredRole, router]); // Added router dependency

  return { isAuthenticated, user, isChecking };
};