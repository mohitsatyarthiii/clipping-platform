'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch, usePost, usePut } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { ArrowLeft, ExternalLink, CheckCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/authStore';

export default function CreatorCampaignDetailPage() {
  useProtectedRoute('creator');
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const campaignId = params?.id;

  const { data: campaign, loading, refetch } = useFetch(campaignId ? `/campaigns/${campaignId}` : null);
  const { post, loading: isJoining } = usePost();
  const { put } = usePut();

  const [isJoined, setIsJoined] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [linksFormData, setLinksFormData] = useState({
    youtube: '',
    tiktok: '',
    instagram: '',
    twitter: '',
    other: '',
  });

  useEffect(() => {
    if (campaign?.campaign) {
      const creatorInCampaign = campaign.campaign.creators?.find(
        (c) => c.creatorId?._id === user?.id
      );
      setIsJoined(!!creatorInCampaign);
      if (creatorInCampaign?.platformLinks) {
        setLinksFormData(creatorInCampaign.platformLinks);
      }
    }
  }, [campaign, user?.id]);

  const handleJoinCampaign = async () => {
    // Just show modal to get platform links - don't POST yet
    setShowLinksModal(true);
  };

  const handleSaveLinks = async () => {
    try {
      if (!Object.values(linksFormData).some((v) => v.trim())) {
        toast.error('Please add at least one platform link');
        return;
      }

      if (!isJoined) {
        // Join campaign with platform links
        await post(`/campaigns/${campaignId}/join`, {
          platformLinks: linksFormData,
        });
        toast.success('Successfully joined campaign!');
      } else {
        // Update platform links if already joined
        await put(`/campaigns/${campaignId}/creators/${user?.id}`, {
          action: 'update-links',
          platformLinks: linksFormData,
        });
        toast.success('Platform links updated successfully!');
      }

      setShowLinksModal(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save links');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <Skeleton className="h-32 mb-8" />
          <Skeleton className="h-96 mb-8" />
          <Skeleton className="h-48" />
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign?.campaign) {
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
  const brandName = campaignData.createdBy?.name || 'Unknown Brand';
  const activeCreators = campaignData.creators?.filter((c) => c.status === 'active') || [];

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
            <p className="text-gray-400 mt-1">By {brandName}</p>
          </div>
          <Badge variant={campaignData.status === 'active' ? 'success' : 'default'}>
            {campaignData.status}
          </Badge>
        </div>

        {/* Campaign Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Payout per 1K Views</h3>
            <p className="text-3xl font-bold text-cyan-400">${campaignData.payoutPer1000Views}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Campaign Period</h3>
            <div className="space-y-1 text-sm">
              <p className="text-white">{new Date(campaignData.startDate).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">to</p>
              <p className="text-white">{new Date(campaignData.endDate).toLocaleDateString()}</p>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Participating Creators</h3>
            <p className="text-3xl font-bold text-white">{activeCreators.length}</p>
          </Card>
        </div>

        {/* Campaign Description */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">About This Campaign</h2>
          <p className="text-gray-300 leading-relaxed mb-6">{campaignData.description}</p>
          {campaignData.rules && (
            <>
              <h3 className="text-lg font-semibold text-white mb-3">Campaign Rules & Guidelines</h3>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                <p className="text-gray-300 whitespace-pre-wrap text-sm">{campaignData.rules}</p>
              </div>
            </>
          )}
        </Card>

        {/* Join Campaign Section */}
        {!isJoined && (
          <Card className="mb-8 border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to earn money?</h3>
                <p className="text-gray-400">
                  Join this campaign to start uploading your content and get paid based on views!
                </p>
              </div>
              <Button
                onClick={handleJoinCampaign}
                disabled={isJoining}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500 whitespace-nowrap"
              >
                {isJoining ? 'Joining...' : 'Join Campaign'}
              </Button>
            </div>
          </Card>
        )}

        {/* Your Links Section */}
        {isJoined && (
          <Card className="mb-8 border border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-400 mt-1" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-green-400">You're in this campaign!</h3>
                  <p className="text-gray-400 text-sm">
                    {Object.values(linksFormData).some((v) => v)
                      ? 'Your platform links are set up and tracking views.'
                      : 'Add your platform links to start tracking views and earning money.'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowLinksModal(true)}
                className="gap-2 text-cyan-400 hover:text-cyan-300"
                variant="ghost"
              >
                <Plus size={16} /> {Object.values(linksFormData).some((v) => v) ? 'Edit' : 'Add'} Links
              </Button>
            </div>
          </Card>
        )}

        {/* Platform Links Display */}
        {isJoined && Object.values(linksFormData).some((v) => v) && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Your Active Platform Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linksFormData.youtube && (
                <a
                  href={linksFormData.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-red-500/30 rounded-lg hover:border-red-500/60 transition-all bg-red-500/5 hover:bg-red-500/10 flex items-center justify-between group"
                >
                  <span className="text-white font-semibold">YouTube</span>
                  <ExternalLink size={18} className="text-red-400 group-hover:text-red-300" />
                </a>
              )}
              {linksFormData.tiktok && (
                <a
                  href={linksFormData.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-white/30 rounded-lg hover:border-white/60 transition-all bg-white/5 hover:bg-white/10 flex items-center justify-between group"
                >
                  <span className="text-white font-semibold">TikTok</span>
                  <ExternalLink size={18} className="text-white/70 group-hover:text-white" />
                </a>
              )}
              {linksFormData.instagram && (
                <a
                  href={linksFormData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-pink-500/30 rounded-lg hover:border-pink-500/60 transition-all bg-pink-500/5 hover:bg-pink-500/10 flex items-center justify-between group"
                >
                  <span className="text-white font-semibold">Instagram</span>
                  <ExternalLink size={18} className="text-pink-400 group-hover:text-pink-300" />
                </a>
              )}
              {linksFormData.twitter && (
                <a
                  href={linksFormData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-blue-500/30 rounded-lg hover:border-blue-500/60 transition-all bg-blue-500/5 hover:bg-blue-500/10 flex items-center justify-between group"
                >
                  <span className="text-white font-semibold">Twitter / X</span>
                  <ExternalLink size={18} className="text-blue-400 group-hover:text-blue-300" />
                </a>
              )}
              {linksFormData.other && (
                <a
                  href={linksFormData.other}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-purple-500/30 rounded-lg hover:border-purple-500/60 transition-all bg-purple-500/5 hover:bg-purple-500/10 flex items-center justify-between group"
                >
                  <span className="text-white font-semibold">Other Platform</span>
                  <ExternalLink size={18} className="text-purple-400 group-hover:text-purple-300" />
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Top Performers */}
        {activeCreators.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold text-white mb-6">Top Performers in This Campaign</h2>
            <div className="space-y-3">
              {activeCreators
                .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
                .slice(0, 10)
                .map((creator, index) => (
                  <motion.div
                    key={creator.creatorId?._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 rounded-full text-cyan-400 font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{creator.creatorId?.name}</p>
                          <p className="text-xs text-gray-400">{creator.creatorId?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {(creator.stats?.views || 0).toLocaleString()} views
                        </p>
                        <p className="text-xs text-green-400">
                          ${(creator.earnings?.total || 0).toFixed(2)} earned
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </Card>
        )}

        {/* Links Modal */}
        <Modal
          isOpen={showLinksModal}
          onClose={() => setShowLinksModal(false)}
          title="Add/Update Your Platform Links"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Add your content platform links. Views from these links will be tracked and converted to earnings.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
              <Input
                type="url"
                placeholder="https://youtube.com/@yourname"
                value={linksFormData.youtube}
                onChange={(e) => setLinksFormData({ ...linksFormData, youtube: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TikTok URL</label>
              <Input
                type="url"
                placeholder="https://tiktok.com/@yourname"
                value={linksFormData.tiktok}
                onChange={(e) => setLinksFormData({ ...linksFormData, tiktok: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
              <Input
                type="url"
                placeholder="https://instagram.com/yourname"
                value={linksFormData.instagram}
                onChange={(e) => setLinksFormData({ ...linksFormData, instagram: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Twitter / X URL</label>
              <Input
                type="url"
                placeholder="https://twitter.com/yourname"
                value={linksFormData.twitter}
                onChange={(e) => setLinksFormData({ ...linksFormData, twitter: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Other Platform URL</label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={linksFormData.other}
                onChange={(e) => setLinksFormData({ ...linksFormData, other: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700/30">
              <Button variant="ghost" onClick={() => setShowLinksModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveLinks}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500"
              >
                Save Platform Links
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
