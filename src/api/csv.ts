import { apiClient } from './client';

export const csvService = {
    listFiles: async (): Promise<{ files: Array<{ file_name: string; row_count: number; headers: string[]; uploaded_at: string }> }> => {
        const { data } = await apiClient.get('/csv-files');
        return data;
    },

    uploadCsv: async (file: File): Promise<{ status: string; uploaded_file: string; row_count: number; headers: string[]; warnings?: any }> => {
        const form = new FormData();
        form.append('file', file);
        const { data } = await apiClient.post('/upload-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        return data;
    },

    previewCsv: async (fileName: string): Promise<{ file: string; headers: string[]; rows: any[]; row_count: number }> => {
        const { data } = await apiClient.get('/csv-preview', { params: { file: fileName } });
        return data;
    },

    syncToHubspot: async (fileName: string): Promise<{ status: string; created: number; updated: number; skipped: number; total: number }> => {
        const { data } = await apiClient.post('/sync-csv-to-hubspot', null, { params: { file_name: fileName } });
        return data;
    },
};
