import { v1ApiClient as apiClient } from './client';

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

export interface EmailSystemConfig {
    provider: 'resend' | 'smtp';
    from_email: string;
    from_name: string;
    resend_api_key?: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_user?: string;
    smtp_password?: string;
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
    // ── Campaigns ─────────────────────────────────────────────────
    // GET /api/v1/sales-marketing-ops/email/campaigns
    getCampaigns: async (): Promise<{ campaigns: EmailCampaign[]; count: number }> => {
        try {
            const { data } = await apiClient.get('/email/campaigns');
            return data;
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
            return { campaigns: [], count: 0 };
        }
    },

    // GET /api/v1/sales-marketing-ops/email/campaigns/{campaign_id}
    getCampaign: async (campaignId: string): Promise<EmailCampaign> => {
        const { data } = await apiClient.get(`/email/campaigns/${campaignId}`);
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/campaigns/debug
    getCampaignsDebug: async (): Promise<any> => {
        const { data } = await apiClient.get('/email/campaigns/debug');
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/campaign/{campaign_id}  (alias)
    getCampaignDetail: async (campaignId: string): Promise<EmailCampaign> => {
        const { data } = await apiClient.get(`/email/campaign/${campaignId}`);
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/hubspot-leads
    getHubspotLeads: async (limit = 200): Promise<{ leads: HubspotLead[]; total: number }> => {
        const { data } = await apiClient.get('/email/hubspot-leads', { params: { limit } });
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/scheduled
    getScheduledEmails: async (params?: { campaign_id?: string; status?: string; limit?: number; skip?: number }): Promise<{ emails: ScheduledEmail[]; total: number }> => {
        const { data } = await apiClient.get('/email/scheduled', { params });
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/scheduled/{email_id}
    getScheduledEmail: async (emailId: string): Promise<ScheduledEmail> => {
        const { data } = await apiClient.get(`/email/scheduled/${emailId}`);
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/tracking/{campaign_id}
    getTracking: async (campaignId: string): Promise<TrackingMetrics> => {
        const { data } = await apiClient.get(`/email/tracking/${campaignId}`);
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/pending-approvals
    getPendingApprovals: async (limit = 50): Promise<{ campaigns: EmailCampaign[]; total: number }> => {
        const { data } = await apiClient.get('/email/pending-approvals', { params: { limit } });
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/events
    getEvents: async (params?: { email_id?: string; campaign_id?: string; event_type?: string; limit?: number }): Promise<{ events: EmailEvent[]; total: number }> => {
        try {
            const { data } = await apiClient.get('/email/events', { params });
            return data;
        } catch (error) {
            console.error('Failed to fetch email events', error);
            return { events: [], total: 0 };
        }
    },

    // GET /api/v1/sales-marketing-ops/email/resend-events
    getResendEvents: async (params?: { limit?: number }): Promise<any> => {
        const { data } = await apiClient.get('/email/resend-events', { params });
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/workflow-suggestions
    getWorkflowSuggestions: async (): Promise<{ suggestions: any[]; count: number }> => {
        try {
            const { data } = await apiClient.get('/email/workflow-suggestions');
            return data;
        } catch (error) {
            console.error('Failed to fetch email workflow suggestions', error);
            return { suggestions: [], count: 0 };
        }
    },

    // GET /api/v1/sales-marketing-ops/email/templates
    getTemplates: async (): Promise<any[]> => {
        const { data } = await apiClient.get('/email/templates');
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/templates/{template_id}
    getTemplate: async (templateId: string): Promise<any> => {
        const { data } = await apiClient.get(`/email/templates/${templateId}`);
        return data;
    },

    // ── Campaign Progress ─────────────────────────────────────────
    // GET /api/v1/sales-marketing-ops/email/campaign/{campaign_id}/progress
    getCampaignProgress: async (campaignId: string): Promise<EmailCampaignProgress> => {
        try {
            const { data } = await apiClient.get(`/email/campaign/${campaignId}/progress`);
            return data;
        } catch (error) {
            console.error('Failed to fetch campaign progress', error);
            return { campaign_id: campaignId, job: { job_id: '', status: 'unknown' }, total_queued: 0, sent: 0, failed: 0, remaining: 0, status: 'unknown' };
        }
    },

    // ── Create & Draft ────────────────────────────────────────────
    // POST /api/v1/sales-marketing-ops/email/generate-template
    generateTemplate: async (body: { tone?: string; goal?: string; cta_style?: string; campaign_name?: string }): Promise<{ template: EmailTemplate; generated_at: string }> => {
        const { data } = await apiClient.post('/email/generate-template', body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/campaigns
    createCampaign: async (body: any): Promise<any> => {
        const { data } = await apiClient.post('/email/campaigns', body);
        return data;
    },

    // PUT /api/v1/sales-marketing-ops/email/campaign/{campaign_id}/edit-template
    editTemplate: async (campaignId: string, body: Partial<EmailTemplate>): Promise<any> => {
        const { data } = await apiClient.put(`/email/campaign/${campaignId}/edit-template`, body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/campaign/{campaign_id}/approve
    approveCampaign: async (campaignId: string, body: { approved_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/email/campaign/${campaignId}/approve`, body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/campaign/{campaign_id}/retry-job
    retryJob: async (campaignId: string): Promise<{ campaign_id: string; job_id?: string; leads_retried?: number; message?: string; missing_count?: number }> => {
        const { data } = await apiClient.post(`/email/campaign/${campaignId}/retry-job`);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/scan-now
    scanNow: async (): Promise<{ success: boolean; leads_found: number; campaign_id?: string }> => {
        const { data } = await apiClient.post('/email/scan-now');
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/test
    sendTest: async (body: { to: string; subject?: string; body?: string }): Promise<{ success: boolean; message_id?: string }> => {
        const { data } = await apiClient.post('/email/test', body);
        return data;
    },

    // ── Lifecycle ─────────────────────────────────────────────────
    // PATCH /api/v1/sales-marketing-ops/email/campaigns/{campaign_id}
    updateCampaign: async (campaignId: string, body: { name?: string; description?: string }): Promise<EmailCampaign> => {
        const { data } = await apiClient.patch(`/email/campaigns/${campaignId}`, body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/campaigns/{campaign_id}/pause
    pauseCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.post(`/email/campaigns/${campaignId}/pause`, { reason: 'Manual pause by user' });
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/campaigns/{campaign_id}/resume
    resumeCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.post(`/email/campaigns/${campaignId}/resume`);
        return data;
    },

    // DELETE /api/v1/sales-marketing-ops/email/campaigns/{campaign_id}  (soft-delete)
    cancelCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.delete(`/email/campaigns/${campaignId}`);
        return data;
    },

    // DELETE /api/v1/sales-marketing-ops/email/campaigns/{campaign_id}/permanent
    permanentDeleteCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.delete(`/email/campaigns/${campaignId}/permanent`);
        return data;
    },

    // ── Scheduled Email management ─────────────────────────────────
    // POST /api/v1/sales-marketing-ops/email/scheduled/{email_id}/cancel
    cancelEmail: async (emailId: string): Promise<any> => {
        const { data } = await apiClient.post(`/email/scheduled/${emailId}/cancel`);
        return data;
    },

    // PATCH /api/v1/sales-marketing-ops/email/scheduled/{email_id}
    rescheduleEmail: async (emailId: string, body: { scheduled_at?: string; subject?: string }): Promise<any> => {
        const { data } = await apiClient.patch(`/email/scheduled/${emailId}`, body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/scheduled/reschedule-stuck
    rescheduleStuck: async (): Promise<{ success: boolean; rescheduled_count: number }> => {
        const { data } = await apiClient.post('/email/scheduled/reschedule-stuck');
        return data;
    },

    // ── Config ────────────────────────────────────────────────────
    // GET /api/v1/sales-marketing-ops/email/config
    getConfig: async (): Promise<EmailConfig> => {
        try {
            const { data } = await apiClient.get('/email/config');
            return data;
        } catch (error) {
            console.error('Failed to fetch email config', error);
            return { followup_1_delay_hours: 72, followup_2_delay_hours: 168, sending_window: { timezone: 'Asia/Kolkata', start_hour: 9, end_hour: 18 }, safety_rules: { max_emails_per_lead_per_month: 10, min_hours_between_campaigns: 48, stop_on_reply: true, stop_on_lifecycle_change: true } };
        }
    },

    // POST /api/v1/sales-marketing-ops/email/config
    updateConfig: async (body: Partial<EmailConfig>): Promise<EmailConfig> => {
        const { data } = await apiClient.post('/email/config', body);
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/system-config
    getSystemConfig: async (): Promise<EmailSystemConfig> => {
        const { data } = await apiClient.get('/email/system-config');
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/system-config
    saveSystemConfig: async (body: Partial<EmailSystemConfig>): Promise<EmailSystemConfig> => {
        const { data } = await apiClient.post('/email/system-config', body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/email/system-config/test-connection
    testConnection: async (): Promise<{ success: boolean; message: string }> => {
        const { data } = await apiClient.post('/email/system-config/test-connection');
        return data;
    },

    // GET /api/v1/sales-marketing-ops/email/default-config
    getDefaultConfig: async (): Promise<EmailDefaultConfig> => {
        try {
            const { data } = await apiClient.get('/email/default-config');
            return data;
        } catch (error) {
            console.error('Failed to fetch default config', error);
            return { default_tone: 'professional', default_goal: 'demo_booking', default_cta_style: 'soft', default_followup_schedule: { followup_1_delay_hours: 72, followup_2_delay_hours: 168 } };
        }
    },

    // PUT /api/v1/sales-marketing-ops/email/default-config
    updateDefaultConfig: async (body: Partial<EmailDefaultConfig>): Promise<EmailDefaultConfig> => {
        const { data } = await apiClient.put('/email/default-config', body);
        return data;
    },
};
