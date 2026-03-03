import { apiClient } from './client';

export interface EmailSequence {
    sequence_id: string;
    name: string;
    description: string;
    status: 'active' | 'paused' | 'draft';
    step_count: number;
}

export interface SequenceStep {
    step_number: number;
    delay_days: number;
    subject: string;
    body_template: string;
}

export interface SequenceDetail extends EmailSequence {
    steps: SequenceStep[];
}

export interface SequenceStats {
    sequence_id: string;
    enrollments: number;
    completed: number;
    active: number;
    emails_sent: number;
    open_rate: number;
    click_rate: number;
    unsubscribe_rate: number;
}

export interface SequencesStats {
    total_sequences: number;
    total_enrollments: number;
    active_enrollments: number;
    emails_sent_total: number;
    avg_open_rate: number;
    avg_click_rate: number;
}

export interface Enrollment {
    enrollment_id: string;
    sequence_id: string;
    lead_id: string;
    email: string;
    status: 'active' | 'paused' | 'completed' | 'unenrolled';
    enrolled_at: string;
    current_step: number;
    next_email_at?: string;
}

export interface CreateSequenceRequest {
    name: string;
    description?: string;
    steps: Omit<SequenceStep, 'step_number'>[];
}

export interface UpdateSequenceRequest {
    name?: string;
    description?: string;
    steps?: Omit<SequenceStep, 'step_number'>[];
}

export interface EnrollLeadRequest {
    lead_id: string;
    email: string;
    first_name?: string;
    company?: string;
    tags?: string[];
}

export interface EnrollLeadResponse {
    success: boolean;
    enrollment_id: string;
    sequence_id: string;
    lead_id: string;
    status: string;
    enrolled_at: string;
}

export const sequencesService = {
    // ── Read ──────────────────────────────────────────────────────
    getSequences: async (status?: 'active' | 'paused' | 'draft'): Promise<EmailSequence[]> => {
        try {
            const { data } = await apiClient.get('/api/sequences', { params: status ? { status } : undefined });
            return data;
        } catch (error) {
            console.error('Failed to fetch sequences', error);
            return [];
        }
    },

    getSequencesStats: async (): Promise<SequencesStats> => {
        try {
            const { data } = await apiClient.get('/api/sequences/stats');
            return data;
        } catch (error) {
            console.error('Failed to fetch sequences stats', error);
            return {
                total_sequences: 0,
                total_enrollments: 0,
                active_enrollments: 0,
                emails_sent_total: 0,
                avg_open_rate: 0,
                avg_click_rate: 0,
            };
        }
    },

    getSequence: async (sequenceId: string): Promise<SequenceDetail> => {
        const { data } = await apiClient.get(`/api/sequences/${sequenceId}`);
        return data;
    },

    getSequenceStats: async (sequenceId: string): Promise<SequenceStats> => {
        const { data } = await apiClient.get(`/api/sequences/${sequenceId}/stats`);
        return data;
    },

    getEnrollments: async (params?: { sequence_id?: string; status?: string; limit?: number }): Promise<Enrollment[]> => {
        try {
            const { data } = await apiClient.get('/api/enrollments/list', { params });
            return data;
        } catch (error) {
            console.error('Failed to fetch enrollments', error);
            return [];
        }
    },

    getEnrollment: async (enrollmentId: string): Promise<Enrollment> => {
        const { data } = await apiClient.get(`/api/enrollments/${enrollmentId}`);
        return data;
    },

    // ── Create ────────────────────────────────────────────────────
    createSequence: async (body: CreateSequenceRequest): Promise<SequenceDetail> => {
        const { data } = await apiClient.post('/api/sequences', body);
        return data;
    },

    enrollLead: async (sequenceId: string, body: EnrollLeadRequest): Promise<EnrollLeadResponse> => {
        const { data } = await apiClient.post(`/api/sequences/${sequenceId}/enroll`, body);
        return data;
    },

    // ── Update ────────────────────────────────────────────────────
    updateSequence: async (sequenceId: string, body: UpdateSequenceRequest): Promise<SequenceDetail> => {
        const { data } = await apiClient.put(`/api/sequences/${sequenceId}`, body);
        return data;
    },

    pauseEnrollment: async (enrollmentId: string): Promise<{ success: boolean; enrollment_id: string; action: string }> => {
        const { data } = await apiClient.post(`/api/enrollments/${enrollmentId}/pause`);
        return data;
    },

    resumeEnrollment: async (enrollmentId: string): Promise<{ success: boolean; enrollment_id: string; action: string }> => {
        const { data } = await apiClient.post(`/api/enrollments/${enrollmentId}/resume`);
        return data;
    },

    unenrollLead: async (enrollmentId: string, reason?: string): Promise<{ success: boolean; enrollment_id: string; action: string; reason?: string }> => {
        const { data } = await apiClient.post(`/api/enrollments/${enrollmentId}/unenroll`, { reason });
        return data;
    },

    // ── Delete ────────────────────────────────────────────────────
    deleteSequence: async (sequenceId: string): Promise<{ success: boolean; sequence_id: string }> => {
        const { data } = await apiClient.delete(`/api/sequences/${sequenceId}`);
        return data;
    },
};
