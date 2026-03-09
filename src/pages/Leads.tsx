import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, X, ExternalLink, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { leadsService } from '../api/leads';
import type { Lead } from '../api/leads';

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-sky-100 text-sky-700',
    contacted: 'bg-violet-100 text-violet-700',
    qualified: 'bg-amber-100 text-amber-700',
    nurturing: 'bg-orange-100 text-orange-700',
    converted: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-slate-100 text-slate-500',
};

function ScorePill({ score }: { score: number }) {
    const color = score > 80 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-500' : 'bg-rose-400';
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 bg-slate-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, score)}%` }} />
            </div>
            <span className="text-xs font-mono text-slate-600">{score}</span>
        </div>
    );
}

function LeadDrawer({ lead, onClose, onNurture }: { lead: Lead; onClose: () => void; onNurture: (id: string) => void }) {
    return (
        <div className="fixed inset-0 z-40 flex">
            <div className="flex-1 bg-black/30" onClick={onClose} />
            <div className="w-96 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900">Lead Detail</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {/* Identity */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                            {(lead.first_name ?? lead.email)[0].toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{lead.first_name} {lead.last_name ?? ''}</div>
                            <div className="text-sm text-slate-500">{lead.email}</div>
                            {lead.company && <div className="text-xs text-slate-400">{lead.company}</div>}
                        </div>
                    </div>

                    {/* Status + Score */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="text-xs text-slate-400 font-medium mb-1">Status</div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status] ?? 'bg-slate-100 text-slate-600'}`}>{lead.status}</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="text-xs text-slate-400 font-medium mb-1">Lead Score</div>
                            <ScorePill score={lead.score} />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        {[
                            { label: 'Source', value: lead.source },
                            { label: 'Phone', value: lead.phone },
                            { label: 'UTM Source', value: lead.utm_source },
                            { label: 'UTM Campaign', value: lead.utm_campaign },
                            { label: 'CRM ID', value: lead.crm_contact_id },
                            { label: 'Last Activity', value: lead.last_activity_date ? new Date(lead.last_activity_date).toLocaleDateString() : undefined },
                        ].filter(f => f.value).map(({ label, value }) => (
                            <div key={label} className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">{label}</span>
                                <span className="text-slate-700 font-medium">{value}</span>
                            </div>
                        ))}
                        {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                                {lead.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{t}</span>)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t border-slate-100 space-y-2">
                    <button
                        onClick={() => { onNurture(lead.lead_id); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
                    >
                        <Heart className="w-4 h-4" /> Enroll in Nurture Sequence
                    </button>
                    {lead.crm_contact_id && (
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                            <ExternalLink className="w-4 h-4" /> View in HubSpot
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export function Leads() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: () => leadsService.getLeads(),
    });

    const { data: stats } = useQuery({
        queryKey: ['leadStats'],
        queryFn: leadsService.getLeadStats,
        staleTime: 60000,
    });

    const syncMutation = useMutation({
        mutationFn: leadsService.syncLeads,
        onSuccess: (res) => {
            toast.success(`Synced! ${res.new_leads_count} new leads from ${res.sources_polled.join(', ')}`);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['leadStats'] });
        },
        onError: () => toast.error('Sync failed'),
    });

    const nurtureMutation = useMutation({
        mutationFn: (leadId: string) => leadsService.nurtureLead(leadId),
        onSuccess: (res) => toast.success(`Enrolled in sequence: ${res.sequence_id}`),
        onError: () => toast.error('Failed to enroll lead'),
    });

    const filtered = leads.filter(l =>
        !search ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.company?.toLowerCase().includes(search.toLowerCase()) ||
        (l.first_name ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {selectedLead && (
                <LeadDrawer
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onNurture={(id) => nurtureMutation.mutate(id)}
                />
            )}

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
                    <p className="text-sm text-slate-500 mt-1">All ingested prospects from Meta, HubSpot, CSV, and website</p>
                </div>
                <button
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    className="clean-button btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    {syncMutation.isPending ? 'Syncing…' : 'Sync Now'}
                </button>
            </div>

            {/* Stat cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Leads', value: stats.total_leads, sub: null },
                        { label: 'New Today', value: stats.new_today, sub: null },
                        { label: 'This Week', value: stats.new_this_week, sub: null },
                        { label: 'Converted', value: stats.by_status?.converted ?? 0, sub: `of ${stats.total_leads}` },
                    ].map(({ label, value, sub }) => (
                        <div key={label} className="clean-panel p-4 bg-white">
                            <div className="text-xl font-bold text-slate-900">{value}<span className="text-sm text-slate-400 font-normal ml-1">{sub}</span></div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="clean-panel overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center bg-white rounded-md px-3 py-1.5 border border-slate-200 w-72 focus-within:ring-2 ring-slate-200">
                        <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email or company…"
                            className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 w-full"
                        />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{filtered.length} results</span>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="py-3 px-5">Lead</th>
                            <th className="py-3 px-5">Company</th>
                            <th className="py-3 px-5">Status</th>
                            <th className="py-3 px-5">Source</th>
                            <th className="py-3 px-5">Score</th>
                            <th className="py-3 px-5 text-right">Last Activity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {isLoading ? (
                            <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading leads…</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="py-10 text-center text-slate-400">
                                {search ? `No results for "${search}"` : 'No leads yet. Click Sync Now to import.'}
                            </td></tr>
                        ) : filtered.map(lead => (
                            <tr
                                key={lead.lead_id}
                                onClick={() => setSelectedLead(lead)}
                                className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                            >
                                <td className="py-3.5 px-5">
                                    <div className="font-semibold text-slate-900">{lead.first_name ?? ''} {lead.last_name ?? ''}</div>
                                    <div className="text-xs text-slate-400">{lead.email}</div>
                                </td>
                                <td className="py-3.5 px-5 text-slate-600">{lead.company ?? '—'}</td>
                                <td className="py-3.5 px-5">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-5 text-slate-500 capitalize">{lead.source}</td>
                                <td className="py-3.5 px-5"><ScorePill score={lead.score} /></td>
                                <td className="py-3.5 px-5 text-right text-slate-400 text-xs">
                                    {lead.last_activity_date ? new Date(lead.last_activity_date).toLocaleDateString() : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
