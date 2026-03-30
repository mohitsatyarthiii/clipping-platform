'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch, usePut } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { Check, X, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SubmissionsPage() {
  useProtectedRoute('admin');
  const { data, loading, refetch } = useFetch('/admin/submissions');
  const { put } = usePut();
  const [processingId, setProcessingId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async (submissionId) => {
    try {
      setProcessingId(submissionId);
      await put(`/admin/submissions/${submissionId}`, { action: 'approve' });
      refetch();
      toast.success('Submission approved');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submissionId) => {
    try {
      setProcessingId(submissionId);
      await put(`/admin/submissions/${submissionId}`, {
        action: 'reject',
        rejectionReason: rejectReason || 'Not meeting quality standards',
      });
      refetch();
      setSelectedSubmission(null);
      setRejectReason('');
      toast.success('Submission rejected');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const submissions = data?.submissions || [];
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const approvedSubmissions = submissions.filter((s) => s.status === 'approved');
  const rejectedSubmissions = submissions.filter((s) => s.status === 'rejected');

  const SubmissionCard = ({ submission, onApprove, onReject, isProcessing }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-medium text-white">{submission.userId?.name}</p>
          <p className="text-sm text-gray-400">{submission.campaignId?.title}</p>
          <p className="text-sm text-cyan-400 mt-1">
            {submission.views || 0} views · ${submission.earnings?.toFixed(2) || 0}
          </p>
        </div>
        {submission.status === 'pending' ? (
          <Badge variant="warning">Pending</Badge>
        ) : submission.status === 'approved' ? (
          <Badge variant="success">Approved</Badge>
        ) : (
          <Badge variant="error">Rejected</Badge>
        )}
      </div>

      {submission.status === 'pending' && (
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => onApprove(submission._id)}
            disabled={isProcessing}
            className="gap-2"
          >
            <Check size={16} /> Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setSelectedSubmission(submission)}
            disabled={isProcessing}
            className="gap-2"
          >
            <X size={16} /> Reject
          </Button>
          {submission.youtubeShortUrl && (
            <a
              href={submission.youtubeShortUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="gap-2">
                <Eye size={16} /> View
              </Button>
            </a>
          )}
        </div>
      )}
    </motion.div>
  );

  const tabs = [
    {
      label: `Pending (${pendingSubmissions.length})`,
      content: (
        <div className="space-y-3">
          {pendingSubmissions.length === 0 ? (
            <p className="text-gray-400 py-8 text-center">No pending submissions</p>
          ) : (
            pendingSubmissions.map((submission) => (
              <SubmissionCard
                key={submission._id}
                submission={submission}
                onApprove={handleApprove}
                onReject={() => setSelectedSubmission(submission)}
                isProcessing={processingId === submission._id}
              />
            ))
          )}
        </div>
      ),
    },
    {
      label: `Approved (${approvedSubmissions.length})`,
      content: (
        <div className="space-y-3">
          {approvedSubmissions.map((submission) => (
            <div
              key={submission._id}
              className="p-4 bg-gray-800/50 rounded-lg border border-green-500/30"
            >
              <p className="font-medium text-white">{submission.userId?.name}</p>
              <p className="text-sm text-gray-400">{submission.campaignId?.title}</p>
              <p className="text-sm text-green-400 mt-2">
                {submission.views} views · ${submission.earnings?.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: `Rejected (${rejectedSubmissions.length})`,
      content: (
        <div className="space-y-3">
          {rejectedSubmissions.map((submission) => (
            <div
              key={submission._id}
              className="p-4 bg-gray-800/50 rounded-lg border border-red-500/30"
            >
              <p className="font-medium text-white">{submission.userId?.name}</p>
              <p className="text-sm text-gray-400">{submission.campaignId?.title}</p>
              {submission.rejectionReason && (
                <p className="text-sm text-red-400 mt-2">
                  {submission.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Submissions</h1>
          <p className="text-gray-400 mt-1">
            Review and approve clip submissions
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <Card>
            <Tabs tabs={tabs} />
          </Card>
        )}

        {/* Reject Modal */}
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => {
            setSelectedSubmission(null);
            setRejectReason('');
          }}
          title="Reject Submission"
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedSubmission(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  handleReject(selectedSubmission._id)
                }
              >
                Reject
              </Button>
            </>
          }
        >
          <Textarea
            label="Rejection Reason"
            placeholder="Explain why this submission is being rejected..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
