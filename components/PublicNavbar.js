'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function PublicNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href) => pathname === href;

  const dashboardRoute = {
    admin: '/dashboard/admin',
    creator: '/dashboard/creator',
    clipper: '/dashboard/clipper',
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-700/30 bg-black/80 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold text-xl">
              Clipping
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              How It Works
            </Link>
            <Link href="/#testimonials" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Testimonials
            </Link>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Pricing
            </a>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={dashboardRoute[user?.role] || '/dashboard/clipper'}>
                    Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/30 py-4 space-y-2">
            <Link
              href="/#features"
              className="block px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium hover:bg-slate-800/50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="block px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium hover:bg-slate-800/50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#testimonials"
              className="block px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium hover:bg-slate-800/50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <div className="px-4 pt-4 border-t border-slate-700/30 space-y-2">
              {isAuthenticated ? (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={dashboardRoute[user?.role] || '/dashboard/clipper'}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
