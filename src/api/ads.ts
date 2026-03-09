import axios from 'axios';

// ─── Section 13: Meta Ads Manual Campaign Builder ────────────────────────────
// Base: /api/sales-marketing-ops/meta/manual
// This uses a distinct prefix from apiClient (/sales-marketing-ops) and v1ApiClient (/api/v1/...)

const isDev = import.meta.env.DEV;
const remoteBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://growthops.rise11.com';
// In dev, /api/sales-marketing-ops is proxied via /proxy-core/api → strip proxy prefix then prepend /api
// We use /api directly here — Vite will match the /api/v1 proxy but NOT /api/sales-marketing-ops.
// To keep it simple we use the full base in prod, and for dev we need a separate Vite proxy rule.
// NOTE: The vite.config.ts has been updated to add /api/sales-marketing-ops proxy.
const metaBase = isDev ? '' : remoteBaseURL;

const metaManualClient = axios.create({
    baseURL: `${metaBase}/api/sales-marketing-ops/meta/manual`,
    headers: { 'Content-Type': 'application/json' },
});

const interceptResponseError = (error: any) => {
    console.error('Meta Ads API Error:', error.response?.data?.detail || error.response?.data?.message || error.message);
    return Promise.reject(error);
};
metaManualClient.interceptors.response.use((r) => r, interceptResponseError);

export interface MetaManualCampaign {
    campaign_id: string;
    campaign_name: string;
    status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
    objective: string;
    daily_budget: number;
    created_at?: string;
}

export interface MetaAdSet {
    adset_id: string;
    name: string;
    status: string;
    daily_budget?: number;
    targeting?: Record<string, any>;
}

export interface MetaAd {
    ad_id: string;
    name: string;
    status: string;
    creative?: Record<string, any>;
}

export interface MetaInsights {
    impressions: number;
    clicks: number;
    spend: number;
    ctr: number;
    cpc: number;
    conversions: number;
    roas: number;
}

export interface MetaAudience {
    audience_id: string;
    name: string;
    type: 'CUSTOM' | 'LOOKALIKE' | 'SAVED';
    size?: number;
}

export interface CreateLeadGenCampaignRequest {
    campaign_name: string;
    objective?: string;
    daily_budget: number;
    ad_creative: {
        headline: string;
        description: string;
        image_url: string;
        call_to_action: string;
    };
    targeting: {
        age_min?: number;
        age_max?: number;
        geo_locations?: { countries?: string[] };
        interests?: string[];
    };
}

export const metaAdsService = {
    // GET /api/sales-marketing-ops/meta/manual/status
    getStatus: async (): Promise<{ connected: boolean; account_id?: string; account_name?: string }> => {
        try {
            const { data } = await metaManualClient.get('/status');
            return data;
        } catch (error) {
            console.error('Failed to fetch Meta Ads status', error);
            return { connected: false };
        }
    },

    // GET /api/sales-marketing-ops/meta/manual/campaigns
    getCampaigns: async (): Promise<MetaManualCampaign[]> => {
        try {
            const { data } = await metaManualClient.get('/campaigns');
            return data;
        } catch (error) {
            console.error('Failed to fetch Meta campaigns', error);
            return [];
        }
    },

    // GET /api/sales-marketing-ops/meta/manual/campaign/{campaign_id}/adsets
    getAdSets: async (campaignId: string): Promise<MetaAdSet[]> => {
        const { data } = await metaManualClient.get(`/campaign/${campaignId}/adsets`);
        return data;
    },

    // GET /api/sales-marketing-ops/meta/manual/adset/{adset_id}/ads
    getAds: async (adsetId: string): Promise<MetaAd[]> => {
        const { data } = await metaManualClient.get(`/adset/${adsetId}/ads`);
        return data;
    },

    // GET /api/sales-marketing-ops/meta/manual/insights
    getInsights: async (params?: { campaign_id?: string; days?: number }): Promise<MetaInsights> => {
        const { data } = await metaManualClient.get('/insights', { params });
        return data;
    },

    // GET /api/sales-marketing-ops/meta/manual/audiences
    getAudiences: async (): Promise<MetaAudience[]> => {
        const { data } = await metaManualClient.get('/audiences');
        return data;
    },

    // GET /api/sales-marketing-ops/meta/manual/best-practices
    getBestPractices: async (): Promise<any> => {
        const { data } = await metaManualClient.get('/best-practices');
        return data;
    },

    // GET /api/sales-marketing-ops/meta/manual/validate-image-url
    validateImageUrl: async (imageUrl: string): Promise<{ valid: boolean; message?: string }> => {
        const { data } = await metaManualClient.get('/validate-image-url', { params: { image_url: imageUrl } });
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/generate-image
    generateImage: async (body: { prompt: string; campaign_context?: string }): Promise<{ image_url: string }> => {
        const { data } = await metaManualClient.post('/generate-image', body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/generate-campaign-details
    generateCampaignDetails: async (body: { business_context: string; goal: string; audience?: string }): Promise<any> => {
        const { data } = await metaManualClient.post('/generate-campaign-details', body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/create-campaign  (Lead Gen)
    createCampaign: async (body: CreateLeadGenCampaignRequest): Promise<any> => {
        const { data } = await metaManualClient.post('/create-campaign', body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/create-traffic-campaign
    createTrafficCampaign: async (body: any): Promise<any> => {
        const { data } = await metaManualClient.post('/create-traffic-campaign', body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/create-carousel-campaign
    createCarouselCampaign: async (body: any): Promise<any> => {
        const { data } = await metaManualClient.post('/create-carousel-campaign', body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/create-video-campaign
    createVideoCampaign: async (body: any): Promise<any> => {
        const { data } = await metaManualClient.post('/create-video-campaign', body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/audiences/custom
    createCustomAudience: async (body: { name: string; customer_file_source?: string }): Promise<MetaAudience> => {
        const { data } = await metaManualClient.post('/audiences/custom', body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/audiences/lookalike
    createLookalikeAudience: async (body: { source_audience_id: string; country: string; ratio?: number }): Promise<MetaAudience> => {
        const { data } = await metaManualClient.post('/audiences/lookalike', body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/fetch-leads
    fetchLeads: async (body?: { form_id?: string }): Promise<{ leads: any[]; count: number }> => {
        const { data } = await metaManualClient.post('/fetch-leads', body ?? {});
        return data;
    },

    // PUT /api/sales-marketing-ops/meta/manual/campaign/{campaign_id}
    updateCampaign: async (campaignId: string, body: { campaign_name?: string; status?: string }): Promise<any> => {
        const { data } = await metaManualClient.put(`/campaign/${campaignId}`, body);
        return data;
    },

    // PUT /api/sales-marketing-ops/meta/manual/campaign/{campaign_id}/budget
    updateCampaignBudget: async (campaignId: string, body: { daily_budget: number }): Promise<any> => {
        const { data } = await metaManualClient.put(`/campaign/${campaignId}/budget`, body);
        return data;
    },

    // POST /api/sales-marketing-ops/meta/manual/campaign/{campaign_id}/archive
    archiveCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await metaManualClient.post(`/campaign/${campaignId}/archive`);
        return data;
    },

    // DELETE /api/sales-marketing-ops/meta/manual/campaign/{campaign_id}
    deleteCampaign: async (campaignId: string): Promise<any> => {
        const { data } = await metaManualClient.delete(`/campaign/${campaignId}`);
        return data;
    },

    // DELETE /api/sales-marketing-ops/meta/manual/campaigns/bulk
    bulkDeleteCampaigns: async (body: { campaign_ids: string[] }): Promise<any> => {
        const { data } = await metaManualClient.delete('/campaigns/bulk', { data: body });
        return data;
    },

    // PUT /api/sales-marketing-ops/meta/manual/adset/{adset_id}
    updateAdSet: async (adsetId: string, body: { name?: string; status?: string }): Promise<any> => {
        const { data } = await metaManualClient.put(`/adset/${adsetId}`, body);
        return data;
    },

    // PUT /api/sales-marketing-ops/meta/manual/adset/{adset_id}/budget
    updateAdSetBudget: async (adsetId: string, body: { daily_budget: number }): Promise<any> => {
        const { data } = await metaManualClient.put(`/adset/${adsetId}/budget`, body);
        return data;
    },
};
