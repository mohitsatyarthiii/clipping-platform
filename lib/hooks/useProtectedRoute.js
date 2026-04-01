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

      // If no token, redirect to login
      if (!token) {
        router.push('/login');
        setIsChecking(false);
        return;
      }

      // If no user data in store and no stored data, still checking
      if (!storedUserData && !user) {
        return;
      }

      // Use either store user or stored user data
      const currentUser = user || storedUserData;

      // Check role if required
      if (requiredRole && currentUser?.role !== requiredRole) {
        const roleRoutes = {
          admin: '/dashboard/admin',
          creator: '/dashboard/creator',
          brand: '/dashboard/brand',
        };
        router.push(roleRoutes[currentUser?.role] || '/');
        return;
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [user, requiredRole]); // Only depend on user and requiredRole, NOT router

  return { isAuthenticated, user, isChecking };
};
