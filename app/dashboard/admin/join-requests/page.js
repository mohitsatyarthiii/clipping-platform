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
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function JoinRequestsPage() {
  useProtectedRoute('admin');
  const { data, loading, refetch } = useFetch('/admin/join-requests');
  const { put } = usePut();
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (requestId) => {
    try {
      setProcessingId(requestId);
      await put(`/admin/join-requests/${requestId}`, { action: 'approve' });
      refetch();
      toast.success('Join request approved');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessingId(requestId);
      await put(`/admin/join-requests/${requestId}`, {
        action: 'reject',
        rejectionReason: 'Not meeting criteria',
      });
      refetch();
      toast.success('Join request rejected');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const requests = data?.joinRequests || [];
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  const RequestCard = ({ request, onApprove, onReject, isProcessing }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-medium text-white">{request.userId?.name}</p>
          <p className="text-sm text-gray-400">{request.userId?.email}</p>
          <p className="text-sm text-cyan-400 mt-1">
            Campaign: {request.campaignId?.title}
          </p>
        </div>
        <Badge variant="warning">Pending</Badge>
      </div>

      {request.status === 'pending' && (
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => onApprove(request._id)}
            disabled={isProcessing}
            className="gap-2"
          >
            <Check size={16} /> Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReject(request._id)}
            disabled={isProcessing}
            className="gap-2"
          >
            <X size={16} /> Reject
          </Button>
        </div>
      )}
    </motion.div>
  );

  const tabs = [
    {
      label: `Pending (${pendingRequests.length})`,
      content: (
        <div className="space-y-3">
          {pendingRequests.length === 0 ? (
            <p className="text-gray-400 py-8 text-center">No pending requests</p>
          ) : (
            pendingRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={processingId === request._id}
              />
            ))
          )}
        </div>
      ),
    },
    {
      label: `Approved (${approvedRequests.length})`,
      content: (
        <div className="space-y-3">
          {approvedRequests.length === 0 ? (
            <p className="text-gray-400 py-8 text-center">No approved requests</p>
          ) : (
            approvedRequests.map((request) => (
              <div
                key={request._id}
                className="p-4 bg-gray-800/50 rounded-lg border border-green-500/30"
              >
                <p className="font-medium text-white">{request.userId?.name}</p>
                <p className="text-sm text-gray-400">{request.campaignId?.title}</p>
                <Badge variant="success" className="mt-2">
                  Approved
                </Badge>
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      label: `Rejected (${rejectedRequests.length})`,
      content: (
        <div className="space-y-3">
          {rejectedRequests.length === 0 ? (
            <p className="text-gray-400 py-8 text-center">No rejected requests</p>
          ) : (
            rejectedRequests.map((request) => (
              <div
                key={request._id}
                className="p-4 bg-gray-800/50 rounded-lg border border-red-500/30"
              >
                <p className="font-medium text-white">{request.userId?.name}</p>
                <p className="text-sm text-gray-400">{request.campaignId?.title}</p>
                <Badge variant="error" className="mt-2">
                  Rejected
                </Badge>
              </div>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Join Requests</h1>
          <p className="text-gray-400 mt-1">
            Review and approve campaign join requests
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
      </div>
    </DashboardLayout>
  );
}
