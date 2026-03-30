'use client';

import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { ArrowLeft, TrendingUp, Users, DollarSign, Eye, Award, Play, Music } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampaignStatsPage() {
  useProtectedRoute('brand');
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id;

  const { data: campaign, loading } = useFetch(`/campaigns/${campaignId}`);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <Skeleton className="h-20 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <Card className="text-center py-12">
            <p className="text-gray-400 text-lg">Campaign not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const campaignData = campaign.campaign || campaign;
  const creators = campaignData.creators || [];
  
  // Calculate totals
  const totalViews = creators.reduce((sum, c) => sum + (c.stats?.views || 0), 0);
  const totalEarnings = creators.reduce((sum, c) => sum + (c.earnings?.total || 0), 0);
  const totalPending = creators.reduce((sum, c) => sum + (c.earnings?.pending || 0), 0);

  // Sort creators by views (top creators)
  const topCreators = [...creators].sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));

  const stats = [
    {
      label: 'Total Creators',
      value: creators.length,
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'cyan',
    },
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Pending Earnings',
      value: `$${totalPending.toFixed(2)}`,
      icon: TrendingUp,
      color: 'yellow',
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white">{campaignData.title}</h1>
            <p className="text-gray-400 mt-1">{campaignData.description}</p>
          </div>
          <Badge variant={campaignData.status === 'active' ? 'success' : 'default'}>
            {campaignData.status}
          </Badge>
        </div>

        {/* Campaign Info */}
        <Card className="mb-8 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Payout Rate</p>
              <p className="text-2xl font-bold text-cyan-400">${campaignData.payoutPer1000Views}/1K</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Category</p>
              <p className="text-white font-semibold">{campaignData.category || 'General'}</p>
            </div>
            {campaignData.startDate && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Start Date</p>
                <p className="text-white font-semibold">{new Date(campaignData.startDate).toLocaleDateString()}</p>
              </div>
            )}
            {campaignData.endDate && (
              <div>
                <p className="text-gray-400 text-sm mb-1">End Date</p>
                <p className="text-white font-semibold">{new Date(campaignData.endDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </Card>

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
                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
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

        {/* Creators Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <h2 className="text-xl font-bold text-white mb-6">Creators Performance</h2>

              {creators.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400">No creators have joined this campaign yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/30">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Creator</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Views</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Total Earning</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Pending</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creators.map((creator, index) => (
                        <motion.tr
                          key={creator._id || index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-white">{creator.creatorId?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-400 mt-1">{creator.creatorId?.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-white">{(creator.stats?.views || 0).toLocaleString()}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-green-400">${(creator.earnings?.total || 0).toFixed(2)}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-yellow-400">${(creator.earnings?.pending || 0).toFixed(2)}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              {creator.platformLinks?.youtube && (
                                <a
                                  href={creator.platformLinks.youtube}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="YouTube"
                                >
                                  <Youtube size={18} />
                                </a>
                              )}
                              {creator.platformLinks?.tiktok && (
                                <a
                                  href={creator.platformLinks.tiktok}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-black hover:text-gray-600 transition-colors bg-white rounded px-1"
                                  title="TikTok"
                                >
                                  <TikTok size={14} />
                                </a>
                              )}
                              {creator.platformLinks?.instagram && (
                                <a
                                  href={creator.platformLinks.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-400 hover:text-pink-300 transition-colors"
                                  title="Instagram"
                                >
                                  📷
                                </a>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Top Creators Sidebar */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Top Creators</h2>
            {topCreators.length === 0 ? (
              <p className="text-gray-400 text-sm">No creators yet</p>
            ) : (
              <div className="space-y-3">
                {topCreators.slice(0, 5).map((creator, index) => (
                  <motion.div
                    key={creator._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{creator.creatorId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{creator.creatorId?.email}</p>
                      </div>
                      <Badge variant="success" className="text-xs">#{index + 1}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Views:</span>
                        <span className="text-white font-semibold">{(creator.stats?.views || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Earned:</span>
                        <span className="text-green-400 font-semibold">${(creator.earnings?.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
