/**
 * PRISM Central Enterprise API Client
 */

const isServer = typeof window === "undefined";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (isServer ? "http://127.0.0.1:8000/api/v1" : "/api/v1");

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: string;
  role_display: string;
  bureau?: string;
  bureau_code?: string;
  regional_office?: string;
  permissions: string[];
}

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("prism_token");
};

export const setStoredToken = (token: string, user: UserSession): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("prism_token", token);
  localStorage.setItem("prism_user", JSON.stringify(user));
};

export const clearStoredSession = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("prism_token");
  localStorage.removeItem("prism_user");
};

export const getStoredUser = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("prism_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      clearStoredSession();
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let errorDetail = "API request failed";
    try {
      const errJson = await res.json();
      errorDetail = errJson.message || errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return apiRequest<{ access_token: string; refresh_token: string; user: UserSession }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  logout: async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      clearStoredSession();
    }
  },
  getMe: async () => apiRequest<UserSession>("/auth/me"),
  changePassword: async (old_password: string, new_password: string) =>
    apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ old_password, new_password }),
    }),

  // Analytics & Executive Dashboard
  getDashboard: async (bureau_id?: string, regional_office_id?: string) => {
    const params = new URLSearchParams();
    if (bureau_id) params.append("bureau_id", bureau_id);
    if (regional_office_id) params.append("regional_office_id", regional_office_id);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any>(`/analytics/dashboard${qs}`);
  },
  getReport: async (report_type: string, bureau_id?: string) => {
    const qs = bureau_id ? `?bureau_id=${bureau_id}` : "";
    return apiRequest<any>(`/analytics/reports/${report_type}${qs}`);
  },
  getReportExportUrl: (report_type: string) => `${API_BASE}/analytics/reports/${report_type}/export-csv`,

  // Institutions
  getInstitutions: async (params: { search?: string; state?: string; institution_type?: string; approval_status?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params.search) q.append("search", params.search);
    if (params.state) q.append("state", params.state);
    if (params.institution_type) q.append("institution_type", params.institution_type);
    if (params.approval_status) q.append("approval_status", params.approval_status);
    if (params.skip !== undefined) q.append("skip", params.skip.toString());
    if (params.limit !== undefined) q.append("limit", params.limit.toString());
    return apiRequest<{ items: any[]; total: number; skip: number; limit: number }>(`/institutions?${q.toString()}`);
  },
  getInstitution360: async (id: string) => apiRequest<any>(`/institutions/${id}`),
  createInstitution: async (data: any) =>
    apiRequest("/institutions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  checkInstitutionDuplicate: async (aicte_id: string, name: string, state: string) => {
    const q = new URLSearchParams({ aicte_id, name, state });
    return apiRequest<{ has_duplicate: boolean; matches: any[] }>(`/institutions/check-duplicate?${q.toString()}`);
  },
  getInstitutionsExportUrl: () => `${API_BASE}/institutions/export/csv`,

  // Complaints
  getComplaints: async (filters: any) => {
    const q = new URLSearchParams();
    Object.keys(filters || {}).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
        q.append(key, filters[key].toString());
      }
    });
    return apiRequest<{ items: any[]; total: number; skip: number; limit: number }>(`/complaints?${q.toString()}`);
  },
  getComplaintDetail: async (id: string) => apiRequest<any>(`/complaints/${id}`),
  createComplaint: async (data: any) =>
    apiRequest("/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  transitionStage: async (id: string, to_stage_id: string, remarks?: string) =>
    apiRequest(`/complaints/${id}/transition`, {
      method: "POST",
      body: JSON.stringify({ to_stage_id, remarks }),
    }),
  assignOfficer: async (id: string, assigned_to_id: string, assignment_reason?: string) =>
    apiRequest(`/complaints/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ assigned_to_id, assignment_reason }),
    }),
  addComment: async (id: string, comment_text: string, is_internal = true) =>
    apiRequest(`/complaints/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment_text, is_internal }),
    }),
  getCategories: async () => apiRequest<any[]>("/complaints/categories"),

  // AI Matching Intelligence
  getAIMatches: async (classification?: string, status?: string) => {
    const q = new URLSearchParams();
    if (classification) q.append("classification", classification);
    if (status) q.append("status", status);
    return apiRequest<{ items: any[]; total: number }>(`/ai/matches?${q.toString()}`);
  },
  reviewAIMatch: async (match_id: string, action: string, comments?: string, relationship_type?: string) =>
    apiRequest(`/ai/matches/${match_id}/review`, {
      method: "POST",
      body: JSON.stringify({ action, comments, relationship_type }),
    }),
  triggerFullScan: async () => apiRequest("/ai/scan-all", { method: "POST" }),
  getRelatedGroups: async (institution_id?: string) => {
    const q = institution_id ? `?institution_id=${institution_id}` : "";
    return apiRequest<any[]>(`/ai/related-groups${q}`);
  },
  createRelatedGroup: async (data: any) =>
    apiRequest("/ai/related-groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Cross-Bureau Coordination
  getCoordinationRequests: async (bureau_id?: string, status?: string) => {
    const q = new URLSearchParams();
    if (bureau_id) q.append("bureau_id", bureau_id);
    if (status) q.append("status", status);
    return apiRequest<{ items: any[]; total: number }>(`/coordination?${q.toString()}`);
  },
  createCoordinationRequest: async (data: any) =>
    apiRequest("/coordination", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  postCoordinationMessage: async (request_id: string, message: string) =>
    apiRequest(`/coordination/${request_id}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  updateCoordinationStatus: async (request_id: string, status: string, resolution_summary?: string) =>
    apiRequest(`/coordination/${request_id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, resolution_summary }),
    }),

  // Evidence
  uploadEvidence: async (complaint_id: string, file: File, document_category: string) => {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append("complaint_id", complaint_id);
    formData.append("document_category", document_category);
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/evidence/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.detail || "Upload failed");
    }
    return res.json();
  },
  getEvidenceList: async (complaint_id: string) => apiRequest<any[]>(`/evidence/complaint/${complaint_id}`),
  getDownloadUrl: (evidence_id: string) => `${API_BASE}/evidence/download/${evidence_id}`,

  // Notifications
  getNotifications: async (unread_only = false) => apiRequest<any[]>(`/notifications?unread_only=${unread_only}`),
  getUnreadCount: async () => apiRequest<{ unread_count: number }>("/notifications/unread-count"),
  markNotificationRead: async (id: string) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: async () => apiRequest("/notifications/mark-all-read", { method: "POST" }),

  // Workflows
  getStages: async () => apiRequest<any[]>("/workflows/stages"),
  getTransitions: async () => apiRequest<any[]>("/workflows/transitions"),

  // Users & Allocation
  getUsers: async (bureau_id?: string, role_id?: string) => {
    const q = new URLSearchParams();
    if (bureau_id) q.append("bureau_id", bureau_id);
    if (role_id) q.append("role_id", role_id);
    return apiRequest<any[]>(`/users?${q.toString()}`);
  },
  createUser: async (data: any) =>
    apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: async (id: string, data: any) =>
    apiRequest(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getRoles: async () => apiRequest<any[]>("/users/roles/all"),
  getBureaus: async () => apiRequest<any[]>("/users/bureaus/all"),
  getRegionalOffices: async () => apiRequest<any[]>("/users/regional-offices/all"),
  getOfficerWorkload: async (bureau_id?: string) => {
    const q = bureau_id ? `?bureau_id=${bureau_id}` : "";
    return apiRequest<any[]>(`/users/officers/workload${q}`);
  },

  // Audit
  getAuditLogs: async (params: { action?: string; resource_type?: string; user_email?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params.action) q.append("action", params.action);
    if (params.resource_type) q.append("resource_type", params.resource_type);
    if (params.user_email) q.append("user_email", params.user_email);
    if (params.skip !== undefined) q.append("skip", params.skip.toString());
    if (params.limit !== undefined) q.append("limit", params.limit.toString());
    return apiRequest<{ items: any[]; total: number; skip: number; limit: number }>(`/audit?${q.toString()}`);
  },

  // Settings
  getSettings: async () => apiRequest<any[]>("/settings"),
  updateSetting: async (key: string, value: any) =>
    apiRequest(`/settings/${key}`, {
      method: "PATCH",
      body: JSON.stringify({ setting_value: value }),
    }),
};
