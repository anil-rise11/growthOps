import { apiClient } from './client';

export interface HubSpotAccount {
    portal_id: string;
    name: string;
    active_scopes: string[];
}

export interface HubSpotSyncResponse {
    status: string;
    contacts_count: number;
    deals_count?: number;
}

export interface HubSpotSyncStatus {
    status: string;
    last_synced_at?: string;
    contacts_count?: number;
    deals_count?: number;
    error_message?: string;
}

export interface HubSpotContact {
    contact_id: string;
    email: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    phone?: string;
    lifecyclestage?: string;
    created_at?: string;
    last_modified?: string;
}

export interface HubSpotDeal {
    deal_id: string;
    dealname: string;
    amount?: number;
    dealstage?: string;
    pipeline?: string;
    closedate?: string;
    created_at?: string;
    contact_id?: string;
}

export interface HubSpotNote {
    note_id: string;
    contact_id: string;
    note_body: string;
    created_at: string;
    created_by?: string;
}

export interface HubSpotPipeline {
    pipeline_id: string;
    label: string;
    stages: HubSpotStage[];
}

export interface HubSpotStage {
    stage_id: string;
    label: string;
    display_order: number;
}

export interface CreateContactRequest {
    properties: {
        email: string;
        firstname?: string;
        lastname?: string;
        company?: string;
        phone?: string;
        [key: string]: any;
    };
}

export interface CreateDealRequest {
    properties: {
        dealname: string;
        amount?: string | number;
        dealstage?: string;
        [key: string]: any;
    };
    contact_id?: string;
}

export interface CreateNoteRequest {
    contact_id: string;
    note_body: string;
}

export interface CreateStageRequest {
    pipeline_id: string;
    label: string;
    display_order?: number;
}

export const hubspotService = {
    // ── Account ───────────────────────────────────────────────────
    getAccount: async (): Promise<HubSpotAccount> => {
        const { data } = await apiClient.get('/hubspot/account');
        return data;
    },

    // ── Sync ──────────────────────────────────────────────────────
    sync: async (): Promise<HubSpotSyncResponse> => {
        const { data } = await apiClient.post('/hubspot/sync');
        return data;
    },

    getSyncStatus: async (): Promise<HubSpotSyncStatus> => {
        const { data } = await apiClient.get('/hubspot/sync/status');
        return data;
    },

    // ── Contacts ──────────────────────────────────────────────────
    getContacts: async (limit = 100): Promise<{ contacts: HubSpotContact[]; total: number }> => {
        try {
            const { data } = await apiClient.get('/hubspot/contacts', { params: { limit } });
            return data;
        } catch (error) {
            console.error('Failed to fetch HubSpot contacts', error);
            return { contacts: [], total: 0 };
        }
    },

    createContact: async (body: CreateContactRequest): Promise<HubSpotContact> => {
        const { data } = await apiClient.post('/hubspot/contacts', body);
        return data;
    },

    updateContact: async (contactId: string, body: { properties: Record<string, any> }): Promise<HubSpotContact> => {
        const { data } = await apiClient.patch(`/hubspot/contacts/${contactId}`, body);
        return data;
    },

    deleteContact: async (contactId: string): Promise<{ success: boolean; contact_id: string }> => {
        const { data } = await apiClient.delete(`/hubspot/contacts/${contactId}`);
        return data;
    },

    // ── Deals ─────────────────────────────────────────────────────
    getDeals: async (limit = 100): Promise<{ deals: HubSpotDeal[]; total: number }> => {
        try {
            const { data } = await apiClient.get('/hubspot/deals', { params: { limit } });
            return data;
        } catch (error) {
            console.error('Failed to fetch HubSpot deals', error);
            return { deals: [], total: 0 };
        }
    },

    createDeal: async (body: CreateDealRequest): Promise<HubSpotDeal> => {
        const { data } = await apiClient.post('/hubspot/deals', body);
        return data;
    },

    updateDeal: async (dealId: string, body: { properties: Record<string, any> }): Promise<HubSpotDeal> => {
        const { data } = await apiClient.patch(`/hubspot/deals/${dealId}`, body);
        return data;
    },

    deleteDeal: async (dealId: string): Promise<{ success: boolean; deal_id: string }> => {
        const { data } = await apiClient.delete(`/hubspot/deals/${dealId}`);
        return data;
    },

    // ── Notes ─────────────────────────────────────────────────────
    getNotes: async (params?: { contact_id?: string; limit?: number }): Promise<{ notes: HubSpotNote[]; total: number }> => {
        try {
            const { data } = await apiClient.get('/hubspot/notes', { params });
            return data;
        } catch (error) {
            console.error('Failed to fetch HubSpot notes', error);
            return { notes: [], total: 0 };
        }
    },

    createNote: async (body: CreateNoteRequest): Promise<HubSpotNote> => {
        const { data } = await apiClient.post('/hubspot/notes', body);
        return data;
    },

    deleteNote: async (noteId: string): Promise<{ success: boolean; note_id: string }> => {
        const { data } = await apiClient.delete(`/hubspot/notes/${noteId}`);
        return data;
    },

    // ── Pipelines ─────────────────────────────────────────────────
    getPipelines: async (): Promise<{ pipelines: HubSpotPipeline[] }> => {
        try {
            const { data } = await apiClient.get('/hubspot/pipelines');
            return data;
        } catch (error) {
            console.error('Failed to fetch HubSpot pipelines', error);
            return { pipelines: [] };
        }
    },

    createStage: async (body: CreateStageRequest): Promise<HubSpotStage> => {
        const { data } = await apiClient.post('/hubspot/stages', body);
        return data;
    },

    updateStage: async (pipelineId: string, stageId: string, body: { label?: string; display_order?: number }): Promise<HubSpotStage> => {
        const { data } = await apiClient.patch('/hubspot/stages', body, { params: { pipeline_id: pipelineId, stage_id: stageId } });
        return data;
    },

    deleteStage: async (pipelineId: string, stageId: string): Promise<{ success: boolean; stage_id: string }> => {
        const { data } = await apiClient.delete('/hubspot/stages', { params: { pipeline_id: pipelineId, stage_id: stageId } });
        return data;
    },
};
