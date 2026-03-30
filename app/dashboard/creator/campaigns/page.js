'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useAuthStore } from '@/lib/stores/authStore';
import { useFetch, usePost } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';
import { Plus, Search, ExternalLink, Play, TrendingUp, DollarSign, Users, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CreatorCampaignsPage() {
  useProtectedRoute('creator');
  const { data: allCampaigns, loading: allLoading, refetch: refetchAll } = useFetch('/campaigns?status=active');
  const { data: myCampaigns, loading: myLoading, refetch: refetchMy } = useFetch('/campaigns/my-campaigns');
  const { data: earnings, loading: earningsLoading } = useFetch('/creator/earnings');
  const { post } = usePost();
  const user = useAuthStore((state) => state.user);

  const [search, setSearch] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [platformLinks, setPlatformLinks] = useState({
    youtube: '',
    tiktok: '',
    instagram: '',
    twitter: '',
    other: '',
  });
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinCampaign = async () => {
    if (!selectedCampaign) return;
    
    // Validate at least one link
    if (!Object.values(platformLinks).some(link => link?.trim())) {
      toast.error('Please add at least one platform link');
      return;
    }

    try {
      setIsJoining(true);
      await post(`/campaigns/${selectedCampaign._id}/join`, { platformLinks });
      toast.success('Successfully joined campaign!');
      setPlatformLinks({ youtube: '', tiktok: '', instagram: '', twitter: '', other: '' });
      setIsJoinModalOpen(false);
      setSelectedCampaign(null);
      refetchAll();
      refetchMy();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join campaign');
      console.error('Error:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const campaigns = allCampaigns?.campaigns || [];
  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const joinedCampaigns = myCampaigns?.campaigns || [];
  const totalEarnings = earnings?.totalEarnings || 0;
  const pendingEarnings = earnings?.pendingEarnings || 0;

  // Available campaigns (not yet joined)
  const availableCampaigns = filteredCampaigns.filter(
    camp => !joinedCampaigns.some(j => j._id === camp._id)
  );

  const tabs = [
    {
      label: 'Join Campaigns',
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

          {allLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : availableCampaigns.length === 0 ? (
            <Card className="text-center py-12">
              <Video size={48} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">No available campaigns to join</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col hover:border-cyan-500/50 transition-all">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{campaign.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">By {campaign.createdBy?.name || 'Unknown'}</p>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">{campaign.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-gray-700/30">
                      <div>
                        <p className="text-xs text-gray-400">Payout Rate</p>
                        <p className="text-base font-semibold text-cyan-400">${campaign.payoutPer1000Views}/1K views</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Creators</p>
                        <p className="text-base font-semibold text-white">{campaign.creators?.length || 0}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setIsJoinModalOpen(true);
                      }}
                      className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 mt-auto gap-2"
                    >
                      <Plus size={18} /> Join Campaign
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'My Campaigns',
      content: (
        <div className="space-y-6">
          {myLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : joinedCampaigns.length === 0 ? (
            <Card className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">You haven't joined any campaigns yet</p>
              <p className="text-gray-500 text-sm mt-1">Join a campaign to start earning</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {joinedCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{campaign.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">By {campaign.createdBy?.name}</p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                        {campaign.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-300 mb-4">{campaign.description}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-700/30">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Payout Rate</p>
                        <p className="text-lg font-bold text-cyan-400">${campaign.payoutPer1000Views}/1K</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Your Views</p>
                        <p className="text-lg font-bold text-white">{campaign.yourStats?.views || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Pending Earning</p>
                        <p className="text-lg font-bold text-green-400">${campaign.yourStats?.pendingEarnings || 0}</p>
                      </div>
                    </div>

                    {campaign.platformLinks && (
                      <div className="bg-gray-800/30 rounded p-3 text-sm">
                        <p className="text-gray-400 mb-2">Your Platform Links:</p>
                        <div className="space-y-1">
                          {campaign.platformLinks.youtube && (
                            <a href={campaign.platformLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-xs">
                              <Play size={14} /> YouTube
                            </a>
                          )}
                          {campaign.platformLinks.tiktok && (
                            <a href={campaign.platformLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-xs">
                              <Video size={14} /> TikTok
                            </a>
                          )}
                          {campaign.platformLinks.instagram && (
                            <a href={campaign.platformLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-xs">
                              📷 Instagram
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Earnings',
      content: (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-4xl font-bold text-green-400 mt-2">${totalEarnings.toFixed(2)}</p>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20">
              <p className="text-gray-400 text-sm">Pending Earnings</p>
              <p className="text-4xl font-bold text-yellow-400 mt-2">${pendingEarnings.toFixed(2)}</p>
            </Card>
          </div>

          {/* Earnings Breakdown */}
          {earningsLoading ? (
            <Skeleton className="h-96" />
          ) : earnings?.bycampaign && earnings.bycampaign.length > 0 ? (
            <Card className="overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-4">Earnings by Campaign</h3>
              <div className="space-y-2">
                {earnings.byCamera.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                    <div>
                      <p className="font-medium text-white">{item.campaignName}</p>
                      <p className="text-xs text-gray-400">{item.views} views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">${item.earnings.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">${item.pendingEarnings.toFixed(2)} pending</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <DollarSign size={48} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">No earnings yet</p>
              <p className="text-gray-500 text-sm mt-1">Join a campaign and reach viewers to start earning</p>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Campaigns & Earnings</h1>
          <p className="text-gray-400 mt-1">Join campaigns, track views, and manage your earnings</p>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} defaultTab={0} />

        {/* Join Campaign Modal */}
        <Modal
          isOpen={isJoinModalOpen}
          onClose={() => {
            setIsJoinModalOpen(false);
            setSelectedCampaign(null);
            setPlatformLinks({ youtube: '', tiktok: '', instagram: '', twitter: '', other: '' });
          }}
          title={`Join: ${selectedCampaign?.title || 'Campaign'}`}
        >
          {selectedCampaign && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                <p className="text-sm text-gray-300 mb-2">{selectedCampaign.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">${selectedCampaign.payoutPer1000Views}/1K views</Badge>
                  <Badge variant="secondary">{selectedCampaign.creators?.length || 0} creators</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3">Add Your Platform Links</h3>
                <p className="text-sm text-gray-400 mb-4">Add links to your content where you'll post campaign content</p>

                <div className="space-y-3">
                  <Input
                    label="YouTube Channel/Video"
                    placeholder="https://youtube.com/..."
                    value={platformLinks.youtube}
                    onChange={(e) => setPlatformLinks({ ...platformLinks, youtube: e.target.value })}
                  />
                  <Input
                    label="TikTok Profile"
                    placeholder="https://tiktok.com/@..."
                    value={platformLinks.tiktok}
                    onChange={(e) => setPlatformLinks({ ...platformLinks, tiktok: e.target.value })}
                  />
                  <Input
                    label="Instagram Profile"
                    placeholder="https://instagram.com/..."
                    value={platformLinks.instagram}
                    onChange={(e) => setPlatformLinks({ ...platformLinks, instagram: e.target.value })}
                  />
                  <Input
                    label="Twitter Profile"
                    placeholder="https://twitter.com/..."
                    value={platformLinks.twitter}
                    onChange={(e) => setPlatformLinks({ ...platformLinks, twitter: e.target.value })}
                  />
                  <Input
                    label="Other Link"
                    placeholder="https://..."
                    value={platformLinks.other}
                    onChange={(e) => setPlatformLinks({ ...platformLinks, other: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
                Add at least one platform link. You can add more later!
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-700/30">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsJoinModalOpen(false);
                    setSelectedCampaign(null);
                  }}
                  disabled={isJoining}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJoinCampaign}
                  disabled={isJoining || !Object.values(platformLinks).some(link => link?.trim())}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-500 gap-2"
                >
                  {isJoining ? 'Joining...' : 'Join Campaign'}
                  {!isJoining && <ExternalLink size={16} />}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
