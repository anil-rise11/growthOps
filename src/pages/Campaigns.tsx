import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Play, Pause, Trash2, Loader2, Search, Filter, Plus, BarChart2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { emailService } from '../api/email';
import type { HubspotLead, EmailTemplate } from '../api/email';

// ── Utility ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    running: 'bg-emerald-100 text-emerald-700',
    paused: 'bg-amber-100 text-amber-700',
    completed: 'bg-slate-100 text-slate-600',
    draft: 'bg-sky-100 text-sky-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

// ── New Campaign Modal ────────────────────────────────────────────────────────
type ModalStep = 'leads' | 'template' | 'confirm';

function NewCampaignModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<ModalStep>('leads');
    const [selectedLeads, setSelectedLeads] = useState<HubspotLead[]>([]);
    const [campaignName, setCampaignName] = useState('');
    const [tone, setTone] = useState('professional');
    const [goal, setGoal] = useState('demo_booking');
    const [template, setTemplate] = useState<EmailTemplate | null>(null);
    const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

    const { data: hubspotData, isLoading: leadsLoading } = useQuery({
        queryKey: ['hubspotLeads'],
        queryFn: () => emailService.getHubspotLeads(200),
    });

    const generateMutation = useMutation({
        mutationFn: () => emailService.generateTemplate({ tone, goal, campaign_name: campaignName }),
        onSuccess: (res) => { setTemplate(res.template); setStep('template'); },
        onError: () => toast.error('Failed to generate template'),
    });

    const createMutation = useMutation({
        mutationFn: () => emailService.createCampaign({
            name: campaignName,
            description: `Campaign for ${selectedLeads.length} leads`,
            target_leads: selectedLeads.map(l => ({
                lead_id: l.lead_id,
                email: l.email,
                first_name: l.first_name,
                last_name: l.last_name,
                company: l.company,
                source: 'hubspot',
                intent: l.intent ?? 'medium',
                reason: l.reason ?? `HubSpot: ${l.first_name ?? l.email}`,
            })),
            tone, goal, cta_style: 'soft',
        }),
        onSuccess: (res) => { setCreatedCampaignId(res.campaign_id); setStep('confirm'); },
        onError: () => toast.error('Failed to create campaign'),
    });

    const approveMutation = useMutation({
        mutationFn: () => emailService.approveCampaign(createdCampaignId!, { approved_by: 'Dashboard User' }),
        onSuccess: () => {
            toast.success('Campaign approved and emails scheduled!');
            queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
            onClose();
        },
        onError: () => toast.error('Failed to approve campaign'),
    });

    const toggleLead = (lead: HubspotLead) => {
        setSelectedLeads(prev =>
            prev.find(l => l.lead_id === lead.lead_id)
                ? prev.filter(l => l.lead_id !== lead.lead_id)
                : [...prev, lead]
        );
    };

    const leads = hubspotData?.leads ?? [];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">New Email Campaign</h2>
                        <div className="flex gap-2 mt-1">
                            {(['leads', 'template', 'confirm'] as ModalStep[]).map((s, i) => (
                                <span key={s} className={`text-xs font-semibold ${step === s ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
                                    {i < 2 && ' →'}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* Step 1: Select leads */}
                    {step === 'leads' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Campaign Name</label>
                                <input
                                    value={campaignName}
                                    onChange={e => setCampaignName(e.target.value)}
                                    placeholder="e.g. March HubSpot Outreach"
                                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tone</label>
                                    <select value={tone} onChange={e => setTone(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300">
                                        {['professional', 'friendly', 'persuasive', 'conversational'].map(t => (
                                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Goal</label>
                                    <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300">
                                        {['demo_booking', 'close_deal', 'nurture', 'followup'].map(g => (
                                            <option key={g} value={g}>{g.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-slate-700">Select Leads ({selectedLeads.length} selected)</label>
                                </div>
                                {leadsLoading ? (
                                    <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                                ) : (
                                    <div className="border border-slate-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-slate-100">
                                        {leads.map(lead => (
                                            <div
                                                key={lead.lead_id}
                                                onClick={() => toggleLead(lead)}
                                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${lead.has_conflict ? 'opacity-50' : ''}`}
                                            >
                                                <input type="checkbox" readOnly checked={!!selectedLeads.find(l => l.lead_id === lead.lead_id)} className="rounded accent-slate-700" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-800 truncate">{lead.first_name} {lead.last_name} <span className="text-slate-400 font-normal">– {lead.email}</span></div>
                                                    <div className="text-xs text-slate-400">{lead.company}{lead.has_conflict ? ' · ⚠️ Already in active campaign' : ''}</div>
                                                </div>
                                                {lead.intent && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${lead.intent === 'high' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{lead.intent}</span>}
                                            </div>
                                        ))}
                                        {leads.length === 0 && <div className="p-6 text-center text-sm text-slate-400">No HubSpot leads found</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Review template */}
                    {step === 'template' && template && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">AI-generated template. Review before submitting.</p>
                            {(['step_1', 'step_2', 'step_3'] as const).map((step, i) => (
                                <div key={step} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Step {i + 1} — {['Initial', 'Follow-up 1', 'Follow-up 2'][i]}</div>
                                    <div className="text-sm font-semibold text-slate-800 mb-1">{template[step].subject}</div>
                                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{template[step].body}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 'confirm' && (
                        <div className="text-center py-6">
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Campaign Draft Created</h3>
                            <p className="text-sm text-slate-500 mb-1">
                                <span className="font-semibold text-slate-700">{campaignName}</span> is ready for {selectedLeads.length} leads.
                            </p>
                            <p className="text-xs text-slate-400">Clicking "Approve & Schedule" will lock the template and send emails per the configured sending window.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                    <div className="flex gap-2">
                        {step === 'leads' && (
                            <button
                                disabled={!campaignName || selectedLeads.length === 0 || generateMutation.isPending}
                                onClick={() => generateMutation.mutate()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Generate Template →
                            </button>
                        )}
                        {step === 'template' && (
                            <button
                                disabled={createMutation.isPending}
                                onClick={() => createMutation.mutate()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Create Draft →
                            </button>
                        )}
                        {step === 'confirm' && (
                            <button
                                disabled={approveMutation.isPending}
                                onClick={() => approveMutation.mutate()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Approve & Schedule
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Open Rate cell (fetches per-campaign tracking) ───────────────────────────
function OpenRateCell({ campaignId }: { campaignId: string }) {
    const { data } = useQuery({
        queryKey: ['emailTracking', campaignId],
        queryFn: () => emailService.getTracking(campaignId),
        staleTime: 60000,
    });
    const rate = data?.metrics?.open_rate;
    return (
        <span className="text-slate-600 font-mono">
            {rate !== undefined ? `${(rate * 100).toFixed(1)}%` : '--'}
        </span>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function Campaigns() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    const { data = { campaigns: [], count: 0 }, isLoading } = useQuery({
        queryKey: ['emailCampaigns'],
        queryFn: emailService.getCampaigns,
        refetchInterval: 15000,
    });

    const campaigns = (data.campaigns ?? []).filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
    );

    const pauseMutation = useMutation({
        mutationFn: emailService.pauseCampaign,
        onSuccess: () => { toast.success('Campaign paused.'); queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] }); }
    });
    const resumeMutation = useMutation({
        mutationFn: emailService.resumeCampaign,
        onSuccess: () => { toast.success('Campaign resumed.'); queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] }); }
    });
    const cancelMutation = useMutation({
        mutationFn: emailService.cancelCampaign,
        onSuccess: () => { toast.info('Campaign cancelled.'); queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] }); }
    });

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {showModal && <NewCampaignModal onClose={() => setShowModal(false)} />}

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Campaigns</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage AI-generated outbound outreach and drip campaigns</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="clean-button btn-primary shadow-sm hover:shadow flex items-center gap-2"
                >
                    <Mail className="w-4 h-4" /> New Campaign
                </button>
            </div>

            <div className="clean-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center bg-white rounded-md px-3 py-1.5 focus-within:ring-2 ring-slate-200 border border-slate-200 w-80">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search campaigns…"
                            className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-500 w-full"
                        />
                    </div>
                    <div className="flex gap-3 items-center">
                        <span className="text-xs text-slate-500 font-medium">{data.count ?? 0} campaigns</span>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="py-3 px-6">Campaign Name</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6">Progress (Sent/Total)</th>
                            <th className="py-3 px-6">
                                <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Open Rate</span>
                            </th>
                            <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-12 text-center text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading campaigns…
                            </td></tr>
                        ) : campaigns.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-slate-500">
                                No campaigns found. Click "New Campaign" to create one.
                            </td></tr>
                        ) : campaigns.map((campaign) => {
                            const total = campaign.total_emails || 1;
                            const sent = campaign.metrics?.sent || 0;
                            const progress = Math.min(100, Math.round((sent / total) * 100));

                            return (
                                <tr key={campaign.campaign_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{campaign.name}</span>
                                            <span className="text-slate-500 text-xs mt-0.5">{campaign.description}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${STATUS_COLORS[campaign.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-xs text-slate-600 mb-0.5">
                                                <span>{sent} / {campaign.total_emails}</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[120px]">
                                                <div className="h-1.5 rounded-full bg-slate-700" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <OpenRateCell campaignId={campaign.campaign_id} />
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end gap-2">
                                            {campaign.status === 'running' && (
                                                <button onClick={() => pauseMutation.mutate(campaign.campaign_id)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Pause">
                                                    <Pause className="w-4 h-4 fill-current" />
                                                </button>
                                            )}
                                            {campaign.status === 'paused' && (
                                                <button onClick={() => resumeMutation.mutate(campaign.campaign_id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Resume">
                                                    <Play className="w-4 h-4 fill-current" />
                                                </button>
                                            )}
                                            {campaign.status !== 'completed' && campaign.status !== 'cancelled' && (
                                                <button onClick={() => cancelMutation.mutate(campaign.campaign_id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Cancel">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
