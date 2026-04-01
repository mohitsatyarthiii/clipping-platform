// app/dashboard/brand/campaigns/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch, useDelete } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Users, 
  DollarSign,
  Calendar,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BrandCampaignsPage() {
  useProtectedRoute('brand');
  const { data, loading, refetch } = useFetch('/campaigns?createdByMe=true');
  const { del } = useDelete();

  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const campaigns = data?.campaigns || [];
  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(campaignId);
      await del(`/campaigns/${campaignId}`);
      toast.success('Campaign deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      paused: 'warning',
      completed: 'default',
      inactive: 'default'
    };
    return variants[status] || 'default';
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">My Campaigns</h1>
            <p className="text-gray-400 mt-1">Manage and track all your campaigns</p>
          </div>
          <Link href="/dashboard/brand/campaigns/new">
            <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500">
              <Plus size={20} /> New Campaign
            </Button>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/20">
            <p className="text-gray-400 text-sm">Total Campaigns</p>
            <p className="text-2xl font-bold text-white">{campaigns.length}</p>
          </Card>
          <Card className="bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20">
            <p className="text-gray-400 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-400">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/20">
            <p className="text-gray-400 text-sm">Total Creators</p>
            <p className="text-2xl font-bold text-purple-400">
              {campaigns.reduce((sum, c) => sum + (c.creators?.length || 0), 0)}
            </p>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20">
            <p className="text-gray-400 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-yellow-400">
              ${campaigns.reduce((sum, c) => sum + (c.metrics?.totalEarningsPaid || 0), 0).toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search campaigns by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400 text-lg">No campaigns found</p>
            <p className="text-gray-500 text-sm mt-1">
              {search ? 'Try a different search term' : 'Create your first campaign to get started'}
            </p>
            {!search && (
              <Link href="/dashboard/brand/campaigns/new">
                <Button className="mt-4 gap-2">
                  <Plus size={16} /> Create Campaign
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-cyan-500/50 transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white">{campaign.title}</h3>
                        <Badge variant={getStatusBadge(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        {campaign.sourceLinks && campaign.sourceLinks.length > 0 && (
                          <Badge variant="info" className="gap-1">
                            📎 {campaign.sourceLinks.length} source links
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{campaign.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Payout Rate</p>
                          <p className="text-sm font-semibold text-cyan-400">${campaign.payoutPer1000Views}/1K</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Creators</p>
                          <p className="text-sm font-semibold text-white flex items-center gap-1">
                            <Users size={14} /> {campaign.creators?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Views</p>
                          <p className="text-sm font-semibold text-white">
                            {(campaign.creators?.reduce((sum, c) => sum + (c.stats?.views || 0), 0) || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">End Date</p>
                          <p className="text-sm font-semibold text-white flex items-center gap-1">
                            <Calendar size={12} />
                            {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/brand/campaigns/${campaign._id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye size={16} /> View
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(campaign._id)}
                        disabled={deletingId === campaign._id}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}