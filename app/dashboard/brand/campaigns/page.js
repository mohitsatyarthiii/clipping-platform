'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { Search, Eye, Users, DollarSign, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BrandCampaignsPage() {
  useProtectedRoute('brand');
  const { data: myCampaigns, loading: myLoading } = useFetch('/campaigns?createdByMe=true');
  const [search, setSearch] = useState('');

  const campaigns = myCampaigns?.campaigns || [];
  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalCreators = campaigns.reduce((sum, c) => sum + (c.creators?.length || 0), 0);
  const totalEarningsDistributed = campaigns.reduce((sum, c) => sum + (c.totalEarnings || 0), 0);

  const stats = [
    {
      icon: BarChart3,
      label: 'Total Campaigns',
      value: campaigns.length,
      color: 'cyan',
    },
    {
      icon: Eye,
      label: 'Active Campaigns',
      value: activeCount,
      color: 'green',
    },
    {
      icon: Users,
      label: 'Total Creators',
      value: totalCreators,
      color: 'purple',
    },
    {
      icon: DollarSign,
      label: 'Total Distributed',
      value: `$${totalEarningsDistributed.toFixed(2)}`,
      color: 'yellow',
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">My Campaigns</h1>
          <p className="text-gray-400 mt-2">Manage and track your campaigns</p>
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

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Campaigns List */}
        {myLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400">No campaigns created yet</p>
            <p className="text-gray-500 text-sm mt-1">Create your first campaign to get started</p>
            <Link href="/dashboard/brand">
              <Button className="mt-4 bg-gradient-to-r from-cyan-600 to-cyan-500">
                Go to Dashboard
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/dashboard/brand/campaigns/${campaign._id}`}>
                  <Card className="hover:border-cyan-500/50 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{campaign.title}</h3>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{campaign.description}</p>
                          </div>
                          <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'default'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 py-4 border-y border-gray-700/30">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Payout Rate</p>
                        <p className="text-base font-semibold text-cyan-400">${campaign.payoutPer1000Views}/1K</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Creators</p>
                        <p className="text-base font-semibold text-white">{campaign.creators?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Views</p>
                        <p className="text-base font-semibold text-white">
                          {(campaign.creators?.reduce((sum, c) => sum + (c.stats?.views || 0), 0) || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">End Date</p>
                        <p className="text-base font-semibold text-white">
                          {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded">
                          Created: {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        View Details →
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
