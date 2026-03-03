import { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, RotateCcw, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { actionsService, governanceService } from '../api/governance';
import type { Action } from '../api/types';

// ── Agent mode toggle ─────────────────────────────────────────────────────────
function ModeToggle() {
    const queryClient = useQueryClient();
    const { data } = useQuery({ queryKey: ['agentMode'], queryFn: governanceService.getMode });
    const mutation = useMutation({
        mutationFn: (mode: string) => governanceService.setMode(mode),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agentMode'] }),
    });
    const modes = data?.modes_available ?? ['observe', 'suggest', 'execute'];
    const current = data?.mode;

    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {modes.map(m => (
                <button
                    key={m}
                    onClick={() => mutation.mutate(m)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${m === current
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {m}
                </button>
            ))}
        </div>
    );
}

// ── Risk dot ──────────────────────────────────────────────────────────────────
const riskDot = (level: string) => {
    const c = level === 'high' ? 'bg-rose-500' : level === 'medium' ? 'bg-amber-400' : 'bg-emerald-400';
    return <span title={`${level} risk`} className={`inline-block w-2 h-2 rounded-full ${c} flex-shrink-0`} />;
};

// ── Single action row ─────────────────────────────────────────────────────────
function ActionRow({ action, selected, onSelect, onApprove, onReject, onRetry, busy }: {
    action: Action;
    selected: boolean;
    onSelect: () => void;
    onApprove: () => void;
    onReject: () => void;
    onRetry?: () => void;
    busy: boolean;
}) {
    const [open, setOpen] = useState(false);
    const isPending = action.status === 'pending_approval';
    const isFailed = action.status === 'failed';

    // Strip leading emoji that come from the API payload
    const stripEmoji = (s: string) => s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '').trim();

    // Build a human-readable summary from the payload
    const raw = action.preview_payload?.summary
        ?? action.preview_payload?.reason
        ?? action.action_type.replace(/_/g, ' ');
    const summary = stripEmoji(raw);


    const sub = [
        action.preview_payload?.lead_email,
        action.preview_payload?.lead_company,
    ].filter(Boolean).join(' · ');

    return (
        <>
            <tr className={`border-b border-slate-100 text-sm transition-colors ${selected ? 'bg-sky-50' : 'hover:bg-slate-50/60'}`}>
                {/* Checkbox */}
                <td className="pl-5 pr-2 py-3.5 w-8">
                    {isPending && (
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={onSelect}
                            className="rounded border-slate-300 accent-slate-800 cursor-pointer"
                        />
                    )}
                </td>

                {/* Risk dot */}
                <td className="pr-3 py-3.5 w-4">{riskDot(action.risk_level)}</td>

                {/* Main content */}
                <td className="py-3.5 pr-4">
                    <div className="font-medium text-slate-800 leading-snug line-clamp-2">{summary}</div>
                    {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
                </td>

                {/* Type */}
                <td className="py-3.5 pr-6 hidden md:table-cell">
                    <span className="text-xs text-slate-500 font-mono">{action.action_type}</span>
                </td>

                {/* Confidence */}
                <td className="py-3.5 pr-6 hidden lg:table-cell text-right">
                    <span className="text-xs tabular-nums text-slate-500">{Math.round(action.ai_confidence_score * 100)}%</span>
                </td>

                {/* Time */}
                <td className="py-3.5 pr-4 hidden lg:table-cell text-right">
                    <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
                        {new Date(action.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                        {isPending && (
                            <>
                                <button
                                    disabled={busy}
                                    onClick={onApprove}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                                >
                                    <Check className="w-3 h-3" /> Approve
                                </button>
                                <button
                                    disabled={busy}
                                    onClick={onReject}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 border border-slate-200 text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                >
                                    <X className="w-3 h-3" /> Reject
                                </button>
                            </>
                        )}
                        {isFailed && onRetry && (
                            <button
                                disabled={busy}
                                onClick={onRetry}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-50 disabled:opacity-40 transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" /> Retry
                            </button>
                        )}
                        {!isPending && !isFailed && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${action.status === 'executed' ? 'text-emerald-700 bg-emerald-50' :
                                action.status === 'rejected' ? 'text-slate-500 bg-slate-100' :
                                    'text-slate-500 bg-slate-100'
                                }`}>{action.status}</span>
                        )}
                        {action.configuration_payload && (
                            <button onClick={() => setOpen(o => !o)} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {open && action.configuration_payload && (
                <tr className="bg-slate-50 border-b border-slate-100">
                    <td colSpan={7} className="px-5 py-3">
                        <pre className="text-xs font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap break-words max-h-40">
                            {JSON.stringify(action.configuration_payload, null, 2)}
                        </pre>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
type Tab = 'queue' | 'history';

export function Approvals() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState<Tab>('queue');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [latestRunOnly, setLatestRunOnly] = useState(false);
    // run_id pinned from Workflows navigation
    const [pinRunId, setPinRunId] = useState<string>(() => searchParams.get('run_id') ?? '');
    const [approveAllLoading, setApproveAllLoading] = useState(false);

    const { data: pending = [], isLoading } = useQuery({
        queryKey: ['pendingActions', typeFilter],
        queryFn: () => actionsService.getPendingActions({ limit: 200, ...(typeFilter ? { action_type: typeFilter } : {}) }),
        refetchInterval: 15000,
    });

    const { data: stats } = useQuery({
        queryKey: ['actionStats'],
        queryFn: actionsService.getActionStats,
        refetchInterval: 30000,
    });

    const { data: history = [], isLoading: histLoading } = useQuery({
        queryKey: ['actionHistory'],
        queryFn: () => actionsService.getActionHistory({ limit: 100 }),
        enabled: tab === 'history',
    });

    const inv = () => {
        queryClient.invalidateQueries({ queryKey: ['pendingActions'] });
        queryClient.invalidateQueries({ queryKey: ['actionStats'] });
    };

    const approveMutation = useMutation({
        mutationFn: (id: string) => actionsService.approveAction(id, { approved_by: 'Dashboard User' }),
        onSuccess: () => { toast.success('Approved'); inv(); },
        onError: () => toast.error('Approval failed'),
    });
    const rejectMutation = useMutation({
        mutationFn: (id: string) => actionsService.rejectAction(id, { rejected_by: 'Dashboard User', reason: 'Rejected via UI' }),
        onSuccess: () => { toast.info('Rejected'); inv(); },
        onError: () => toast.error('Rejection failed'),
    });
    const retryMutation = useMutation({
        mutationFn: (id: string) => actionsService.retryAction(id, 'Dashboard User'),
        onSuccess: () => { toast.success('Re-queued'); inv(); },
    });
    const bulkApproveMutation = useMutation({
        mutationFn: () => actionsService.bulkApprove({ action_ids: [...selected], approved_by: 'Dashboard User' }),
        onSuccess: () => { toast.success(`Approved ${selected.size}`); setSelected(new Set()); inv(); },
        onError: () => toast.error('Bulk approval failed'),
    });
    const bulkRejectMutation = useMutation({
        mutationFn: () => actionsService.bulkReject({ action_ids: [...selected], rejected_by: 'Dashboard User' }),
        onSuccess: () => { toast.info(`Rejected ${selected.size}`); setSelected(new Set()); inv(); },
        onError: () => toast.error('Bulk rejection failed'),
    });

    const busy = approveMutation.isPending || rejectMutation.isPending || bulkApproveMutation.isPending || bulkRejectMutation.isPending || retryMutation.isPending;

    // ── Filtering ──────────────────────────────────────────────────────────────
    const latestRunId = (pending as Action[]).reduce<string>((acc, a) => {
        const rid = (a as any).source_workflow_run_id ?? '';
        if (!acc) return rid;
        if (!rid) return acc;
        return rid > acc ? rid : acc;
    }, '');

    const filteredPending = (() => {
        let list = pending as Action[];
        // Pin to a specific run from URL param
        if (pinRunId) return list.filter(a => (a as any).source_workflow_run_id === pinRunId);
        // Latest run toggle
        if (latestRunOnly && latestRunId) return list.filter(a => (a as any).source_workflow_run_id === latestRunId);
        return list;
    })();

    const toggleOne = (id: string) => setSelected(prev => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
    });
    const toggleAll = () => setSelected(
        selected.size === filteredPending.length ? new Set() : new Set(filteredPending.map((a: Action) => a.action_id))
    );

    const rows = tab === 'queue' ? filteredPending : history;
    const loading = tab === 'queue' ? isLoading : histLoading;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Approvals</h1>
                    {stats && (
                        <p className="text-sm text-slate-500 mt-0.5">
                            <span className="font-semibold text-amber-600">{stats.pending_approval.toLocaleString()}</span> pending
                            {' · '}
                            <span className="font-semibold text-emerald-600">{stats.executed}</span> executed
                            {' · '}
                            <span className="font-semibold text-slate-500">{stats.rejected}</span> rejected
                            {stats.failed > 0 && <> · <span className="font-semibold text-rose-600">{stats.failed}</span> failed</>}
                        </p>
                    )}
                </div>
                <ModeToggle />
            </div>

            {/* Filter bar — only for pending queue */}
            {tab === 'queue' && (
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {/* pinned run chip + one-click approve */}
                    {pinRunId && (
                        <>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
                                {filteredPending.length} actions · run {pinRunId.slice(0, 8)}…
                                <button
                                    onClick={() => { setPinRunId(''); setSearchParams({}); setSelected(new Set()); }}
                                    className="hover:text-amber-900 leading-none ml-0.5"
                                    title="Clear run filter"
                                >×</button>
                            </span>
                            {filteredPending.length > 0 && (
                                <button
                                    onClick={async () => {
                                        setApproveAllLoading(true);
                                        try {
                                            await actionsService.bulkApprove({
                                                action_ids: filteredPending.map((a: Action) => a.action_id),
                                                approved_by: 'Dashboard User',
                                            });
                                            toast.success(`Approved all ${filteredPending.length} actions`);
                                            inv();
                                        } catch {
                                            toast.error('Bulk approval failed');
                                        } finally {
                                            setApproveAllLoading(false);
                                        }
                                    }}
                                    disabled={approveAllLoading || busy}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                                >
                                    {approveAllLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {approveAllLoading ? 'Approving…' : `Approve all (${filteredPending.length})`}
                                </button>
                            )}
                        </>
                    )}



                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setSelected(new Set()); }}
                        className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-slate-400"
                    >
                        <option value="">All types</option>
                        <option value="email_campaign">Email campaign</option>
                        <option value="social_post">Social post</option>
                        <option value="meta_ad">Meta ad</option>
                        <option value="meta_ad_campaign">Meta ad campaign</option>
                        <option value="budget_adjustment">Budget adjustment</option>
                        <option value="reassign_lead">Reassign lead</option>
                    </select>

                    {!pinRunId && (
                        <button
                            onClick={() => { setLatestRunOnly(v => !v); setSelected(new Set()); }}
                            className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors ${latestRunOnly
                                ? 'bg-sky-50 border-sky-300 text-sky-700'
                                : 'border-slate-200 text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {latestRunOnly ? '✓ Latest run only' : 'Latest run only'}
                        </button>
                    )}

                    {(typeFilter || latestRunOnly || pinRunId) && (
                        <span className="text-xs text-slate-400">
                            {filteredPending.length} shown
                        </span>
                    )}
                </div>
            )}

            {/* Tabs + bulk bar */}
            <div className="flex items-center justify-between border-b border-slate-200 mb-0">
                <div className="flex gap-0">
                    {(['queue', 'history'] as Tab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t === 'queue' ? 'Pending' : 'History'}
                        </button>
                    ))}
                </div>

                {/* Bulk actions — only show when items are checked */}
                {selected.size > 0 && (
                    <div className="flex items-center gap-2 pb-1">
                        <span className="text-xs text-slate-500">{selected.size} selected</span>
                        <button
                            disabled={busy}
                            onClick={() => bulkApproveMutation.mutate()}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                        >
                            {bulkApproveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Approve all
                        </button>
                        <button
                            disabled={busy}
                            onClick={() => bulkRejectMutation.mutate()}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-slate-600 border border-slate-200 text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 transition-colors"
                        >
                            {bulkRejectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                            Reject all
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 border-t-0 rounded-b-xl overflow-hidden">
                <table className="w-full">
                    <thead className="border-b border-slate-100">
                        <tr className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                            <th className="pl-5 pr-2 py-2.5 w-8 text-left">
                                {tab === 'queue' && (
                                    <input
                                        type="checkbox"
                                        checked={selected.size > 0 && selected.size === filteredPending.length}
                                        onChange={toggleAll}
                                        className="rounded border-slate-300 accent-slate-800"
                                    />
                                )}
                            </th>
                            <th className="pr-3 w-4" />
                            <th className="py-2.5 pr-4 text-left">Action</th>
                            <th className="py-2.5 pr-6 text-left hidden md:table-cell">Type</th>
                            <th className="py-2.5 pr-6 text-right hidden lg:table-cell">Confidence</th>
                            <th className="py-2.5 pr-4 text-right hidden lg:table-cell">Time</th>
                            <th className="py-2.5 pr-5 text-right" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-16 text-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-300 mx-auto" />
                                </td>
                            </tr>
                        ) : (rows as Action[]).length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                                    {tab === 'queue' ? 'No pending actions right now.' : 'No history yet.'}
                                </td>
                            </tr>
                        ) : (rows as Action[]).map(action => (
                            <ActionRow
                                key={action.action_id}
                                action={action}
                                selected={selected.has(action.action_id)}
                                onSelect={() => toggleOne(action.action_id)}
                                onApprove={() => approveMutation.mutate(action.action_id)}
                                onReject={() => rejectMutation.mutate(action.action_id)}
                                onRetry={() => retryMutation.mutate(action.action_id)}
                                busy={busy}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
