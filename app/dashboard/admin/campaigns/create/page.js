// app/dashboard/admin/campaigns/create/page.js
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
import { ArrowLeft, Plus, Trash2, Globe, Video, Music, FileText, Image } from 'lucide-react';
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

  // Source links state
  const [sourceLinks, setSourceLinks] = useState([
    { title: '', url: '', description: '', type: 'other' }
  ]);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.payoutPer1000Views || parseFloat(formData.payoutPer1000Views) <= 0) {
      newErrors.payoutPer1000Views = 'Payout must be greater than 0';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Validate source links
    sourceLinks.forEach((link, index) => {
      if (link.title && !link.url) {
        newErrors[`sourceLink_${index}`] = 'URL is required when title is provided';
      }
      if (link.url && !link.title) {
        newErrors[`sourceLink_${index}`] = 'Title is required when URL is provided';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSourceLinkChange = (index, field, value) => {
    const updatedLinks = [...sourceLinks];
    updatedLinks[index][field] = value;
    setSourceLinks(updatedLinks);
    
    if (errors[`sourceLink_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`sourceLink_${index}`];
      setErrors(newErrors);
    }
  };

  const addSourceLink = () => {
    setSourceLinks([...sourceLinks, { title: '', url: '', description: '', type: 'other' }]);
  };

  const removeSourceLink = (index) => {
    if (sourceLinks.length > 1) {
      const updatedLinks = sourceLinks.filter((_, i) => i !== index);
      setSourceLinks(updatedLinks);
    } else {
      toast.error('At least one source link field is required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      // Filter out empty source links
      const filteredSourceLinks = sourceLinks.filter(link => link.title && link.url);

      const payload = {
        title: formData.title,
        description: formData.description,
        payoutPer1000Views: parseFloat(formData.payoutPer1000Views),
        rules: formData.rules || '',
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: formData.status,
        sourceLinks: filteredSourceLinks,
      };

      const response = await post('/api/campaigns', payload);
      toast.success('Campaign created successfully!');
      router.push('/dashboard/admin/campaigns');
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
                name="title"
                value={formData.title}
                onChange={handleChange}
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your campaign in detail. What is it about? What's the goal?"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Source Links Section - FORM ME HI ADD HOGA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Source Content Links
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addSourceLink}
                  className="gap-1 text-cyan-400"
                >
                  <Plus size={16} /> Add More Links
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Add reference links that creators can use for content inspiration
              </p>
              
              {sourceLinks.map((link, index) => (
                <div key={index} className="mb-6 p-5 border border-gray-700/30 rounded-lg bg-slate-900/50">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Link2 size={14} className="text-cyan-400" />
                      Source Link {index + 1}
                    </h4>
                    {sourceLinks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSourceLink(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Link Title *</label>
                      <Input
                        type="text"
                        placeholder="e.g., Product Demo Video"
                        value={link.title}
                        onChange={(e) => handleSourceLinkChange(index, 'title', e.target.value)}
                        className="text-sm bg-slate-800/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">URL *</label>
                      <Input
                        type="url"
                        placeholder="https://example.com/video"
                        value={link.url}
                        onChange={(e) => handleSourceLinkChange(index, 'url', e.target.value)}
                        className="text-sm bg-slate-800/50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Description (Optional)</label>
                      <Input
                        type="text"
                        placeholder="Brief description of this link"
                        value={link.description}
                        onChange={(e) => handleSourceLinkChange(index, 'description', e.target.value)}
                        className="text-sm bg-slate-800/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Content Type</label>
                      <select
                        value={link.type}
                        onChange={(e) => handleSourceLinkChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {linkTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {errors[`sourceLink_${index}`] && (
                    <p className="text-red-400 text-xs mt-3">{errors[`sourceLink_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Payout and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payout per 1K Views ($) *
                </label>
                <Input
                  type="number"
                  name="payoutPer1000Views"
                  value={formData.payoutPer1000Views}
                  onChange={handleChange}
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
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Rules & Guidelines
              </label>
              <Textarea
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                placeholder="Enter any specific rules, guidelines, or requirements for this campaign"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">Optional - provide guidelines for creators</p>
            </div>

            {/* Campaign Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-700/30">
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