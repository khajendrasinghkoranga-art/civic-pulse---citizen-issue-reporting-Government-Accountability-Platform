import { Suspense } from 'react';
import CommunityPostClient from './CommunityPostClient';

export const dynamic = 'force-dynamic';

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    }>
      <CommunityPostClient id={id} />
    </Suspense>
  );
}
