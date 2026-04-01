'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/authStore';
import { 
  Play, 
  Users, 
  TrendingUp, 
  Zap, 
  Award, 
  BarChart3,
  Shield,
  DollarSign,
  Video,
  Scissors,
  Globe,
  Clock,
  Star,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only redirect once when authenticated, don't depend on router
    if (isAuthenticated && user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const dashboards = {
        admin: '/dashboard/admin',
        brand: '/dashboard/brand',
        creator: '/dashboard/creator',
      };
      router.push(dashboards[user.role] || '/dashboard/admin');
    }
  }, [isAuthenticated, user]); // Don't depend on router

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8"
          >
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">#1 Creator Marketplace</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent"
          >
            Create, Share, Earn
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            The ultimate marketplace for creators and brands. Monetize your content and earn from views instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <Button size="lg" className="min-w-48 group">
                Get Started Free
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="min-w-48">
                Login
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-800"
          >
            {[
              { value: "10K+", label: "Active Creators" },
              { value: "50K+", label: "Content Clips" },
              { value: "1M+", label: "Monthly Views" },
              { value: "$100K+", label: "Earnings Paid" }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl md:text-3xl font-bold text-purple-400">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-400">Three simple steps to start earning</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Play,
              title: 'Create Content',
              description: 'Upload your original videos and source content to campaigns. Set your pricing and start earning.',
              color: 'from-purple-500 to-purple-600',
              step: '01'
            },
            {
              icon: Users,
              title: 'Build Community',
              description: 'Creators join your campaigns and share your content. Grow your audience together.',
              color: 'from-cyan-500 to-cyan-600',
              step: '02'
            },
            {
              icon: TrendingUp,
              title: 'Earn Money',
              description: 'Get paid based on views and engagement of your clips. Withdraw earnings instantly to your account.',
              color: 'from-purple-500 to-cyan-600',
              step: '03'
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 group"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-lg font-bold">
                {item.step}
              </div>
              <div className={`bg-gradient-to-br ${item.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400">Everything you need to succeed</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Publishing',
                description: 'Publish clips instantly with one click. No waiting time, start earning immediately.',
                color: 'text-yellow-400'
              },
              {
                icon: Award,
                title: 'Transparent Earnings',
                description: 'Track every view and payment in real-time. Complete transparency on all transactions.',
                color: 'text-green-400'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Detailed stats on clip performance, audience engagement, and ROI metrics.',
                color: 'text-blue-400'
              },
              {
                icon: DollarSign,
                title: 'Secure Payments',
                description: 'Fast, secure payouts to your account. Multiple withdrawal options available.',
                color: 'text-emerald-400'
              },
              {
                icon: Shield,
                title: 'Content Protection',
                description: 'Advanced copyright protection and watermarking to secure your content.',
                color: 'text-red-400'
              },
              {
                icon: Globe,
                title: 'Global Reach',
                description: 'Reach audiences worldwide with multi-language support and global distribution.',
                color: 'text-purple-400'
              },
              {
                icon: Video,
                title: 'HD Quality',
                description: 'Support for 4K video uploads and high-quality streaming for your content.',
                color: 'text-pink-400'
              },
              {
                icon: Clock,
                title: '24/7 Support',
                description: 'Round-the-clock customer support to help you with any issues.',
                color: 'text-orange-400'
              },
              {
                icon: Scissors,
                title: 'AI Clipping Tools',
                description: 'Smart AI-powered tools to help create engaging clips automatically.',
                color: 'text-indigo-400'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} bg-gray-800/50 p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-400">Trusted by thousands of creators worldwide</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "Content Creator",
              content: "This platform has transformed how I monetize my content. The clipping system is revolutionary!",
              rating: 5,
              image: "https://randomuser.me/api/portraits/women/1.jpg"
            },
            {
              name: "Michael Chen",
              role: "Content Promoter",
              content: "Best decision I made this year. The earnings are consistent and the platform is super easy to use.",
              rating: 5,
              image: "https://randomuser.me/api/portraits/men/1.jpg"
            },
            {
              name: "Emily Rodriguez",
              role: "Video Editor",
              content: "The AI tools save me hours of work. Highly recommended for anyone in content creation.",
              rating: 5,
              image: "https://randomuser.me/api/portraits/women/2.jpg"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic">"{testimonial.content}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20 bg-gradient-to-t from-gray-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">Choose the plan that works for you</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                features: ["Basic analytics", "Up to 10 clips/month", "Community support", "Standard watermarking"],
                recommended: false
              },
              {
                name: "Pro",
                price: "$29",
                features: ["Advanced analytics", "Unlimited clips", "Priority support", "Custom branding", "AI clipping tools"],
                recommended: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: ["API access", "Dedicated manager", "Custom integration", "White-label solution", "SLA guarantee"],
                recommended: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative bg-gray-900/50 border rounded-xl p-8 transition-all duration-300 ${
                  plan.recommended 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-105' 
                    : 'border-gray-800 hover:border-purple-500/30'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    RECOMMENDED
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-gray-400">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Zap className="w-4 h-4 text-purple-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full" variant={plan.recommended ? "default" : "outline"}>
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of creators and brands earning money every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="min-w-56 group">
                  Sign Up Today
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="min-w-56">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Creator Marketplace
              </h3>
              <p className="text-gray-400 mb-4">
                The ultimate marketplace for creators and brands. Monetize your content and earn from views instantly.
              </p>
              
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-purple-400 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-purple-400 transition-colors">Demo</Link></li>
                <li><Link href="/integrations" className="hover:text-purple-400 transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-purple-400 transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-purple-400 transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-purple-400 transition-colors">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-purple-400 transition-colors">Cookies</Link></li>
                <li><Link href="/licenses" className="hover:text-purple-400 transition-colors">Licenses</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; 2024 Clipping Platform. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@clipping.com
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +1 (555) 123-4567
                </Link>
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  San Francisco, CA
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}