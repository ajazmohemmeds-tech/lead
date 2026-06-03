export interface ScoringRule {
  id: number;
  name: string;
  rule_type: 'demographic' | 'behavioral';
  field: string;
  operator: string;
  value: string;
  points: number;
  is_active: boolean;
}

export interface ScoringRuleCreate {
  name: string;
  rule_type: 'demographic' | 'behavioral';
  field: string;
  operator: string;
  value: string;
  points: number;
  is_active?: boolean;
}

export interface ScoringRuleUpdate {
  name?: string;
  rule_type?: 'demographic' | 'behavioral';
  field?: string;
  operator?: string;
  value?: string;
  points?: number;
  is_active?: boolean;
}

export interface BehavioralEvent {
  id: number;
  lead_id: number;
  event_type: string;
  event_details: string;
  score_delta: number;
  timestamp: string;
}

export interface BehavioralEventBase {
  event_type: string;
  event_details: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  job_role: string;
  company_size: number;
  industry: string;
  phone?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
  category: 'Hot' | 'Warm' | 'Cold';
  score: number;
  created_at: string;
  updated_at: string;
}

export interface LeadCreate {
  name: string;
  email: string;
  company: string;
  job_role: string;
  company_size: number;
  industry: string;
  phone?: string;
  initial_events?: BehavioralEventBase[];
}

export interface LeadUpdate {
  name?: string;
  email?: string;
  company?: string;
  job_role?: string;
  company_size?: number;
  industry?: string;
  phone?: string;
  status?: string;
}

export interface LeadDetail extends Lead {
  events: BehavioralEvent[];
}

export interface CategoryStats {
  hot: number;
  warm: number;
  cold: number;
}

export interface StatusStats {
  new: number;
  contacted: number;
  qualified: number;
  unqualified: number;
}

export interface ActivityFeedItem {
  id: number;
  lead_id: number;
  lead_name: string;
  event_type: string;
  event_details: string;
  score_delta: number;
  timestamp: string;
}

export interface DashboardStats {
  total_leads: number;
  category_counts: CategoryStats;
  status_counts: StatusStats;
  recent_activity: ActivityFeedItem[];
  average_score: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || JSON.stringify(errorJson);
    } catch {
      // JSON parsing failed, use status text
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Leads
  getLeads: (params?: {
    search?: string;
    status?: string;
    category?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.sort_order) query.append('sort_order', params.sort_order);
    
    return fetchJson<Lead[]>(`/api/leads?${query.toString()}`, { method: 'GET' });
  },

  getLead: (id: number) => {
    return fetchJson<LeadDetail>(`/api/leads/${id}`, { method: 'GET' });
  },

  createLead: (lead: LeadCreate) => {
    return fetchJson<Lead>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  },

  updateLead: (id: number, update: LeadUpdate) => {
    return fetchJson<Lead>(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  },

  deleteLead: (id: number) => {
    return fetchJson<{ message: string }>(`/api/leads/${id}`, { method: 'DELETE' });
  },

  logLeadEvent: (leadId: number, event: BehavioralEventBase) => {
    return fetchJson<BehavioralEvent>(`/api/leads/${leadId}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  // Scoring Rules
  getRules: () => {
    return fetchJson<ScoringRule[]>('/api/rules', { method: 'GET' });
  },

  createRule: (rule: ScoringRuleCreate) => {
    return fetchJson<ScoringRule>('/api/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  updateRule: (id: number, update: ScoringRuleUpdate) => {
    return fetchJson<ScoringRule>(`/api/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  },

  deleteRule: (id: number) => {
    return fetchJson<{ message: string }>(`/api/rules/${id}`, { method: 'DELETE' });
  },

  // Dashboard Stats
  getDashboardStats: () => {
    return fetchJson<DashboardStats>('/api/dashboard/stats', {
      method: 'GET',
      next: { revalidate: 0 }, // Disable Next.js fetch caching to always get fresh DB data
    });
  },

  // Admin
  seedDatabase: () => {
    return fetchJson<{ status: string; message: string }>('/api/seed', { method: 'POST' });
  },
};
