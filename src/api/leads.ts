import { apiClient } from './client';

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

export const leadsService = {
    getLeads: async (params?: { source?: string; status?: string; days?: number; page?: number; per_page?: number }): Promise<Lead[]> => {
        const { data } = await apiClient.get('/api/leads', { params });
        // API returns { leads: [], total, page, per_page, has_more } — unwrap the array
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

    syncLeads: async (): Promise<{ success: boolean; new_leads_count: number; sources_polled: string[] }> => {
        const { data } = await apiClient.post('/api/leads/sync');
        return data;
    },

    nurtureLead: async (leadId: string, sequenceId?: string): Promise<{ success: boolean; sequence_id: string; status: string }> => {
        const { data } = await apiClient.post(`/api/leads/${leadId}/nurture`, {}, { params: sequenceId ? { sequence_id: sequenceId } : undefined });
        return data;
    },

    crmSync: async (leadId: string): Promise<{ success: boolean; crm_contact_id: string }> => {
        const { data } = await apiClient.post(`/api/leads/${leadId}/crm-sync`);
        return data;
    },
};

