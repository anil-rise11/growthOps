import { apiClient } from './client';

export const csvService = {
    // GET /sales-marketing-ops/csv-files
    listFiles: async (): Promise<{ files: Array<{ file_name: string; row_count: number; headers: string[]; uploaded_at: string }> }> => {
        const { data } = await apiClient.get('/csv-files');
        return data;
    },

    // GET /sales-marketing-ops/csv-preview?file={fileName}
    previewCsv: async (fileName: string): Promise<{ file: string; headers: string[]; rows: any[]; row_count: number }> => {
        const { data } = await apiClient.get('/csv-preview', { params: { file: fileName } });
        return data;
    },

    // POST /sales-marketing-ops/upload-csv  (multipart/form-data)
    uploadCsv: async (file: File): Promise<{ status: string; uploaded_file: string; row_count: number; headers: string[]; rows?: any[][]; warnings?: any }> => {
        const form = new FormData();
        form.append('file', file);
        const { data } = await apiClient.post('/upload-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        return data;
    },

    // DELETE /sales-marketing-ops/csv-files/{file_name}
    deleteCsv: async (fileName: string): Promise<{ success: boolean; file_name: string }> => {
        const { data } = await apiClient.delete(`/csv-files/${encodeURIComponent(fileName)}`);
        return data;
    },

    // POST /sales-marketing-ops/sync-csv-to-hubspot?file_name={fileName}
    syncToHubspot: async (fileName: string): Promise<{ status: string; created: number; updated: number; skipped: number; total: number }> => {
        const { data } = await apiClient.post('/sync-csv-to-hubspot', null, { params: { file_name: fileName } });
        return data;
    },

    // POST /sales-marketing-ops/refresh-clarity
    refreshClarity: async (): Promise<any> => {
        const { data } = await apiClient.post('/refresh-clarity');
        return data;
    },

    // POST /sales-marketing-ops/refresh-ga4
    refreshGA4: async (): Promise<any> => {
        const { data } = await apiClient.post('/refresh-ga4');
        return data;
    },
};
