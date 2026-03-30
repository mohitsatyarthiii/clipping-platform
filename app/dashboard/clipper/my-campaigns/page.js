'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { Calendar, MapPin, DollarSign, Filter, Zap, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyCliperCampaignsPage() {
  useProtectedRoute('clipper');
  const { data, loading } = useFetch('/campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const campaigns = data?.campaigns || [];

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'closed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const CampaignCard = ({ campaign, index }) => (
    <motion.div
      key={campaign._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:border-cyan-500/30 transition-all bg-slate-900/60 border-slate-700/50">
        {/* Header with Status */}
        <div className="bg-linear-to-r from-cyan-500/15 to-blue-500/10 p-4 border-b border-slate-700/30">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">{campaign.title}</h3>
              <p className="text-xs text-slate-400 mt-1">By {campaign.createdBy?.name || 'Unknown'}</p>
            </div>
            <Badge variant={getStatusColor(campaign.status)} className="text-xs ml-2 shrink-0">
              {getStatusLabel(campaign.status)}
            </Badge>
          </div>

          {/* Description */}
          {campaign.description && (
            <p className="text-xs text-slate-300 line-clamp-2">{campaign.description}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Campaign Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Reward */}
            <div className="bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/30">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={14} className="text-green-400" />
                <p className="text-xs font-medium text-slate-400">Reward</p>
              </div>
              <p className="text-base font-bold text-green-400">
                ${campaign.rewardPerClip || 0}
              </p>
            </div>

            {/* Submissions */}
            <div className="bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/30">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={14} className="text-yellow-400" />
                <p className="text-xs font-medium text-slate-400">Submitted</p>
              </div>
              <p className="text-base font-bold text-yellow-400">
                {campaign.submissionsCount || 0}
              </p>
            </div>

            {/* Dates */}
            <div className="col-span-2 bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/30">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={14} className="text-cyan-400" />
                <p className="text-xs font-medium text-slate-400">Duration</p>
              </div>
              <p className="text-xs text-slate-300">
                {new Date(campaign.startDate).toLocaleDateString()} to{' '}
                {new Date(campaign.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Campaign Stats */}
          {campaign.totalClips !== undefined && (
            <div className="bg-linear-to-r from-purple-500/10 to-pink-500/5 rounded-lg p-2.5 border border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <Target size={16} className="text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Campaign Goal</p>
                  <p className="text-xs font-medium text-white">
                    {campaign.totalClips} clips needed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Participants */}
          {campaign.joinedCount !== undefined && (
            <div className="flex items-center gap-2 px-2.5 py-2 bg-slate-800/30 rounded-lg border border-slate-700/30 text-xs">
              <Users size={14} className="text-blue-400 shrink-0" />
              <span className="text-slate-300">
                {campaign.joinedCount} clippers joined
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.location.href = `/dashboard/clipper/campaigns/${campaign._id}`}
            >
              Details
            </Button>
            {campaign.status === 'active' && (
              <Button size="sm" className="flex-1">
                Submit
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Campaigns</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Campaigns you have joined and are clipping for</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : (
          <div>
            {filteredCampaigns.length === 0 ? (
              <Card className="text-center py-12 bg-linear-to-br from-slate-900/60 to-slate-950/60">
                <Target size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="text-base font-medium text-slate-400">No campaigns found</h3>
                <p className="text-slate-500 text-xs mt-1">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Join a campaign to start submitting clips'}
                </p>
                <Button 
                  size="sm"
                  className="mt-4"
                  onClick={() => window.location.href = '/dashboard/clipper/campaigns'}
                >
                  Browse Campaigns
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampaigns.map((campaign, index) => (
                  <CampaignCard key={campaign._id} campaign={campaign} index={index} />
                ))}
              </div>
            )}

            {/* Results Count */}
            {filteredCampaigns.length > 0 && (
              <div className="mt-4 text-center text-slate-400 text-xs">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
