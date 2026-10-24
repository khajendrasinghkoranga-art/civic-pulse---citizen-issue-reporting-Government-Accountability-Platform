import { Suspense } from 'react';
import IssueDetailClient from './IssueDetailClient';

export const dynamic = 'force-dynamic';

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    }>
      <IssueDetailClient id={id} />
    </Suspense>
  );
}
