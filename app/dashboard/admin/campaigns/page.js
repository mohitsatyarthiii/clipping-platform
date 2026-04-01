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
import { Plus, Search, Edit2, Trash2, Users, Link2, Globe, Video, Music, FileText, Image, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
  });
  
  // Source links state
  const [sourceLinks, setSourceLinks] = useState([]);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    type: 'other'
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

  const handleAddLink = () => {
    if (!newLink.title.trim()) {
      toast.error('Please enter a title for the link');
      return;
    }
    if (!newLink.url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    // Validate URL format
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

  const handleSubmit = useCallback(async (e) => {
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
        sourceLinks: sourceLinks, // Source links ko payload mein bhej rahe hain
      };
      
      console.log('Submitting payload:', JSON.stringify(payload, null, 2)); // Debug log
      
      if (editingId) {
        await put(`/campaigns/${editingId}`, payload);
        toast.success('Campaign updated successfully!');
      } else {
        await post('/campaigns', payload);
        toast.success('Campaign created successfully!');
      }
      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save campaign');
    }
  }, [editingId, formData, sourceLinks, post, put, refetch]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      payoutPer1000Views: '',
      rules: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    });
    setSourceLinks([]);
    setEditingId(null);
    setValidationErrors({});
    setShowAddLinkForm(false);
    setNewLink({ title: '', url: '', description: '', type: 'other' });
  };

  const handleEditClick = useCallback((campaign) => {
    setFormData({
      title: campaign.title,
      description: campaign.description,
      payoutPer1000Views: campaign.payoutPer1000Views,
      rules: campaign.rules || '',
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      status: campaign.status || 'active',
    });
    setSourceLinks(campaign.sourceLinks || []);
    setEditingId(campaign._id);
    setIsModalOpen(true);
  }, []);

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
                <Card className="hover:border-cyan-500/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{campaign.title}</h3>
                        <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        By {campaign.createdBy?.name || 'Unknown'} • {campaign.description}
                      </p>
                      
                      {/* Show source links count */}
                      {campaign.sourceLinks && campaign.sourceLinks.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Link2 size={14} className="text-cyan-400" />
                          <span className="text-xs text-gray-400">
                            {campaign.sourceLinks.length} source {campaign.sourceLinks.length === 1 ? 'link' : 'links'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex gap-4 mt-3">
                        <Badge variant="info" className="gap-1">
                          <Users size={14} /> {campaign.creators?.length || 0} Creators
                        </Badge>
                        <span className="text-sm text-gray-400">
                          ${campaign.payoutPer1000Views}/1K views
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(campaign)}
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal with Source Links */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingId ? 'Edit Campaign' : 'Create New Campaign'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            {/* Basic Campaign Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (validationErrors.title) setValidationErrors({ ...validationErrors, title: '' });
                }}
                placeholder="Enter campaign title"
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (validationErrors.description) setValidationErrors({ ...validationErrors, description: '' });
                }}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Describe your campaign"
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
              )}
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
                        <X size={16} />
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
                    if (validationErrors.payoutPer1000Views) setValidationErrors({ ...validationErrors, payoutPer1000Views: '' });
                  }}
                  placeholder="e.g., 10"
                  step="0.01"
                  min="0"
                  className={validationErrors.payoutPer1000Views ? 'border-red-500' : ''}
                />
                {validationErrors.payoutPer1000Views && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.payoutPer1000Views}</p>
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
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter any specific rules or guidelines for creators"
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
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700/30">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-cyan-500">
                {editingId ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}