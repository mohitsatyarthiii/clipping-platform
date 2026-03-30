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
import { Plus, TrendingUp, Award, Upload, Eye, Film, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const StatMetric = ({ icon: Icon, label, value, change, color = 'cyan' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className={`relative overflow-hidden bg-linear-to-br from-${color}-500/10 to-${color}-600/5 border border-${color}-500/20 rounded-xl p-4 hover:border-${color}-500/40 transition-all duration-300 group`}>
      <div className={`absolute inset-0 bg-linear-to-r from-${color}-500/0 via-${color}-500/5 to-${color}-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 bg-${color}-500/20 rounded-lg group-hover:scale-110 transition-transform`}>
            <Icon className={`w-5 h-5 text-${color}-400`} />
          </div>
          {change && (
            <Badge variant="success" className="text-xs">{change}↑</Badge>
          )}
        </div>
        <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  </motion.div>
);

export default function CreatorDashboardPage() {
  useProtectedRoute('creator');
  const { data, loading, refetch } = useFetch('/dashboard/creator');
  const { post } = usePost();
  const user = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ youtubeUrl: '', title: '' });

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      await post('/source-content', formData);
      refetch();
      setIsModalOpen(false);
      setFormData({ youtubeUrl: '', title: '' });
      toast.success('Content added successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const dashboard = data?.dashboard || {};
  const sourceContents = dashboard.sourceContents || [];
  const totalViewsFromClips = dashboard.totalViewsFromClips || 0;
  const sourceContentCount = dashboard.sourceContentCount || 0;
  const topClips = dashboard.topClips || [];
  const earnings = dashboard.earnings || 0;

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="bg-linear-to-r from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Welcome back, <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name.split(' ')[0]}</span>
                </h1>
                <p className="text-slate-400 text-sm">Manage your content and track performance across all campaigns.</p>
              </div>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 whitespace-nowrap">
                <Plus size={16} /> Add Content
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </>
            ) : (
              <>
                <StatMetric
                  icon={Upload}
                  label="Source Videos"
                  value={sourceContentCount}
                  change="+2"
                  color="cyan"
                />
                <StatMetric
                  icon={Eye}
                  label="Total Views"
                  value={totalViewsFromClips.toLocaleString()}
                  change="+15%"
                  color="blue"
                />
                <StatMetric
                  icon={Award}
                  label="Earnings"
                  value={`$${earnings.toFixed(2)}`}
                  change="+8%"
                  color="green"
                />
                <StatMetric
                  icon={Film}
                  label="Active Clips"
                  value={topClips.length}
                  change="+3"
                  color="purple"
                />
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-linear-to-br from-slate-900/60 to-slate-950/60 border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Your Source Content</h2>
                <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg">{sourceContents.length}</span>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : sourceContents.length === 0 ? (
                <div className="text-center py-8">
                  <Film size={40} className="mx-auto text-slate-500 mb-3" />
                  <p className="text-slate-400 text-sm">No source content yet</p>
                  <p className="text-slate-500 text-xs mt-1">Add your first YouTube video to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sourceContents.map((content, index) => (
                    <motion.div
                      key={content._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-500/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm truncate">{content.title || 'Untitled'}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {content.clipsCount || 0} clips • {content.totalViews?.toLocaleString?.() || 0} views
                          </p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0 ml-3" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            {/* Quick Stats Card */}
            <Card className="bg-linear-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-xs font-medium mb-1">This Month</p>
                  <h3 className="text-2xl font-bold text-white">${earnings.toFixed(2)}</h3>
                </div>
                <div className="p-2 bg-green-500/15 rounded-lg">
                  <Award className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-700/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Growth</span>
                  <span className="text-green-400 font-semibold">+8%</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-green-500 to-emerald-500 w-3/4" />
                </div>
              </div>
            </Card>

            {/* Activity Card */}
            <Card className="bg-linear-to-br from-slate-900/60 to-slate-950/60 border-slate-700/50">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/30">
                <Activity size={16} className="text-cyan-400" />
                <p className="text-slate-400 text-xs font-medium">Platform Activity</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Views</span>
                  <span className="font-semibold text-white">{totalViewsFromClips.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Active Clips</span>
                  <span className="font-semibold text-white">{topClips.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Engagement</span>
                  <Badge variant="success" className="text-xs">Active</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Source Content"
          description="Add a new YouTube video to your library"
        >
          <form onSubmit={handleAddContent} className="space-y-4">
            <Input
              label="Video Title"
              type="text"
              placeholder="Enter video title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              label="YouTube URL"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
            />
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Video</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
