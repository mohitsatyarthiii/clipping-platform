'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { Search, Users, TrendingUp, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsersPage() {
  useProtectedRoute('admin');
  const { data, loading } = useFetch('/admin/users');
  const [search, setSearch] = useState('');

  const users = data?.users || [];
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const verifiedUsers = users.filter((u) => u.isEmailVerified).length;

  const StatCard = ({ icon: Icon, label, value, color = 'cyan' }) => (
    <Card className="bg-linear-to-br from-slate-800/40 to-slate-900/60 border-slate-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
        </div>
        <div className={`p-2.5 bg-${color}-500/15 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
      </div>
    </Card>
  );

  const getRoleColor = (role) => {
    const colors = {
      admin: 'purple',
      creator: 'blue',
      clipper: 'cyan',
    };
    return colors[role] || 'gray';
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage and monitor platform users</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard icon={Users} label="Total Users" value={totalUsers} color="cyan" />
            <StatCard
              icon={UserCheck}
              label="Active Users"
              value={activeUsers}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="Verified Users"
              value={verifiedUsers}
              color="blue"
            />
          </div>
        )}

        {/* Users Table Card */}
        <Card className="bg-linear-to-br from-slate-900/60 to-slate-950/60 border-slate-700/50">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white mb-3">All Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-800/40 border-slate-700/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-slate-400 text-center py-6 text-sm">No users found</p>
              ) : (
                <div className="space-y-1.5">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-white">{user.name}</h3>
                            <Badge
                              variant={user.role === 'admin' ? 'danger' : 'secondary'}
                            >
                              {user.role}
                            </Badge>
                            {user.isEmailVerified && (
                              <Badge variant="success">Verified</Badge>
                            )}
                            {!user.isActive && (
                              <Badge variant="warning">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                          {user.lastLogin && (
                            <p className="text-xs text-gray-500">
                              Last login: {new Date(user.lastLogin).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
