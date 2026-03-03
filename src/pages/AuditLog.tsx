import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, Filter, Loader2, RefreshCw, User, Bot, Settings, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react';
import { auditService, type AuditLogEvent, type AuditLogParams } from '../api/audit';

// ── Actor Type Icons ─────────────────────────────────────────────────────────
const ACTOR_ICONS: Record<string, React.ReactNode> = {
    agent: <Bot className="w-4 h-4 text-indigo-500" />,
    human: <User className="w-4 h-4 text-emerald-500" />,
    system: <Settings className="w-4 h-4 text-slate-500" />,
};

const ACTOR_COLORS: Record<string, string> = {
    agent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    human: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    system: 'bg-slate-50 text-slate-700 border-slate-200',
};

// ── Status Icons ─────────────────────────────────────────────────────────────
const STATUS_ICONS: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    failure: <XCircle className="w-4 h-4 text-rose-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
};

const STATUS_COLORS: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failure: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
};

// ── Filter Select Component ──────────────────────────────────────────────────
function FilterSelect({
    label,
    value,
    options,
    onChange,
    icon: Icon,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    icon: React.ElementType;
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-400" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300 bg-white"
            >
                <option value="">{label}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ── Event Row Component ──────────────────────────────────────────────────────
function EventRow({ event }: { event: AuditLogEvent }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                        {STATUS_ICONS[event.status]}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[event.status]}`}>
                            {event.status}
                        </span>
                    </div>
                </td>
                <td className="py-3 px-6">
                    <span className="text-slate-900 font-medium">{event.channel}</span>
                </td>
                <td className="py-3 px-6">
                    <span className="text-slate-900">{event.action}</span>
                </td>
                <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                        {ACTOR_ICONS[event.actor_type]}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ACTOR_COLORS[event.actor_type]}`}>
                            {event.actor_type}
                        </span>
                    </div>
                </td>
                <td className="py-3 px-6">
                    <span className="text-slate-600 font-mono text-xs">{event.actor}</span>
                </td>
                <td className="py-3 px-6">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.timestamp).toLocaleString()}
                    </div>
                </td>
                <td className="py-3 px-6">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                    >
                        {expanded ? 'Hide' : 'Details'}
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50">
                    <td colSpan={7} className="py-4 px-6">
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">Event ID</span>
                                <p className="text-sm font-mono text-slate-700">{event.event_id}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">Details</span>
                                <p className="text-sm text-slate-700">{event.details}</p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AuditLog() {
    const [filters, setFilters] = useState<AuditLogParams>({
        limit: 50,
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['auditLog', filters],
        queryFn: () => auditService.getAuditLog(filters),
        refetchInterval: 30000,
    });

    const events = data?.events ?? [];
    const total = data?.total ?? 0;

    const updateFilter = (key: keyof AuditLogParams, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
        }));
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Log</h1>
                    <p className="text-sm text-slate-500 mt-1">Track all system actions and events</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="px-3 py-1 bg-slate-100 rounded-full">
                        {total.toLocaleString()} events
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                <FilterSelect
                    label="All Channels"
                    value={filters.channel || ''}
                    options={[
                        { value: 'email', label: 'Email' },
                        { value: 'whatsapp', label: 'WhatsApp' },
                        { value: 'meta_ads', label: 'Meta Ads' },
                        { value: 'google_ads', label: 'Google Ads' },
                        { value: 'social', label: 'Social' },
                        { value: 'hubspot', label: 'HubSpot' },
                        { value: 'webhook', label: 'Webhook' },
                    ]}
                    onChange={(value) => updateFilter('channel', value)}
                    icon={ScrollText}
                />

                <FilterSelect
                    label="All Actors"
                    value={filters.actor_type || ''}
                    options={[
                        { value: 'agent', label: 'Agent' },
                        { value: 'human', label: 'Human' },
                        { value: 'system', label: 'System' },
                    ]}
                    onChange={(value) => updateFilter('actor_type', value)}
                    icon={User}
                />

                <FilterSelect
                    label="All Statuses"
                    value={filters.status || ''}
                    options={[
                        { value: 'success', label: 'Success' },
                        { value: 'failure', label: 'Failure' },
                        { value: 'warning', label: 'Warning' },
                    ]}
                    onChange={(value) => updateFilter('status', value)}
                    icon={CheckCircle}
                />

                <div className="flex-1"></div>

                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Events Table */}
            <div className="clean-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <ScrollText className="w-4 h-4 text-slate-500" /> Event Log
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6">Channel</th>
                                <th className="py-3 px-6">Action</th>
                                <th className="py-3 px-6">Actor Type</th>
                                <th className="py-3 px-6">Actor</th>
                                <th className="py-3 px-6">Timestamp</th>
                                <th className="py-3 px-6"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading audit log...
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-500">
                                        <ScrollText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        No audit events found.
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => (
                                    <EventRow key={event.event_id} event={event} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
