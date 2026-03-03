import axios from 'axios';

// Autonomous Config API uses /v2/sales-marketing-ops prefix
const isDev = import.meta.env.DEV;
const remoteBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://api-test.zetaleap.ai';
const v2Base = isDev ? '' : remoteBaseURL;

const v2ApiClient = axios.create({
    baseURL: `${v2Base}/v2/sales-marketing-ops/autonomous`,
    headers: {
        'Content-Type': 'application/json',
    },
});

const interceptRequest = (config: any) => config;
const interceptResponseError = (error: any) => {
    console.error('API Error:', error.response?.data?.detail || error.response?.data?.message || error.message);
    return Promise.reject(error);
};

v2ApiClient.interceptors.request.use(interceptRequest, (err) => Promise.reject(err));
v2ApiClient.interceptors.response.use((r) => r, interceptResponseError);

export interface AutonomousConfig {
    enabled: boolean;
    interval_hours: number;
    selected_sources: string[];
    selected_csvs: string[];
    governance_mode: 'observe' | 'suggest' | 'execute';
    notification_emails: string[];
    send_notification_emails: boolean;
    action_limits: {
        max_daily_email_campaigns: number;
        max_daily_social_posts: number;
        max_daily_ad_spend: number;
    };
    hubspot_deals?: {
        revenue_forecasting: boolean;
        sales_rep_tracking: boolean;
        native_revenue_dashboards: boolean;
    };
}

export interface AutonomousHistoryRun {
    run_id: string;
    status: string;
    started_at: string;
    completed_at?: string;
    duration_seconds?: number;
}

export interface AutonomousHistoryResponse {
    runs: AutonomousHistoryRun[];
    total: number;
}

export interface ToggleRequest {
    enabled: boolean;
}

export interface ToggleResponse {
    success: boolean;
    enabled: boolean;
    message: string;
}

export interface RunNowResponse {
    success: boolean;
    message: string;
    active_run_id: string;
}

export const autonomousService = {
    // ── Read ──────────────────────────────────────────────────────
    getConfig: async (): Promise<AutonomousConfig> => {
        try {
            const { data } = await v2ApiClient.get('/config');
            return data;
        } catch (error) {
            console.error('Failed to fetch autonomous config', error);
            return {
                enabled: false,
                interval_hours: 4,
                selected_sources: [],
                selected_csvs: [],
                governance_mode: 'suggest',
                notification_emails: [],
                send_notification_emails: false,
                action_limits: {
                    max_daily_email_campaigns: 3,
                    max_daily_social_posts: 5,
                    max_daily_ad_spend: 500,
                },
            };
        }
    },

    getHistory: async (): Promise<AutonomousHistoryResponse> => {
        try {
            const { data } = await v2ApiClient.get('/history');
            return data;
        } catch (error) {
            console.error('Failed to fetch autonomous history', error);
            return { runs: [], total: 0 };
        }
    },

    // ── Update ────────────────────────────────────────────────────
    updateConfig: async (body: Partial<AutonomousConfig>): Promise<AutonomousConfig> => {
        const { data } = await v2ApiClient.put('/config', body);
        return data;
    },

    toggle: async (enabled: boolean): Promise<ToggleResponse> => {
        const { data } = await v2ApiClient.post('/toggle', { enabled });
        return data;
    },

    runNow: async (): Promise<RunNowResponse> => {
        const { data } = await v2ApiClient.post('/run-now');
        return data;
    },
};
