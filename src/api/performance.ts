import { v2ApiClient } from './client';

export interface PerformanceRecord {
    record_id: string;
    action_type: string;
    outcome: 'success' | 'failure' | 'partial';
    metrics: Record<string, number>;
    context: Record<string, any>;
    created_at: string;
}

export interface PerformanceMemoryResponse {
    records: PerformanceRecord[];
    total: number;
}

export interface CreatePerformanceRecordRequest {
    action_type: string;
    outcome: 'success' | 'failure' | 'partial';
    metrics?: Record<string, number>;
    context?: Record<string, any>;
}

export interface PerformanceSummary {
    total_records: number;
    by_action_type: Record<string, number>;
    success_rate: number;
    average_metrics: Record<string, number>;
    learning_insights: string[];
}

export const performanceService = {
    // ── Read ──────────────────────────────────────────────────────
    // GET /v2/sales-marketing-ops/performance-memory/best-patterns
    getBestPatterns: async (): Promise<any> => {
        try {
            const { data } = await v2ApiClient.get('/performance-memory/best-patterns');
            return data;
        } catch (error) {
            console.error('Failed to fetch best performance patterns', error);
            return { patterns: [] };
        }
    },

    // GET /v2/sales-marketing-ops/performance-memory/failed-patterns
    getFailedPatterns: async (): Promise<any> => {
        try {
            const { data } = await v2ApiClient.get('/performance-memory/failed-patterns');
            return data;
        } catch (error) {
            console.error('Failed to fetch failed performance patterns', error);
            return { patterns: [] };
        }
    },

    // GET /v2/sales-marketing-ops/performance-memory/action-rates
    getActionRates: async (): Promise<any> => {
        try {
            const { data } = await v2ApiClient.get('/performance-memory/action-rates');
            return data;
        } catch (error) {
            console.error('Failed to fetch action rates', error);
            return { rates: {} };
        }
    },

    // GET /v2/sales-marketing-ops/performance-memory/summary
    getSummary: async (): Promise<PerformanceSummary> => {
        try {
            const { data } = await v2ApiClient.get('/performance-memory/summary');
            return data;
        } catch (error) {
            console.error('Failed to fetch performance summary', error);
            return {
                total_records: 0,
                by_action_type: {},
                success_rate: 0,
                average_metrics: {},
                learning_insights: [],
            };
        }
    },
};
