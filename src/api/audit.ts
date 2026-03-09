import { apiClient } from './client';

export interface AuditLogEvent {
    event_id: string;
    timestamp: string;
    channel: string;
    action: string;
    details: string;
    actor_type: 'agent' | 'human' | 'system';
    actor: string;
    status: 'success' | 'failure' | 'warning';
}

export interface AuditLogResponse {
    events: AuditLogEvent[];
    total: number;
}

export interface AuditLogParams {
    channel?: string;
    actor_type?: 'agent' | 'human' | 'system';
    status?: 'success' | 'failure' | 'warning';
    limit?: number;
}

export const auditService = {
    // ── Read ──────────────────────────────────────────────────────
    getAuditLog: async (params?: AuditLogParams): Promise<AuditLogResponse> => {
        try {
            const { data } = await apiClient.get('/audit-log', { params });
            return data;
        } catch (error) {
            console.error('Failed to fetch audit log', error);
            return { events: [], total: 0 };
        }
    },
};
