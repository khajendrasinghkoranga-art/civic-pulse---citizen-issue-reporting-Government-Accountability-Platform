'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { timeAgo } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import type { CommunityPost, ApiResponse } from '@/types';

export default function CommunityPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPosts();
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get<ApiResponse<CommunityPost[]>>('/community/posts');
      setPosts(res.data || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      await apiClient.post('/community/posts', {
        title: newTitle,
        content: newContent,
        locality: newLocality || undefined,
        city: undefined,
      });
      setNewTitle('');
      setNewContent('');
      setNewLocality('');
      setShowCreate(false);
      fetchPosts();
    } catch { /* ignore */ } finally {
      setCreating(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <>
      <Navbar />
      <main className="app-main">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="page-title">💬 Community Forum</h1>
              <p className="page-subtitle">Connect with fellow citizens and discuss local issues</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? '✕ Cancel' : '✏️ New Post'}
            </button>
          </div>

          {/* Create Post Form */}
          {showCreate && (
            <form onSubmit={handleCreate} className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>Create a Post</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="post-title">Title *</label>
                <input
                  id="post-title"
                  type="text"
                  className="form-input"
                  placeholder="What's on your mind?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="post-content">Content *</label>
                <textarea
                  id="post-content"
                  className="form-textarea"
                  placeholder="Share your thoughts with the community..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="post-locality">Locality (Optional)</label>
                <input
                  id="post-locality"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Koramangala, Indiranagar"
                  value={newLocality}
                  onChange={(e) => setNewLocality(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
                <button type="submit" className="btn btn-accent" disabled={creating}>
                  {creating ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Posting...</> : '🚀 Publish Post'}
                </button>
              </div>
            </form>
          )}

          {/* Posts List */}
          {loading ? (
            <div className="loading-center"><div className="spinner spinner-lg"></div></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-title">No Posts Yet</div>
              <p>Be the first to start a conversation in the community!</p>
              <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }} onClick={() => setShowCreate(true)}>
                ✏️ Create First Post
              </button>
            </div>
          ) : (
            <div className="community-posts-list">
              {posts.map((post) => (
                <Link href={`/community/${post.id}`} key={post.id} className="community-post-card glass-card">
                  <div className="community-post-header">
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.875rem' }}>
                      {post.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <span className="community-post-author">{post.user?.name || 'Anonymous'}</span>
                      <span className="community-post-time">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                  <h3 className="community-post-title">{post.title}</h3>
                  <p className="community-post-preview">{post.content.slice(0, 200)}{post.content.length > 200 ? '...' : ''}</p>
                  <div className="community-post-footer">
                    {post.locality && <span className="community-post-locality">📍 {post.locality}</span>}
                    <span className="community-post-comments">💬 {post._count?.comments || 0} comments</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
