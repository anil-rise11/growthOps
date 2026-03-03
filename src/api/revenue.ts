import { v1ApiClient } from './client';

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

export interface RevenueAttributionResponse {
    total_attributed_revenue: number;
    by_campaign: RevenueByCampaign[];
    by_channel: RevenueByChannel[];
}

export interface RevenueAttributionByCampaignResponse {
    campaigns: RevenueByCampaign[];
    total_revenue: number;
}

export interface RevenueAttributionByChannelResponse {
    channels: RevenueByChannel[];
    total_revenue: number;
}

export const revenueService = {
    // ── Read ──────────────────────────────────────────────────────
    getAttribution: async (): Promise<RevenueAttributionResponse> => {
        try {
            const { data } = await v1ApiClient.get('/revenue-attribution');
            return data;
        } catch (error) {
            console.error('Failed to fetch revenue attribution', error);
            return {
                total_attributed_revenue: 0,
                by_campaign: [],
                by_channel: [],
            };
        }
    },

    getAttributionByCampaign: async (): Promise<RevenueAttributionByCampaignResponse> => {
        try {
            const { data } = await v1ApiClient.get('/revenue-attribution/by-campaign');
            return data;
        } catch (error) {
            console.error('Failed to fetch revenue by campaign', error);
            return {
                campaigns: [],
                total_revenue: 0,
            };
        }
    },

    getAttributionByChannel: async (): Promise<RevenueAttributionByChannelResponse> => {
        try {
            const { data } = await v1ApiClient.get('/revenue-attribution/by-channel');
            return data;
        } catch (error) {
            console.error('Failed to fetch revenue by channel', error);
            return {
                channels: [],
                total_revenue: 0,
            };
        }
    },
};
