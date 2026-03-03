import axios from 'axios';

// When in development mode (browser), use the Vite proxy to avoid CORS.
const isDev = import.meta.env.DEV;
const remoteBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://api-test.zetaleap.ai';

// Core Client goes through /proxy-core -> https://api-test.zetaleap.ai/
const coreBase = isDev ? '/proxy-core' : remoteBaseURL;

export const apiClient = axios.create({
    baseURL: `${coreBase}/sales-marketing-ops`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// v1 Client goes through /api/v1 -> https://api-test.zetaleap.ai/api/v1/
// Vite intercepts /api/v1 natively so we just use empty string in dev to make it relative.
const v1Base = isDev ? '' : remoteBaseURL;

export const v1ApiClient = axios.create({
    baseURL: `${v1Base}/api/v1/sales-marketing-ops`,
    headers: {
        'Content-Type': 'application/json',
    },
});

const interceptRequest = (config: any) => config;
const interceptResponseError = (error: any) => {
    console.error('API Error:', error.response?.data?.detail || error.response?.data?.message || error.message);
    return Promise.reject(error);
};

apiClient.interceptors.request.use(interceptRequest, (err) => Promise.reject(err));
apiClient.interceptors.response.use((r) => r, interceptResponseError);

v1ApiClient.interceptors.request.use(interceptRequest, (err) => Promise.reject(err));
v1ApiClient.interceptors.response.use((r) => r, interceptResponseError);
