import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Workflows } from './pages/Workflows';
import { Approvals } from './pages/Approvals';
import { Leads } from './pages/Leads';
import { Campaigns } from './pages/Campaigns';
import { SocialCampaigns } from './pages/SocialCampaigns';
import { Integrations } from './pages/Integrations';
import { CsvManager } from './pages/CsvManager';
// import { AdsDashboard } from './pages/AdsDashboard';
import { WhatsAppManager } from './pages/WhatsAppManager';
import { AuditLog } from './pages/AuditLog';
import { RevenueDashboard } from './pages/RevenueDashboard';
import { EmailSequences } from './pages/EmailSequences';
import { HubSpotManager } from './pages/HubSpotManager';
import { WebhooksDashboard } from './pages/WebhooksDashboard';
import { AutonomousConfig } from './pages/AutonomousConfig';
import { PerformanceMemory } from './pages/PerformanceMemory';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="leads" element={<Leads />} />
            <Route path="campaigns/email" element={<Campaigns />} />
            <Route path="campaigns/social" element={<SocialCampaigns />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="csv" element={<CsvManager />} />
            {/* <Route path="ads" element={<AdsDashboard />} /> */}
            <Route path="whatsapp" element={<WhatsAppManager />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="revenue" element={<RevenueDashboard />} />
            <Route path="sequences" element={<EmailSequences />} />
            <Route path="hubspot" element={<HubSpotManager />} />
            <Route path="webhooks" element={<WebhooksDashboard />} />
            <Route path="autonomous" element={<AutonomousConfig />} />
            <Route path="performance" element={<PerformanceMemory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-right" theme="light" />
    </QueryClientProvider>
  );
}

export default App;

