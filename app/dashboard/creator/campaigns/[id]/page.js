// app/dashboard/creator/campaigns/[id]/page.js
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
import Textarea from '@/components/ui/Textarea';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle, 
  Plus, 
  Users, 
  DollarSign, 
  Eye, 
  Calendar,
  TrendingUp,
  Award,
  Link2,
  Clock,
  Video,
  Music,
  FileText,
  Image,
  Globe
} from 'lucide-react';
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
  const [creatorData, setCreatorData] = useState(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showSourceLinksModal, setShowSourceLinksModal] = useState(false);
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
      setCreatorData(creatorInCampaign);
      if (creatorInCampaign?.platformLinks) {
        setLinksFormData(creatorInCampaign.platformLinks);
      }
    }
  }, [campaign, user?.id]);

  const handleJoinCampaign = async () => {
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
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save links');
    }
  };

  const getLinkIcon = (type) => {
    const icons = {
      video: Video,
      audio: Music,
      document: FileText,
      image: Image,
      other: Globe
    };
    const Icon = icons[type] || Globe;
    return <Icon size={16} className="text-cyan-400" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-12 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64 mb-8" />
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
            <Button onClick={() => router.push('/dashboard/creator/campaigns')} className="mt-4">
              Browse Campaigns
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const campaignData = campaign.campaign;
  const brandName = campaignData.createdBy?.name || 'Unknown Brand';
  const activeCreators = campaignData.creators?.filter((c) => c.status === 'active') || [];
  const totalViews = activeCreators.reduce((sum, c) => sum + (c.stats?.views || 0), 0);
  const totalEarnings = activeCreators.reduce((sum, c) => sum + (c.earnings?.total || 0), 0);

  // Calculate creator's own stats if joined
  const myStats = isJoined && creatorData ? {
    views: creatorData.stats?.views || 0,
    earnings: creatorData.earnings?.total || 0,
    pending: creatorData.earnings?.pending || 0,
    joinedAt: creatorData.joinedAt
  } : null;

  return (
    <DashboardLayout>
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
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
            <p className="text-gray-400 mt-1">
              By <span className="text-cyan-400">{brandName}</span>
            </p>
          </div>
          <Badge variant={campaignData.status === 'active' ? 'success' : 'default'} size="lg">
            {campaignData.status}
          </Badge>
        </div>

        {/* Campaign Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
            <div className="flex items-center gap-3">
              <DollarSign className="text-cyan-400" size={24} />
              <div>
                <p className="text-gray-400 text-sm">Payout Rate</p>
                <p className="text-2xl font-bold text-cyan-400">${campaignData.payoutPer1000Views}/1K</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <div className="flex items-center gap-3">
              <Users className="text-purple-400" size={24} />
              <div>
                <p className="text-gray-400 text-sm">Active Creators</p>
                <p className="text-2xl font-bold text-purple-400">{activeCreators.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <div className="flex items-center gap-3">
              <Eye className="text-green-400" size={24} />
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-green-400">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
            <div className="flex items-center gap-3">
              <Award className="text-yellow-400" size={24} />
              <div>
                <p className="text-gray-400 text-sm">Total Earned</p>
                <p className="text-2xl font-bold text-yellow-400">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">About This Campaign</h2>
              <p className="text-gray-300 leading-relaxed">{campaignData.description}</p>
              
              {campaignData.rules && (
                <div className="mt-6 pt-6 border-t border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-cyan-400" />
                    Campaign Rules & Guidelines
                  </h3>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                    <p className="text-gray-300 whitespace-pre-wrap text-sm">{campaignData.rules}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Source Links - Reference for creators */}
            {campaignData.sourceLinks && campaignData.sourceLinks.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Link2 size={20} className="text-cyan-400" />
                  Source Content Links
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Use these reference links as inspiration for your content:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {campaignData.sourceLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-cyan-500/50 transition-all group"
                    >
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        {getLinkIcon(link.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                          {link.title}
                        </p>
                        {link.description && (
                          <p className="text-xs text-gray-400">{link.description}</p>
                        )}
                      </div>
                      <ExternalLink size={16} className="text-gray-500 group-hover:text-cyan-400" />
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Campaign Period */}
            <Card>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Campaign Period</h3>
              <div className="flex items-center gap-3 text-white">
                <Calendar size={18} className="text-cyan-400" />
                <div>
                  <p>{new Date(campaignData.startDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">to</p>
                  <p>{new Date(campaignData.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              {new Date(campaignData.endDate) < new Date() && (
                <Badge variant="warning" className="mt-3">Campaign Ended</Badge>
              )}
            </Card>

            {/* My Stats if joined */}
            {isJoined && myStats && (
              <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
                <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} />
                  My Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">My Views</span>
                    <span className="text-white font-semibold">{myStats.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Earned</span>
                    <span className="text-green-400 font-semibold">${myStats.earnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Pending</span>
                    <span className="text-yellow-400 font-semibold">${myStats.pending.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Joined</span>
                    <span className="text-gray-300 text-sm">
                      {new Date(myStats.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Join/Manage Section */}
            {campaignData.status === 'active' ? (
              !isJoined ? (
                <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                  <h3 className="text-xl font-bold text-white mb-2">Ready to earn?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Join this campaign to start earning ${campaignData.payoutPer1000Views} per 1,000 views!
                  </p>
                  <Button
                    onClick={handleJoinCampaign}
                    disabled={isJoining}
                    className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500"
                  >
                    {isJoining ? 'Joining...' : 'Join Campaign Now'}
                  </Button>
                </Card>
              ) : (
                <Card className="border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="text-green-400 mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-bold text-green-400">You're in this campaign!</h3>
                      <p className="text-gray-400 text-sm">
                        {Object.values(linksFormData).some((v) => v)
                          ? 'Your links are active. Views are being tracked!'
                          : 'Add your platform links to start earning.'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowLinksModal(true)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Plus size={16} /> 
                    {Object.values(linksFormData).some((v) => v) ? 'Update Links' : 'Add Links'}
                  </Button>
                </Card>
              )
            ) : (
              <Card className="border-gray-500/30 bg-gray-800/30">
                <p className="text-gray-400 text-center">
                  This campaign is no longer accepting new participants.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Platform Links Display if joined */}
        {isJoined && Object.values(linksFormData).some((v) => v) && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Link2 size={20} className="text-cyan-400" />
              Your Active Platform Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {linksFormData.youtube && (
                <a
                  href={linksFormData.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/30 rounded-lg hover:border-red-500/60 transition-all group"
                >
                  <span className="text-white font-medium">YouTube</span>
                  <ExternalLink size={16} className="text-red-400 group-hover:text-red-300" />
                </a>
              )}
              {linksFormData.tiktok && (
                <a
                  href={linksFormData.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/30 rounded-lg hover:border-white/60 transition-all group"
                >
                  <span className="text-white font-medium">TikTok</span>
                  <ExternalLink size={16} className="text-white/70 group-hover:text-white" />
                </a>
              )}
              {linksFormData.instagram && (
                <a
                  href={linksFormData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-pink-500/5 border border-pink-500/30 rounded-lg hover:border-pink-500/60 transition-all group"
                >
                  <span className="text-white font-medium">Instagram</span>
                  <ExternalLink size={16} className="text-pink-400 group-hover:text-pink-300" />
                </a>
              )}
              {linksFormData.twitter && (
                <a
                  href={linksFormData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/30 rounded-lg hover:border-blue-500/60 transition-all group"
                >
                  <span className="text-white font-medium">Twitter/X</span>
                  <ExternalLink size={16} className="text-blue-400 group-hover:text-blue-300" />
                </a>
              )}
              {linksFormData.other && (
                <a
                  href={linksFormData.other}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/30 rounded-lg hover:border-purple-500/60 transition-all group"
                >
                  <span className="text-white font-medium">Other</span>
                  <ExternalLink size={16} className="text-purple-400 group-hover:text-purple-300" />
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Top Performers Leaderboard */}
        {activeCreators.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-yellow-400" />
              Top Performers
            </h2>
            <div className="space-y-2">
              {activeCreators
                .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
                .slice(0, 10)
                .map((creator, index) => (
                  <motion.div
                    key={creator.creatorId?._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      creator.creatorId?._id === user?.id
                        ? 'bg-cyan-500/10 border border-cyan-500/30'
                        : 'bg-gray-800/30 border border-gray-700/30 hover:border-gray-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                        index < 3 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {creator.creatorId?.name}
                          {creator.creatorId?._id === user?.id && (
                            <span className="ml-2 text-xs text-cyan-400">(You)</span>
                          )}
                        </p>
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
                  </motion.div>
                ))}
            </div>
          </Card>
        )}

        {/* Links Modal */}
        <Modal
          isOpen={showLinksModal}
          onClose={() => setShowLinksModal(false)}
          title={isJoined ? "Update Your Platform Links" : "Join Campaign - Add Your Links"}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              {isJoined 
                ? "Update your platform links to continue tracking views and earnings." 
                : "Add your content platform links to join this campaign. Views from these links will be tracked automatically."}
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
                {isJoined ? 'Update & Save' : 'Join Campaign'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

// Trophy icon component
const Trophy = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);