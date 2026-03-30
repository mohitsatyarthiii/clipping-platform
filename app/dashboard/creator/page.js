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
import { TrendingUp, ArrowRight, Users, DollarSign, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatorDashboardPage() {
  useProtectedRoute('creator');
  const router = useRouter();
  const { data: myCampaigns, loading: myLoading } = useFetch('/campaigns/my-campaigns');
  const { data: earnings, loading: earningsLoading } = useFetch('/creator/earnings');
  const user = useAuthStore((state) => state.user);

  const joinedCampaignCount = myCampaigns?.campaigns?.length || 0;
  const totalEarnings = earnings?.totalEarnings || 0;
  const pendingEarnings = earnings?.pendingEarnings || 0;
  const totalViews = earnings?.totalViews || 0;

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Views',
      value: totalViews,
      color: 'cyan',
      loading: earningsLoading,
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      color: 'green',
      loading: earningsLoading,
    },
    {
      icon: Users,
      label: 'Active Campaigns',
      value: joinedCampaignCount,
      color: 'purple',
      loading: myLoading,
    },
    {
      icon: Award,
      label: 'Pending Earnings',
      value: `$${pendingEarnings.toFixed(2)}`,
      color: 'yellow',
      loading: earningsLoading,
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Creator Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.name} 👋</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              cyan: 'bg-cyan-500/10 text-cyan-400',
              green: 'bg-green-500/10 text-green-400',
              purple: 'bg-purple-500/10 text-purple-400',
              yellow: 'bg-yellow-500/10 text-yellow-400',
            };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:border-cyan-500/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                      {stat.loading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Campaigns</h2>
                <Button
                  onClick={() => router.push('/dashboard/creator/campaigns')}
                  variant="ghost"
                  className="gap-2"
                >
                  View All <ArrowRight size={16} />
                </Button>
              </div>

              {myLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : myCampaigns?.campaigns && myCampaigns.campaigns.length > 0 ? (
                <div className="space-y-3">
                  {myCampaigns.campaigns.slice(0, 3).map((campaign) => (
                    <div
                      key={campaign._id}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{campaign.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {campaign.creators?.length || 0} creators • ${campaign.payoutPer1000Views}/1K views
                        </p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No campaigns joined yet</p>
                  <Button
                    onClick={() => router.push('/dashboard/creator/campaigns')}
                    className="mt-4 bg-gradient-to-r from-cyan-600 to-cyan-500 w-full"
                  >
                    Browse Campaigns
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/dashboard/creator/campaigns')}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600"
              >
                Browse Campaigns
              </Button>
              <Button
                onClick={() => router.push('/dashboard/creator/campaigns?tab=1')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
              >
                My Campaigns
              </Button>
              <Button
                onClick={() => router.push('/dashboard/creator/campaigns?tab=2')}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              >
                View Earnings
              </Button>
              <Button
                onClick={() => router.push('/profile')}
                variant="outline"
                className="w-full"
              >
                Edit Profile
              </Button>
            </div>

            {/* Tips */}
            <div className="mt-6 pt-6 border-t border-gray-700/30">
              <h3 className="text-sm font-semibold text-white mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Join campaigns that match your audience</li>
                <li>• Add platform links in your campaign profile</li>
                <li>• Track your views and earnings in real-time</li>
                <li>• Reach out to brands with great content</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
