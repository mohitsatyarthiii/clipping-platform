'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';
import PublicNavbar from '@/components/PublicNavbar';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Video } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatorLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/dashboard/creator');
    }
  }, [isAuthenticated, router]);

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

    setIsLoading(true);
    const success = await login(formData.email, formData.password);
    setIsLoading(false);
    
    if (success) {
      toast.success('Logged in successfully!');
      router.push('/dashboard/creator');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-center mb-2">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-3 rounded-lg">
                <Video className="text-white" size={24} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-white mb-2">Creator Sign In</h1>
            <p className="text-center text-gray-400 mb-8">Join campaigns and start earning</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 transition-all duration-300 gap-2"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight size={18} />}
              </Button>

              {/* Forgot Password */}
              <div className="text-center">
                <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">or</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3 text-sm text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link href="/register/creator" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Sign up as creator
                </Link>
              </p>
              <p className="text-gray-400">
                Are you a brand?{' '}
                <Link href="/login/brand" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Brand sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
