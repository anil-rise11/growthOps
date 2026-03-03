import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Loader2, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { integrationsService } from '../api/integrations';
import type { Integration } from '../api/integrations';

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    connected: { color: 'text-emerald-600', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'Connected' },
    configured: { color: 'text-sky-600', icon: <CheckCircle2 className="w-4 h-4 text-sky-500" />, label: 'Configured' },
    not_configured: { color: 'text-slate-400', icon: <XCircle className="w-4 h-4 text-slate-300" />, label: 'Not configured' },
    error: { color: 'text-rose-600', icon: <AlertCircle className="w-4 h-4 text-rose-500" />, label: 'Error' },
};

const INTEGRATION_LABELS: Record<string, { name: string; description: string; fields: Array<{ key: string; label: string; type?: string }> }> = {
    hubspot: { name: 'HubSpot CRM', description: 'Sync contacts, deals, and notes', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }] },
    meta: { name: 'Meta Ads', description: 'Facebook & Instagram ad campaigns', fields: [{ key: 'access_token', label: 'Access Token', type: 'password' }, { key: 'ad_account_id', label: 'Ad Account ID' }, { key: 'page_id', label: 'Page ID' }, { key: 'ig_user_id', label: 'Instagram User ID' }] },
    ga4: { name: 'Google Analytics 4', description: 'Website traffic and conversion data', fields: [{ key: 'property_id', label: 'Property ID' }, { key: 'credentials_json', label: 'Service Account JSON', type: 'password' }] },
    clarity: { name: 'Microsoft Clarity', description: 'Heatmaps and friction analysis', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }, { key: 'project_id', label: 'Project ID' }] },
    slack: { name: 'Slack', description: 'Team notifications and alerts', fields: [{ key: 'bot_token', label: 'Bot Token', type: 'password' }, { key: 'channel_id', label: 'Channel ID' }] },
    email: { name: 'Email (Resend)', description: 'Outbound email delivery', fields: [{ key: 'resend_api_key', label: 'Resend API Key', type: 'password' }, { key: 'from_email', label: 'From Email' }] },
    linkedin: { name: 'LinkedIn Ads', description: 'LinkedIn ad campaign management', fields: [{ key: 'access_token', label: 'Access Token', type: 'password' }, { key: 'account_id', label: 'Account ID' }] },
    google: { name: 'Google Ads', description: 'Google ad campaign management', fields: [{ key: 'developer_token', label: 'Developer Token', type: 'password' }, { key: 'customer_id', label: 'Customer ID' }] },
};

function IntegrationCard({ integration }: { integration: Integration }) {
    const queryClient = useQueryClient();
    const [expanded, setExpanded] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    const meta = INTEGRATION_LABELS[integration.integration] ?? { name: integration.integration, description: '', fields: [] };
    const statusCfg = STATUS_CONFIG[integration.status] ?? STATUS_CONFIG.not_configured;

    const saveMutation = useMutation({
        mutationFn: () => integrationsService.configure({ integration: integration.integration, payload: formValues }),
        onSuccess: () => {
            toast.success(`${meta.name} connected!`);
            setExpanded(false);
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
        },
        onError: () => toast.error('Connection failed — check credentials'),
    });

    const testSlackMutation = useMutation({
        mutationFn: integrationsService.testSlack,
        onSuccess: () => toast.success('Slack test message sent!'),
        onError: () => toast.error('Slack test failed'),
    });

    const refreshMutation = useMutation({
        mutationFn: () => integration.integration === 'ga4' ? integrationsService.refreshGA4() : integrationsService.refreshClarity(),
        onSuccess: () => toast.success(`${meta.name} data refreshed`),
        onError: () => toast.error(`Refresh failed`),
    });

    return (
        <div className="clean-panel bg-white overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {statusCfg.icon}
                    <div>
                        <div className="font-semibold text-slate-900 text-sm">{meta.name}</div>
                        <div className="text-xs text-slate-400">{meta.description}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
                    {/* Quick actions */}
                    {integration.status === 'connected' && integration.integration === 'slack' && (
                        <button onClick={() => testSlackMutation.mutate()} disabled={testSlackMutation.isPending} className="px-2 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">
                            {testSlackMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        </button>
                    )}
                    {integration.status === 'connected' && ['ga4', 'clarity'].includes(integration.integration) && (
                        <button onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending} className="px-2 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">
                            <RefreshCw className={`w-3 h-3 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    <button onClick={() => setExpanded(!expanded)} className="px-3 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 flex items-center gap-1">
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {integration.status === 'connected' ? 'Edit' : 'Connect'}
                    </button>
                </div>
            </div>

            {/* Masked credentials summary */}
            {integration.status === 'connected' && !expanded && integration.masked && Object.keys(integration.masked).length > 0 && (
                <div className="px-5 pb-3 flex gap-4">
                    {Object.entries(integration.masked).map(([k, v]) => (
                        <div key={k} className="text-xs">
                            <span className="text-slate-400">{k}: </span>
                            <span className="font-mono text-slate-600">{v}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Configure form */}
            {expanded && meta.fields.length > 0 && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60 space-y-3">
                    {meta.fields.map(field => (
                        <div key={field.key}>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
                            <input
                                type={field.type ?? 'text'}
                                placeholder={field.type === 'password' ? '••••••••' : ''}
                                value={formValues[field.key] ?? ''}
                                onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300 bg-white"
                            />
                        </div>
                    ))}
                    <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setExpanded(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                        <button
                            disabled={saveMutation.isPending || Object.keys(formValues).length === 0}
                            onClick={() => saveMutation.mutate()}
                            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                        >
                            {saveMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                            Save & Connect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function Integrations() {
    const { data, isLoading } = useQuery({
        queryKey: ['integrations'],
        queryFn: integrationsService.getAll,
        staleTime: 60000,
    });

    const integrations = data?.integrations ?? [];
    const connected = integrations.filter(i => i.status === 'connected' || i.status === 'configured').length;

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integrations</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Connect your data sources and marketing tools.
                    {!isLoading && <span className="ml-1 font-semibold text-slate-700">{connected}/{integrations.length} connected.</span>}
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading integrations…
                </div>
            ) : integrations.length === 0 ? (
                <div className="clean-panel p-10 text-center text-slate-400">No integrations found.</div>
            ) : (
                <div className="space-y-3">
                    {integrations.map(integration => (
                        <IntegrationCard key={integration.integration} integration={integration} />
                    ))}
                </div>
            )}
        </div>
    );
}
