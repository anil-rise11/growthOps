import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Loader2, Phone, User, CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { whatsappService, type WhatsAppCampaign, type WhatsAppTestRequest, type WhatsAppSendRequest } from '../api/whatsapp';

// ── Status Colors ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    sent: 'bg-sky-100 text-sky-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    scheduled: <Clock className="w-4 h-4" />,
    sent: <Send className="w-4 h-4" />,
    delivered: <CheckCircle className="w-4 h-4" />,
    failed: <AlertCircle className="w-4 h-4" />,
};

// ── Test Message Modal ───────────────────────────────────────────────────────
function TestMessageModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<WhatsAppTestRequest>({
        phone: '',
        lead_name: '',
        campaign_name: 'Test Campaign',
        source: 'dashboard',
    });

    const testMutation = useMutation({
        mutationFn: () => whatsappService.test(formData),
        onSuccess: (res) => {
            toast.success(`Test message sent! Message ID: ${res.message_id}`);
            queryClient.invalidateQueries({ queryKey: ['whatsappCampaigns'] });
            onClose();
        },
        onError: () => toast.error('Failed to send test message'),
    });

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Send Test WhatsApp</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <span className="text-slate-500 text-xl">×</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1234567890"
                                className="flex-1 px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Lead Name</label>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <input
                                value={formData.lead_name}
                                onChange={e => setFormData({ ...formData, lead_name: e.target.value })}
                                placeholder="John Doe"
                                className="flex-1 px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Campaign Name</label>
                        <input
                            value={formData.campaign_name}
                            onChange={e => setFormData({ ...formData, campaign_name: e.target.value })}
                            placeholder="Test Campaign"
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => testMutation.mutate()}
                        disabled={testMutation.isPending || !formData.phone}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {testMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Send className="w-4 h-4" /> Send Test
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Send to Leads Modal ──────────────────────────────────────────────────────
function SendToLeadsModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<WhatsAppSendRequest>({
        phone: '',
        lead_name: '',
        message: '',
        campaign_name: 'Manual Send',
    });

    const sendMutation = useMutation({
        mutationFn: () => whatsappService.send(formData),
        onSuccess: (res) => {
            toast.success(`Message sent! Status: ${res.status}`);
            queryClient.invalidateQueries({ queryKey: ['whatsappCampaigns'] });
            onClose();
        },
        onError: () => toast.error('Failed to send message'),
    });

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Send WhatsApp to Lead</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <span className="text-slate-500 text-xl">×</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1234567890"
                                className="flex-1 px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Lead Name</label>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <input
                                value={formData.lead_name}
                                onChange={e => setFormData({ ...formData, lead_name: e.target.value })}
                                placeholder="John Doe"
                                className="flex-1 px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Campaign Name</label>
                        <input
                            value={formData.campaign_name}
                            onChange={e => setFormData({ ...formData, campaign_name: e.target.value })}
                            placeholder="Manual Send"
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
                        <textarea
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Enter your message..."
                            rows={4}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => sendMutation.mutate()}
                        disabled={sendMutation.isPending || !formData.phone || !formData.message}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {sendMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Send className="w-4 h-4" /> Send Message
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Campaign Row ─────────────────────────────────────────────────────────────
function CampaignRow({ campaign }: { campaign: WhatsAppCampaign }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{campaign.name}</span>
                        <span className="text-slate-500 text-xs font-mono">{campaign.campaign_id}</span>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        {campaign.recipient}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <span className="text-slate-900 font-medium">{campaign.template}</span>
                </td>
                <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${STATUS_COLORS[campaign.status] || 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_ICONS[campaign.status]}
                        {campaign.status}
                    </span>
                </td>
                <td className="py-4 px-6">
                    <span className="text-slate-500 text-sm">
                        {new Date(campaign.scheduled_at).toLocaleString()}
                    </span>
                </td>
                <td className="py-4 px-6">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50">
                    <td colSpan={6} className="py-4 px-6">
                        <div className="text-sm text-slate-600 space-y-1">
                            <p><span className="font-semibold">Created:</span> {new Date(campaign.created_at).toLocaleString()}</p>
                            <p><span className="font-semibold">Campaign ID:</span> <span className="font-mono text-xs">{campaign.campaign_id}</span></p>
                            <p><span className="font-semibold">Template:</span> {campaign.template}</p>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function WhatsAppManager() {
    const queryClient = useQueryClient();
    const [showTestModal, setShowTestModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['whatsappCampaigns'],
        queryFn: () => whatsappService.getCampaigns(),
        refetchInterval: 30000,
    });

    const campaigns = data?.campaigns || [];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">WhatsApp Campaign Manager</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage WhatsApp campaigns and send messages to leads</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowTestModal(true)}
                        className="clean-button btn-secondary flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" /> Send Test
                    </button>
                    <button
                        onClick={() => setShowSendModal(true)}
                        className="clean-button btn-primary shadow-sm hover:shadow flex items-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" /> Send to Lead
                    </button>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="clean-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp Campaigns
                    </h2>
                    <button
                        onClick={() => refetch()}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="py-3 px-6">Campaign</th>
                            <th className="py-3 px-6">Recipient</th>
                            <th className="py-3 px-6">Template</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6">Scheduled</th>
                            <th className="py-3 px-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading campaigns...
                                </td>
                            </tr>
                        ) : campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-500">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    No WhatsApp campaigns found.
                                </td>
                            </tr>
                        ) : (
                            campaigns.map((campaign) => (
                                <CampaignRow key={campaign.campaign_id} campaign={campaign} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showTestModal && <TestMessageModal onClose={() => setShowTestModal(false)} />}
            {showSendModal && <SendToLeadsModal onClose={() => setShowSendModal(false)} />}
        </div>
    );
}
