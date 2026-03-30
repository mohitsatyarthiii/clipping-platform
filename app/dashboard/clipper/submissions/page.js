'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useFetch } from '@/lib/hooks/useApi';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SubmissionsPage() {
  useProtectedRoute('clipper');
  const { data, loading } = useFetch('/submissions');

  const submissions = data?.submissions || [];
  const pending = submissions.filter((s) => s.status === 'pending');
  const approved = submissions.filter((s) => s.status === 'approved');
  const rejected = submissions.filter((s) => s.status === 'rejected');

  const SubmissionCard = ({ submission }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-medium text-white">{submission.campaignId?.title}</p>
          <p className="text-sm text-gray-400 mt-1">
            {submission.views || 0} views · ${submission.earnings?.toFixed(2) || 0}
          </p>
        </div>
        {submission.status === 'pending' && (
          <Badge variant="warning">Pending Review</Badge>
        )}
        {submission.status === 'approved' && (
          <Badge variant="success">Approved</Badge>
        )}
        {submission.status === 'rejected' && (
          <Badge variant="error">Rejected</Badge>
        )}
      </div>

      {submission.rejectionReason && (
        <div className="mt-3 p-3 bg-red-500/10 rounded border border-red-500/30">
          <p className="text-sm text-red-400">{submission.rejectionReason}</p>
        </div>
      )}

      {submission.youtubeShortUrl && (
        <a
          href={submission.youtubeShortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 text-sm mt-3 inline-block"
        >
          View on YouTube →
        </a>
      )}
    </motion.div>
  );

  const tabs = [
    {
      label: `Pending (${pending.length})`,
      content: (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No pending submissions
            </p>
          ) : (
            pending.map((submission) => (
              <SubmissionCard key={submission._id} submission={submission} />
            ))
          )}
        </div>
      ),
    },
    {
      label: `Approved (${approved.length})`,
      content: (
        <div className="space-y-3">
          {approved.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No approved submissions yet
            </p>
          ) : (
            approved.map((submission) => (
              <SubmissionCard key={submission._id} submission={submission} />
            ))
          )}
        </div>
      ),
    },
    {
      label: `Rejected (${rejected.length})`,
      content: (
        <div className="space-y-3">
          {rejected.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No rejected submissions
            </p>
          ) : (
            rejected.map((submission) => (
              <SubmissionCard key={submission._id} submission={submission} />
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
          <h1 className="text-4xl font-bold text-white">My Submissions</h1>
          <p className="text-gray-400 mt-1">Track your clip submissions and earnings</p>
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
            <Link href="/dashboard/clipper/submit">
              <p className="text-purple-400 hover:text-purple-300 font-medium mt-6 inline-block">
                ← Submit another clip
              </p>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
