import { apiClient } from './client';
import type { Action, ActionStats } from './types';

// ─── Section 2: Actions (/sales-marketing-ops/actions) ───────────────────────

export const actionsService = {
    // GET /sales-marketing-ops/actions/pending
    getPendingActions: async (params?: { action_type?: string; limit?: number }): Promise<Action[]> => {
        const { data } = await apiClient.get('/actions/pending', { params });
        return data;
    },

    // GET /sales-marketing-ops/actions/history
    getActionHistory: async (params?: { status?: string; action_type?: string; run_id?: string; limit?: number; skip?: number }): Promise<Action[]> => {
        const { data } = await apiClient.get('/actions/history', { params });
        return data;
    },

    // GET /sales-marketing-ops/actions/stats
    getActionStats: async (): Promise<ActionStats> => {
        const { data } = await apiClient.get('/actions/stats');
        return data;
    },

    // GET /sales-marketing-ops/actions/by-run/{run_id}
    getActionsByRun: async (runId: string): Promise<Action[]> => {
        const { data } = await apiClient.get(`/actions/by-run/${runId}`);
        return data;
    },

    // GET /sales-marketing-ops/actions/{action_id}
    getAction: async (actionId: string): Promise<Action> => {
        const { data } = await apiClient.get(`/actions/${encodeURIComponent(actionId)}`);
        return data;
    },

    // GET /sales-marketing-ops/actions/{action_id}/template-preview
    getTemplatePreview: async (actionId: string): Promise<{ html: string; subject: string; step: number }> => {
        const { data } = await apiClient.get(`/actions/${encodeURIComponent(actionId)}/template-preview`);
        return data;
    },

    // PATCH /sales-marketing-ops/actions/{action_id}/template
    editActionTemplate: async (actionId: string, body: { template: { step_1?: { subject: string; body: string }; step_2?: { subject: string; body: string }; step_3?: { subject: string; body: string } } }): Promise<any> => {
        const { data } = await apiClient.patch(`/actions/${encodeURIComponent(actionId)}/template`, body);
        return data;
    },

    // PATCH /sales-marketing-ops/actions/{action_id}
    updateAction: async (actionId: string, body: { configuration_payload?: any; scheduled_at?: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.patch(`/actions/${encodeURIComponent(actionId)}`, body);
        return data;
    },

    // POST /sales-marketing-ops/actions/{action_id}/approve
    approveAction: async (actionId: string, payload: { approved_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/actions/${encodeURIComponent(actionId)}/approve`, payload);
        return data;
    },

    // POST /sales-marketing-ops/actions/{action_id}/reject
    rejectAction: async (actionId: string, payload: { rejected_by: string; reason: string }): Promise<any> => {
        const { data } = await apiClient.post(`/actions/${encodeURIComponent(actionId)}/reject`, payload);
        return data;
    },

    // POST /sales-marketing-ops/actions/{action_id}/retry
    retryAction: async (actionId: string, requestedBy: string): Promise<any> => {
        const { data } = await apiClient.post(`/actions/${encodeURIComponent(actionId)}/retry`, { requested_by: requestedBy });
        return data;
    },

    // POST /sales-marketing-ops/actions/bulk-approve
    bulkApprove: async (body: { action_ids: string[]; approved_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post('/actions/bulk-approve', body);
        return data;
    },

    // POST /sales-marketing-ops/actions/bulk-reject
    bulkReject: async (body: { action_ids?: string[]; suggestion_ids?: string[]; social_suggestion_ids?: string[]; rejected_by: string; reason?: string }): Promise<any> => {
        const { data } = await apiClient.post('/actions/bulk-reject', body);
        return data;
    },

    // POST /sales-marketing-ops/actions/execute-scheduled
    executeScheduled: async (): Promise<{ success: boolean; executed_count: number }> => {
        const { data } = await apiClient.post('/actions/execute-scheduled');
        return data;
    },
};

// ─── Section 3: Governance Layer (/sales-marketing-ops/api/approvals) ─────────

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
    // GET /sales-marketing-ops/api/approvals
    getApprovals: async (status?: string): Promise<GovernanceRequest[]> => {
        const { data } = await apiClient.get('/api/approvals', { params: status ? { status } : undefined });
        return data;
    },

    // GET /sales-marketing-ops/api/approvals/stats
    getApprovalStats: async (): Promise<GovernanceStats> => {
        const { data } = await apiClient.get('/api/approvals/stats');
        return data;
    },

    // GET /sales-marketing-ops/api/approvals/history
    getApprovalHistory: async (limit = 50): Promise<{ decisions: any[]; count: number }> => {
        const { data } = await apiClient.get('/api/approvals/history', { params: { limit } });
        return data;
    },

    // GET /sales-marketing-ops/api/approvals/policy
    getPolicy: async (): Promise<any> => {
        const { data } = await apiClient.get('/api/approvals/policy');
        return data;
    },

    // GET /sales-marketing-ops/api/approvals/mode
    getMode: async (): Promise<{ mode: string; modes_available: string[] }> => {
        const { data } = await apiClient.get('/api/approvals/mode');
        return data;
    },

    // POST /sales-marketing-ops/api/approvals/mode
    setMode: async (mode: string): Promise<any> => {
        const { data } = await apiClient.post('/api/approvals/mode', { mode });
        return data;
    },

    // GET /sales-marketing-ops/api/approvals/view/{request_id}
    getApproval: async (requestId: string): Promise<GovernanceRequest> => {
        const { data } = await apiClient.get(`/api/approvals/view/${requestId}`);
        return data;
    },

    // GET /sales-marketing-ops/api/approvals/{request_id}
    getApprovalById: async (requestId: string): Promise<GovernanceRequest> => {
        const { data } = await apiClient.get(`/api/approvals/${requestId}`);
        return data;
    },

    // POST /sales-marketing-ops/api/approvals/approve/{request_id}
    approveRequest: async (requestId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/approvals/approve/${requestId}`, body);
        return data;
    },

    // POST /sales-marketing-ops/api/approvals/reject/{request_id}
    rejectRequest: async (requestId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/approvals/reject/${requestId}`, body);
        return data;
    },

    // POST /sales-marketing-ops/api/approvals/expire-stale
    expireStale: async (): Promise<{ success: boolean; expired_count: number; checked_at: string }> => {
        const { data } = await apiClient.post('/api/approvals/expire-stale');
        return data;
    },

    // GET /sales-marketing-ops/api/approvals/ad-campaign-suggestions
    getAdSuggestions: async (status?: string): Promise<{ suggestions: AdSuggestion[]; count: number }> => {
        const { data } = await apiClient.get('/api/approvals/ad-campaign-suggestions', { params: status ? { status } : undefined });
        return data;
    },

    // GET /sales-marketing-ops/api/approvals/ad-campaign-suggestions/{suggestion_id}
    getAdSuggestion: async (suggestionId: string): Promise<AdSuggestion> => {
        const { data } = await apiClient.get(`/api/approvals/ad-campaign-suggestions/${suggestionId}`);
        return data;
    },

    // POST /sales-marketing-ops/api/approvals/ad-campaign-suggestions/{suggestion_id}/approve
    approveAdSuggestion: async (suggestionId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/approvals/ad-campaign-suggestions/${suggestionId}/approve`, body);
        return data;
    },

    // POST /sales-marketing-ops/api/approvals/ad-campaign-suggestions/{suggestion_id}/reject
    rejectAdSuggestion: async (suggestionId: string, body: { responded_by: string; notes?: string }): Promise<any> => {
        const { data } = await apiClient.post(`/api/approvals/ad-campaign-suggestions/${suggestionId}/reject`, body);
        return data;
    },
};
