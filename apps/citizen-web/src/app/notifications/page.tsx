'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { timeAgo } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import type { Notification, ApiResponse } from '@/types';

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
        setNotifications(res.data || []);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [isAuthenticated]);

  const markRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner spinner-lg"></div></div>;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <Navbar />
      <main className="app-main">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="page-title">🔔 Notifications</h1>
              <p className="page-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
                ✓ Mark All Read
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner spinner-lg"></div></div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <div className="empty-state-title">No Notifications</div>
              <p>You&apos;ll receive notifications when there are updates on your issues.</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item glass-card ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notif.isRead) markRead(notif.id);
                    if (notif.issueId) router.push(`/issues/${notif.issueId}`);
                  }}
                  style={{ cursor: notif.issueId ? 'pointer' : 'default' }}
                >
                  <div className="notification-item-icon">
                    {notif.type === 'STATUS_UPDATE' ? '🔄' : notif.type === 'COMMENT' ? '💬' : '📢'}
                  </div>
                  <div className="notification-item-content">
                    <h4 className="notification-item-title">{notif.title}</h4>
                    <p className="notification-item-msg">{notif.message}</p>
                  </div>
                  <span className="notification-item-time">{timeAgo(notif.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
