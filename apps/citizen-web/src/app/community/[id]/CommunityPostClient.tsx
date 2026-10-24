'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { timeAgo, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import type { CommunityPost, CommunityComment, ApiResponse } from '@/types';

export default function CommunityPostClient({ id }: { id: string }) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const fetchPost = async () => {
      try {
        const [postRes, commentsRes] = await Promise.allSettled([
          apiClient.get<ApiResponse<CommunityPost>>(`/community/posts/${id}`),
          apiClient.get<ApiResponse<CommunityComment[]>>(`/community/posts/${id}/comments`),
        ]);
        if (postRes.status === 'fulfilled') setPost(postRes.value.data);
        if (commentsRes.status === 'fulfilled') setComments(commentsRes.value.data || []);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [isAuthenticated, id]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await apiClient.post(`/community/posts/${id}/comments`, { comment: newComment });
      setNewComment('');
      const res = await apiClient.get<ApiResponse<CommunityComment[]>>(`/community/posts/${id}/comments`);
      setComments(res.data || []);
    } catch { /* ignore */ } finally {
      setCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiClient.delete(`/community/posts/${id}`);
      router.push('/community');
    } catch { /* ignore */ }
  };

  if (authLoading || !isAuthenticated || loading) {
    return (
      <>
        <Navbar />
        <main className="app-main">
          <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner spinner-lg"></div></div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="app-main">
          <div className="container">
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-title">Post Not Found</div>
              <Link href="/community" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>← Back to Community</Link>
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
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="breadcrumb">
            <Link href="/community" className="breadcrumb-link">Community</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{post.title}</span>
          </div>

          <article className="glass-card" style={{ padding: 'var(--space-xl)' }}>
            <div className="community-post-header" style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="avatar avatar-lg">{post.user?.name?.charAt(0).toUpperCase() || '?'}</div>
              <div>
                <span className="community-post-author" style={{ fontSize: '1rem' }}>{post.user?.name}</span>
                <span className="community-post-time">{formatDateTime(post.createdAt)}</span>
              </div>
              {post.userId === user?.id && (
                <button className="btn btn-ghost btn-sm" onClick={handleDelete} style={{ marginLeft: 'auto', color: 'var(--danger)' }}>
                  🗑️ Delete
                </button>
              )}
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>{post.title}</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{post.content}</p>

            {post.locality && (
              <div style={{ marginTop: 'var(--space-lg)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                📍 {post.locality}{post.city ? `, ${post.city}` : ''}
              </div>
            )}
          </article>

          <div className="glass-card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
              💬 Comments ({comments.length})
            </h2>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleComment(); }}
              />
              <button className="btn btn-primary" onClick={handleComment} disabled={commentLoading || !newComment.trim()}>
                {commentLoading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> : 'Send'}
              </button>
            </div>

            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-lg)' }}>
                No comments yet. Start the conversation!
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
