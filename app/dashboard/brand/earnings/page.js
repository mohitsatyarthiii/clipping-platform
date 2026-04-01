'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import { DollarSign, TrendingUp, Users, Award, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandEarningsPage() {
  useProtectedRoute('brand');
  const { data, loading } = useFetch('/campaigns?createdByMe=true');
  const [search, setSearch] = useState('');

  const campaigns = data?.campaigns || [];
  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate earnings metrics
  const totalRevenue = campaigns.reduce((sum, campaign) => {
    const campaignEarnings = campaign.creators?.reduce((cSum, creator) => {
      return cSum + (creator.earnings?.total || 0);
    }, 0) || 0;
    return sum + campaignEarnings;
  }, 0);

  const totalPaid = campaigns.reduce((sum, campaign) => {
    const campaignPaid = campaign.creators?.reduce((cSum, creator) => {
      return cSum + (creator.earnings?.paid || 0);
    }, 0) || 0;
    return sum + campaignPaid;
  }, 0);

  const totalPending = campaigns.reduce((sum, campaign) => {
    const campaignPending = campaign.creators?.reduce((cSum, creator) => {
      return cSum + (creator.earnings?.pending || 0);
    }, 0) || 0;
    return sum + campaignPending;
  }, 0);

  const totalCreators = new Set(
    campaigns.flatMap((c) => c.creators?.map((cr) => cr.creatorId?._id) || [])
  ).size;

  const StatCard = ({ icon: Icon, label, value, color = 'cyan' }) => (
    <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 border-slate-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
        </div>
        <div className={`p-2.5 bg-${color}-500/15 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Earnings & Payouts</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Track earnings from all your campaigns</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={DollarSign}
              label="Total Distributed"
              value={`$${totalRevenue.toFixed(2)}`}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Paid"
              value={`$${totalPaid.toFixed(2)}`}
              color="cyan"
            />
            <StatCard
              icon={Award}
              label="Pending"
              value={`$${totalPending.toFixed(2)}`}
              color="amber"
            />
            <StatCard
              icon={Users}
              label="Active Creators"
              value={totalCreators}
              color="purple"
            />
          </div>
        )}

        {/* Campaigns Earnings Card */}
        <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Campaign Earnings Breakdown</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by campaign name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No campaigns yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((campaign, index) => {
                const campaignTotal = campaign.creators?.reduce((sum, c) => sum + (c.earnings?.total || 0), 0) || 0;
                const campaignPaid = campaign.creators?.reduce((sum, c) => sum + (c.earnings?.paid || 0), 0) || 0;
                const creatorCount = campaign.creators?.filter((c) => c.status === 'active')?.length || 0;

                return (
                  <motion.div
                    key={campaign._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{campaign.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{creatorCount} active creators</p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Total Distributed</p>
                        <p className="font-semibold text-green-400">${campaignTotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Paid Out</p>
                        <p className="font-semibold text-cyan-400">${campaignPaid.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Pending</p>
                        <p className="font-semibold text-amber-400">${(campaignTotal - campaignPaid).toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
