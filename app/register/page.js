'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { 
  Mail, Lock, ArrowRight, Sparkles, Zap, TrendingUp, Users, 
  Eye, EyeOff, Crown, Rocket, Award, Star, Shield, 
  Video, Music, Heart, Share2, Globe, DollarSign, User, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, register } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const userRole = useAuthStore.getState().user?.role;
      const dashboardRoute = {
        admin: '/dashboard/admin',
        creator: '/dashboard/creator',
        clipper: '/dashboard/clipper',
      };
      router.push(dashboardRoute[userRole] || '/dashboard/clipper');
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

    if (success) {
      toast.success('Account created successfully!');
      const userRole = useAuthStore.getState().user?.role;
      const dashboardRoute = {
        admin: '/dashboard/admin',
        creator: '/dashboard/creator',
        clipper: '/dashboard/clipper',
      };
      router.push(dashboardRoute[userRole] || '/dashboard/clipper');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const benefits = [
    { icon: Rocket, text: "Start earning from day one", color: "purple" },
    { icon: TrendingUp, text: "Access to viral analytics", color: "cyan" },
    { icon: DollarSign, text: "Instant payouts", color: "green" },
    { icon: Shield, text: "Content protection", color: "blue" },
    { icon: Users, text: "Grow your community", color: "pink" },
    { icon: Award, text: "Exclusive creator perks", color: "yellow" },
  ];

  const stats = [
    { value: "50K+", label: "Active Creators", icon: Users },
    { value: "$2.5M+", label: "Total Earnings", icon: DollarSign },
    { value: "10M+", label: "Monthly Views", icon: TrendingUp },
  ];

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="min-h-screen bg-black flex overflow-hidden">
        {/* LEFT SIDE - CONTENT SECTION */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000" />
            
            {/* Grid Pattern */}
            
          </div>

          <div className="relative z-10 w-full flex flex-col justify-between p-12">
            {/* Logo & Tagline */}
            <div>
              

              {/* Hero Text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <h1 className="text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Start Your Journey
                  </span>
                  <br />
                  <span className="text-white">As a Clipper Today</span>
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Join thousands of creators already earning money doing what they love. No upfront costs, no hidden fees.
                </p>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-3 gap-4 mb-12"
              >
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-4 h-4 text-purple-400" />
                      <span className="text-xl font-bold text-white">{stat.value}</span>
                    </div>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Benefits List */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h3 className="text-white font-semibold mb-4 text-sm">What you get:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-300">
                      <benefit.icon className={`w-3.5 h-3.5 text-${benefit.color}-400`} />
                      <span className="text-xs">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="border-t border-white/10 pt-6 mt-auto"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border-2 border-black flex items-center justify-center text-xs font-bold text-white">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              <p className="text-gray-400 text-sm italic">
                "The best decision I made this year! Already earning consistently from my content."
              </p>
              <p className="text-white text-xs mt-2 font-semibold">— Michael Chen, Creator</p>
            </motion.div>
          </div>
        </div>

        {/* RIGHT SIDE - REGISTRATION FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
          {/* Background Effects */}
          <div className="absolute inset-0 lg:hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Card */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
                  <p className="text-gray-400 text-sm">Start your creator journey today</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        className="pl-9 h-11 bg-gray-800/50 border-gray-700 focus:border-purple-500 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        className="pl-9 h-11 bg-gray-800/50 border-gray-700 focus:border-purple-500 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Password */}
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
                        className="pl-9 pr-10 h-11 bg-gray-800/50 border-gray-700 focus:border-purple-500 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {!errors.password && formData.password && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Strong password
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        className="pl-9 pr-10 h-11 bg-gray-800/50 border-gray-700 focus:border-purple-500 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Hint */}
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>Password must be at least 6 characters</span>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Create Account
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
                    <span className="px-3 bg-gray-900 text-gray-500">Already have an account?</span>
                  </div>
                </div>

                {/* Login Link */}
                <Link href="/login">
                  <Button variant="outline" className="w-full h-11 text-sm border-gray-700 hover:border-purple-500">
                    Sign in instead
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
                    <span>Free</span>
                  </div>
                  <div>•</div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>Global</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}