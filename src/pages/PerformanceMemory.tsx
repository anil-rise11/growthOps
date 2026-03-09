import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, TrendingUp, Award, Loader2, RefreshCw, Plus, CheckCircle, XCircle, MinusCircle, ChevronDown, ChevronUp, BarChart3, Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';
import { performanceService, type PerformanceRecord, type PerformanceSummary } from '../api/performance';

// ── Outcome Icons ────────────────────────────────────────────────────────────
const OUTCOME_ICONS: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    failure: <XCircle className="w-4 h-4 text-rose-500" />,
    partial: <MinusCircle className="w-4 h-4 text-amber-500" />,
};

const OUTCOME_COLORS: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failure: 'bg-rose-50 text-rose-700 border-rose-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
};

// ── New Record Modal ─────────────────────────────────────────────────────────
function NewRecordModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        action_type: '',
        outcome: 'success' as 'success' | 'failure' | 'partial',
        metrics: {} as Record<string, number>,
        context: {} as Record<string, unknown>,
    });
    const [metricKey, setMetricKey] = useState('');
    const [metricValue, setMetricValue] = useState('');

    const createMutation = useMutation({
        mutationFn: () => performanceService.recordOutcome(formData),
        onSuccess: () => {
            toast.success('Performance record created');
            queryClient.invalidateQueries({ queryKey: ['performanceRecords'] });
            queryClient.invalidateQueries({ queryKey: ['performanceSummary'] });
            onClose();
        },
        onError: () => toast.error('Failed to create record'),
    });

    const addMetric = () => {
        if (metricKey && metricValue) {
            setFormData({
                ...formData,
                metrics: { ...formData.metrics, [metricKey]: parseFloat(metricValue) || 0 }
            });
            setMetricKey('');
            setMetricValue('');
        }
    };

    const removeMetric = (key: string) => {
        const newMetrics = { ...formData.metrics };
        delete newMetrics[key];
        setFormData({ ...formData, metrics: newMetrics });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Record Performance Outcome</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <span className="text-slate-500 text-xl">×</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Action Type</label>
                        <input
                            value={formData.action_type}
                            onChange={e => setFormData({ ...formData, action_type: e.target.value })}
                            placeholder="e.g. email_campaign, social_post"
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Outcome</label>
                        <div className="flex gap-2">
                            {(['success', 'failure', 'partial'] as const).map((outcome) => (
                                <button
                                    key={outcome}
                                    onClick={() => setFormData({ ...formData, outcome })}
                                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors capitalize ${formData.outcome === outcome
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {OUTCOME_ICONS[outcome]}
                                    <span className="ml-2">{outcome}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Metrics</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                value={metricKey}
                                onChange={e => setMetricKey(e.target.value)}
                                placeholder="Metric name"
                                className="flex-1 px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                            <input
                                type="number"
                                value={metricValue}
                                onChange={e => setMetricValue(e.target.value)}
                                placeholder="Value"
                                className="w-24 px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                            <button
                                onClick={addMetric}
                                disabled={!metricKey || !metricValue}
                                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>

                        {Object.keys(formData.metrics).length > 0 && (
                            <div className="space-y-1">
                                {Object.entries(formData.metrics).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-md text-sm">
                                        <span className="text-slate-700">{key}: <span className="font-semibold">{value}</span></span>
                                        <button
                                            onClick={() => removeMetric(key)}
                                            className="text-rose-500 hover:text-rose-700"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending || !formData.action_type}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Record Outcome
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Record Row Component ─────────────────────────────────────────────────────
function RecordRow({ record }: { record: PerformanceRecord }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                        {OUTCOME_ICONS[record.outcome]}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${OUTCOME_COLORS[record.outcome]}`}>
                            {record.outcome}
                        </span>
                    </div>
                </td>
                <td className="py-3 px-4">
                    <span className="font-medium text-slate-900">{record.action_type}</span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-600 text-sm">
                        {Object.keys(record.metrics).length} metrics
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-500 text-sm">
                        {new Date(record.created_at).toLocaleString()}
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
                    <td colSpan={5} className="py-4 px-4">
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-semibold text-slate-600">Record ID:</span>
                                <span className="font-mono text-xs text-slate-500 ml-2">{record.record_id}</span>
                            </div>
                            {Object.keys(record.metrics).length > 0 && (
                                <div>
                                    <span className="font-semibold text-slate-600">Metrics:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {Object.entries(record.metrics).map(([key, value]) => (
                                            <span key={key} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">
                                                {key}: <span className="font-semibold">{value}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {Object.keys(record.context).length > 0 && (
                                <div>
                                    <span className="font-semibold text-slate-600">Context:</span>
                                    <pre className="mt-1 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 overflow-auto max-h-32">
                                        {JSON.stringify(record.context, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ summary }: { summary: PerformanceSummary }) {
    const successRate = ((summary?.success_rate ?? 0) * 100).toFixed(1);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Total Records</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{(summary?.total_records ?? 0).toLocaleString()}</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600">Success Rate</span>
                </div>
                <div className="text-2xl font-bold text-emerald-700">{successRate}%</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Action Types</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                    {Object.keys(summary?.by_action_type ?? {}).length}
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-indigo-600">Insights</span>
                </div>
                <div className="text-2xl font-bold text-indigo-700">
                    {(summary?.learning_insights ?? []).length}
                </div>
            </div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function PerformanceMemory() {
    const [showModal, setShowModal] = useState(false);

    const { data: recordsData, isLoading: recordsLoading, refetch: refetchRecords } = useQuery({
        queryKey: ['performanceRecords'],
        queryFn: () => performanceService.getRecords(100),
        refetchInterval: 60000,
    });

    const { data: summary, isLoading: summaryLoading } = useQuery({
        queryKey: ['performanceSummary'],
        queryFn: () => performanceService.getSummary(),
        refetchInterval: 60000,
    });

    const records = recordsData?.records || [];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance & Learning</h1>
                    <p className="text-sm text-slate-500 mt-1">Track outcomes and learn from performance data</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetchRecords()}
                        className="clean-button btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="clean-button btn-primary shadow-sm hover:shadow flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Record Outcome
                    </button>
                </div>
            </div>

            {/* Summary */}
            {summaryLoading ? (
                <div className="flex items-center justify-center h-32 mb-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
            ) : summary ? (
                <div className="mb-8">
                    <SummaryCard summary={summary} />
                </div>
            ) : null}

            {/* Learning Insights */}
            {summary && (summary.learning_insights ?? []).length > 0 && (
                <div className="clean-panel mb-8">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" /> Learning Insights
                        </h2>
                    </div>
                    <div className="p-6">
                        <ul className="space-y-2">
                            {(summary.learning_insights ?? []).map((insight, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-amber-500 mt-0.5">•</span>
                                    {insight}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Action Type Breakdown */}
            {summary && Object.keys(summary.by_action_type ?? {}).length > 0 && (
                <div className="clean-panel mb-8">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <Brain className="w-4 h-4 text-indigo-500" /> Actions by Type
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(summary.by_action_type ?? {}).map(([type, count]) => (
                                <div key={type} className="text-center p-3 bg-slate-50 rounded-lg">
                                    <div className="text-lg font-bold text-slate-900">{count}</div>
                                    <div className="text-xs text-slate-500 capitalize">{type.replace('_', ' ')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Records Table */}
            <div className="clean-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-500" /> Performance Records
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="py-3 px-4">Outcome</th>
                                <th className="py-3 px-4">Action Type</th>
                                <th className="py-3 px-4">Metrics</th>
                                <th className="py-3 px-4">Created</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordsLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading records...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500">
                                        <Brain className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        No performance records yet. Start by recording outcomes.
                                    </td>
                                </tr>
                            ) : (
                                records.map((record: PerformanceRecord) => (
                                    <RecordRow key={record.record_id} record={record} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && <NewRecordModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
