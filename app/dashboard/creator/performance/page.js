'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import {
  TrendingUp,
  Play,
  DollarSign,
  Eye,
  Heart,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PerformancePage() {
  useProtectedRoute('creator');
  const { data, loading } = useFetch('/dashboard/creator');

  const dashboard = data?.dashboard || {};
  const {
    totalViewsFromClips = 0,
    totalEarnings = 0,
    topClips = [],
    sourceContentCount = 0,
  } = dashboard;

  const StatCard = ({ icon: Icon, label, value, trend, color = 'cyan' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-linear-to-br from-${color}-500/10 to-${color}-600/5 border border-${color}-500/20 hover:border-${color}-500/30`}>
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg bg-${color}-500/15`}>
            <Icon className={`text-${color}-400`} size={18} />
          </div>
          {trend && (
            <Badge variant="success" className="text-xs">{trend}</Badge>
          )}
        </div>
        <p className="text-slate-400 text-xs mb-1 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Track your content performance and earnings</p>
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
              icon={Eye}
              label="Total Views"
              value={totalViewsFromClips.toLocaleString()}
              color="blue"
            />
            <StatCard
              icon={DollarSign}
              label="Total Earnings"
              value={`$${totalEarnings.toFixed(2)}`}
              color="green"
            />
            <StatCard
              icon={Play}
              label="Source Videos"
              value={sourceContentCount}
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Active Clips"
              value={topClips.length}
              color="cyan"
            />
          </div>
        )}

        {/* Top Performing Clips */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Top Performing Clips</h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : topClips.length === 0 ? (
            <Card className="text-center py-8 bg-linear-to-br from-slate-900/60 to-slate-950/60">
              <Play size={32} className="mx-auto text-slate-500 mb-2" />
              <p className="text-slate-400 text-sm">No clips yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {topClips.map((clip, index) => (
                <motion.div
                  key={clip._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-3 hover:border-cyan-500/30 transition-colors bg-slate-900/60 border-slate-700/50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-cyan-400">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm truncate">
                            {clip.title || 'Untitled Clip'}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {new Date(clip.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Views</p>
                          <p className="text-sm font-bold text-cyan-400">
                            {(clip.viewCount || 0).toLocaleString()}
                          </p>
                        </div>
                        {clip.likes !== undefined && (
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Likes</p>
                            <p className="text-sm font-bold text-pink-400">
                              {(clip.likes || 0).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Earnings</p>
                          <p className="text-sm font-bold text-green-400">
                            ${(clip.earnings || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-700/30">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Views</p>
                        <p className="text-xs font-bold text-cyan-400">
                          {(clip.viewCount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Likes</p>
                        <p className="text-xs font-bold text-pink-400">
                          {(clip.likes || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Earnings</p>
                        <p className="text-xs font-bold text-green-400">
                          ${(clip.earnings || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Info */}
        <Card className="bg-linear-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 hover:border-cyan-500/30">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-500/15 rounded-lg shrink-0">
              <TrendingUp className="text-cyan-400" size={18} />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm mb-1">Real-time Analytics</h3>
              <p className="text-slate-400 text-xs">
                Your clip performance is updated in real-time. Earnings are calculated based on
                views and engagement metrics from your submitted clips across all campaigns.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
