'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import { DollarSign, TrendingUp, Users, Award, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EarningsPage() {
  useProtectedRoute('admin');
  const { data, loading } = useFetch('/admin/earnings');
  const [search, setSearch] = useState('');

  const earnings = data?.earnings || [];
  const filteredEarnings = earnings.filter(
    (e) =>
      e.userName?.toLowerCase().includes(search.toLowerCase()) ||
      e.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = earnings.reduce((sum, e) => sum + (e.total || 0), 0);
  const pendingPayouts = earnings.reduce((sum, e) => sum + (e.pending || 0), 0);
  const totalPaid = earnings.reduce((sum, e) => sum + (e.paid || 0), 0);
  const totalClippers = new Set(earnings.map((e) => e.userId)).size;

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

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Earnings & Payouts</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Track platform revenue and user earnings</p>
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
              icon={DollarSign}
              label="Total Revenue"
              value={`$${totalRevenue.toFixed(2)}`}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Paid"
              value={`$${totalPaid.toFixed(2)}`}
              color="cyan"
            />
            <StatCard
              icon={Award}
              label="Pending Payouts"
              value={`$${pendingPayouts.toFixed(2)}`}
              color="amber"
            />
            <StatCard
              icon={Users}
              label="Active Clippers"
              value={totalClippers}
              color="purple"
            />
          </div>
        )}

        {/* Earnings Table Card */}
        <Card className="bg-linear-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">User Earnings Breakdown</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {filteredEarnings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No earnings found</p>
              ) : (
                <div className="space-y-2">
                  {filteredEarnings.map((earning, index) => (
                    <motion.div
                      key={earning.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{earning.userName}</h3>
                          <p className="text-sm text-gray-400">{earning.userEmail}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-right">
                          <div>
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="text-lg font-bold text-cyan-400">
                              ${earning.total?.toFixed(2) || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Paid</p>
                            <p className="text-lg font-bold text-green-400">
                              ${earning.paid?.toFixed(2) || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Pending</p>
                            {earning.pending > 0 ? (
                              <Badge variant="warning" className="justify-end">
                                ${earning.pending?.toFixed(2) || 0}
                              </Badge>
                            ) : (
                              <p className="text-lg font-bold text-gray-500">$0.00</p>
                            )}
                          </div>
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
