'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/stores/authStore';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { Users, FileText, CheckCircle, TrendingUp, AlertCircle, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const StatMetric = ({ icon: Icon, title, value, change, color = 'cyan' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className={`relative overflow-hidden bg-linear-to-br from-${color}-500/10 to-${color}-600/5 border border-${color}-500/20 rounded-xl p-4 hover:border-${color}-500/40 transition-all duration-300 group`}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-linear-to-r from-${color}-500/0 via-${color}-500/5 to-${color}-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 bg-${color}-500/20 rounded-lg group-hover:scale-110 transition-transform`}>
            <Icon className={`w-5 h-5 text-${color}-400`} />
          </div>
          {change && (
            <Badge variant="success" className="text-xs">{change}↑</Badge>
          )}
        </div>
        <p className="text-slate-400 text-xs font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value || '0'}</h3>
      </div>
    </div>
  </motion.div>
);

const QuickActionCard = ({ href, icon: Icon, title, value, description, color = 'cyan' }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ translateY: -4 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <Card className={`bg-linear-to-br from-${color}-500/10 to-${color}-600/5 border-${color}-500/20 hover:border-${color}-500/40 cursor-pointer h-full transition-all duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">{title}</p>
            <h2 className="text-3xl font-bold text-white">{value}</h2>
            <p className="text-slate-400 text-xs mt-2">{description}</p>
          </div>
          <div className={`p-3 bg-${color}-500/20 rounded-lg`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
        </div>
      </Card>
    </motion.div>
  </Link>
);

export default function AdminDashboardPage() {
  useProtectedRoute('admin');
  const { data, loading } = useFetch('/dashboard/admin');
  const user = useAuthStore((state) => state.user);

  const stats = [
    { icon: Users, title: 'Total Users', value: data?.totalUsers, change: '+12%', color: 'cyan' },
    { icon: FileText, title: 'Active Campaigns', value: data?.totalCampaigns, change: '+8%', color: 'blue' },
    { icon: CheckCircle, title: 'Total Submissions', value: data?.totalSubmissions, change: '+25%', color: 'green' },
    { icon: AlertCircle, title: 'Pending Review', value: data?.pendingSubmissions, change: '-3%', color: 'amber' },
    { icon: TrendingUp, title: 'Total Views', value: data?.totalViews?.toLocaleString?.(), change: '+45%', color: 'purple' },
    { icon: Award, title: 'Total Payouts', value: `$${data?.totalPayouts?.toFixed(2)}`, change: '+18%', color: 'pink' },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="bg-linear-to-r from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Welcome back, <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name.split(' ')[0]}</span>
                </h1>
                <p className="text-slate-400 text-sm">Here's your platform overview. Keep an eye on your key metrics.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <Activity size={16} className="text-cyan-400" />
                <span className="text-xs font-medium text-cyan-300">Platform Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </>
            ) : (
              stats.map((stat, i) => (
                <StatMetric
                  key={i}
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  color={stat.color}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              href="/dashboard/admin/campaigns"
              icon={FileText}
              title="Manage Campaigns"
              value={data?.totalCampaigns || 0}
              description="View and manage all campaigns"
              color="blue"
            />
            <QuickActionCard
              href="/dashboard/admin/users"
              icon={Users}
              title="Platform Users"
              value={data?.totalUsers || 0}
              description="View all registered users"
              color="cyan"
            />
            <QuickActionCard
              href="/dashboard/admin/submissions"
              icon={CheckCircle}
              title="Review Submissions"
              value={data?.pendingSubmissions || 0}
              description="Pending approvals"
              color="amber"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Card */}
          <Card className="bg-linear-to-br from-slate-900/60 to-slate-950/60 border-slate-700/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-xs font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-white mt-2">${data?.totalPayouts?.toFixed(2) || '0'}</h3>
              </div>
              <div className="p-3 bg-green-500/15 rounded-lg">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-700/30">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Monthly Growth</span>
                <span className="text-green-400 font-semibold">+18%</span>
              </div>
              <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full w-3/4 group-hover:w-full transition-all" />
              </div>
            </div>
          </Card>

          {/* Activity Card */}
          <Card className="bg-linear-to-br from-slate-900/60 to-slate-950/60 border-slate-700/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-xs font-medium">Platform Activity</p>
                <h3 className="text-3xl font-bold text-white mt-2">{data?.totalViews?.toLocaleString?.() || '0'}</h3>
                <p className="text-slate-400 text-xs mt-2">Total Views This Month</p>
              </div>
              <div className="p-3 bg-purple-500/15 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-700/30">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Engagement Rate</span>
                <span className="text-purple-400 font-semibold">+45%</span>
              </div>
              <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full w-2/3 group-hover:w-full transition-all" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
