'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Menu, LogOut, Bell, Settings } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import Button from '@/components/ui/Button';

const Navbar = memo(({ isAuthenticated = false, onToggleSidebar }) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    logout();
    router.push('/login');
  }, [logout, router]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-700/50 bg-linear-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={() => onToggleSidebar?.()}
                className="hidden md:inline-flex text-slate-400 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                title="Toggle sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <div className="w-8 h-8 bg-linear-to-br from-cyan-400 via-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Clipping
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/notifications"
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg transition-colors relative"
              >
                <Bell size={18} />
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
                <Link
                  href="/profile"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Settings size={18} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700/50">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-4">
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full text-xs">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full text-xs">Sign Up</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 pt-4 text-sm">
                <Link
                  href="/notifications"
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Bell size={16} />
                  Notifications
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-400/80 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
