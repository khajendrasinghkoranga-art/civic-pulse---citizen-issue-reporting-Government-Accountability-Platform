'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Navbar from '@/components/layout/Navbar';
import type { ApiResponse, IssueFeedback } from '@/types';

export default function FeedbackClient({ issueId }: { issueId: string }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<IssueFeedback | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || !issueId) return;
    const checkExisting = async () => {
      try {
        const res = await apiClient.get<ApiResponse<IssueFeedback>>(`/feedback/issues/${issueId}`);
        if (res.data) setExisting(res.data);
      } catch { /* no existing feedback */ } finally {
        setCheckingExisting(false);
      }
    };
    checkExisting();
  }, [isAuthenticated, issueId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post(`/feedback/issues/${issueId}`, { rating, comment: comment || undefined });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated || checkingExisting) {
    return (
      <>
        <Navbar />
        <main className="app-main">
          <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner spinner-lg"></div></div>
        </main>
      </>
    );
  }

  if (success || existing) {
    const displayRating = existing?.rating || rating;
    return (
      <>
        <Navbar />
        <main className="app-main">
          <div className="container" style={{ maxWidth: 600 }}>
            <div className="success-overlay">
              <div className="success-card glass-card">
                <div className="success-icon">⭐</div>
                <h2 className="success-title">
                  {existing ? 'Feedback Already Submitted' : 'Thank You for Your Feedback!'}
                </h2>
                <div className="star-display" style={{ fontSize: '2rem', margin: 'var(--space-md) 0' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ opacity: s <= displayRating ? 1 : 0.2 }}>⭐</span>
                  ))}
                </div>
                {(existing?.comment || comment) && (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    &quot;{existing?.comment || comment}&quot;
                  </p>
                )}
                <Link href={`/issues/${issueId}`} className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                  ← Back to Issue
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="app-main">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="breadcrumb">
            <Link href="/issues" className="breadcrumb-link">Issues</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href={`/issues/${issueId}`} className="breadcrumb-link">Issue Detail</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Feedback</span>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
              <h1 className="page-title" style={{ fontSize: '1.5rem' }}>⭐ Rate the Resolution</h1>
              <p className="page-subtitle">How satisfied are you with how this issue was handled?</p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="star-rating" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="star-btn"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      fontSize: '2.5rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      transform: (hoverRating >= s || rating >= s) ? 'scale(1.2)' : 'scale(1)',
                      opacity: (hoverRating >= s || rating >= s) ? 1 : 0.3,
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="feedback-comment">Comments (Optional)</label>
                <textarea
                  id="feedback-comment"
                  className="form-textarea"
                  placeholder="Share your experience with the resolution process..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <button type="submit" className="btn btn-accent btn-lg" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Submitting...</> : '📝 Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
