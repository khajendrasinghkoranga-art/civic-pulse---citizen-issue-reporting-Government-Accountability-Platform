// ── Auth Types ──
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CITIZEN' | 'DEPARTMENT_STAFF' | 'DEPARTMENT_ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
  isActive: boolean;
  identityVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ── Issue Types ──
export interface IssueCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  defaultPriority: string;
  defaultSlaHours: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  latitude?: number;
  longitude?: number;
  address?: string;
  sector?: string;
  ward?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAnonymous?: boolean;
  trackingId?: string;
  slaDueAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  reporterId: string;
  categoryId: string;
  category?: IssueCategory;
  reporter?: { id: string; name: string };
  evidence?: IssueEvidence[];
  _count?: { comments: number };
}

export interface IssueEvidence {
  id: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  createdAt: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  categoryId: string;
  priority?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  sector?: string;
  ward?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAnonymous?: boolean;
}

export interface SectorInfo {
  id: string;
  name: string;
  zone: string;
  center: { lat: number; lng: number };
  dispatchUnit: string;
  office: string;
  helpline: string;
  totalCount: number;
  activeCount: number;
  resolvedCount: number;
  urgentCount: number;
  capacityThreshold: number;
  loadRatio: number;
  loadPercentage: number;
  loadStatus: 'OPTIMAL' | 'MODERATE LOAD' | 'HIGH LOAD' | 'SURGE / OVERLOAD';
  statusBadgeColor: string;
}

export interface SectorWorkloadResponse {
  totalIssues: number;
  totalActive: number;
  sectorCount: number;
  sectors: SectorInfo[];
}

export interface IssueStatusHistory {
  id: string;
  oldStatus: string;
  newStatus: string;
  remarks?: string;
  changedAt: string;
  changer: { id: string; name: string };
}

// ── Notification Types ──
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  issueId?: string;
}

// ── Community Types ──
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  locality?: string;
  city?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: { id: string; name: string };
  _count?: { comments: number };
}

export interface CommunityComment {
  id: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string };
}

// ── Feedback Types ──
export interface IssueFeedback {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ── Pagination ──
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

// ── Analytics Types ──
export interface AnalyticsOverview {
  totals: {
    issues: number;
    resolvedIssues: number;
    resolutionRate: number;
    activeUsers: number;
    activeDepartments: number;
  };
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  recentIssues: Issue[];
}
