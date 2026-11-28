import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { IssuePriority, IssueStatus } from '@/types';

// In dev, the Metro bundler proxies /api/v1/* to localhost:5000 via metro.config.js,
// so we use the same origin that served the JS bundle (the ngrok tunnel URL).
function resolveApiBase(): string {
  // If explicitly set via .env, use that directly (e.g. Vercel production URL)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('10.0.2.2')) {
    return envUrl;
  }

  // Fallback production URL
  return 'https://backend-three-taupe-67.vercel.app/api/v1';
}

export const API_BASE_URL = resolveApiBase();

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${BACKEND_ORIGIN}${url}`;
  }
  return url;
}

export const COLORS = {
  primary: '#1E3A8A',       // Deep Civic Navy
  primaryLight: '#3B82F6',
  accent: '#F97316',        // Saffron Accent
  accentSoft: '#FFF7ED',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
};

export const STATUS_META: Record<IssueStatus, { label: string; color: string; bg: string }> = {
  SUBMITTED: { label: 'Submitted', color: '#4F46E5', bg: '#EEF2FF' },
  UNDER_REVIEW: { label: 'Under Review', color: '#D97706', bg: '#FEF3C7' },
  IN_PROGRESS: { label: 'In Progress', color: '#2563EB', bg: '#DBEAFE' },
  RESOLVED: { label: 'Resolved', color: '#059669', bg: '#D1FAE5' },
  REJECTED: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
};

export const PRIORITY_META: Record<IssuePriority, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Low', color: '#475569', bg: '#F1F5F9' },
  MEDIUM: { label: 'Medium', color: '#D97706', bg: '#FEF3C7' },
  HIGH: { label: 'High', color: '#EA580C', bg: '#FFEDD5' },
  URGENT: { label: 'Urgent', color: '#DC2626', bg: '#FEE2E2' },
};

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
