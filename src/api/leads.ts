import { apiClient, v1ApiClient } from './client';

export interface Lead {
    lead_id: string;
    email: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    phone?: string;
    status: string;
    source: string;
    score: number;
    tags?: string[];
    utm_source?: string;
    utm_campaign?: string;
    crm_contact_id?: string;
    last_activity_date?: string;
    created_at?: string;
}

export interface LeadsResponse {
    leads: Lead[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
}

export interface LeadStats {
    total_leads: number;
    new_today: number;
    new_this_week: number;
    by_source: Record<string, number>;
    by_status: Record<string, number>;
    top_campaigns: Array<{ campaign: string; leads: number }>;
}

export interface SourcesHealth {
    timestamp: string;
    sources: Record<string, { status: string; last_synced?: string; contact_count?: number }>;
}

// ─── Section 5: Raw Source Leads (/sales-marketing-ops/api/leads) ─────────────

export const leadsService = {
    getLeads: async (params?: { source?: string; status?: string; days?: number; page?: number; per_page?: number; limit?: number; offset?: number }): Promise<Lead[]> => {
        const { data } = await apiClient.get('/api/leads', { params });
        return data.leads ?? data;
    },

    getLeadStats: async (): Promise<LeadStats> => {
        const { data } = await apiClient.get('/api/leads/stats');
        return data;
    },

    getSourcesHealth: async (): Promise<SourcesHealth> => {
        const { data } = await apiClient.get('/api/leads/sources/health');
        return data;
    },

    getLead: async (leadId: string): Promise<Lead> => {
        const { data } = await apiClient.get(`/api/leads/${leadId}`);
        return data;
    },

    // POST /sales-marketing-ops/api/leads/sync
    syncLeads: async (): Promise<{ success: boolean; new_leads_count: number; sources_polled: string[]; polled_at: string }> => {
        const { data } = await apiClient.post('/api/leads/sync');
        return data;
    },

    // POST /sales-marketing-ops/api/leads/sync-signups
    syncSignups: async (): Promise<{ success: boolean; new_leads_count: number }> => {
        const { data } = await apiClient.post('/api/leads/sync-signups');
        return data;
    },

    // POST /sales-marketing-ops/api/leads/{lead_id}/nurture
    nurtureLead: async (leadId: string, sequenceId?: string): Promise<{ success: boolean; sequence_id: string; status: string }> => {
        const { data } = await apiClient.post(`/api/leads/${leadId}/nurture`, {}, { params: sequenceId ? { sequence_id: sequenceId } : undefined });
        return data;
    },

    // POST /sales-marketing-ops/api/leads/{lead_id}/crm-sync
    crmSync: async (leadId: string): Promise<{ success: boolean; crm_contact_id: string }> => {
        const { data } = await apiClient.post(`/api/leads/${leadId}/crm-sync`);
        return data;
    },
};

// ─── Section 6: Unified Leads Dashboard (/api/v1/sales-marketing-ops/leads) ──

export interface UnifiedLeadsDashboard {
    total_leads: number;
    new_today: number;
    active_campaigns: number;
    by_source: Record<string, number>;
    by_status: Record<string, number>;
    recent_leads: Lead[];
}

export interface PerformanceAlert {
    alert_id: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    created_at: string;
}

export const unifiedLeadsService = {
    // GET /api/v1/sales-marketing-ops/leads/dashboard
    getDashboard: async (): Promise<UnifiedLeadsDashboard> => {
        try {
            const { data } = await v1ApiClient.get('/leads/dashboard');
            return data;
        } catch (error) {
            console.error('Failed to fetch unified leads dashboard', error);
            return { total_leads: 0, new_today: 0, active_campaigns: 0, by_source: {}, by_status: {}, recent_leads: [] };
        }
    },

    // GET /api/v1/sales-marketing-ops/leads/stats
    getStats: async (): Promise<any> => {
        const { data } = await v1ApiClient.get('/leads/stats');
        return data;
    },

    // GET /api/v1/sales-marketing-ops/leads/performance-alerts
    getPerformanceAlerts: async (): Promise<PerformanceAlert[]> => {
        try {
            const { data } = await v1ApiClient.get('/leads/performance-alerts');
            return data;
        } catch (error) {
            console.error('Failed to fetch performance alerts', error);
            return [];
        }
    },

    // POST /api/v1/sales-marketing-ops/leads/enroll-nurture
    enrollNurture: async (body: { lead_ids: string[]; sequence_id: string }): Promise<{ success: boolean; enrolled: number }> => {
        const { data } = await v1ApiClient.post('/leads/enroll-nurture', body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/leads/send-whatsapp
    sendWhatsApp: async (body: { lead_ids: string[]; message: string }): Promise<{ success: boolean; sent: number }> => {
        const { data } = await v1ApiClient.post('/leads/send-whatsapp', body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/leads/pause-campaign
    pauseCampaign: async (body: { campaign_id: string; reason?: string }): Promise<{ success: boolean; campaign_id: string }> => {
        const { data } = await v1ApiClient.post('/leads/pause-campaign', body);
        return data;
    },
};
