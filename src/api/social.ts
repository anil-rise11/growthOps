import { v1ApiClient as apiClient, apiClient as coreApiClient } from './client';

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
    // ── Section 10: Social Media Campaigns ────────────────────────
    // GET /api/v1/sales-marketing-ops/social/campaigns
    getCampaigns: async (): Promise<{ campaigns: SocialCampaign[]; count: number }> => {
        try {
            const { data } = await apiClient.get('/social/campaigns');
            return data;
        } catch (error) {
            console.error('Failed to fetch social campaigns', error);
            return { campaigns: [], count: 0 };
        }
    },

    // GET /api/v1/sales-marketing-ops/social/campaigns/{campaign_id}
    getCampaign: async (campaignId: string): Promise<SocialCampaign> => {
        const { data } = await apiClient.get(`/social/campaigns/${campaignId}`);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/campaigns
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

    // POST /api/v1/sales-marketing-ops/social/campaigns/{campaign_id}/pause
    pauseCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.post(`/social/campaigns/${campaignId}/pause`);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/campaigns/{campaign_id}/resume
    resumeCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.post(`/social/campaigns/${campaignId}/resume`);
        return data;
    },

    // DELETE /api/v1/sales-marketing-ops/social/campaigns/{campaign_id}
    cancelCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await apiClient.delete(`/social/campaigns/${campaignId}`);
        return data;
    },

    // GET /api/v1/sales-marketing-ops/social/posts/queue
    getPostsQueue: async (): Promise<{ posts: any[]; total: number }> => {
        const { data } = await apiClient.get('/social/posts/queue');
        return data;
    },

    // GET /api/v1/sales-marketing-ops/social/config
    getConfig: async (): Promise<any> => {
        const { data } = await apiClient.get('/social/config');
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/config
    updateConfig: async (body: any): Promise<any> => {
        const { data } = await apiClient.post('/social/config', body);
        return data;
    },

    // ── Section 11: Social Media Suggestions ─────────────────────
    // GET /api/v1/sales-marketing-ops/social/suggestions
    getSuggestions: async (status?: string): Promise<{ suggestions: any[]; count: number }> => {
        const { data } = await apiClient.get('/social/suggestions', { params: status ? { status } : undefined });
        return data;
    },

    // GET /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}
    getSuggestion: async (suggestionId: string): Promise<any> => {
        const { data } = await apiClient.get(`/social/suggestions/${suggestionId}`);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}/preview
    previewSuggestion: async (suggestionId: string): Promise<any> => {
        const { data } = await apiClient.post(`/social/suggestions/${suggestionId}/preview`);
        return data;
    },

    // PATCH /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}
    updateSuggestion: async (suggestionId: string, body: { content?: string; scheduled_at?: string }): Promise<any> => {
        const { data } = await apiClient.patch(`/social/suggestions/${suggestionId}`, body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}/save-draft
    saveDraft: async (suggestionId: string): Promise<any> => {
        const { data } = await apiClient.post(`/social/suggestions/${suggestionId}/save-draft`);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}/generate-image
    generateImage: async (suggestionId: string, body?: { prompt?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/social/suggestions/${suggestionId}/generate-image`, body ?? {});
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}/generate-video
    generateVideo: async (suggestionId: string, body?: { prompt?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/social/suggestions/${suggestionId}/generate-video`, body ?? {});
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}/approve
    approveSuggestion: async (suggestionId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/social/suggestions/${suggestionId}/approve`, body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}/reject
    rejectSuggestion: async (suggestionId: string, body: { responded_by: string; reason?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/social/suggestions/${suggestionId}/reject`, body);
        return data;
    },

    // DELETE /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}
    deleteSuggestion: async (suggestionId: string): Promise<any> => {
        const { data } = await apiClient.delete(`/social/suggestions/${suggestionId}`);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/regenerate
    regenerateSuggestions: async (): Promise<any> => {
        const { data } = await apiClient.post('/social/suggestions/regenerate');
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}/schedule
    scheduleSuggestion: async (suggestionId: string, body: { scheduled_at: string; platforms?: string[] }): Promise<any> => {
        const { data } = await apiClient.post(`/social/suggestions/${suggestionId}/schedule`, body);
        return data;
    },

    // POST /api/v1/sales-marketing-ops/social/suggestions/{suggestion_id}/execute
    executeSuggestion: async (suggestionId: string): Promise<any> => {
        const { data } = await apiClient.post(`/social/suggestions/${suggestionId}/execute`);
        return data;
    },

    // GET /api/v1/sales-marketing-ops/social/suggestions/posts/facebook
    getFacebookPosts: async (): Promise<{ posts: any[]; total: number }> => {
        const { data } = await apiClient.get('/social/suggestions/posts/facebook');
        return data;
    },

    // GET /api/v1/sales-marketing-ops/social/suggestions/posts/instagram
    getInstagramPosts: async (): Promise<{ posts: any[]; total: number }> => {
        const { data } = await apiClient.get('/social/suggestions/posts/instagram');
        return data;
    },

    // DELETE /api/v1/sales-marketing-ops/social/suggestions/posts/facebook/{post_id}
    deleteFacebookPost: async (postId: string): Promise<any> => {
        const { data } = await apiClient.delete(`/social/suggestions/posts/facebook/${postId}`);
        return data;
    },

    // DELETE /api/v1/sales-marketing-ops/social/suggestions/posts/instagram/{post_id}
    deleteInstagramPost: async (postId: string): Promise<any> => {
        const { data } = await apiClient.delete(`/social/suggestions/posts/instagram/${postId}`);
        return data;
    },

    // ── Section 9: Social Brand Config (/sales-marketing-ops/api/social-brand/config) ─
    // GET /sales-marketing-ops/api/social-brand/config
    getBrandConfig: async (): Promise<any> => {
        const { data } = await coreApiClient.get('/api/social-brand/config');
        return data;
    },

    // POST /sales-marketing-ops/api/social-brand/config
    updateBrandConfig: async (body: {
        brand_name?: string;
        brand_voice?: string;
        tone?: string;
        industry?: string;
        guidelines?: string;
        target_audience?: string;
        hashtags?: string[];
        post_frequency?: string;
    }): Promise<any> => {
        const { data } = await coreApiClient.post('/api/social-brand/config', body);
        return data;
    },
};
