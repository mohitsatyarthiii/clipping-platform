'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch, usePost } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import { Search, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BrowseCampaignsPage() {
  useProtectedRoute('clipper');
  const { data, loading } = useFetch('/campaigns?status=active');
  const { post } = usePost();
  const [search, setSearch] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRequest = async () => {
    try {
      setIsJoining(true);
      await post(`/campaigns/${selectedCampaign._id}/join`, {});
      toast.success('Join request sent!');
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const campaigns = data?.campaigns || [];
  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Browse Campaigns</h1>
          <p className="text-gray-400 mt-1">Find and join campaigns</p>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-2">
          <Input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:border-purple-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign)}>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-400 text-sm flex-1">
                    {campaign.description}
                  </p>
                  <div className="space-y-3 mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Payout Rate</span>
                      <Badge variant="info">
                        ${campaign.payoutPer1000Views}/1K views
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Clippers Joined</span>
                      <span className="font-medium text-white">
                        {campaign.clippers || 0}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(campaign);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          title={selectedCampaign?.title}
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setSelectedCampaign(null)}
              >
                Close
              </Button>
              <Button
                onClick={handleJoinRequest}
                disabled={isJoining}
              >
                {isJoining ? 'Requesting...' : 'Request to Join'}
              </Button>
            </>
          }
        >
          {selectedCampaign && (
            <div className="space-y-4">
              <p className="text-gray-300">{selectedCampaign.description}</p>

              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Payout Rate</span>
                  <span className="font-medium text-white">
                    ${selectedCampaign.payoutPer1000Views}/1K views
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Clippers Joined</span>
                  <span className="font-medium text-white">
                    {selectedCampaign.clippers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>

              <p className="text-sm text-gray-400 pt-2">
                Request to join this campaign. Once approved, you can start creating clips
                from the campaign's source content.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
