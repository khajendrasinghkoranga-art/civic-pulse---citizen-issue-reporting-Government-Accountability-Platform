'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel, formatDateTime, timeAgo } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import type { Issue, ApiResponse } from '@/types';

export default function IssuesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [viewScope, setViewScope] = useState<'all' | 'my'>('all');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchIssues = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ sortBy: 'createdAt', sortOrder: 'desc', limit: '50' });
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (searchQuery) params.set('search', searchQuery);

        const endpoint = viewScope === 'all' ? `/issues?${params}` : `/issues/my?${params}`;
        const res = await apiClient.get<ApiResponse<Issue[]>>(endpoint);
        setIssues(res.data || []);
      } catch {
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [isAuthenticated, viewScope, statusFilter, searchQuery]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="app-main">
        <div className="container">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">{viewScope === 'all' ? 'All City Issues' : 'My Reported Issues'}</h1>
              <p className="page-subtitle">
                {viewScope === 'all' 
                  ? 'Real-time feed of all civic complaints across Dehradun from the database' 
                  : 'Track all civic issues submitted by your account'}
              </p>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className={`btn ${viewScope === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  onClick={() => setViewScope('all')}
                >
                  🌐 All City Issues (Live DB)
                </button>
                <button
                  type="button"
                  className={`btn ${viewScope === 'my' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  onClick={() => setViewScope('my')}
                >
                  👤 My Complaints
                </button>
              </div>
            </div>
            <Link href="/report" className="btn btn-primary">
              📝 Report New Issue
            </Link>
          </div>

          {/* Filters */}
          <div className="issues-filters">
            <div className="tabs">
              {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  className={`tab ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'ALL' ? 'All' : getStatusLabel(status)}
                </button>
              ))}
            </div>

            <div className="form-group" style={{ maxWidth: 320, marginTop: 'var(--space-md)' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Issues List */}
          {loading ? (
            <div className="loading-center"><div className="spinner spinner-lg"></div></div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No issues found</div>
              <p>{statusFilter !== 'ALL' ? 'No issues match the selected filter.' : 'You haven\'t reported any issues yet.'}</p>
              <Link href="/report" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                📝 Report Your First Issue
              </Link>
            </div>
          ) : (
            <div className="issue-list">
              {issues.map((issue) => (
                <Link href={`/issues/${issue.id}`} key={issue.id} className="issue-list-item glass-card">
                  <div className="issue-list-item-header">
                    <h3 className="issue-list-item-title">{issue.title}</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <span
                        className="badge"
                        style={{
                          background: `${getPriorityColor(issue.priority)}20`,
                          color: getPriorityColor(issue.priority),
                        }}
                      >
                        {getPriorityLabel(issue.priority)}
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
                  <p className="issue-list-item-desc">{issue.description.slice(0, 150)}{issue.description.length > 150 ? '...' : ''}</p>
                  <div className="issue-list-item-meta">
                    <span>📁 {issue.category?.name || 'General'}</span>
                    {issue.address && <><span>•</span><span>📍 {issue.address}</span></>}
                    <span>•</span>
                    <span>🕐 {formatDateTime(issue.createdAt)} ({timeAgo(issue.createdAt)})</span>
                    {issue._count?.comments ? <><span>•</span><span>💬 {issue._count.comments}</span></> : null}
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
