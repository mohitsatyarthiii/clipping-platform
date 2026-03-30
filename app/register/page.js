'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import PublicNavbar from '@/components/PublicNavbar';
import { 
  ArrowRight, Zap, TrendingUp, Users, Rocket, Award, Star, Shield, 
  Globe, DollarSign, User, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 text-white">
              Join Our Community
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Choose your path and start growing with us today. Sign up as a brand to launch campaigns, or as a creator to start earning.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Brand Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl border border-blue-500/30 hover:border-blue-500/60 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
              onClick={() => router.push('/register/brand')}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-3xl" />
              
              <div className="relative z-10">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Brand/Company</h2>
                  <p className="text-gray-400 text-sm mb-4">Create campaigns and reach creators to grow your content.</p>
                </div>

                <ul className="space-y-2 mb-6 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-blue-400" />
                    <span>Launch campaigns instantly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Access creator network</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span>Track performance metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Content protection</span>
                  </li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
                  Sign Up as Brand
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* Creator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
              onClick={() => router.push('/register/creator')}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-3xl" />
              
              <div className="relative z-10">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Creator</h2>
                  <p className="text-gray-400 text-sm mb-4">Join campaigns and earn money from your content creation.</p>
                </div>

                <ul className="space-y-2 mb-6 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                    <span>Start earning instantly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Exclusive opportunities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span>Performance analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>Global reach</span>
                  </li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all">
                  Sign Up as Creator
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-gray-400 mb-4">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign in here
              </Link>
            </p>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure & Private</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Free to Join</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Global Community</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}