import { apiClient } from './client';
import type { Action, ActionStats } from './types';

// ─── Actions Service (/sales-marketing-ops/actions) ─────────────────────────

export const actionsService = {
    getPendingActions: async (params?: { action_type?: string; limit?: number }): Promise<Action[]> => {
        const { data } = await apiClient.get('/actions/pending', { params });
        return data;
    },

    getActionHistory: async (params?: { status?: string; action_type?: string; run_id?: string; limit?: number; skip?: number }): Promise<Action[]> => {
        const { data } = await apiClient.get('/actions/history', { params });
        return data;
    },

    getActionStats: async (): Promise<ActionStats> => {
        const { data } = await apiClient.get('/actions/stats');
        return data;
    },

    getActionsByRun: async (runId: string): Promise<Action[]> => {
        const { data } = await apiClient.get(`/actions/by-run/${runId}`);
        return data;
    },

    getAction: async (actionId: string): Promise<Action> => {
        const { data } = await apiClient.get(`/actions/${encodeURIComponent(actionId)}`);
        return data;
    },

    bulkApprove: async (body: { action_ids: string[]; approved_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post('/actions/bulk-approve', body);
        return data;
    },

    bulkReject: async (body: { action_ids?: string[]; suggestion_ids?: string[]; social_suggestion_ids?: string[]; rejected_by: string; reason?: string }): Promise<any> => {
        const { data } = await apiClient.post('/actions/bulk-reject', body);
        return data;
    },

    approveAction: async (actionId: string, payload: { approved_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/actions/${encodeURIComponent(actionId)}/approve`, payload);
        return data;
    },

    rejectAction: async (actionId: string, payload: { rejected_by: string; reason: string }): Promise<any> => {
        const { data } = await apiClient.post(`/actions/${encodeURIComponent(actionId)}/reject`, payload);
        return data;
    },

    retryAction: async (actionId: string, requestedBy: string): Promise<any> => {
        const { data } = await apiClient.post(`/actions/${encodeURIComponent(actionId)}/retry`, { requested_by: requestedBy });
        return data;
    },

    updateAction: async (actionId: string, body: { configuration_payload?: any; scheduled_at?: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.patch(`/actions/${encodeURIComponent(actionId)}`, body);
        return data;
    },
};

// ─── Governance Service (/sales-marketing-ops/api/approvals) ─────────────────

export interface GovernanceRequest {
    request_id: string;
    action_type: string;
    category: string;
    risk_level: string;
    status: string;
    reason: string;
    estimated_spend?: number;
    requested_at: string;
    timeout_minutes?: number;
}

export interface GovernanceStats {
    current_mode: string;
    pending_count: number;
    total_decisions: number;
    decisions_by_type: Record<string, number>;
    daily_spend_today: number;
    daily_spend_limit: number;
    pending: number;
    approved_today: number;
    rejected_today: number;
    auto_executed: number;
}

export interface AdSuggestion {
    suggestion_id: string;
    campaign_name: string;
    campaign_type: string;
    objective: string;
    budget: number;
    duration_days: number;
    targeting: any;
    expected_impact: string;
    confidence_score: number;
    status: string;
    created_at: string;
    pattern_type?: string;
    reasoning?: string;
}

export const governanceService = {
    // — Governance requests —
    getApprovals: async (status?: string): Promise<GovernanceRequest[]> => {
        const { data } = await apiClient.get('/api/approvals', { params: status ? { status } : undefined });
        return data;
    },

    getApprovalStats: async (): Promise<GovernanceStats> => {
        const { data } = await apiClient.get('/api/approvals/stats');
        return data;
    },

    getApproval: async (requestId: string): Promise<GovernanceRequest> => {
        const { data } = await apiClient.get(`/api/approvals/view/${requestId}`);
        return data;
    },

    approveRequest: async (requestId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/approvals/approve/${requestId}`, body);
        return data;
    },

    rejectRequest: async (requestId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/approvals/reject/${requestId}`, body);
        return data;
    },

    getApprovalHistory: async (limit = 50): Promise<{ decisions: any[]; count: number }> => {
        const { data } = await apiClient.get('/api/approvals/history', { params: { limit } });
        return data;
    },

    getPolicy: async (): Promise<any> => {
        const { data } = await apiClient.get('/api/approvals/policy');
        return data;
    },

    getMode: async (): Promise<{ mode: string; modes_available: string[] }> => {
        const { data } = await apiClient.get('/api/approvals/mode');
        return data;
    },

    setMode: async (mode: string): Promise<any> => {
        const { data } = await apiClient.post('/api/approvals/mode', { mode });
        return data;
    },

    expireStale: async (): Promise<{ success: boolean; expired_count: number; checked_at: string }> => {
        const { data } = await apiClient.post('/api/approvals/expire-stale');
        return data;
    },

    // — Ad campaign suggestions —
    getAdSuggestions: async (status?: string): Promise<{ suggestions: AdSuggestion[]; count: number }> => {
        const { data } = await apiClient.get('/api/approvals/ad-campaign-suggestions', { params: status ? { status } : undefined });
        return data;
    },

    approveAdSuggestion: async (suggestionId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/approvals/ad-campaign-suggestions/${suggestionId}/approve`, body);
        return data;
    },

    rejectAdSuggestion: async (suggestionId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/approvals/ad-campaign-suggestions/${suggestionId}/reject`, body);
        return data;
    },
};

