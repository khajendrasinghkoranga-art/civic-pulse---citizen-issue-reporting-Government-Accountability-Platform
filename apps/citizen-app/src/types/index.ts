export type UserRole = 'CITIZEN' | 'DEPARTMENT_STAFF' | 'DEPARTMENT_ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  organization?: string | null;
  sector?: string | null;
  designation?: string | null;
  isVerified: boolean;
  isActive: boolean;
  identityVerified: boolean;
  createdAt: string;
  updatedAt?: string;
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

export type IssueStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface IssueCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  defaultPriority: IssuePriority;
  defaultSlaHours: number;
}

export interface IssueEvidence {
  id: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  sector?: string | null;
  ward?: string | null;
  locality?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  isAnonymous?: boolean;
  resolutionProofUrl?: string | null;
  resolutionRemarks?: string | null;
  slaDueAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reporterId: string;
  categoryId: string;
  category?: IssueCategory;
  reporter?: { id: string; name: string };
  evidence?: IssueEvidence[];
  _count?: { comments: number };
}

export interface IssueStatusHistory {
  id: string;
  oldStatus: IssueStatus;
  newStatus: IssueStatus;
  remarks?: string | null;
  changedAt: string;
  changer?: { id: string; name: string };
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

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  locality?: string | null;
  city?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: { id: string; name: string; role?: string };
  _count?: { comments: number };
}

export interface CommunityComment {
  id: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string };
  replies?: CommunityComment[];
}

export interface PollCandidate {
  id: string;
  name: string;
  description?: string | null;
  _count?: { votes: number };
}

export interface Poll {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  status: string;
  startDate: string;
  endDate: string;
  candidates: PollCandidate[];
  _count?: { votes: number };
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  issueId?: string | null;
}

export interface IssueFeedback {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

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
