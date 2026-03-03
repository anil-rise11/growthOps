import { apiClient } from './client';

export interface SocialCampaign {
    campaign_id: string;
    name: string;
    description: string;
    platform: 'facebook' | 'instagram';
    status: string;
    posts_scheduled: number;
    created_at: string;
    metrics?: {
        published: number;
        pending: number;
        failed: number;
    };
}

export const socialService = {
    getCampaigns: async (): Promise<{ campaigns: SocialCampaign[]; count: number }> => {
        try {
            const { data } = await apiClient.get('/social/campaigns');
            return data;
        } catch (error) {
            console.error('Failed to fetch social campaigns', error);
            return { campaigns: [], count: 0 };
        }
    },

    getCampaign: async (campaignId: string): Promise<SocialCampaign> => {
        const { data } = await apiClient.get(`/social/campaigns/${campaignId}`);
        return data;
    },

    createCampaign: async (body: {
        name: string;
        platform: 'facebook' | 'instagram';
        topics: [string, string, string];
        tone: string;
        description?: string;
        context?: Record<string, string>;
        image_urls?: string[];
    }): Promise<any> => {
        const { data } = await apiClient.post('/social/campaigns', body);
        return data;
    },

    pauseCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.post(`/social/campaigns/${campaignId}/pause`);
        return data;
    },

    resumeCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.post(`/social/campaigns/${campaignId}/resume`);
        return data;
    },

    cancelCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.delete(`/social/campaigns/${campaignId}`);
        return data;
    },

    getPostsQueue: async (): Promise<{ posts: any[]; total: number }> => {
        const { data } = await apiClient.get('/social/posts/queue');
        return data;
    },

    getConfig: async (): Promise<any> => {
        const { data } = await apiClient.get('/social/config');
        return data;
    },

    updateConfig: async (body: any): Promise<any> => {
        const { data } = await apiClient.post('/social/config', body);
        return data;
    },

    // ── Social Media Suggestions (Section 8) ─────────────────────────────
    getSuggestions: async (status?: string): Promise<{ suggestions: any[]; count: number }> => {
        const { data } = await apiClient.get('/api/social/suggestions', { params: status ? { status } : undefined });
        return data;
    },

    getSuggestion: async (suggestionId: string): Promise<any> => {
        const { data } = await apiClient.get(`/api/social/suggestions/${suggestionId}`);
        return data;
    },

    updateSuggestion: async (suggestionId: string, body: { content?: string; scheduled_at?: string }): Promise<any> => {
        const { data } = await apiClient.patch(`/api/social/suggestions/${suggestionId}`, body);
        return data;
    },

    previewSuggestion: async (suggestionId: string): Promise<any> => {
        const { data } = await apiClient.post(`/api/social/suggestions/${suggestionId}/preview`);
        return data;
    },

    approveSuggestion: async (suggestionId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/social/suggestions/${suggestionId}/approve`, body);
        return data;
    },

    rejectSuggestion: async (suggestionId: string, body: { responded_by: string; reason?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/social/suggestions/${suggestionId}/reject`, body);
        return data;
    },

    executeSuggestion: async (suggestionId: string): Promise<any> => {
        const { data } = await apiClient.post(`/api/social/suggestions/${suggestionId}/execute`);
        return data;
    },

    scheduleSuggestion: async (suggestionId: string, body: { scheduled_at: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/social/suggestions/${suggestionId}/schedule`, body);
        return data;
    },

    // ── Social Brand Config (Section 9) ──────────────────────────────────
    getBrandConfig: async (): Promise<any> => {
        const { data } = await apiClient.get('/api/social-brand/config');
        return data;
    },

    updateBrandConfig: async (body: {
        brand_voice?: string;
        tone?: string;
        guidelines?: string;
        target_audience?: string;
        hashtags?: string[];
    }): Promise<any> => {
        const { data } = await apiClient.post('/api/social-brand/config', body);
        return data;
    },
};
