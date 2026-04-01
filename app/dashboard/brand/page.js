// app/dashboard/brand/page.js - Dashboard only
'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  Plus,
  Calendar,
  ArrowRight,
  BarChart3,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/authStore';

export default function BrandDashboardPage() {
  useProtectedRoute('brand');
  const { data, loading, refetch } = useFetch('/campaigns?createdByMe=true');
  const user = useAuthStore((state) => state.user);

  const campaigns = data?.campaigns || [];
  
  // Stats calculations
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalCreators = campaigns.reduce((sum, c) => sum + (c.creators?.length || 0), 0);
  const totalEarningsDistributed = campaigns.reduce((sum, c) => sum + (c.metrics?.totalEarningsPaid || 0), 0);
  const totalViews = campaigns.reduce((sum, c) => {
    const campaignViews = c.creators?.reduce((s, creator) => s + (creator.stats?.views || 0), 0) || 0;
    return sum + campaignViews;
  }, 0);

  // Get recent campaigns (last 5)
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const stats = [
    {
      title: 'Active Campaigns',
      value: activeCount,
      icon: Activity,
      color: 'cyan',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Creators',
      value: totalCreators,
      icon: Users,
      color: 'purple',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'blue',
      change: '+23%',
      changeType: 'increase'
    },
    {
      title: 'Total Distributed',
      value: `$${totalEarningsDistributed.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      green: 'bg-green-500/10 text-green-400 border-green-500/20',
    };
    return colors[color] || colors.cyan;
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Brand'}! 👋
          </h1>
          <p className="text-gray-400 mt-2">
            Here's what's happening with your campaigns today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 border-l-${stat.color}-500`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/dashboard/brand/campaigns/new">
                <Button className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500">
                  <Plus size={18} /> Create New Campaign
                </Button>
              </Link>
              <Link href="/dashboard/brand/campaigns">
                <Button variant="outline" className="w-full gap-2">
                  <Eye size={18} /> View All Campaigns
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-white mb-4">Platform Tips</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                💡 Tip: Campaigns with higher payouts attract more quality creators
              </p>
              <p className="text-sm text-gray-400">
                📊 Track your campaign performance in real-time
              </p>
              <p className="text-sm text-gray-400">
                🎯 Set clear guidelines for better content quality
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Campaigns</h2>
            <Link href="/dashboard/brand/campaigns">
              <Button variant="ghost" size="sm" className="gap-2">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : recentCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 size={48} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">No campaigns yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Create your first campaign to get started
              </p>
              <Link href="/dashboard/brand/campaigns/new">
                <Button className="mt-4 gap-2">
                  <Plus size={16} /> Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/dashboard/brand/campaigns/${campaign._id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-cyan-500/50 transition-all cursor-pointer group">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {campaign.title}
                          </h3>
                          <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users size={14} /> {campaign.creators?.length || 0} creators
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} /> ${campaign.payoutPer1000Views}/1K
                          </span>
                          {campaign.endDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={14} /> Ends {new Date(campaign.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-gray-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}