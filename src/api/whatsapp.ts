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

export interface WhatsAppTestRequest {
    phone: string;
    lead_name: string;
    campaign_name: string;
    source: string;
}

export interface WhatsAppTestResponse {
    success: boolean;
    message_id: string;
    campaign_name: string;
    phone: string;
    lead_name: string;
}

export interface WhatsAppCampaignsResponse {
    success: boolean;
    campaigns: WhatsAppCampaign[];
}

export interface WhatsAppSendRequest {
    phone: string;
    lead_name: string;
    message: string;
    campaign_name: string;
    execution_id?: string;
}

export interface WhatsAppSendResponse {
    success: boolean;
    message_id: string;
    status: string;
}

export const whatsappService = {
    // ── Read ──────────────────────────────────────────────────────
    getCampaigns: async (): Promise<WhatsAppCampaignsResponse> => {
        try {
            const { data } = await v1ApiClient.get('/whatsapp/campaigns');
            return data;
        } catch (error) {
            console.error('Failed to fetch WhatsApp campaigns', error);
            return { success: false, campaigns: [] };
        }
    },

    // ── Create ────────────────────────────────────────────────────
    test: async (body: WhatsAppTestRequest): Promise<WhatsAppTestResponse> => {
        const { data } = await v1ApiClient.post('/whatsapp/test', body);
        return data;
    },

    send: async (body: WhatsAppSendRequest): Promise<WhatsAppSendResponse> => {
        const { data } = await v1ApiClient.post('/whatsapp/send', body);
        return data;
    },
};
