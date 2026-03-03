import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '../api/workflows';
import { actionsService } from '../api/governance';
import { leadsService } from '../api/leads';
import type { WorkflowRun, RunState } from '../api/types';

// ── Helpers ───────────────────────────────────────────────────────────────────
const runStatusColor: Record<string, string> = {
    completed: 'bg-emerald-500',
    running: 'bg-sky-500 animate-pulse',
    failed: 'bg-rose-500',
    cancelled: 'bg-slate-400',
};

const stripEmoji = (s: string) =>
    s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '').trim();

// ── Stat card ─────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, onClick }: { label: string; value: string | number; sub?: string; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`bg-white border border-slate-200 rounded-xl px-5 py-4 ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all' : ''}`}
        >
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
            {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function Dashboard() {
    const navigate = useNavigate();

    const { data: latestData } = useQuery({
        queryKey: ['latestRun'],
        queryFn: workflowService.getLatestRun,
        refetchInterval: 15000,
    });

    const { data: actionStats } = useQuery({
        queryKey: ['actionStats'],
        queryFn: actionsService.getActionStats,
        refetchInterval: 30000,
    });

    const { data: leadStats } = useQuery({
        queryKey: ['leadStats'],
        queryFn: leadsService.getLeadStats,
        staleTime: 60000,
    });

    const { data: runs = [] } = useQuery({
        queryKey: ['workflows'],
        queryFn: () => workflowService.getRuns(),
        refetchInterval: 15000,
    });

    // Handle non-object or no_runs response from latestRun
    const hasRun = latestData && typeof latestData === 'object' && !('status' in (latestData as object) && (latestData as any).status === 'no_runs');
    const latestRun = hasRun ? (latestData as { run: WorkflowRun; state: RunState }).run : null;
    const latestState = hasRun ? (latestData as { run: WorkflowRun; state: RunState }).state : null;

    const toArr = (v: any) => Array.isArray(v) ? v : [];
    const timeline = toArr((latestState as any)?.execution_timeline);
    const insights = toArr(latestState?.current_state?.insights);
    const decisions = toArr(latestState?.current_state?.decisions);


    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Overview</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Sales & Marketing Ops Agent</p>
                </div>
                {latestRun && (
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${runStatusColor[latestRun.status] ?? 'bg-slate-300'}`} />
                        <span className="text-sm text-slate-500">
                            Last run <span className="font-medium text-slate-700 capitalize">{latestRun.status}</span>
                            {latestRun.created_at && (
                                <> · {new Date(latestRun.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                            )}
                        </span>
                    </div>
                )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat
                    label="Pending approvals"
                    value={actionStats?.pending_approval ?? '—'}
                    onClick={() => navigate('/approvals')}
                />
                <Stat
                    label="Total leads"
                    value={leadStats?.total_leads ?? '—'}
                    sub={leadStats?.new_this_week ? `+${leadStats.new_this_week} this week` : undefined}
                    onClick={() => navigate('/leads')}
                />
                <Stat
                    label="Actions executed"
                    value={actionStats?.executed ?? '—'}
                />
                <Stat
                    label="Workflow runs"
                    value={(runs as WorkflowRun[]).length}
                    sub={(runs as WorkflowRun[]).filter(r => r.status === 'completed').length + ' completed'}
                    onClick={() => navigate('/workflows')}
                />
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Execution timeline */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-800">Last run steps</h2>
                        {latestRun && (
                            <span className="text-xs font-mono text-slate-400">{latestRun.run_id.slice(0, 8)}</span>
                        )}
                    </div>
                    <div className="divide-y divide-slate-50">
                        {timeline.length === 0 ? (
                            <div className="px-5 py-10 text-sm text-slate-400 text-center">
                                {latestRun ? 'No step data available for this run.' : 'No runs yet — go to Workflows to start one.'}
                            </div>
                        ) : timeline.slice(0, 10).map((node: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${node.success !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span className="text-sm text-slate-700 flex-1 truncate">{node.tool?.replace(/_/g, ' ') ?? 'Step ' + (i + 1)}</span>
                                <span className="text-xs text-slate-400 flex-shrink-0">{node.stage}</span>
                                {node.execution_time_ms != null && (
                                    <span className="text-xs text-slate-400 flex-shrink-0 tabular-nums">{node.execution_time_ms}ms</span>
                                )}
                            </div>
                        ))}
                        {timeline.length > 10 && (
                            <div className="px-5 py-2 text-xs text-slate-400">+{timeline.length - 10} more steps</div>
                        )}
                    </div>
                </div>

                {/* Insights & decisions */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-800">Agent findings</h2>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {insights.length === 0 && decisions.length === 0 ? (
                            <div className="px-5 py-10 text-sm text-slate-400 text-center">No findings yet from the latest run.</div>
                        ) : (
                            <>
                                {insights.slice(0, 5).map((ins: any, i: number) => (
                                    <div key={i} className="px-5 py-3 border-b border-slate-50 last:border-0">
                                        <div className="text-sm font-medium text-slate-800 leading-snug">
                                            {stripEmoji(ins.title ?? ins.insight ?? ins.description ?? '')}
                                        </div>
                                        {ins.ai_summary_oneliner && (
                                            <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{ins.ai_summary_oneliner}</div>
                                        )}
                                    </div>
                                ))}
                                {decisions.slice(0, 4).map((dec: any, i: number) => (
                                    <div key={i} className="px-5 py-3 border-b border-slate-50 last:border-0">
                                        <div className="text-sm font-medium text-slate-800 leading-snug">
                                            {stripEmoji(dec.title ?? dec.decision ?? dec.description ?? '')}
                                        </div>
                                        {(dec.rationale ?? dec.reason) && (
                                            <div className="text-xs text-slate-500 mt-0.5">{dec.rationale ?? dec.reason}</div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent runs mini-table */}
            {(runs as WorkflowRun[]).length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-800">Recent workflow runs</h2>
                        <button onClick={() => navigate('/workflows')} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                            View all →
                        </button>
                    </div>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-50">
                            {(runs as WorkflowRun[]).slice(0, 5).map(run => (
                                <tr key={run.run_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-2.5">
                                        <span className="font-mono text-xs text-slate-400">{run.run_id.slice(0, 12)}…</span>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${run.status === 'completed' ? 'text-emerald-600' :
                                            run.status === 'running' ? 'text-sky-600' :
                                                run.status === 'failed' ? 'text-rose-600' : 'text-slate-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${runStatusColor[run.status] ?? 'bg-slate-300'}`} />
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-2.5 text-slate-500 text-xs">{run.current_stage ?? '—'}</td>
                                    <td className="px-5 py-2.5 text-right text-xs text-slate-400 tabular-nums">
                                        {run.created_at ? new Date(run.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
