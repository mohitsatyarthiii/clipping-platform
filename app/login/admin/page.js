'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';
import PublicNavbar from '@/components/PublicNavbar';
import { 
  Mail, Lock, ArrowRight, Eye, EyeOff, Shield, 
  Zap, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, user } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      
      // Check if user is admin
      if (user?.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        toast.error('Admin access required. Please use your role-specific login.');
        // Redirect to main login
        setTimeout(() => router.push('/login'), 2000);
      }
    }
  }, [isAuthenticated, user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await login(formData.email, formData.password);
    if (success) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'admin') {
        toast.success('Admin login successful!');
        router.push('/dashboard/admin');
      } else {
        toast.error('Admin access required. This account is not an admin.');
        // Redirect back to login
        setTimeout(() => router.push('/login'), 2000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Admin Access
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to the admin dashboard
            </p>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-8 shadow-2xl"
          >
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    className="pl-9 h-11 bg-gray-800/50 border-gray-700 focus:border-yellow-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    className="pl-9 pr-10 h-11 bg-gray-800/50 border-gray-700 focus:border-yellow-500 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Sign In as Admin
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-gray-900 text-gray-500">Need different access?</span>
              </div>
            </div>

            {/* Back Link */}
            <Link href="/login">
              <Button variant="outline" className="w-full h-11 text-sm border-gray-700 hover:border-yellow-500">
                Back to Login Options
              </Button>
            </Link>

            {/* Trust Badge */}
            <div className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Protected</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Admin Only</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
