import { apiClient } from './client';

export interface Integration {
    integration: string;
    status: 'connected' | 'not_configured' | 'configured' | 'error';
    last_verified?: string;
    masked?: Record<string, string>;
    metadata?: Record<string, any>;
}

export const integrationsService = {
    getAll: async (): Promise<{ integrations: Integration[]; hubspot_last_sync?: any }> => {
        const { data } = await apiClient.get('/integrations/status');
        return data;
    },

    configure: async (body: { integration: string; payload: Record<string, any> }): Promise<Integration> => {
        const { data } = await apiClient.post('/integrations/configure', body);
        return data;
    },

    getOne: async (name: string): Promise<Integration> => {
        const { data } = await apiClient.get(`/integrations/${name}`);
        return data;
    },

    testSlack: async (): Promise<{ status: string; channel_id: string }> => {
        const { data } = await apiClient.post('/integrations/slack/test');
        return data;
    },

    refreshClarity: async (): Promise<any> => {
        const { data } = await apiClient.post('/refresh-clarity');
        return data;
    },

    refreshGA4: async (): Promise<any> => {
        const { data } = await apiClient.post('/refresh-ga4');
        return data;
    },
};
