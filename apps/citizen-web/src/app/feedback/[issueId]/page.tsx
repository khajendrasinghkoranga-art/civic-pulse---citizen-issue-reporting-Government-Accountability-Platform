import { Suspense } from 'react';
import FeedbackClient from './FeedbackClient';

export const dynamic = 'force-dynamic';

export default async function FeedbackPage({ params }: { params: Promise<{ issueId: string }> }) {
  const { issueId } = await params;
  return (
    <Suspense fallback={
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    }>
      <FeedbackClient issueId={issueId} />
    </Suspense>
  );
}
