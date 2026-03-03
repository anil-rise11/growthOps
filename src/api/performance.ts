import { v1ApiClient } from './client';

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
    getRecords: async (limit = 100): Promise<PerformanceMemoryResponse> => {
        try {
            const { data } = await v1ApiClient.get('/performance-memory', { params: { limit } });
            return data;
        } catch (error) {
            console.error('Failed to fetch performance records', error);
            return { records: [], total: 0 };
        }
    },

    getSummary: async (): Promise<PerformanceSummary> => {
        try {
            const { data } = await v1ApiClient.get('/performance-memory/summary');
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

    // ── Create ────────────────────────────────────────────────────
    recordOutcome: async (body: CreatePerformanceRecordRequest): Promise<PerformanceRecord> => {
        const { data } = await v1ApiClient.post('/performance-memory', body);
        return data;
    },
};
