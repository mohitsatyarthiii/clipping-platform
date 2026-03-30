'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch, usePost, useDelete } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Textarea from '@/components/ui/Textarea';
import { Plus, Trash2, ExternalLink, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SourceContentPage() {
  useProtectedRoute('creator');
  const { data, loading, refetch } = useFetch('/source-content');
  const { post } = usePost();
  const { delete: deleteContent } = useDelete();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    title: '',
  });

  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!formData.youtubeUrl) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    try {
      await post('/source-content', formData);
      refetch();
      setIsModalOpen(false);
      setFormData({ youtubeUrl: '', title: '' });
      toast.success('Content added successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (contentId) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteContent(`/source-content/${contentId}`);
        refetch();
        toast.success('Content deleted successfully!');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const sourceContents = data?.sourceContents || [];

  const extractThumbnail = (url) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Source Content</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage your YouTube videos for clipping</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 mt-4 sm:mt-0">
            <Plus size={16} /> Add Video
          </Button>
        </div>

        {/* Add Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Source Content">
          <form onSubmit={handleAddContent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Video Title</label>
              <Input
                type="text"
                placeholder="Enter video title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                YouTube URL
              </label>
              <Input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Content</Button>
            </div>
          </form>
        </Modal>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : (
          <div>
            {sourceContents.length === 0 ? (
              <Card className="text-center py-12 bg-linear-to-br from-slate-900/60 to-slate-950/60">
                <Play size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="text-base font-medium text-slate-400">No source content yet</h3>
                <p className="text-slate-500 text-xs mt-1">Add your first YouTube video to get started</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sourceContents.map((content, index) => {
                  const thumbnail = extractThumbnail(content.youtubeUrl);
                  return (
                    <motion.div
                      key={content._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden group hover:border-cyan-500/40 transition-all h-full flex flex-col bg-slate-900/60 border-slate-700/50">
                        {/* Thumbnail */}
                        {thumbnail && (
                          <div className="relative h-32 overflow-hidden bg-slate-800">
                            <img
                              src={thumbnail}
                              alt={content.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <a
                                href={content.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600/90 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                              >
                                <ExternalLink size={16} />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Content Info */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
                            {content.title || 'Untitled'}
                          </h3>
                          <p className="text-xs text-slate-400 mb-3">
                            {new Date(content.createdAt).toLocaleDateString()}
                          </p>

                          {/* Stats */}
                          <div className="bg-slate-800/40 rounded p-2 mb-3 text-center border border-slate-700/30">
                            <Badge variant="info" className="text-xs">{content.clipsCount || 0} Clips</Badge>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(content._id)}
                            className="mt-auto w-full py-1.5 px-3 rounded-lg bg-red-500/10 text-red-400/80 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
