import { apiClient } from './client';

export interface EmailCampaign {
    campaign_id: string;
    name: string;
    description: string;
    status: string;
    total_emails: number;
    created_at: string;
    metrics: {
        sent: number;
        delivered: number;
        failed: number;
        pending: number;
        cancelled: number;
    };
}

export interface HubspotLead {
    lead_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    phone?: string;
    intent?: string;
    reason?: string;
    has_conflict: boolean;
}

export interface ScheduledEmail {
    email_id: string;
    campaign_id: string;
    campaign_name: string;
    lead_id: string;
    recipient_email: string;
    subject: string;
    scheduled_at: string;
    status: string;
    step: number;
}

export interface EmailTemplate {
    step_1: { subject: string; body: string };
    step_2: { subject: string; body: string };
    step_3: { subject: string; body: string };
}

export interface EmailEvent {
    event_id: string;
    email_id: string;
    campaign_id: string;
    lead_id: string;
    event_type: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained';
    event_timestamp: string;
    event_source: string;
}

export interface EmailConfig {
    followup_1_delay_hours: number;
    followup_2_delay_hours: number;
    sending_window: {
        timezone: string;
        start_hour: number;
        end_hour: number;
    };
    safety_rules: {
        max_emails_per_lead_per_month: number;
        min_hours_between_campaigns: number;
        stop_on_reply: boolean;
        stop_on_lifecycle_change: boolean;
    };
}

export interface EmailDefaultConfig {
    default_tone: string;
    default_goal: string;
    default_cta_style: string;
    default_followup_schedule: {
        followup_1_delay_hours: number;
        followup_2_delay_hours: number;
    };
}

export interface EmailCampaignProgress {
    campaign_id: string;
    job: { job_id: string; status: string };
    total_queued: number;
    sent: number;
    failed: number;
    remaining: number;
    status: string;
    next_batch_eta_seconds?: number;
}

export interface TrackingMetrics {
    campaign_id: string;
    metrics: {
        sent: number;
        delivered: number;
        failed: number;
        pending: number;
        cancelled: number;
        bounce_rate?: number;
        open_rate?: number;
    };
    events: Array<{ event_type: string; count: number }>;
}

export const emailService = {
    // ── Read ──────────────────────────────────────────────────────
    getCampaigns: async (): Promise<{ campaigns: EmailCampaign[]; count: number }> => {
        try {
            const { data } = await apiClient.get('/email/campaigns');
            return data;
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
            return { campaigns: [], count: 0 };
        }
    },

    getCampaign: async (campaignId: string): Promise<EmailCampaign> => {
        const { data } = await apiClient.get(`/email/campaigns/${campaignId}`);
        return data;
    },

    getHubspotLeads: async (limit = 200): Promise<{ leads: HubspotLead[]; total: number }> => {
        const { data } = await apiClient.get('/email/hubspot-leads', { params: { limit } });
        return data;
    },

    getScheduledEmails: async (params?: { campaign_id?: string; status?: string; limit?: number; skip?: number }): Promise<{ emails: ScheduledEmail[]; total: number }> => {
        const { data } = await apiClient.get('/email/scheduled', { params });
        return data;
    },

    getTracking: async (campaignId: string): Promise<TrackingMetrics> => {
        const { data } = await apiClient.get(`/email/tracking/${campaignId}`);
        return data;
    },

    getPendingApprovals: async (limit = 50): Promise<{ campaigns: EmailCampaign[]; total: number }> => {
        const { data } = await apiClient.get('/email/pending-approvals', { params: { limit } });
        return data;
    },

    // ── Create & Draft ────────────────────────────────────────────
    generateTemplate: async (body: { tone?: string; goal?: string; cta_style?: string; campaign_name?: string }): Promise<{ template: EmailTemplate; generated_at: string }> => {
        const { data } = await apiClient.post('/email/generate-template', body);
        return data;
    },

    createCampaign: async (body: any): Promise<any> => {
        const { data } = await apiClient.post('/email/campaigns', body);
        return data;
    },

    editTemplate: async (campaignId: string, body: Partial<EmailTemplate>): Promise<any> => {
        const { data } = await apiClient.put(`/email/campaign/${campaignId}/edit-template`, body);
        return data;
    },

    approveCampaign: async (campaignId: string, body: { approved_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/email/campaign/${campaignId}/approve`, body);
        return data;
    },

    // ── Lifecycle ─────────────────────────────────────────────────
    pauseCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.post(`/email/campaigns/${campaignId}/pause`, { reason: 'Manual pause by user' });
        return data;
    },

    resumeCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.post(`/email/campaigns/${campaignId}/resume`);
        return data;
    },

    cancelCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.delete(`/email/campaigns/${campaignId}`);
        return data;
    },

    // ── Scheduled Email management ─────────────────────────────────
    cancelEmail: async (emailId: string): Promise<any> => {
        const { data } = await apiClient.post(`/email/scheduled/${emailId}/cancel`);
        return data;
    },

    rescheduleEmail: async (emailId: string, body: { scheduled_at?: string; subject?: string }): Promise<any> => {
        const { data } = await apiClient.patch(`/email/scheduled/${emailId}`, body);
        return data;
    },

    // ── Email Events ──────────────────────────────────────────────
    getEvents: async (params?: { email_id?: string; campaign_id?: string; event_type?: string; limit?: number }): Promise<{ events: EmailEvent[]; total: number }> => {
        try {
            const { data } = await apiClient.get('/email/events', { params });
            return data;
        } catch (error) {
            console.error('Failed to fetch email events', error);
            return { events: [], total: 0 };
        }
    },

    // ── Email Config ──────────────────────────────────────────────
    getConfig: async (): Promise<EmailConfig> => {
        try {
            const { data } = await apiClient.get('/email/config');
            return data;
        } catch (error) {
            console.error('Failed to fetch email config', error);
            return {
                followup_1_delay_hours: 72,
                followup_2_delay_hours: 168,
                sending_window: {
                    timezone: 'Asia/Kolkata',
                    start_hour: 9,
                    end_hour: 18,
                },
                safety_rules: {
                    max_emails_per_lead_per_month: 10,
                    min_hours_between_campaigns: 48,
                    stop_on_reply: true,
                    stop_on_lifecycle_change: true,
                },
            };
        }
    },

    updateConfig: async (body: Partial<EmailConfig>): Promise<EmailConfig> => {
        const { data } = await apiClient.post('/email/config', body);
        return data;
    },

    // ── Default Config ────────────────────────────────────────────
    getDefaultConfig: async (): Promise<EmailDefaultConfig> => {
        try {
            const { data } = await apiClient.get('/email/default-config');
            return data;
        } catch (error) {
            console.error('Failed to fetch default config', error);
            return {
                default_tone: 'professional',
                default_goal: 'demo_booking',
                default_cta_style: 'soft',
                default_followup_schedule: {
                    followup_1_delay_hours: 72,
                    followup_2_delay_hours: 168,
                },
            };
        }
    },

    updateDefaultConfig: async (body: Partial<EmailDefaultConfig>): Promise<EmailDefaultConfig> => {
        const { data } = await apiClient.put('/email/default-config', body);
        return data;
    },

    // ── Lead Scan ─────────────────────────────────────────────────
    scanNow: async (): Promise<{ success: boolean; leads_found: number; campaign_id?: string }> => {
        const { data } = await apiClient.post('/email/scan-now');
        return data;
    },

    // ── Campaign Progress ─────────────────────────────────────────
    getCampaignProgress: async (campaignId: string): Promise<EmailCampaignProgress> => {
        try {
            const { data } = await apiClient.get(`/email/campaign/${campaignId}/progress`);
            return data;
        } catch (error) {
            console.error('Failed to fetch campaign progress', error);
            return {
                campaign_id: campaignId,
                job: { job_id: '', status: 'unknown' },
                total_queued: 0,
                sent: 0,
                failed: 0,
                remaining: 0,
                status: 'unknown',
            };
        }
    },
};
