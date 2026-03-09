import { v2ApiClient } from './client';

export interface RevenueByCampaign {
    campaign: string;
    revenue: number;
    leads: number;
    conversions: number;
}

export interface RevenueByChannel {
    channel: string;
    revenue: number;
}

export interface RevenueAttributionDashboard {
    total_attributed_revenue: number;
    by_campaign: RevenueByCampaign[];
    by_channel: RevenueByChannel[];
}

export interface RevenueFunnelStage {
    stage: string;
    count: number;
    conversion_rate?: number;
}

export const revenueService = {
    // ── GET /v2/sales-marketing-ops/attribution/dashboard ────────────────
    getDashboard: async (): Promise<RevenueAttributionDashboard> => {
        try {
            const { data } = await v2ApiClient.get('/attribution/dashboard');
            return data;
        } catch (error) {
            console.error('Failed to fetch attribution dashboard', error);
            return {
                total_attributed_revenue: 0,
                by_campaign: [],
                by_channel: [],
            };
        }
    },

    // ── GET /v2/sales-marketing-ops/attribution/campaign/{campaign_id} ───
    getCampaignAttribution: async (campaignId: string): Promise<any> => {
        try {
            const { data } = await v2ApiClient.get(`/attribution/campaign/${campaignId}`);
            return data;
        } catch (error) {
            console.error('Failed to fetch campaign attribution', error);
            return null;
        }
    },

    // ── GET /v2/sales-marketing-ops/attribution/revenue-by-source ────────
    getRevenueBySource: async (): Promise<{ channels: RevenueByChannel[]; total_revenue: number }> => {
        try {
            const { data } = await v2ApiClient.get('/attribution/revenue-by-source');
            return data;
        } catch (error) {
            console.error('Failed to fetch revenue by source', error);
            return { channels: [], total_revenue: 0 };
        }
    },

    // ── GET /v2/sales-marketing-ops/attribution/funnel ──────────────────
    getFunnel: async (): Promise<{ stages: RevenueFunnelStage[] }> => {
        try {
            const { data } = await v2ApiClient.get('/attribution/funnel');
            return data;
        } catch (error) {
            console.error('Failed to fetch funnel data', error);
            return { stages: [] };
        }
    },
};
