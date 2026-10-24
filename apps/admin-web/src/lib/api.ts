import { API_BASE_URL } from "./constants";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string | null;
  sector?: string | null;
  designation?: string | null;
  phone?: string | null;
}

export interface IssueEvidence {
  id: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export interface IssueStatusHistory {
  id: string;
  oldStatus: string;
  newStatus: string;
  remarks?: string | null;
  changedAt: string;
  changer: {
    id: string;
    name: string;
    role: string;
  };
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  sector?: string | null;
  ward?: string | null;
  locality?: string | null;
  city?: string | null;
  resolutionProofUrl?: string | null;
  resolutionRemarks?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string | null;
  };
  evidence?: IssueEvidence[];
  statusHistory?: IssueStatusHistory[];
}

export interface TransparencyPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  locality?: string | null;
  city?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

const TOKEN_KEY = "civicpulse_admin_token";
const USER_KEY = "civicpulse_admin_user";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredAuth = (token: string, user: UserProfile) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): UserProfile | null => {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const adminApi = {
  // Auth
  login: async (email: string, password: string): Promise<{ user: UserProfile; accessToken: string }> => {
    const data = await apiRequest<{ success: boolean; data: { user: UserProfile; accessToken: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    return data.data;
  },

  getMe: async (): Promise<UserProfile> => {
    const data = await apiRequest<{ success: boolean; data: UserProfile }>("/auth/me");
    return data.data;
  },

  getMagistrates: async (): Promise<UserProfile[]> => {
    const data = await apiRequest<{ success: boolean; data: UserProfile[] }>("/auth/magistrates");
    return data.data;
  },

  // Issues
  getIssues: async (filters: Record<string, string | number> = {}): Promise<{ issues: CivicIssue[]; pagination: any }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        params.append(k, String(v));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const data = await apiRequest<{ success: boolean; data: CivicIssue[]; pagination: any }>(`/issues${queryString}`);
    return { issues: data.data, pagination: data.pagination };
  },

  getIssueById: async (id: string): Promise<CivicIssue> => {
    const data = await apiRequest<{ success: boolean; data: CivicIssue }>(`/issues/${id}`);
    return data.data;
  },

  getIssueHistory: async (id: string): Promise<IssueStatusHistory[]> => {
    const data = await apiRequest<{ success: boolean; data: IssueStatusHistory[] }>(`/issues/${id}/history`);
    return data.data;
  },

  updateIssueStatus: async (
    id: string,
    payload: {
      status: "SUBMITTED" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
      remarks?: string;
      resolutionProofUrl?: string;
      broadcastToTransparency?: boolean;
    }
  ): Promise<CivicIssue> => {
    const data = await apiRequest<{ success: boolean; message: string; data: CivicIssue }>(`/issues/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  getSectorWorkload: async (): Promise<any> => {
    const data = await apiRequest<{ success: boolean; data: any }>("/issues/sectors/workload");
    return data.data;
  },

  // Transparency posts (community feed)
  getTransparencyPosts: async (): Promise<TransparencyPost[]> => {
    const data = await apiRequest<{ success: boolean; data: TransparencyPost[] }>("/community/posts");
    return data.data;
  },
};

export function getMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `http://localhost:5000${url}`;
  }
  return url;
}
