'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';
import PublicNavbar from '@/components/PublicNavbar';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, register } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/dashboard/brand');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Brand name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword,
        'brand'
      );

      if (success) {
        toast.success('Brand account created successfully!');
        router.push('/dashboard/brand');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
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
              <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-3 rounded-lg">
                <Building2 className="text-white" size={24} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-white mb-2">Brand Sign Up</h1>
            <p className="text-center text-gray-400 mb-8">Create campaigns and manage creators</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Brand Name */}
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Brand Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Business Email"
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

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-all duration-300 gap-2"
              >
                {isLoading ? 'Creating Account...' : 'Create Brand Account'}
                {!isLoading && <ArrowRight size={18} />}
              </Button>
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
                Are you a creator?{' '}
                <Link href="/register/creator" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Sign up as creator
                </Link>
              </p>
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link href="/login/brand" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
