import { apiClient } from './client';
import type { WorkflowRun, RunState, WorkflowGraph } from './types';

export const workflowService = {
    // Get all runs
    getRuns: async (limit = 100): Promise<WorkflowRun[]> => {
        const { data } = await apiClient.get('/runs', { params: { limit } });
        return data;
    },

    // Get latest run + state (used on Dashboard load)
    getLatestRun: async (): Promise<{ run: WorkflowRun; state: RunState } | { status: 'no_runs' }> => {
        const { data } = await apiClient.get('/latest-run');
        return data;
    },

    // Get state from the most recent completed run
    getLatestState: async (): Promise<RunState> => {
        const { data } = await apiClient.get('/latest-state');
        return data;
    },

    // Get specific run state snapshot
    getRunState: async (runId: string): Promise<RunState> => {
        const { data } = await apiClient.get(`/state/${runId}`);
        return data;
    },

    // Get current execution status of a run
    getRunStatus: async (runId: string): Promise<WorkflowRun> => {
        const { data } = await apiClient.get(`/status/${runId}`);
        return data;
    },

    // Trigger new run
    triggerRun: async (payload: any = {}): Promise<{ status: string; run_id: string }> => {
        const { data } = await apiClient.post('/run', payload);
        return data;
    },

    // Cancel a running workflow
    cancelRun: async (runId: string): Promise<{ status: string; message: string }> => {
        const { data } = await apiClient.post(`/cancel/${runId}`);
        return data;
    },

    // Approve selected actions and RESUME workflow execution
    approveRun: async (runId: string, selectedActionIds: string[]): Promise<any> => {
        const { data } = await apiClient.post(`/approve/${runId}`, {
            approved: true,
            selected_action_ids: selectedActionIds,
        });
        return data;
    },

    // Get raw source data for a run
    getRawSources: async (runId: string): Promise<any> => {
        const { data } = await apiClient.get(`/raw-sources/${runId}`);
        return data;
    },

    // Get workflow visualization data (timeline + graph)
    getWorkflowGraph: async (runId: string): Promise<WorkflowGraph> => {
        const { data } = await apiClient.get(`/api/v2/workflow-graph/${runId}`);
        return data;
    },

    // Get detail for a single graph node
    getGraphNode: async (runId: string, nodeId: string): Promise<any> => {
        const { data } = await apiClient.get(`/api/v2/workflow-graph/${runId}/node/${nodeId}`);
        return data;
    },
};

