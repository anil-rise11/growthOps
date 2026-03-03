import { apiClient } from './client';

export interface MetaCampaign {
    campaign_id: string;
    campaign_name: string;
    status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    roas: number;
    ctr: number;
    cpc: number;
}

export interface AdsStats {
    meta: {
        status: 'connected' | 'not_configured' | 'error';
        campaigns?: MetaCampaign[];
        totals?: {
            spend: number;
            impressions: number;
            clicks: number;
            conversions: number;
            roas: number;
            ctr: number;
        };
    };
    google: {
        status: 'connected' | 'not_configured' | 'error';
    };
    linkedin: {
        status: 'connected' | 'not_configured' | 'error';
    };
}

export interface CampaignToggleRequest {
    platform: 'meta_ads' | 'google' | 'linkedin';
    campaign_id: string;
    action: 'pause' | 'activate';
}

export interface CampaignToggleResponse {
    message: string;
    platform: string;
    campaign_id: string;
    new_status: string;
}

export interface CreateCampaignRequest {
    business_context: string;
    image_path: string;
    link_url: string;
    daily_budget: number;
    countries: string[];
    age_min: number;
    age_max: number;
}

export interface CreateCampaignResponse {
    success: boolean;
    campaign_id: string;
    ad_set_id: string;
    ad_id: string;
    status: string;
}

export interface MetaCampaignRequest {
    campaign_name: string;
    objective: string;
    audience: string;
    daily_budget: number;
    creative_angle: string;
    execution_id?: string;
    source?: string;
}

export interface GA4Snapshot {
    status: string;
    snapshot: any[];
    count: number;
    fetched_at: string;
}

export interface ClaritySnapshot {
    status: string;
    friction_data: any[];
    count: number;
    snapshot_meta: Record<string, any>;
    fetched_at: string;
}

export const adsService = {
    // ── Read ──────────────────────────────────────────────────────
    getAdsStats: async (days = 30): Promise<AdsStats> => {
        try {
            const { data } = await apiClient.get('/ads-stats', { params: { days } });
            return data;
        } catch (error) {
            console.error('Failed to fetch ads stats', error);
            return {
                meta: { status: 'not_configured' },
                google: { status: 'not_configured' },
                linkedin: { status: 'not_configured' },
            };
        }
    },

    getAdsStatsV2: async (): Promise<AdsStats> => {
        try {
            const { data } = await apiClient.get('/ads/stats');
            return data;
        } catch (error) {
            console.error('Failed to fetch ads stats', error);
            return {
                meta: { status: 'not_configured' },
                google: { status: 'not_configured' },
                linkedin: { status: 'not_configured' },
            };
        }
    },

    getGA4Snapshot: async (days = 1): Promise<GA4Snapshot> => {
        try {
            const { data } = await apiClient.get('/ga4/snapshot', { params: { days } });
            return data;
        } catch (error) {
            console.error('Failed to fetch GA4 snapshot', error);
            return {
                status: 'error',
                snapshot: [],
                count: 0,
                fetched_at: new Date().toISOString(),
            };
        }
    },

    getClaritySnapshot: async (): Promise<ClaritySnapshot> => {
        try {
            const { data } = await apiClient.get('/clarity/snapshot');
            return data;
        } catch (error) {
            console.error('Failed to fetch Clarity snapshot', error);
            return {
                status: 'error',
                friction_data: [],
                count: 0,
                snapshot_meta: {},
                fetched_at: new Date().toISOString(),
            };
        }
    },

    // ── Create ────────────────────────────────────────────────────
    createCampaign: async (body: CreateCampaignRequest): Promise<CreateCampaignResponse> => {
        const { data } = await apiClient.post('/ads-campaign/create', body);
        return data;
    },

    createMetaCampaign: async (body: MetaCampaignRequest): Promise<CreateCampaignResponse> => {
        const { data } = await apiClient.post('/meta/campaigns', body);
        return data;
    },

    // ── Update ────────────────────────────────────────────────────
    toggleCampaign: async (body: CampaignToggleRequest): Promise<CampaignToggleResponse> => {
        const { data } = await apiClient.post('/ads-campaign/toggle', body);
        return data;
    },
};

