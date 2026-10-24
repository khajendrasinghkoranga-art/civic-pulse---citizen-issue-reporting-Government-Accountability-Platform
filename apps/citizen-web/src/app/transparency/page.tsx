'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import type { ApiResponse, AnalyticsOverview } from '@/types';

export default function TransparencyPage() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get<ApiResponse<AnalyticsOverview>>('/analytics/overview');
        setData(res.data);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <>
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'app-main' : ''}>
        <div className="container">
          {!isAuthenticated && (
            <nav className="landing-nav" style={{ position: 'relative' }}>
              <div className="landing-nav-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 var(--space-lg)' }}>
                <Link href="/" className="landing-logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <img
                    src="/civicpulse-logo.png"
                    alt="CivicPulse"
                    style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                  />
                </Link>
                <div className="landing-nav-links">
                  <Link href="/login" className="btn btn-ghost">Sign In</Link>
                  <Link href="/register" className="btn btn-primary">Get Started</Link>
                </div>
              </div>
            </nav>
          )}

          <div className="page-header" style={{ paddingTop: isAuthenticated ? undefined : 'var(--space-3xl)' }}>
            <h1 className="page-title">📊 Government Transparency Dashboard</h1>
            <p className="page-subtitle">
              Real-time data on civic issue resolution and government accountability
            </p>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner spinner-lg"></div></div>
          ) : !data ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No Data Available</div>
              <p>Analytics data will appear as issues are reported and resolved.</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-4">
                <div className="stat-card glass-card">
                  <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)' }}>📋</div>
                  <div className="stat-value">{data.totals?.issues?.toLocaleString() || 0}</div>
                  <div className="stat-label">Total Issues Reported</div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-500)' }}>✅</div>
                  <div className="stat-value">{data.totals?.resolvedIssues?.toLocaleString() || 0}</div>
                  <div className="stat-label">Issues Resolved</div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>📈</div>
                  <div className="stat-value">{data.totals?.resolutionRate ? `${Math.round(data.totals.resolutionRate)}%` : '—'}</div>
                  <div className="stat-label">Resolution Rate</div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>🏛️</div>
                  <div className="stat-value">{data.totals?.activeDepartments || 0}</div>
                  <div className="stat-label">Active Departments</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-2" style={{ marginTop: 'var(--space-xl)' }}>
                {/* By Status */}
                <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Issues by Status</h3>
                  <div className="bar-chart">
                    {(data.byStatus || []).map((item) => {
                      const max = Math.max(...(data.byStatus || []).map((s) => s.count), 1);
                      return (
                        <div key={item.status} className="bar-chart-row">
                          <span className="bar-chart-label">{getStatusLabel(item.status)}</span>
                          <div className="bar-chart-track">
                            <div
                              className="bar-chart-fill"
                              style={{
                                width: `${(item.count / max) * 100}%`,
                                background: getStatusColor(item.status),
                              }}
                            ></div>
                          </div>
                          <span className="bar-chart-value">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By Priority */}
                <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Issues by Priority</h3>
                  <div className="bar-chart">
                    {(data.byPriority || []).map((item) => {
                      const max = Math.max(...(data.byPriority || []).map((p) => p.count), 1);
                      const colors: Record<string, string> = { LOW: '#6b7280', MEDIUM: '#f59e0b', HIGH: '#f97316', URGENT: '#ef4444' };
                      return (
                        <div key={item.priority} className="bar-chart-row">
                          <span className="bar-chart-label">{item.priority}</span>
                          <div className="bar-chart-track">
                            <div
                              className="bar-chart-fill"
                              style={{
                                width: `${(item.count / max) * 100}%`,
                                background: colors[item.priority] || '#6b7280',
                              }}
                            ></div>
                          </div>
                          <span className="bar-chart-value">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Public Audit Trail Notice */}
              <div className="glass-card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-2xl)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🛡️</div>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Public & Transparent Audit Trail</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                  All issue status transitions, staff assignments, and resolutions are permanently logged in an open audit trail.
                  This ensures complete public accountability and prevents tampering.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
