'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/stores/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';
import { Users, FileText, CheckCircle, TrendingUp, AlertCircle, Award, Activity, DollarSign, Eye, Ban, User} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboardPage() {
  useProtectedRoute('admin');
  const { data: dashboardData, loading } = useFetch('/dashboard/admin');
  const { data: allUsers, loading: usersLoading } = useFetch('/admin/users');
  const { data: allCampaigns, loading: campaignsLoading } = useFetch('/campaigns');
  const user = useAuthStore((state) => state.user);

  const stats = [
    { 
      icon: Users, 
      label: 'Total Users', 
      value: allUsers?.users?.length || 0, 
      color: 'cyan',
      breakdown: [
        { label: 'Brands', value: allUsers?.users?.filter(u => u.role === 'brand').length || 0 },
        { label: 'Creators', value: allUsers?.users?.filter(u => u.role === 'creator').length || 0 },
        { label: 'Admins', value: allUsers?.users?.filter(u => u.role === 'admin').length || 0 },
      ]
    },
    { 
      icon: FileText, 
      label: 'Active Campaigns', 
      value: allCampaigns?.campaigns?.filter(c => c.status === 'active').length || 0, 
      color: 'blue' 
    },
    { 
      icon: Eye, 
      label: 'Total Views', 
      value: (allCampaigns?.campaigns?.reduce((sum, c) => sum + (c.totalViews || 0), 0) || 0).toLocaleString(), 
      color: 'purple' 
    },
    { 
      icon: DollarSign, 
      label: 'Total Distributed', 
      value: `$${(allCampaigns?.campaigns?.reduce((sum, c) => sum + (c.totalEarnings || 0), 0) || 0).toFixed(2)}`, 
      color: 'green' 
    },
  ];

  const tabs = [
    {
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : (
              stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = {
                  cyan: 'bg-cyan-500/10 text-cyan-400',
                  green: 'bg-green-500/10 text-green-400',
                  purple: 'bg-purple-500/10 text-purple-400',
                  blue: 'bg-blue-500/10 text-blue-400',
                };

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                          {stat.breakdown && (
                            <div className="mt-3 space-y-1">
                              {stat.breakdown.map((item, i) => (
                                <p key={i} className="text-xs text-gray-400">{item.label}: {item.value}</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                          <Icon size={24} />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/admin/campaigns">
              <Card className="hover:border-cyan-500/50 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Manage Campaigns</p>
                    <p className="text-2xl font-bold text-cyan-400">Campaigns</p>
                  </div>
                  <FileText className="text-cyan-400 opacity-50" size={32} />
                </div>
              </Card>
            </Link>
            <Link href="/dashboard/admin/users">
              <Card className="hover:border-purple-500/50 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Manage Users</p>
                    <p className="text-2xl font-bold text-purple-400">Users</p>
                  </div>
                  <Users className="text-purple-400 opacity-50" size={32} />
                </div>
              </Card>
            </Link>
          </div>

          {/* Recent Campaigns */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Recent Campaigns</h2>
            {campaignsLoading ? (
              <Skeleton className="h-96" />
            ) : allCampaigns?.campaigns?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/30">
                      <th className="text-left py-3 px-4 text-gray-400">Campaign</th>
                      <th className="text-left py-3 px-4 text-gray-400">Brand</th>
                      <th className="text-left py-3 px-4 text-gray-400">Creators</th>
                      <th className="text-left py-3 px-4 text-gray-400">Views</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCampaigns.campaigns.slice(0, 5).map((campaign) => (
                      <tr key={campaign._id} className="border-b border-gray-700/30 hover:bg-gray-800/20">
                        <td className="py-3 px-4 font-semibold text-white">{campaign.title}</td>
                        <td className="py-3 px-4 text-gray-300">{campaign.createdBy?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-gray-300">{campaign.creators?.length || 0}</td>
                        <td className="py-3 px-4 text-gray-300">{(campaign.totalViews || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                            {campaign.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No campaigns</p>
            )}
          </Card>
        </div>
      ),
    },
    {
      label: 'Users',
      content: (
        <div className="space-y-6">
          {usersLoading ? (
            <Skeleton className="h-96" />
          ) : allUsers?.users?.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/30">
                      <th className="text-left py-3 px-4 text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400">Role</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-700/30 hover:bg-gray-800/20">
                        <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                        <td className="py-3 px-4 text-gray-300">{u.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'brand' ? 'info' : 'success'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={u.isActive ? 'success' : 'warning'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                          >
                            {u.isActive ? <Ban size={16} /> : <User size={16} />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-400">No users found</p>
            </Card>
          )}
        </div>
      ),
    },
    {
      label: 'Campaigns',
      content: (
        <div className="space-y-6">
          {campaignsLoading ? (
            <Skeleton className="h-96" />
          ) : allCampaigns?.campaigns?.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/30">
                      <th className="text-left py-3 px-4 text-gray-400">Campaign</th>
                      <th className="text-left py-3 px-4 text-gray-400">Brand</th>
                      <th className="text-left py-3 px-4 text-gray-400">Creators</th>
                      <th className="text-left py-3 px-4 text-gray-400">Views</th>
                      <th className="text-left py-3 px-4 text-gray-400">Earnings</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCampaigns.campaigns.map((campaign) => (
                      <tr key={campaign._id} className="border-b border-gray-700/30 hover:bg-gray-800/20">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{campaign.title}</p>
                          <p className="text-xs text-gray-400">${campaign.payoutPer1000Views}/1K</p>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{campaign.createdBy?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-gray-300">{campaign.creators?.length || 0}</td>
                        <td className="py-3 px-4 text-gray-300">{(campaign.totalViews || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-green-400 font-semibold">${(campaign.totalEarnings || 0).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'default'}>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/admin/campaigns/${campaign._id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-400">No campaigns found</p>
            </Card>
          )}
        </div>
      ),
    },
    {
      label: 'Analytics',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <p className="text-gray-400 text-sm mb-2">Total Platform Revenue</p>
              <p className="text-4xl font-bold text-green-400">
                ${(allCampaigns?.campaigns?.reduce((sum, c) => sum + (c.totalEarnings || 0), 0) || 0).toFixed(2)}
              </p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <p className="text-gray-400 text-sm mb-2">Total Platform Views</p>
              <p className="text-4xl font-bold text-purple-400">
                {(allCampaigns?.campaigns?.reduce((sum, c) => sum + (c.totalViews || 0), 0) || 0).toLocaleString()}
              </p>
            </Card>
          </div>
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Top Campaigns by Views</h2>
            {campaignsLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <div className="space-y-3">
                {(allCampaigns?.campaigns || [])
                  .sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0))
                  .slice(0, 10)
                  .map((campaign, index) => (
                    <div key={campaign._id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-cyan-400">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-white">{campaign.title}</p>
                            <p className="text-xs text-gray-400">{campaign.createdBy?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{(campaign.totalViews || 0).toLocaleString()} views</p>
                        <p className="text-xs text-green-400">${(campaign.totalEarnings || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Full system control and oversight</p>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} defaultTab={0} />
      </div>
    </DashboardLayout>
  );
}
