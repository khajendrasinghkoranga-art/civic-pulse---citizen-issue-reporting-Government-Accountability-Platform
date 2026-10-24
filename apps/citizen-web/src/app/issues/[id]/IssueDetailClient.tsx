'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel, formatDateTime, timeAgo } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import type { Issue, IssueStatusHistory, CommunityComment, ApiResponse } from '@/types';

export default function IssueDetailClient({ id }: { id: string }) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [history, setHistory] = useState<IssueStatusHistory[]>([]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchIssue = async () => {
      try {
        const [issueRes, historyRes, commentsRes] = await Promise.allSettled([
          apiClient.get<ApiResponse<Issue>>(`/issues/${id}`),
          apiClient.get<ApiResponse<IssueStatusHistory[]>>(`/issues/${id}/history`),
          apiClient.get<ApiResponse<CommunityComment[]>>(`/community/issues/${id}/comments`),
        ]);

        if (issueRes.status === 'fulfilled') setIssue(issueRes.value.data);
        if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data || []);
        if (commentsRes.status === 'fulfilled') setComments(commentsRes.value.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [isAuthenticated, id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await apiClient.post(`/community/issues/${id}/comments`, { comment: newComment });
      setNewComment('');
      const res = await apiClient.get<ApiResponse<CommunityComment[]>>(`/community/issues/${id}/comments`);
      setComments(res.data || []);
    } catch {
      // silently fail
    } finally {
      setCommentLoading(false);
    }
  };

  if (authLoading || !isAuthenticated || loading) {
    return (
      <>
        <Navbar />
        <main className="app-main">
          <div className="loading-center" style={{ minHeight: '60vh' }}>
            <div className="spinner spinner-lg"></div>
          </div>
        </main>
      </>
    );
  }

  if (!issue) {
    return (
      <>
        <Navbar />
        <main className="app-main">
          <div className="container">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">Issue Not Found</div>
              <p>The issue you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
              <Link href="/issues" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                ← Back to Issues
              </Link>
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
        <div className="container" style={{ maxWidth: 960 }}>
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/issues" className="breadcrumb-link">My Issues</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{issue.title}</span>
          </div>

          {/* Issue Header */}
          <div className="issue-detail-header glass-card">
            <div className="issue-detail-header-top">
              <div>
                <h1 className="issue-detail-title">{issue.title}</h1>
                <div className="issue-detail-meta">
                  <span>📁 {issue.category?.name || 'General'}</span>
                  <span>•</span>
                  <span>🕐 {formatDateTime(issue.createdAt)} ({timeAgo(issue.createdAt)})</span>
                  {issue.address && (
                    <>
                      <span>•</span>
                      <span>📍 {[issue.address, issue.locality, issue.city].filter(Boolean).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexShrink: 0 }}>
                <span
                  className="badge"
                  style={{
                    background: `${getPriorityColor(issue.priority)}20`,
                    color: getPriorityColor(issue.priority),
                  }}
                >
                  {getPriorityLabel(issue.priority)} Priority
                </span>
                <span
                  className="badge"
                  style={{
                    background: `${getStatusColor(issue.status)}20`,
                    color: getStatusColor(issue.status),
                  }}
                >
                  <span className="badge-dot" style={{ background: getStatusColor(issue.status) }}></span>
                  {getStatusLabel(issue.status)}
                </span>
              </div>
            </div>

            {/* Status Progress Bar */}
            <div className="status-progress">
              {['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'].map((s, i) => {
                const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'];
                const currentIdx = statuses.indexOf(issue.status);
                const isActive = i <= currentIdx && issue.status !== 'REJECTED';
                return (
                  <div key={s} className="status-progress-step">
                    <div className={`status-progress-dot ${isActive ? 'active' : ''}`}>
                      {isActive ? '✓' : i + 1}
                    </div>
                    <span className={`status-progress-label ${isActive ? 'active' : ''}`}>
                      {getStatusLabel(s)}
                    </span>
                    {i < 3 && <div className={`status-progress-line ${i < currentIdx && issue.status !== 'REJECTED' ? 'active' : ''}`}></div>}
                  </div>
                );
              })}
            </div>

            {issue.status === 'REJECTED' && (
              <div className="alert alert-error" style={{ marginTop: 'var(--space-md)' }}>
                <span>❌</span>
                <span>This issue has been rejected by the department.</span>
              </div>
            )}
          </div>

          {/* Issue Description */}
          <div className="issue-detail-body glass-card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Description</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{issue.description}</p>

            {issue.evidence && issue.evidence.length > 0 && (
              <div style={{ marginTop: 'var(--space-xl)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>📎 Evidence</h3>
                <div className="evidence-grid">
                  {issue.evidence.map((ev) => (
                    <a key={ev.id} href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="evidence-item glass-card">
                      {ev.fileType.startsWith('image') ? (
                        <img src={ev.fileUrl} alt="Evidence" className="evidence-img" />
                      ) : (
                        <div className="evidence-file">📄 {ev.fileType}</div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SLA Info */}
          {issue.slaDueAt && (
            <div className="glass-card" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>⏰ SLA Deadline</h3>
              <p style={{ color: new Date(issue.slaDueAt) < new Date() ? 'var(--danger)' : 'var(--text-secondary)' }}>
                {formatDateTime(issue.slaDueAt)}
                {new Date(issue.slaDueAt) < new Date() && ' (Overdue!)'}
              </p>
            </div>
          )}

          {/* Feedback CTA */}
          {issue.status === 'RESOLVED' && issue.reporterId === user?.id && (
            <div className="glass-card" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-lg)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                How was the resolution? ⭐
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                Your feedback helps improve government services.
              </p>
              <Link href={`/feedback/${issue.id}`} className="btn btn-accent">
                📝 Submit Feedback
              </Link>
            </div>
          )}

          {/* Status History */}
          {history.length > 0 && (
            <div className="glass-card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>📜 Status History</h2>
              <div className="timeline">
                {history.map((h) => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-dot" style={{ background: getStatusColor(h.newStatus) }}></div>
                    <div className="timeline-content">
                      <div className="timeline-status">
                        <span style={{ color: getStatusColor(h.oldStatus) }}>{getStatusLabel(h.oldStatus)}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                        <span style={{ color: getStatusColor(h.newStatus), fontWeight: 700 }}>{getStatusLabel(h.newStatus)}</span>
                      </div>
                      {h.remarks && <p className="timeline-remarks">{h.remarks}</p>}
                      <div className="timeline-meta">
                        <span>By {h.changer?.name || 'System'}</span>
                        <span>•</span>
                        <span>{formatDateTime(h.changedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="glass-card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>💬 Discussion ({comments.length})</h2>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
              />
              <button className="btn btn-primary" onClick={handleAddComment} disabled={commentLoading || !newComment.trim()}>
                {commentLoading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> : 'Send'}
              </button>
            </div>

            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-lg)' }}>
                No comments yet. Be the first to discuss this issue.
              </p>
            ) : (
              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {c.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{c.user?.name || 'Anonymous'}</span>
                        <span className="comment-time">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="comment-text">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
