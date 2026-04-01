'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch, usePut } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { ArrowLeft, Eye, Edit2, Trash2, Ban, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BrandCampaignDetailPage() {
  useProtectedRoute('brand');
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id;

  const { data: campaign, loading, refetch } = useFetch(campaignId ? `/campaigns/${campaignId}` : null);
  const { put } = usePut();

  const [viewMode, setViewMode] = useState('view'); // 'view' or 'edit'
  const [editingCreatorId, setEditingCreatorId] = useState(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linksFormData, setLinksFormData] = useState({
    youtube: '',
    tiktok: '',
    instagram: '',
    twitter: '',
    other: '',
  });

  const handleEditLinks = (creator) => {
    setViewMode('edit');
    setEditingCreatorId(creator.creatorId?._id);
    setLinksFormData({
      youtube: creator.platformLinks?.youtube || '',
      tiktok: creator.platformLinks?.tiktok || '',
      instagram: creator.platformLinks?.instagram || '',
      twitter: creator.platformLinks?.twitter || '',
      other: creator.platformLinks?.other || '',
    });
    setShowLinksModal(true);
  };

  const handleSaveLinks = async () => {
    if (!editingCreatorId) return;

    try {
      setIsSubmitting(true);
      await put(`/campaigns/${campaignId}/creators/${editingCreatorId}`, {
        action: 'update-links',
        platformLinks: linksFormData,
      });
      toast.success('Creator links updated successfully');
      setShowLinksModal(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update links');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBanCreator = async () => {
    if (!editingCreatorId) return;

    try {
      setIsSubmitting(true);
      await put(`/campaigns/${campaignId}/creators/${editingCreatorId}`, {
        action: 'ban',
        bannedReason: banReason,
      });
      toast.success('Creator banned successfully');
      setShowBanModal(false);
      setBanReason('');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to ban creator');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreCreator = async (creatorId) => {
    try {
      setIsSubmitting(true);
      await put(`/campaigns/${campaignId}/creators/${creatorId}`, {
        action: 'restore',
      });
      toast.success('Creator restored successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore creator');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCreator = async (creatorId) => {
    if (confirm('Are you sure you want to remove this creator from the campaign?')) {
      try {
        setIsSubmitting(true);
        await put(`/campaigns/${campaignId}/creators/${creatorId}`, {
          action: 'remove',
        });
        toast.success('Creator removed successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove creator');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <Skeleton className="h-32 mb-8" />
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

  if (!campaign || !campaign.campaign) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 mb-6"
          >
            <ArrowLeft size={16} /> Back
          </Button>
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

  const campaignData = campaign.campaign;
  const creators = campaignData.creators || [];
  const activeCreators = creators.filter((c) => c.status === 'active' || c.status === undefined);
  const bannedCreators = creators.filter((c) => c.status === 'banned' || c.status === 'suspended');

  // Calculate totals
  const totalViews = activeCreators.reduce((sum, c) => sum + (c.stats?.views || 0), 0);
  const totalEarnings = activeCreators.reduce((sum, c) => sum + (c.earnings?.total || 0), 0);
  const totalPending = activeCreators.reduce((sum, c) => sum + (c.earnings?.pending || 0), 0);

  // Sort creators by views (top creators)
  const topCreators = [...activeCreators].sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));

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

        {/* View/Edit Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setViewMode('view')}
            variant={viewMode === 'view' ? 'default' : 'ghost'}
            className="gap-2"
          >
            <Eye size={16} /> View
          </Button>
          <Button
            onClick={() => setViewMode('edit')}
            variant={viewMode === 'edit' ? 'default' : 'ghost'}
            className="gap-2"
          >
            <Edit2 size={16} /> Manage
          </Button>
        </div>

        {viewMode === 'view' ? (
          <>
            {/* Campaign Info */}
            <Card className="mb-8 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Campaign Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Payout Rate</p>
                  <p className="text-2xl font-bold text-cyan-400">${campaignData.payoutPer1000Views}/1K</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Creators</p>
                  <p className="text-2xl font-bold text-white">{activeCreators.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Distributed</p>
                  <p className="text-2xl font-bold text-green-400">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
              {campaignData.startDate && (
                <div className="mt-6 pt-6 border-t border-gray-700/30 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Start Date</p>
                    <p className="text-white font-semibold">{new Date(campaignData.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">End Date</p>
                    <p className="text-white font-semibold">{new Date(campaignData.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Creators Table */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Active Creators ({activeCreators.length})</h2>
              {activeCreators.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No active creators in this campaign</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/30">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Creator</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Views</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Earnings</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Pending</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCreators.map((creator, index) => (
                        <motion.tr
                          key={creator.creatorId?._id || index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-white">{creator.creatorId?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-400">{creator.creatorId?.email}</p>
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
                            <p className="text-sm text-gray-400">
                              {creator.joinedAt ? new Date(creator.joinedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Banned Creators */}
            {bannedCreators.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-white mb-6">Banned/Suspended Creators ({bannedCreators.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/30">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Creator</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Reason</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Banned At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bannedCreators.map((creator, index) => (
                        <motion.tr
                          key={creator.creatorId?._id || index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-700/30"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-white">{creator.creatorId?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-400">{creator.creatorId?.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={creator.status === 'banned' ? 'danger' : 'warning'}>
                              {creator.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-400">{creator.bannedReason || 'No reason'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-400">
                              {creator.bannedAt ? new Date(creator.bannedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        ) : (
          /* Edit Mode */
          <>
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Manage Creators</h2>
              {activeCreators.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No active creators to manage</p>
              ) : (
                <div className="space-y-4">
                  {activeCreators.map((creator, index) => (
                    <motion.div
                      key={creator.creatorId?._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border border-gray-700/30 rounded-lg hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{creator.creatorId?.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">{creator.creatorId?.email}</p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-gray-400">Views: <span className="text-white font-semibold">{(creator.stats?.views || 0).toLocaleString()}</span></span>
                            <span className="text-gray-400">Earned: <span className="text-green-400 font-semibold">${(creator.earnings?.total || 0).toFixed(2)}</span></span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLinks(creator)}
                            className="gap-2 text-cyan-400 hover:text-cyan-300"
                          >
                            <Plus size={16} /> Links
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCreatorId(creator.creatorId?._id);
                              setShowBanModal(true);
                            }}
                            className="gap-1 text-red-400 hover:text-red-300"
                          >
                            <Ban size={14} /> Ban
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCreator(creator.creatorId?._id)}
                            className="gap-1 text-orange-400 hover:text-orange-300"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Creator Links Display */}
                      {(creator.platformLinks?.youtube || creator.platformLinks?.tiktok || creator.platformLinks?.instagram || creator.platformLinks?.twitter || creator.platformLinks?.other) && (
                        <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-gray-700/30">
                          {creator.platformLinks?.youtube && (
                            <a href={creator.platformLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 text-sm">
                              YouTube
                            </a>
                          )}
                          {creator.platformLinks?.tiktok && (
                            <a href={creator.platformLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 text-sm">
                              TikTok
                            </a>
                          )}
                          {creator.platformLinks?.instagram && (
                            <a href={creator.platformLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 text-sm">
                              Instagram
                            </a>
                          )}
                          {creator.platformLinks?.twitter && (
                            <a href={creator.platformLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                              Twitter
                            </a>
                          )}
                          {creator.platformLinks?.other && (
                            <a href={creator.platformLinks.other} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm">
                              Other
                            </a>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* Links Modal */}
        <Modal
          isOpen={showLinksModal}
          onClose={() => {
            setShowLinksModal(false);
            setViewMode('view');
          }}
          title="Add/Edit Creator Platform Links"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
              <Input
                type="url"
                placeholder="https://youtube.com/@creator"
                value={linksFormData.youtube}
                onChange={(e) => setLinksFormData({ ...linksFormData, youtube: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TikTok URL</label>
              <Input
                type="url"
                placeholder="https://tiktok.com/@creator"
                value={linksFormData.tiktok}
                onChange={(e) => setLinksFormData({ ...linksFormData, tiktok: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
              <Input
                type="url"
                placeholder="https://instagram.com/creator"
                value={linksFormData.instagram}
                onChange={(e) => setLinksFormData({ ...linksFormData, instagram: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Twitter/X URL</label>
              <Input
                type="url"
                placeholder="https://twitter.com/creator"
                value={linksFormData.twitter}
                onChange={(e) => setLinksFormData({ ...linksFormData, twitter: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Other URL</label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={linksFormData.other}
                onChange={(e) => setLinksFormData({ ...linksFormData, other: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700/30">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowLinksModal(false);
                  setViewMode('view');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveLinks}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500"
              >
                {isSubmitting ? 'Saving...' : 'Save Links'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Ban Modal */}
        <Modal
          isOpen={showBanModal}
          onClose={() => {
            setShowBanModal(false);
            setBanReason('');
          }}
          title="Ban Creator from Campaign"
        >
          <div className="space-y-4">
            <p className="text-gray-400">Are you sure you want to ban this creator? They will no longer be able to participate in this campaign.</p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reason (Optional)</label>
              <Input
                type="text"
                placeholder="e.g., Violations of campaign rules"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700/30">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBanCreator}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-600 to-red-500"
              >
                {isSubmitting ? 'Banning...' : 'Confirm Ban'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
