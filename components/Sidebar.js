'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  LayoutDashboard,
  FileText,
  Users,
  CheckCircle,
  LogOut,
  Settings,
  Zap,
  Award,
  Upload,
  Video,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ collapsed = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const adminMenuItems = [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    {
      section: 'Campaigns',
      items: [
        { href: '/dashboard/admin/campaigns', icon: FileText, label: 'All Campaigns' },
        { href: '/dashboard/admin/campaigns/create', icon: Upload, label: 'Create Campaign' },
      ],
    },
    {
      href: '/dashboard/admin/join-requests',
      icon: Users,
      label: 'Join Requests',
    },
    {
      href: '/dashboard/admin/submissions',
      icon: CheckCircle,
      label: 'Submissions',
    },
    { href: '/dashboard/admin/users', icon: Users, label: 'Users' },
    { href: '/dashboard/admin/earnings', icon: Award, label: 'Earnings' },
  ];

  const creatorMenuItems = [
    { href: '/dashboard/creator', icon: LayoutDashboard, label: 'Dashboard' },
    {
      section: 'Campaigns',
      items: [
        { href: '/dashboard/creator/campaigns', icon: FileText, label: 'Browse Campaigns' },
        { href: '/dashboard/creator/my-campaigns', icon: Users, label: 'My Campaigns' },
      ],
    },
    {
      section: 'Content',
      items: [
        { href: '/dashboard/creator/source-content', icon: Video, label: 'Platform Links' },
        { href: '/dashboard/creator/performance', icon: Zap, label: 'Performance' },
      ],
    },
  ];

  const brandMenuItems = [
    { href: '/dashboard/brand', icon: LayoutDashboard, label: 'Dashboard' },
    {
      section: 'Campaigns',
      items: [
        { href: '/dashboard/brand/campaigns', icon: FileText, label: 'My Campaigns' },
        { href: '/dashboard/brand/campaigns/create', icon: Upload, label: 'Create Campaign' },
      ],
    },
    {
      href: '/dashboard/brand/earnings',
      icon: Award,
      label: 'Earnings',
    },
  ];

  let menuItems = [];
  if (user?.role === 'admin') menuItems = adminMenuItems;
  else if (user?.role === 'creator') menuItems = creatorMenuItems;
  else if (user?.role === 'brand') menuItems = brandMenuItems;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-linear-to-b from-slate-900/95 to-slate-950/95 border-r border-slate-700/50 backdrop-blur-xl transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, idx) => {
          // Handle section headers with nested items
          if (item.section && item.items) {
            return (
              <div key={idx} className="py-2">
                {!collapsed && (
                  <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.section}
                  </p>
                )}
                {item.items.map((subItem) => {
                  const Icon = subItem.icon;
                  const isActive = pathname === subItem.href;
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        isActive
                          ? 'bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{subItem.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          }

          // Handle regular menu items
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 space-y-1 border-t border-slate-700/50">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
            pathname === '/profile'
              ? 'bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium border border-transparent"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
