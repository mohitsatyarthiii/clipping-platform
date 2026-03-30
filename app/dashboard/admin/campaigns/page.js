'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch, usePost, usePut } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampaignsPage() {
  useProtectedRoute('admin');
  const { data, loading, refetch } = useFetch('/campaigns');
  const { post } = usePost();
  const { put } = usePut();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    payoutPer1000Views: '',
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await put(`/campaigns/${editingId}`, formData);
      } else {
        await post('/campaigns', formData);
      }
      refetch();
      setIsModalOpen(false);
      setFormData({ title: '', description: '', payoutPer1000Views: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [editingId, formData, post, put, refetch]);

  const handleEditClick = useCallback((campaign) => {
    setFormData(campaign);
    setEditingId(campaign._id);
    setIsModalOpen(true);
  }, []);

  const campaigns = data?.campaigns || [];
  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Campaigns</h1>
            <p className="text-gray-400 mt-1">Manage all platform campaigns</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={20} /> New Campaign
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="flex items-center justify-between hover:border-purple-500/50 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {campaign.description}
                    </p>
                    <div className="flex gap-4 mt-3">
                      <Badge variant="info">{campaign.clippers || 0} Clippers</Badge>
                      <span className="text-sm text-gray-400">
                        ${campaign.payoutPer1000Views}/1K views
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData(campaign);
                        setEditingId(campaign._id);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              payoutPer1000Views: '',
            });
          }}
          title={editingId ? 'Edit Campaign' : 'Create Campaign'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Input
              label="Payout per 1000 Views ($)"
              type="number"
              value={formData.payoutPer1000Views}
              onChange={(e) =>
                setFormData({ ...formData, payoutPer1000Views: e.target.value })
              }
            />
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
