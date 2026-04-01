// app/dashboard/brand/campaigns/new/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { usePost } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { ArrowLeft, Plus, Trash2, Globe, Video, Music, FileText, Image, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateCampaignPage() {
  useProtectedRoute(['admin', 'brand']);
  const router = useRouter();
  const { post, loading } = usePost();

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!formData.payoutPer1000Views || parseFloat(formData.payoutPer1000Views) <= 0) {
      newErrors.payoutPer1000Views = 'Payout must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLink = () => {
    if (!newLink.title.trim()) {
      toast.error('Please enter a title for the link');
      return;
    }
    if (!newLink.url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      new URL(newLink.url);
    } catch (e) {
      toast.error('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setSourceLinks([...sourceLinks, { ...newLink }]);
    setNewLink({ title: '', url: '', description: '', type: 'other' });
    setShowAddLinkForm(false);
    toast.success('Source link added');
  };

  const handleRemoveLink = (index) => {
    setSourceLinks(sourceLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
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
      toast.success('Campaign created successfully!');
      router.push('/dashboard/brand/campaigns');
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    }
  };

  const linkTypes = [
    { value: 'video', label: 'Video', icon: Video, color: 'text-red-400' },
    { value: 'audio', label: 'Audio', icon: Music, color: 'text-green-400' },
    { value: 'document', label: 'Document', icon: FileText, color: 'text-blue-400' },
    { value: 'image', label: 'Image', icon: Image, color: 'text-purple-400' },
    { value: 'other', label: 'Other', icon: Globe, color: 'text-gray-400' },
  ];

  const getLinkIcon = (type) => {
    const linkType = linkTypes.find(t => t.value === type);
    const Icon = linkType?.icon || Globe;
    return <Icon size={16} className={linkType?.color || 'text-gray-400'} />;
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 mb-4"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <h1 className="text-4xl font-bold text-white">Create New Campaign</h1>
          <p className="text-gray-400 mt-2">Set up a new campaign to work with creators</p>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="e.g., Summer Content Challenge 2024"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Describe your campaign in detail..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Source Links Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Source Content Links
                </label>
                {!showAddLinkForm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddLinkForm(true)}
                    className="gap-1 text-cyan-400"
                  >
                    <Plus size={16} /> Add Link
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Add reference links that creators can use for content inspiration
              </p>

              {/* Display existing source links */}
              {sourceLinks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {sourceLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 border border-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {getLinkIcon(link.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{link.title}</p>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-cyan-400 hover:underline truncate block"
                          >
                            {link.url}
                          </a>
                          {link.description && (
                            <p className="text-xs text-gray-400 mt-1">{link.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLink(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new link form */}
              {showAddLinkForm && (
                <div className="p-4 border border-cyan-500/30 rounded-lg bg-slate-800/50">
                  <h4 className="text-sm font-medium text-white mb-3">Add New Source Link</h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Link Title *"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    />
                    <Input
                      placeholder="URL * (include http:// or https://)"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    />
                    <Input
                      placeholder="Description (Optional)"
                      value={newLink.description}
                      onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    />
                    <select
                      value={newLink.type}
                      onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {linkTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddLinkForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddLink}
                        className="bg-cyan-600"
                      >
                        Add Link
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payout and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payout per 1K Views ($) *
                </label>
                <Input
                  type="number"
                  value={formData.payoutPer1000Views}
                  onChange={(e) => {
                    setFormData({ ...formData, payoutPer1000Views: e.target.value });
                    if (errors.payoutPer1000Views) setErrors({ ...errors, payoutPer1000Views: '' });
                  }}
                  placeholder="e.g., 10"
                  step="0.01"
                  min="0"
                  className={errors.payoutPer1000Views ? 'border-red-500' : ''}
                />
                {errors.payoutPer1000Views && (
                  <p className="text-red-400 text-sm mt-1">{errors.payoutPer1000Views}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Rules & Guidelines
              </label>
              <Textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                placeholder="Enter any specific rules or guidelines for creators"
                rows={3}
              />
            </div>

            {/* Campaign Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-700/30">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}