import { useState } from 'react';
import { Play, Loader2, X, ChevronRight } from 'lucide-react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '../api/workflows';
import type { WorkflowRun } from '../api/types';

// ── Utils ─────────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
    completed: 'text-emerald-600',
    running: 'text-sky-600',
    failed: 'text-rose-600',
    cancelled: 'text-slate-400',
    awaiting_approval: 'text-amber-600',
};
const statusDot: Record<string, string> = {
    completed: 'bg-emerald-500',
    running: 'bg-sky-500 animate-pulse',
    failed: 'bg-rose-500',
    cancelled: 'bg-slate-300',
    awaiting_approval: 'bg-amber-400 animate-pulse',
};
const stripEmoji = (s: string) =>
    s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '').trim();

// ── Run Detail Panel ──────────────────────────────────────────────────────────
function RunDetailPanel({ run, onClose }: { run: WorkflowRun; onClose: () => void }) {
    // Full state — insights, decisions, approvals
    const { data: state, isLoading: stateLoading } = useQuery({
        queryKey: ['runState', run.run_id],
        queryFn: () => workflowService.getRunState(run.run_id),

        staleTime: 30000,
    });

    // Timeline from workflow-graph
    const { data: graph, isLoading: graphLoading } = useQuery({
        queryKey: ['workflowGraph', run.run_id],
        queryFn: () => workflowService.getWorkflowGraph(run.run_id),
        staleTime: 30000,
    });

    const cs = (state as any)?.current_state ?? {};
    const insights: any[] = Array.isArray(cs.insights) ? cs.insights : [];
    const decisionsRaw = cs.decisions ?? {};
    // Decisions is an object with tier keys, flatten them all
    const decisions: any[] = typeof decisionsRaw === 'object' && !Array.isArray(decisionsRaw)
        ? Object.values(decisionsRaw).flat()
        : Array.isArray(decisionsRaw) ? decisionsRaw : [];
    const timeline: any[] = Array.isArray(graph?.timeline) ? graph.timeline : [];

    const isLoading = stateLoading || graphLoading;

    return (
        <div className="fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div className="flex-1 bg-black/20" onClick={onClose} />

            {/* Panel */}
            <div className="w-[520px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[run.status] ?? 'bg-slate-300'}`} />
                            <span className={`text-sm font-semibold capitalize ${statusColor[run.status] ?? ''}`}>{run.status}</span>
                        </div>
                        <div className="font-mono text-xs text-slate-400 mt-0.5">{run.run_id}</div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading run data…
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">

                        {/* Run meta */}
                        <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Started</div>
                                <div className="text-slate-700 font-medium">
                                    {run.created_at ? new Date(run.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Actions generated</div>
                                <div className="text-slate-700 font-medium">{run.actions_executed ?? 0}</div>
                            </div>
                            {run.current_stage && (
                                <div>
                                    <div className="text-xs text-slate-400 mb-0.5">Last stage</div>
                                    <div className="text-slate-700 font-medium capitalize">{run.current_stage}</div>
                                </div>
                            )}
                            {graph?.budget_breakdown?.total_cost != null && (
                                <div>
                                    <div className="text-xs text-slate-400 mb-0.5">AI cost</div>
                                    <div className="text-slate-700 font-medium">${graph.budget_breakdown.total_cost.toFixed(4)}</div>
                                </div>
                            )}
                        </div>

                        {/* Insights */}
                        {insights.length > 0 && (
                            <div className="px-5 py-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                    Insights ({insights.length})
                                </h3>
                                <div className="space-y-3">
                                    {insights.map((ins: any, i: number) => (
                                        <div key={i} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                                            <div className="text-sm font-medium text-slate-800 leading-snug">
                                                {stripEmoji(ins.title ?? ins.insight ?? '')}
                                            </div>
                                            {ins.ai_summary_oneliner && (
                                                <div className="text-xs text-slate-500 mt-1 leading-relaxed">{ins.ai_summary_oneliner}</div>
                                            )}
                                            {ins.impact && (
                                                <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2">{ins.impact}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Decisions */}
                        {decisions.length > 0 && (
                            <div className="px-5 py-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                    Decisions ({decisions.length})
                                </h3>
                                <div className="space-y-2">
                                    {decisions.slice(0, 10).map((dec: any, i: number) => (
                                        <div key={i} className="flex gap-2 text-sm">
                                            <span className="w-1 rounded-full bg-amber-400 flex-shrink-0 mt-1" />
                                            <div className="text-slate-700">{stripEmoji(dec.title ?? dec.decision ?? dec.description ?? '')}</div>
                                        </div>
                                    ))}
                                    {decisions.length > 10 && (
                                        <div className="text-xs text-slate-400 pl-3">+{decisions.length - 10} more</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Execution Timeline */}
                        {timeline.length > 0 && (
                            <div className="px-5 py-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                    Execution steps ({timeline.length})
                                </h3>
                                <div className="space-y-1.5">
                                    {timeline.map((node: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${node.success !== false ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                            <span className="text-slate-700 flex-1 truncate">{node.tool?.replace(/_/g, ' ')}</span>
                                            <span className="text-slate-400 flex-shrink-0">{node.stage}</span>
                                            {node.execution_time_ms != null && (
                                                <span className="text-slate-400 tabular-nums flex-shrink-0">{node.execution_time_ms}ms</span>
                                            )}
                                            {node.cached && <span className="text-sky-500 flex-shrink-0">cached</span>}
                                        </div>
                                    ))}
                                </div>
                                {graph?.budget_breakdown && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-xs text-slate-400">
                                        <span>{graph.budget_breakdown.cached_calls} cached calls</span>
                                        <span>${graph.budget_breakdown.total_cost?.toFixed(4)} total</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {insights.length === 0 && decisions.length === 0 && timeline.length === 0 && (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                No detailed data available for this run.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function Workflows() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);

    const { data: runs = [], isLoading } = useQuery({
        queryKey: ['workflows'],
        queryFn: () => workflowService.getRuns(),
        refetchInterval: 10000,
    });

    const triggerMutation = useMutation({
        mutationFn: () => workflowService.triggerRun({
            run_type: 'manual',
            selected_sources: ['csv', 'hubspot', 'ga4'],
        }),
        onSuccess: () => {
            toast.success('New workflow started.');
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
        },
        onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to start workflow'),
    });

    const cancelMutation = useMutation({
        mutationFn: (runId: string) => workflowService.cancelRun(runId),
        onSuccess: () => {
            toast.info('Workflow cancelled.');
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
        },
        onError: () => toast.error('Cancel failed'),
    });

    return (
        <div className="max-w-5xl mx-auto">
            {selectedRun && (
                <RunDetailPanel run={selectedRun} onClose={() => setSelectedRun(null)} />
            )}

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Workflows</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Click any run to see insights, decisions, and execution steps</p>
                </div>
                <button
                    onClick={() => triggerMutation.mutate()}
                    disabled={triggerMutation.isPending}
                    className="clean-button btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    {triggerMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Play className="w-4 h-4 fill-current" />}
                    {triggerMutation.isPending ? 'Starting…' : 'Run Now'}
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="py-3 px-5 text-left">Run</th>
                            <th className="py-3 px-5 text-left">Status</th>
                            <th className="py-3 px-5 text-left">Stage</th>
                            <th className="py-3 px-5 text-left">Actions</th>
                            <th className="py-3 px-5 text-right">Started</th>
                            <th className="py-3 px-5 w-24" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…
                            </td></tr>
                        ) : (runs as WorkflowRun[]).length === 0 ? (
                            <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                                No runs yet. Click <span className="font-semibold text-slate-600">Run Now</span> to start.
                            </td></tr>
                        ) : (runs as WorkflowRun[]).map((run) => (
                            <tr
                                key={run.run_id}
                                onClick={() => setSelectedRun(run)}
                                className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedRun?.run_id === run.run_id ? 'bg-slate-50' : ''}`}
                            >
                                <td className="py-3.5 px-5">
                                    <span className="font-mono text-xs text-slate-500">{run.run_id.slice(0, 12)}…</span>
                                </td>
                                <td className="py-3.5 px-5">
                                    <span className={`flex items-center gap-1.5 font-medium capitalize text-xs ${statusColor[run.status] ?? 'text-slate-500'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[run.status] ?? 'bg-slate-300'}`} />
                                        {run.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-5 text-slate-500 capitalize text-xs">{run.current_stage ?? '—'}</td>
                                <td className="py-3.5 px-5 text-slate-700 font-semibold">{run.actions_executed ?? 0}</td>
                                <td className="py-3.5 px-5 text-right text-slate-400 text-xs tabular-nums">
                                    {run.created_at ? new Date(run.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                                </td>
                                <td className="py-3.5 px-5 text-right" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                        {(run.status === 'running' || run.status === 'awaiting_approval') && (
                                            <>
                                                {run.status === 'awaiting_approval' && (
                                                    <button
                                                        onClick={() => navigate(`/approvals?run_id=${run.run_id}`)}
                                                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200 rounded-md hover:bg-amber-50 transition-colors"
                                                    >
                                                        Review approvals →
                                                    </button>
                                                )}
                                                {run.status === 'running' && (
                                                    <button
                                                        onClick={() => cancelMutation.mutate(run.run_id)}
                                                        disabled={cancelMutation.isPending}
                                                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 border border-rose-200 rounded-md hover:bg-rose-50 transition-colors disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
