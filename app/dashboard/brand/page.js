'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useAuthStore } from '@/lib/stores/authStore';
import { useFetch, usePost, usePut } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';
import { Plus, Search, Settings, TrendingUp, Users, DollarSign, Eye, Edit, Trash2, BarChart3, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BrandDashboardPage() {
  useProtectedRoute('brand');
  const { data: myCampaigns, loading: myLoading, refetch } = useFetch('/campaigns?createdByMe=true');
  const { post } = usePost();
  const { put } = usePut();
  const user = useAuthStore((state) => state.user);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    payoutPer1000Views: '',
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || formData.title.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    if (!formData.payoutPer1000Views || parseFloat(formData.payoutPer1000Views) <= 0) {
      toast.error('Payout rate must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        payoutPer1000Views: parseFloat(formData.payoutPer1000Views),
      };
      await post('/campaigns', payload);
      toast.success('Campaign created successfully!');
      refetch();
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        payoutPer1000Views: '',
        startDate: '',
        endDate: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const campaigns = myCampaigns?.campaigns || [];
  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalCreators = campaigns.reduce((sum, c) => sum + (c.creators?.length || 0), 0);
  const totalEarningsDistributed = campaigns.reduce((sum, c) => sum + (c.totalEarnings || 0), 0);

  const createCampaignTab = {
    label: 'Create Campaign',
    content: (
      <div className="max-w-2xl">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Launch a New Campaign</h2>
          
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Title *</label>
              <Input
                type="text"
                placeholder="e.g., Summer Collection Promo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 3 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <Textarea
                placeholder="Describe your campaign, include key messaging, target audience, and what creators should do..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payout per 1K Views (USD) *</label>
                <Input
                  type="number"
                  placeholder="5.00"
                  step="0.01"
                  min="0.01"
                  value={formData.payoutPer1000Views}
                  onChange={(e) => setFormData({ ...formData, payoutPer1000Views: e.target.value })}
                />
              </div>


            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700/30">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500 gap-2"
              >
                {isSubmitting ? 'Creating...' : 'Create Campaign'}
                {!isSubmitting && <Plus size={16} />}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    ),
  };

  const campaignListTab = {
    label: 'My Campaigns',
    content: (
      <div className="space-y-6">
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
                        <p className="text-base font-semibold text-white">{(campaign.totalViews || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Spent</p>
                        <p className="text-base font-semibold text-green-400">${(campaign.totalEarnings || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex gap-2">
                        {campaign.startDate && (
                          <span className="text-xs bg-gray-800/30 text-gray-300 px-2 py-1 rounded">
                            {new Date(campaign.startDate).toLocaleDateString()}
                          </span>
                        )}
                        {campaign.endDate && (
                          <span className="text-xs bg-gray-800/30 text-gray-300 px-2 py-1 rounded">
                            to {new Date(campaign.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                        → View Stats
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    ),
  };

  const tabs = [
    {
      label: 'Dashboard',
      content: (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
              <p className="text-gray-400 text-sm mb-2">Active Campaigns</p>
              <p className="text-4xl font-bold text-cyan-400">{activeCount}</p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <p className="text-gray-400 text-sm mb-2">Total Creators</p>
              <p className="text-4xl font-bold text-purple-400">{totalCreators}</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <p className="text-gray-400 text-sm mb-2">Total Distributed</p>
              <p className="text-4xl font-bold text-green-400">${totalEarningsDistributed.toFixed(2)}</p>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Recent Campaigns</h2>
            {myLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div
                    key={campaign._id}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{campaign.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{campaign.creators?.length || 0} creators</p>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No campaigns yet</p>
            )}
          </Card>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 gap-2"
          >
            <Plus size={18} /> Create New Campaign
          </Button>
        </div>
      ),
    },
    createCampaignTab,
    campaignListTab,
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Brand Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage campaigns, track creators, and monitor earnings</p>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} defaultTab={0} />

        {/* Create Campaign Modal - for quick creation from dashboard */}
        <Modal
          isOpen={isCreateModalOpen && !search}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Campaign"
        >
          <form onSubmit={handleCreateCampaign} className="space-y-4 max-h-96 overflow-y-auto">
            <Input
              label="Campaign Title *"
              type="text"
              placeholder="e.g., Summer Collection Promo"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              label="Description *"
              placeholder="Describe your campaign..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Payout per 1K Views (USD) *"
                type="number"
                placeholder="5.00"
                step="0.01"
                min="0.01"
                value={formData.payoutPer1000Views}
                onChange={(e) => setFormData({ ...formData, payoutPer1000Views: e.target.value })}
              />

            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700/30">
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-cyan-600 to-cyan-500">
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
