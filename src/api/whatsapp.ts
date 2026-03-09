import { v1ApiClient } from './client';

export interface WhatsAppCampaign {
    campaign_id: string;
    name: string;
    recipient: string;
    template: string;
    scheduled_at: string;
    status: 'scheduled' | 'sent' | 'delivered' | 'failed';
    created_at: string;
}

// POST /api/v1/sales-marketing-ops/api/whatsapp/test  — matches API doc exactly
export interface WhatsAppTestRequest {
    phone: string;       // e.g. "+919876543210"
    lead_name: string;   // e.g. "Test User"
    campaign_name: string; // e.g. "welcome_message_zetaleap"
    source?: string;     // e.g. "new-landing-page form"
}

export interface WhatsAppTestResponse {
    success: boolean;
    message_id?: string;
    status?: string;
}

// POST /sales-marketing-ops/whatsapp/send — n8n agent path
export interface WhatsAppSendRequest {
    phone: string;
    lead_name: string;
    message: string;
    campaign_name?: string;
    execution_id?: string;
}

export interface WhatsAppSendResponse {
    success: boolean;
    message_id?: string;
    status?: string;
}

export interface WhatsAppCampaignsResponse {
    success: boolean;
    campaigns: WhatsAppCampaign[];
}

export const whatsappService = {
    // GET /api/v1/sales-marketing-ops/whatsapp/campaigns
    getCampaigns: async (): Promise<WhatsAppCampaignsResponse> => {
        try {
            const { data } = await v1ApiClient.get('/whatsapp/campaigns');
            return data;
        } catch (error) {
            console.error('Failed to fetch WhatsApp campaigns', error);
            return { success: false, campaigns: [] };
        }
    },

    // POST /api/v1/sales-marketing-ops/whatsapp/test
    test: async (body: WhatsAppTestRequest): Promise<WhatsAppTestResponse> => {
        const { data } = await v1ApiClient.post('/whatsapp/test', body);
        return data;
    },

    // POST /sales-marketing-ops/whatsapp/send  (n8n agent path)
    send: async (body: WhatsAppSendRequest): Promise<WhatsAppSendResponse> => {
        const { data } = await v1ApiClient.post('/whatsapp/send', body);
        return data;
    },
};
