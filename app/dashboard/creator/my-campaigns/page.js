// app/dashboard/creator/my-campaigns/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/stores/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import {
  Search,
  DollarSign,
  Eye,
  TrendingUp,
  Calendar,
  Download,
  ExternalLink,
  Video,
  Music,
  FileText,
  Image,
  Globe,
  Play,
  Clock,
  Award,
  Users,
  Link2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CreatorMyCampaignsPage() {
  useProtectedRoute('creator');
  const { user } = useAuthStore();
  const { data, loading, refetch } = useFetch('/campaigns?joinedByMe=true');
  
  const [search, setSearch] = useState('');
  const [selectedSourceLink, setSelectedSourceLink] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const campaigns = data?.campaigns || [];
  
  // Filter campaigns by search
  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(search.toLowerCase())
  );

  // Get creator's stats for a campaign
  const getCreatorStats = (campaign) => {
    const creatorData = campaign.creators?.find(
      c => c.creatorId?._id === user?.id
    );
    return {
      views: creatorData?.stats?.views || 0,
      earnings: creatorData?.earnings?.total || 0,
      pending: creatorData?.earnings?.pending || 0,
      joinedAt: creatorData?.joinedAt,
      platformLinks: creatorData?.platformLinks || {},
      status: creatorData?.status || 'active'
    };
  };

  // Calculate total earnings across all campaigns
  const totalEarnings = campaigns.reduce((sum, campaign) => {
    const stats = getCreatorStats(campaign);
    return sum + stats.earnings;
  }, 0);

  const totalViews = campaigns.reduce((sum, campaign) => {
    const stats = getCreatorStats(campaign);
    return sum + stats.views;
  }, 0);

  const activeCampaigns = campaigns.filter(campaign => {
    const stats = getCreatorStats(campaign);
    return stats.status === 'active' && campaign.status === 'active';
  }).length;

  const handleDownload = async (url, title) => {
    try {
      toast.info(`Preparing to download ${title}...`);
      // Open in new tab for download
      window.open(url, '_blank');
      toast.success(`Opening ${title} for download`);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const getSourceIcon = (type) => {
    const icons = {
      video: Video,
      audio: Music,
      document: FileText,
      image: Image,
      other: Globe
    };
    const Icon = icons[type] || Globe;
    return <Icon size={20} />;
  };

  const getSourceColor = (type) => {
    const colors = {
      video: 'from-red-500/20 to-red-600/10 border-red-500/30',
      audio: 'from-green-500/20 to-green-600/10 border-green-500/30',
      document: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
      image: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
      other: 'from-gray-500/20 to-gray-600/10 border-gray-500/30'
    };
    return colors[type] || colors.other;
  };

  // Stats Cards
  const stats = [
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'cyan'
    },
    {
      label: 'Active Campaigns',
      value: activeCampaigns,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      label: 'Joined Campaigns',
      value: campaigns.length,
      icon: Users,
      color: 'yellow'
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      green: 'from-green-500/10 to-green-600/5 border-green-500/20',
      cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20',
      purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
      yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20'
    };
    return colors[color];
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">My Campaigns</h1>
          <p className="text-gray-400 mt-1">
            Track your performance, earnings, and access source content
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-br ${getColorClass(stat.color)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                      <Icon size={24} className={`text-${stat.color}-400`} />
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
              placeholder="Search your campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400 text-lg">No campaigns joined yet</p>
            <p className="text-gray-500 text-sm mt-1">
              {search ? 'Try a different search term' : 'Browse and join campaigns to start earning'}
            </p>
            {!search && (
              <Link href="/dashboard/creator/campaigns">
                <Button className="mt-4 gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500">
                  Browse Campaigns
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredCampaigns.map((campaign, index) => {
              const stats = getCreatorStats(campaign);
              return (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:border-cyan-500/50 transition-all">
                    {/* Campaign Header */}
                    <div className="p-6 border-b border-gray-700/30 bg-gradient-to-r from-gray-800/50 to-transparent">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl font-bold text-white">{campaign.title}</h2>
                            <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="info" className="gap-1">
                              <CheckCircle size={12} /> Joined
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            By {campaign.createdBy?.name || 'Unknown Brand'}
                          </p>
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                            {campaign.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Payout Rate</p>
                          <p className="text-xl font-bold text-cyan-400">
                            ${campaign.payoutPer1000Views}/1K views
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-700/30">
                      <div className="text-center p-3 bg-green-500/5 rounded-lg">
                        <p className="text-xs text-gray-400">Your Views</p>
                        <p className="text-2xl font-bold text-white">{stats.views.toLocaleString()}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Eye size={12} className="text-green-400" />
                          <span className="text-xs text-green-400">Total</span>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-yellow-500/5 rounded-lg">
                        <p className="text-xs text-gray-400">Earned</p>
                        <p className="text-2xl font-bold text-green-400">${stats.earnings.toFixed(2)}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <DollarSign size={12} className="text-green-400" />
                          <span className="text-xs text-green-400">Total Earned</span>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-500/5 rounded-lg">
                        <p className="text-xs text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-yellow-400">${stats.pending.toFixed(2)}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Clock size={12} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400">Awaiting</span>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/5 rounded-lg">
                        <p className="text-xs text-gray-400">Joined</p>
                        <p className="text-sm font-semibold text-white mt-2">
                          {stats.joinedAt ? new Date(stats.joinedAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Calendar size={12} className="text-purple-400" />
                          <span className="text-xs text-purple-400">Member since</span>
                        </div>
                      </div>
                    </div>

                    {/* Source Content Links - For downloading clips */}
                    {campaign.sourceLinks && campaign.sourceLinks.length > 0 && (
                      <div className="p-6 border-b border-gray-700/30">
                        <div className="flex items-center gap-2 mb-4">
                          <Link2 size={18} className="text-cyan-400" />
                          <h3 className="text-lg font-semibold text-white">Source Content</h3>
                          <Badge variant="info" className="text-xs">
                            {campaign.sourceLinks.length} {campaign.sourceLinks.length === 1 ? 'link' : 'links'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                          Download or preview these source files to create your clips:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {campaign.sourceLinks.map((link, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg border bg-gradient-to-br ${getSourceColor(link.type)} hover:scale-105 transition-transform cursor-pointer group`}
                              onClick={() => {
                                setSelectedSourceLink(link);
                                setIsPreviewModalOpen(true);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-black/30 rounded-lg">
                                  {getSourceIcon(link.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                                    {link.title}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {link.description || 'No description'}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-cyan-400 capitalize">
                                      {link.type}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-0 h-auto text-cyan-400 hover:text-cyan-300"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(link.url, link.title);
                                      }}
                                    >
                                      <Download size={14} className="mr-1" /> Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Platform Links */}
                    {Object.values(stats.platformLinks).some(v => v) && (
                      <div className="p-6 border-b border-gray-700/30">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Your Active Platform Links</h3>
                        <div className="flex flex-wrap gap-3">
                          {stats.platformLinks.youtube && (
                            <a
                              href={stats.platformLinks.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Play size={14} /> YouTube
                            </a>
                          )}
                          {stats.platformLinks.tiktok && (
                            <a
                              href={stats.platformLinks.tiktok}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                            >
                              <Video size={14} /> TikTok
                            </a>
                          )}
                          {stats.platformLinks.instagram && (
                            <a
                              href={stats.platformLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-pink-500/10 rounded-lg text-pink-400 hover:bg-pink-500/20 transition-colors"
                            >
                              📷 Instagram
                            </a>
                          )}
                          {stats.platformLinks.twitter && (
                            <a
                              href={stats.platformLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                            >
                              🐦 Twitter
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="p-6 flex gap-3">
                      <Link href={`/dashboard/creator/campaigns/${campaign._id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          <Eye size={16} /> View Details
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="gap-2 text-cyan-400"
                        onClick={() => {
                          // Open update links modal or navigate to edit
                          toast.info('Use campaign details page to update your links');
                        }}
                      >
                        <ExternalLink size={16} /> Update Links
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Preview Modal for Source Content */}
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedSourceLink(null);
          }}
          title={selectedSourceLink?.title || 'Preview Content'}
          size="lg"
        >
          {selectedSourceLink && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  {getSourceIcon(selectedSourceLink.type)}
                  <div>
                    <p className="font-semibold text-white">{selectedSourceLink.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{selectedSourceLink.type}</p>
                  </div>
                </div>
                
                {selectedSourceLink.description && (
                  <p className="text-sm text-gray-300 mb-4">{selectedSourceLink.description}</p>
                )}

                {/* Preview based on type */}
                {selectedSourceLink.type === 'video' && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={selectedSourceLink.url}
                      controls
                      className="w-full h-full"
                      controlsList="nodownload"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {selectedSourceLink.type === 'image' && (
                  <div className="flex justify-center bg-black/30 rounded-lg p-4">
                    <img
                      src={selectedSourceLink.url}
                      alt={selectedSourceLink.title}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                )}

                {selectedSourceLink.type === 'audio' && (
                  <div className="bg-black/30 rounded-lg p-6">
                    <audio controls className="w-full">
                      <source src={selectedSourceLink.url} />
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                )}

                {(selectedSourceLink.type === 'document' || selectedSourceLink.type === 'other') && (
                  <div className="bg-gray-900/50 rounded-lg p-6 text-center">
                    <FileText size={48} className="mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400 mb-4">Document preview not available</p>
                    <Button
                      onClick={() => handleDownload(selectedSourceLink.url, selectedSourceLink.title)}
                      className="gap-2"
                    >
                      <Download size={16} /> Download File
                    </Button>
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-700/30">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsPreviewModalOpen(false);
                      setSelectedSourceLink(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleDownload(selectedSourceLink.url, selectedSourceLink.title)}
                    className="gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500"
                  >
                    <Download size={16} /> Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}