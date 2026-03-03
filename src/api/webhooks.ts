import axios from 'axios';

// Webhooks API uses a different base path - no /sales-marketing-ops prefix
const isDev = import.meta.env.DEV;
const remoteBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://api-test.zetaleap.ai';
const coreBase = isDev ? '/proxy-core' : remoteBaseURL;

const webhooksClient = axios.create({
    baseURL: `${coreBase}/webhooks`,
    headers: {
        'Content-Type': 'application/json',
    },
});

const interceptRequest = (config: any) => config;
const interceptResponseError = (error: any) => {
    console.error('API Error:', error.response?.data?.detail || error.response?.data?.message || error.message);
    return Promise.reject(error);
};

webhooksClient.interceptors.request.use(interceptRequest, (err) => Promise.reject(err));
webhooksClient.interceptors.response.use((r) => r, interceptResponseError);

export interface WebhookHealth {
    status: string;
    timestamp: string;
    version?: string;
}

export interface WebhookEvent {
    event_id: string;
    type: string;
    timestamp: string;
    source: string;
    payload: Record<string, any>;
    processed: boolean;
}

export interface IdempotencyStats {
    total_events: number;
    unique_events: number;
    duplicates_detected: number;
    dedup_rate: number;
}

export interface FailedEvent {
    event_id: string;
    type: string;
    timestamp: string;
    error: string;
    retry_count: number;
}

export interface RetryEventResponse {
    success: boolean;
    event_id: string;
    message: string;
}

export const webhooksService = {
    // ── Health ────────────────────────────────────────────────────
    getHealth: async (): Promise<WebhookHealth> => {
        try {
            const { data } = await webhooksClient.get('/health');
            return data;
        } catch (error) {
            console.error('Failed to fetch webhook health', error);
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
            };
        }
    },

    // ── Debug ─────────────────────────────────────────────────────
    getDebugEvents: async (limit = 100): Promise<{ events: WebhookEvent[]; total: number }> => {
        try {
            const { data } = await webhooksClient.get('/debug/events', { params: { limit } });
            return data;
        } catch (error) {
            console.error('Failed to fetch debug events', error);
            return { events: [], total: 0 };
        }
    },

    // ── Idempotency ───────────────────────────────────────────────
    getIdempotencyStats: async (): Promise<IdempotencyStats> => {
        try {
            const { data } = await webhooksClient.get('/idempotency/stats');
            return data;
        } catch (error) {
            console.error('Failed to fetch idempotency stats', error);
            return {
                total_events: 0,
                unique_events: 0,
                duplicates_detected: 0,
                dedup_rate: 0,
            };
        }
    },

    getFailedEvents: async (limit = 50): Promise<{ events: FailedEvent[]; total: number }> => {
        try {
            const { data } = await webhooksClient.get('/idempotency/failed', { params: { limit } });
            return data;
        } catch (error) {
            console.error('Failed to fetch failed events', error);
            return { events: [], total: 0 };
        }
    },

    retryEvent: async (eventId: string): Promise<RetryEventResponse> => {
        const { data } = await webhooksClient.post(`/idempotency/retry/${eventId}`);
        return data;
    },
};
