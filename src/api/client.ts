import axios from 'axios';

// When in development mode (browser), use the Vite proxy to avoid CORS.
const isDev = import.meta.env.DEV;
const remoteBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://growthops.rise11.com';

// ── Core Client → /sales-marketing-ops ───────────────────────────────────────
// In dev: proxied via /proxy-core → https://growthops.rise11.com/
const coreBase = isDev ? '/proxy-core' : remoteBaseURL;

export const apiClient = axios.create({
    baseURL: `${coreBase}/sales-marketing-ops`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── v1 Client → /api/v1/sales-marketing-ops ──────────────────────────────────
// In dev: Vite intercepts /api/v1 natively so we just use empty string.
const v1Base = isDev ? '' : remoteBaseURL;

export const v1ApiClient = axios.create({
    baseURL: `${v1Base}/api/v1/sales-marketing-ops`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── v2 Client → /v2/sales-marketing-ops ─────────────────────────────────────
// Used by: Performance Memory (21), Revenue Attribution (22), Autonomous (23)
const v2Base = isDev ? '' : remoteBaseURL;

export const v2ApiClient = axios.create({
    baseURL: `${v2Base}/v2/sales-marketing-ops`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Shared interceptors ───────────────────────────────────────────────────────
const interceptRequest = (config: any) => config;
const interceptResponseError = (error: any) => {
    console.error('API Error:', error.response?.data?.detail || error.response?.data?.message || error.message);
    return Promise.reject(error);
};

for (const client of [apiClient, v1ApiClient, v2ApiClient]) {
    client.interceptors.request.use(interceptRequest, (err) => Promise.reject(err));
    client.interceptors.response.use((r) => r, interceptResponseError);
}
