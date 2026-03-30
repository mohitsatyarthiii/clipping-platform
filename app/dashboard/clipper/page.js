'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useAuthStore } from '@/lib/stores/authStore';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { TrendingUp, Award, Zap, Target, Activity, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

const QuickActionCard = ({ icon: Icon, title, description, color = 'cyan', href = '#' }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ translateY: -4 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <Card className={`bg-linear-to-br from-${color}-500/15 to-${color}-600/5 border-${color}-500/20 hover:border-${color}-500/40 cursor-pointer`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-${color}-500/20 rounded-lg shrink-0`}>
            <Icon className={`w-5 h-5 text-${color}-400`} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{title}</h3>
            <p className="text-slate-400 text-xs mt-1">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  </Link>
);

export default function ClipperDashboardPage() {
  useProtectedRoute('clipper');
  const { data, loading } = useFetch('/dashboard/clipper');
  const user = useAuthStore((state) => state.user);

  const dashboard = data?.dashboard || {};

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
                <p className="text-slate-400 text-sm">Create clips, join campaigns, and earn rewards.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <Activity size={16} className="text-cyan-400" />
                <span className="text-xs font-medium text-cyan-300">Earning Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Your Stats</h2>
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
                  icon={Target}
                  label="Campaigns Joined"
                  value={dashboard.joinedCampaignsCount || 0}
                  color="cyan"
                />
                <StatMetric
                  icon={Zap}
                  label="Total Submissions"
                  value={dashboard.totalSubmissions || 0}
                  change="+3"
                  color="yellow"
                />
                <StatMetric
                  icon={TrendingUp}
                  label="Total Views"
                  value={(dashboard.totalViews || 0).toLocaleString()}
                  color="blue"
                />
                <StatMetric
                  icon={Award}
                  label="Total Earnings"
                  value={`$${(dashboard.totalEarnings || 0).toFixed(2)}`}
                  change="+8%"
                  color="green"
                />
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Your Campaigns */}
          <div className="lg:col-span-2">
            <Card className="bg-linear-to-br from-slate-900/60 to-slate-950/60 border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Your Campaigns</h2>
                <Link href="/dashboard/clipper/campaigns">
                  <Button variant="ghost" size="sm" className="text-xs">Browse All</Button>
                </Link>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : (dashboard.joinedCampaigns || []).length === 0 ? (
                <div className="text-center py-8">
                  <Target size={40} className="mx-auto text-slate-500 mb-3" />
                  <p className="text-slate-400 text-sm">No campaigns joined yet</p>
                  <p className="text-slate-500 text-xs mt-1">Browse and request to join campaigns to start earning</p>
                  <Link href="/dashboard/clipper/campaigns">
                    <Button size="sm" className="mt-4">Browse Campaigns</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(dashboard.joinedCampaigns || []).map((campaign, index) => (
                    <motion.div
                      key={campaign._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-500/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors">
                            {campaign.campaignId?.title || campaign.title || 'Campaign'}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">By {campaign.campaignId?.creatorName || 'Creator'}</p>
                        </div>
                        <Badge variant="success" className="text-xs">Joined</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-700/30">
                        <span className="text-slate-400">Reward: <span className="text-green-400 font-semibold">${campaign.campaignId?.payoutPer1000Views || campaign.rewardPerClip || 0}/1K views</span></span>
                        <span className="text-slate-400">Your Submissions: <span className="text-cyan-400 font-semibold">{campaign.submissionCount || 0}</span></span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            {/* Earnings Card */}
            <Card className="bg-linear-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-xs font-medium mb-1">Total Earnings</p>
                  <h3 className="text-2xl font-bold text-white">${(dashboard.totalEarnings || 0).toFixed(2)}</h3>
                </div>
                <div className="p-2 bg-green-500/15 rounded-lg">
                  <Award className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-700/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pending</span>
                  <span className="text-amber-400 font-semibold">${(dashboard.pendingEarnings || 0).toFixed(2)}</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-green-500 to-emerald-500" style={{ width: '65%' }} />
                </div>
              </div>
            </Card>

            {/* Submission Stats */}
            <Card className="bg-linear-to-br from-slate-900/60 to-slate-950/60 border-slate-700/50">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/30">
                <Activity size={16} className="text-cyan-400" />
                <p className="text-slate-400 text-xs font-medium">Submission Status</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Submitted</span>
                  <span className="font-semibold text-white">{dashboard.totalSubmissions || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Approved</span>
                  <span className="font-semibold text-green-400">{dashboard.approvedSubmissions || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pending</span>
                  <span className="font-semibold text-amber-400">{dashboard.pendingSubmissions || 0}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <QuickActionCard
              icon={Plus}
              title="Submit Clip"
              description="Upload a new clip"
              href="/dashboard/clipper/submit"
              color="cyan"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
