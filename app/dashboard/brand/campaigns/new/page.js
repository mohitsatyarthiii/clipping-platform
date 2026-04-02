// app/dashboard/brand/campaigns/new/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/lib/stores/authStore';
import { usePost } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { post, loading: apiLoading } = usePost();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    payoutPer1000Views: '',
    rules: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
  });

  const [sourceLinks, setSourceLinks] = useState([]);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    type: 'other'
  });

  const [errors, setErrors] = useState({});

  // Simple validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.payoutPer1000Views || parseFloat(formData.payoutPer1000Views) <= 0) {
      newErrors.payoutPer1000Views = 'Payout must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLink = () => {
    if (!newLink.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!newLink.url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setSourceLinks([...sourceLinks, { ...newLink }]);
    setNewLink({ title: '', url: '', description: '', type: 'other' });
    setShowAddLinkForm(false);
    toast.success('Link added');
  };

  const handleRemoveLink = (index) => {
    setSourceLinks(sourceLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        payoutPer1000Views: parseFloat(formData.payoutPer1000Views),
        rules: formData.rules || '',
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: formData.status,
        sourceLinks: sourceLinks,
      };

      await post('/campaigns', payload);
      toast.success('Campaign created!');
      router.push('/dashboard/brand/campaigns');
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Auth check
  if (!user || (user.role !== 'admin' && user.role !== 'brand')) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Create New Campaign</h1>
          <p className="text-gray-400 mt-1">Set up a campaign for creators</p>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Campaign Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter campaign title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your campaign"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Source Links */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">Source Links</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddLinkForm(true)}
                  className="text-cyan-400"
                >
                  <Plus size={14} /> Add Link
                </Button>
              </div>

              {/* Existing Links */}
              {sourceLinks.length > 0 && (
                <div className="space-y-2 mb-3">
                  {sourceLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-gray-700">
                      <div>
                        <p className="text-sm text-white">{link.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-md">{link.url}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLink(idx)}
                        className="text-red-400"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Link Form */}
              {showAddLinkForm && (
                <div className="p-3 border border-cyan-500/30 rounded bg-slate-800/50 space-y-2">
                  <Input
                    placeholder="Title"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newLink.description}
                    onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    className="text-sm"
                  />
                  <select
                    value={newLink.type}
                    onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddLinkForm(false)}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={handleAddLink} className="bg-cyan-600">
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Payout and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Payout per 1K Views ($) *
                </label>
                <Input
                  type="number"
                  value={formData.payoutPer1000Views}
                  onChange={(e) => setFormData({ ...formData, payoutPer1000Views: e.target.value })}
                  placeholder="10"
                  step="0.01"
                  className={errors.payoutPer1000Views ? 'border-red-500' : ''}
                />
                {errors.payoutPer1000Views && <p className="text-red-400 text-sm">{errors.payoutPer1000Views}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Rules & Guidelines
              </label>
              <Textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                placeholder="Any rules for creators"
                rows={3}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={apiLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={apiLoading} className="bg-cyan-600">
                {apiLoading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}