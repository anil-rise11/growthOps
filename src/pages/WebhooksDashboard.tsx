import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Webhook, Activity, Shield, AlertTriangle, RefreshCw, Loader2, CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { webhooksService, type WebhookEvent, type FailedEvent } from '../api/webhooks';

// ── Health Status Component ──────────────────────────────────────────────────
function HealthStatus() {
    const { data: health, isLoading } = useQuery({
        queryKey: ['webhookHealth'],
        queryFn: () => webhooksService.getHealth(),
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
        );
    }

    const isHealthy = health?.status === 'ok' || health?.status === 'healthy';

    return (
        <div className={`border rounded-xl p-6 ${isHealthy ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHealthy ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {isHealthy ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                </div>
                <div>
                    <h3 className={`font-semibold ${isHealthy ? 'text-emerald-900' : 'text-rose-900'}`}>
                        {isHealthy ? 'System Healthy' : 'System Issues'}
                    </h3>
                    <p className={`text-sm ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Status: {health?.status || 'unknown'}
                    </p>
                    {health?.timestamp && (
                        <p className="text-xs text-slate-400 mt-1">
                            Last checked: {new Date(health.timestamp).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Idempotency Stats Component ──────────────────────────────────────────────
function IdempotencyStatsCard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['idempotencyStats'],
        queryFn: () => webhooksService.getIdempotencyStats(),
        refetchInterval: 60000,
    });

    if (isLoading) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900">Idempotency Stats</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">{stats?.total_events?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-slate-500">Total Events</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">{stats?.unique_events?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-slate-500">Unique Events</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-700">{stats?.duplicates_detected?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-amber-600">Duplicates</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-700">{((stats?.dedup_rate || 0) * 100).toFixed(1)}%</div>
                    <div className="text-xs text-emerald-600">Deduplication Rate</div>
                </div>
            </div>
        </div>
    );
}

// ── Event Row Component ──────────────────────────────────────────────────────
function EventRow({ event }: { event: WebhookEvent }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                <td className="py-3 px-4">
                    <span className="font-mono text-xs text-slate-600">{event.event_id.slice(0, 16)}...</span>
                </td>
                <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {event.type}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-600 text-sm">{event.source}</span>
                </td>
                <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.processed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {event.processed ? 'Processed' : 'Pending'}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-500 text-sm">
                        {new Date(event.timestamp).toLocaleString()}
                    </span>
                </td>
                <td className="py-3 px-4">
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
                    <td colSpan={6} className="py-4 px-4">
                        <pre className="text-xs text-slate-600 overflow-auto max-h-48 bg-white p-3 rounded border border-slate-200">
                            {JSON.stringify(event.payload, null, 2)}
                        </pre>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Failed Event Row Component ───────────────────────────────────────────────
function FailedEventRow({ event }: { event: FailedEvent }) {
    const queryClient = useQueryClient();
    const [expanded, setExpanded] = useState(false);

    const retryMutation = useMutation({
        mutationFn: () => webhooksService.retryEvent(event.event_id),
        onSuccess: () => {
            toast.success('Event retry initiated');
            queryClient.invalidateQueries({ queryKey: ['failedEvents'] });
        },
        onError: () => toast.error('Failed to retry event'),
    });

    return (
        <>
            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                <td className="py-3 px-4">
                    <span className="font-mono text-xs text-slate-600">{event.event_id.slice(0, 16)}...</span>
                </td>
                <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        {event.type}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-rose-600 text-sm truncate max-w-[200px] block" title={event.error}>
                        {event.error}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-900 font-medium">{event.retry_count}</span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-500 text-sm">
                        {new Date(event.timestamp).toLocaleString()}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => retryMutation.mutate()}
                            disabled={retryMutation.isPending}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Retry"
                        >
                            {retryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50">
                    <td colSpan={6} className="py-4 px-4">
                        <div className="text-sm text-slate-600 space-y-1">
                            <p><span className="font-medium">Full Event ID:</span> <span className="font-mono text-xs">{event.event_id}</span></p>
                            <p><span className="font-medium">Error:</span> {event.error}</p>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function WebhooksDashboard() {
    const [activeTab, setActiveTab] = useState<'events' | 'failed'>('events');

    const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
        queryKey: ['webhookEvents'],
        queryFn: () => webhooksService.getDebugEvents(50),
        refetchInterval: 30000,
    });

    const { data: failedData, isLoading: failedLoading, refetch: refetchFailed } = useQuery({
        queryKey: ['failedEvents'],
        queryFn: () => webhooksService.getFailedEvents(50),
        refetchInterval: 30000,
    });

    const events = eventsData?.events ?? [];
    const failedEvents = failedData?.events ?? [];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Webhooks Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor webhook health, events, and idempotency</p>
                </div>
                <button
                    onClick={() => {
                        refetchEvents();
                        refetchFailed();
                    }}
                    className="clean-button btn-secondary flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh All
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <HealthStatus />
                <IdempotencyStatsCard />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'events'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Activity className="w-4 h-4" />
                    Event Log
                    <span className="ml-1 px-2 py-0.5 bg-slate-100 rounded-full text-xs">{events.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('failed')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'failed'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    Failed Events
                    {failedEvents.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs">{failedEvents.length}</span>
                    )}
                </button>
            </div>

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="clean-panel overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <Webhook className="w-4 h-4 text-slate-500" /> Recent Events
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="py-3 px-4">Event ID</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Source</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Timestamp</th>
                                    <th className="py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventsLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading events...
                                        </td>
                                    </tr>
                                ) : events.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500">
                                            <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            No events found
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
            )}

            {/* Failed Events Tab */}
            {activeTab === 'failed' && (
                <div className="clean-panel overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-500" /> Failed Events
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="py-3 px-4">Event ID</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Error</th>
                                    <th className="py-3 px-4">Retries</th>
                                    <th className="py-3 px-4">Timestamp</th>
                                    <th className="py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading failed events...
                                        </td>
                                    </tr>
                                ) : failedEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500">
                                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                                            No failed events! All systems operational.
                                        </td>
                                    </tr>
                                ) : (
                                    failedEvents.map((event) => (
                                        <FailedEventRow key={event.event_id} event={event} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
