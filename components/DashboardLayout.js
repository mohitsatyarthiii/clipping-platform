'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/lib/stores/authStore';

const DashboardLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black flex flex-col">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onToggleSidebar={toggleSidebar} 
      />
      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
