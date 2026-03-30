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
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
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
    rules: '',
    maxClippers: '',
    startDate: '',
    endDate: '',
  });
  const [editingId, setEditingId] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    if (!formData.payoutPer1000Views || parseFloat(formData.payoutPer1000Views) <= 0) {
      errors.payoutPer1000Views = 'Payout must be greater than 0';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        payoutPer1000Views: parseFloat(formData.payoutPer1000Views),
        maxClippers: formData.maxClippers ? parseInt(formData.maxClippers) : null,
      };
      
      if (editingId) {
        await put(`/campaigns/${editingId}`, payload);
      } else {
        await post('/campaigns', payload);
      }
      refetch();
      setIsModalOpen(false);
      setFormData({ title: '', description: '', payoutPer1000Views: '' });
      setEditingId(null);
      setValidationErrors({});
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

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalCreators = campaigns.reduce((sum, c) => sum + (c.creators?.length || 0), 0);

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Manage Campaigns</h1>
            <p className="text-gray-400 mt-1">View and manage all platform campaigns</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={20} /> New Campaign
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <p className="text-gray-400 text-sm">Total Campaigns</p>
            <p className="text-3xl font-bold text-white mt-2">{totalCampaigns}</p>
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Active</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">{activeCampaigns}</p>
          </Card>
          <Card>
            <p className="text-gray-400 text-sm">Total Creators</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{totalCreators}</p>
          </Card>
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
                      By {campaign.createdBy?.name || 'Unknown'} • {campaign.description}
                    </p>
                    <div className="flex gap-4 mt-3">
                      <Badge variant="info" className="gap-1">
                        <Users size={14} /> {campaign.creators?.length || 0} Creators
                      </Badge>
                      <span className="text-sm text-gray-400">
                        ${campaign.payoutPer1000Views}/1K views
                      </span>
                      <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                        {campaign.status}
                      </Badge>
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
              rules: '',
              maxClippers: '',
              startDate: '',
              endDate: '',
            });
            setValidationErrors({});
          }}
          title={editingId ? 'Edit Campaign' : 'Create Campaign'}
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (validationErrors.title) setValidationErrors({ ...validationErrors, title: '' });
                }}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
              )}
            </div>
            <div>
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (validationErrors.description) setValidationErrors({ ...validationErrors, description: '' });
                }}
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>
            <div>
              <Input
                label="Payout per 1000 Views ($)"
                type="number"
                value={formData.payoutPer1000Views}
                onChange={(e) => {
                  setFormData({ ...formData, payoutPer1000Views: e.target.value });
                  if (validationErrors.payoutPer1000Views) setValidationErrors({ ...validationErrors, payoutPer1000Views: '' });
                }}
              />
              {validationErrors.payoutPer1000Views && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.payoutPer1000Views}</p>
              )}
            </div>
            <Input
              label="Rules (Optional)"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            />
            <Input
              label="Max Creators (Optional)"
              type="number"
              value={formData.maxClippers}
              onChange={(e) => setFormData({ ...formData, maxClippers: e.target.value })}
            />
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
