// app/dashboard/creator/page.js
'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useAuthStore } from '@/lib/stores/authStore';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { TrendingUp, ArrowRight, Users, DollarSign, Award, Eye, Clock, CheckCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CreatorDashboardPage() {
  useProtectedRoute('creator');
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  // Fetch joined campaigns - using correct endpoint
  const { data: joinedCampaignsData, loading: campaignsLoading, refetch } = useFetch('/campaigns?joinedByMe=true');
  const { data: earningsData, loading: earningsLoading, refetch: refetchEarnings } = useFetch('/creator/earnings');

  const joinedCampaigns = joinedCampaignsData?.campaigns || [];
  
  // Calculate stats from joined campaigns
  let totalViews = 0;
  let totalEarnings = 0;
  let pendingEarnings = 0;
  let activeCampaigns = 0;

  joinedCampaigns.forEach(campaign => {
    // Find creator's data in the campaign
    const creatorData = campaign.creators?.find(
      c => c.creatorId?._id === user?.id
    );
    
    if (creatorData) {
      totalViews += creatorData.stats?.views || 0;
      totalEarnings += creatorData.earnings?.total || 0;
      pendingEarnings += creatorData.earnings?.pending || 0;
    }
    
    // Count active campaigns
    if (campaign.status === 'active') {
      activeCampaigns++;
    }
  });

  // Also check earnings API data as backup
  const apiTotalEarnings = earningsData?.totalEarnings || 0;
  const apiPendingEarnings = earningsData?.pendingEarnings || 0;
  const apiTotalViews = earningsData?.totalViews || 0;

  // Use the larger value between calculated and API data
  const finalTotalEarnings = Math.max(totalEarnings, apiTotalEarnings);
  const finalPendingEarnings = Math.max(pendingEarnings, apiPendingEarnings);
  const finalTotalViews = Math.max(totalViews, apiTotalViews);

  const stats = [
    {
      icon: Eye,
      label: 'Total Views',
      value: finalTotalViews.toLocaleString(),
      color: 'cyan',
      loading: campaignsLoading,
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `$${finalTotalEarnings.toFixed(2)}`,
      color: 'green',
      loading: campaignsLoading,
    },
    {
      icon: Users,
      label: 'Joined Campaigns',
      value: joinedCampaigns.length,
      color: 'purple',
      loading: campaignsLoading,
    },
    {
      icon: Award,
      label: 'Pending Earnings',
      value: `$${finalPendingEarnings.toFixed(2)}`,
      color: 'yellow',
      loading: campaignsLoading,
    },
  ];

  // Get recent campaigns (last 5 joined)
  const recentCampaigns = [...joinedCampaigns]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getColorClasses = (color) => {
    const colors = {
      cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      green: 'bg-green-500/10 text-green-400 border-green-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };
    return colors[color] || colors.cyan;
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Creator Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}! 👋
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Track your campaigns, earnings, and performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-br ${getColorClasses(stat.color)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                      {stat.loading ? (
                        <Skeleton className="h-8 w-24 bg-slate-700/50" />
                      ) : (
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color === 'cyan' ? 'bg-cyan-500/20' : stat.color === 'green' ? 'bg-green-500/20' : stat.color === 'purple' ? 'bg-purple-500/20' : 'bg-yellow-500/20'}`}>
                      <Icon size={24} className={`${stat.color === 'cyan' ? 'text-cyan-400' : stat.color === 'green' ? 'text-green-400' : stat.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Campaigns Section */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">My Campaigns</h2>
                <Link href="/dashboard/creator/my-campaigns">
                  <Button variant="ghost" className="gap-2 text-cyan-400">
                    View All <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>

              {campaignsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : joinedCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <Users size={32} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400">No campaigns joined yet</p>
                  <p className="text-gray-500 text-sm mt-1">Join your first campaign to start earning</p>
                  <Link href="/dashboard/creator/campaigns">
                    <Button className="mt-4 bg-gradient-to-r from-cyan-600 to-cyan-500">
                      Browse Campaigns
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCampaigns.map((campaign, index) => {
                    const creatorData = campaign.creators?.find(
                      c => c.creatorId?._id === user?.id
                    );
                    return (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/dashboard/creator/campaigns/${campaign._id}`}>
                          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-cyan-500/50 transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-white hover:text-cyan-400 transition-colors">
                                    {campaign.title}
                                  </h3>
                                  <Badge variant={campaign.status === 'active' ? 'success' : 'default'} size="sm">
                                    {campaign.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  By {campaign.createdBy?.name || 'Unknown Brand'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">Payout</p>
                                <p className="text-sm font-semibold text-cyan-400">${campaign.payoutPer1000Views}/1K</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-700/30">
                              <div>
                                <p className="text-xs text-gray-400">Your Views</p>
                                <p className="text-base font-bold text-white">
                                  {(creatorData?.stats?.views || 0).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Earned</p>
                                <p className="text-base font-bold text-green-400">
                                  ${(creatorData?.earnings?.total || 0).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Pending</p>
                                <p className="text-base font-bold text-yellow-400">
                                  ${(creatorData?.earnings?.pending || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/dashboard/creator/campaigns">
                  <Button className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500">
                    <TrendingUp size={16} /> Browse New Campaigns
                  </Button>
                </Link>
                <Link href="/dashboard/creator/my-campaigns">
                  <Button variant="outline" className="w-full gap-2">
                    <Users size={16} /> View My Campaigns
                  </Button>
                </Link>
                <Link href="/dashboard/creator/source-content">
                  <Button variant="outline" className="w-full gap-2">
                    <Link2 size={16} /> Manage Platform Links
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full gap-2">
                    <Settings size={16} /> Profile Settings
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Tips Card */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">💡 Creator Tips</h2>
              <div className="space-y-3">
                <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                  <p className="text-sm text-cyan-400 font-medium mb-1">Maximize Earnings</p>
                  <p className="text-xs text-gray-400">Join campaigns that match your audience for better engagement</p>
                </div>
                <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-purple-400 font-medium mb-1">Platform Links</p>
                  <p className="text-xs text-gray-400">Add all your platform links to track views from every source</p>
                </div>
                <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                  <p className="text-sm text-green-400 font-medium mb-1">Consistent Content</p>
                  <p className="text-xs text-gray-400">Regular posting helps maintain and grow your viewership</p>
                </div>
                <div className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                  <p className="text-sm text-yellow-400 font-medium mb-1">Track Performance</p>
                  <p className="text-xs text-gray-400">Monitor your views and earnings to optimize your strategy</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Missing imports
import { Link2, Settings } from 'lucide-react';