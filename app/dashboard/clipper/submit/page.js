'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch, usePost } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SubmitClipPage() {
  useProtectedRoute('clipper');
  const router = useRouter();
  const { data, loading } = useFetch('/campaigns');
  const { post, loading: isSubmitting } = usePost();

  const [formData, setFormData] = useState({
    campaignId: '',
    youtubeShortUrl: '',
    uploadedVideoUrl: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.campaignId) newErrors.campaignId = 'Campaign is required';
    if (!formData.youtubeShortUrl)
      newErrors.youtubeShortUrl = 'YouTube Shorts URL is required';
    if (!formData.uploadedVideoUrl)
      newErrors.uploadedVideoUrl = 'Video upload URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await post('/submissions', formData);
      toast.success('Clip submitted successfully!');
      router.push('/dashboard/clipper/submissions');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const campaigns = data?.campaigns || [];

  return (
    <DashboardLayout>
      <div className="px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Submit a Clip</h1>
          <p className="text-gray-400 mt-1">Upload your clip and earn money</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Campaign
              </label>
              {loading ? (
                <Skeleton className="h-10" />
              ) : (
                <select
                  value={formData.campaignId}
                  onChange={(e) =>
                    setFormData({ ...formData, campaignId: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors"
                >
                  <option value="">Choose a campaign...</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.title} (${campaign.payoutPer1000Views}/1K views)
                    </option>
                  ))}
                </select>
              )}
              {errors.campaignId && (
                <p className="text-red-500 text-sm mt-1">{errors.campaignId}</p>
              )}
            </div>

            {/* YouTube Shorts URL */}
            <Input
              label="YouTube Shorts URL"
              type="url"
              placeholder="https://youtube.com/shorts/..."
              value={formData.youtubeShortUrl}
              onChange={(e) =>
                setFormData({ ...formData, youtubeShortUrl: e.target.value })
              }
              error={errors.youtubeShortUrl}
            />

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Video or Link
              </label>
              <Input
                type="url"
                placeholder="https://storage.example.com/video.mp4"
                value={formData.uploadedVideoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, uploadedVideoUrl: e.target.value })
                }
                error={errors.uploadedVideoUrl}
              />
              <p className="text-sm text-gray-400 mt-2">
                Upload your video file or provide a direct link
              </p>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Guidelines:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Video should be 15-60 seconds long</li>
                  <li>Must be original and high quality</li>
                  <li>No copyrighted music or content</li>
                  <li>Earnings will be calculated based on views</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex-1 gap-2"
              >
                <Upload size={20} />
                {isSubmitting ? 'Submitting...' : 'Submit Clip'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
