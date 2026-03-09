import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Play, Pause, Clock, Settings, History, RefreshCw, Loader2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { autonomousService, type AutonomousConfig as ConfigType, type AutonomousHistoryRun } from '../api/autonomous';

// ── Toggle Switch Component ──────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}

// ── History Run Row Component ────────────────────────────────────────────────
function HistoryRunRow({ run }: { run: AutonomousHistoryRun }) {
    const [expanded, setExpanded] = useState(false);

    const statusColors: Record<string, string> = {
        completed: 'bg-emerald-100 text-emerald-700',
        running: 'bg-sky-100 text-sky-700',
        failed: 'bg-rose-100 text-rose-700',
        pending: 'bg-amber-100 text-amber-700',
    };

    return (
        <>
            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                <td className="py-3 px-4">
                    <span className="font-mono text-xs text-slate-600">{run.run_id.slice(0, 16)}...</span>
                </td>
                <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[run.status] || 'bg-slate-100 text-slate-600'}`}>
                        {run.status}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-600 text-sm">
                        {new Date(run.started_at).toLocaleString()}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-600 text-sm">
                        {run.completed_at ? new Date(run.completed_at).toLocaleString() : '—'}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-900 font-medium">
                        {run.duration_seconds ? `${run.duration_seconds}s` : '—'}
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
                        <div className="text-sm text-slate-600 space-y-1">
                            <p><span className="font-medium">Full Run ID:</span> <span className="font-mono text-xs">{run.run_id}</span></p>
                            <p><span className="font-medium">Status:</span> {run.status}</p>
                            {run.duration_seconds && (
                                <p><span className="font-medium">Duration:</span> {run.duration_seconds} seconds</p>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AutonomousConfig() {
    const queryClient = useQueryClient();
    const [showHistory, setShowHistory] = useState(false);

    const { data: config, isLoading: configLoading } = useQuery({
        queryKey: ['autonomousConfig'],
        queryFn: () => autonomousService.getConfig(),
        refetchInterval: 30000,
    });

    const { data: history, isLoading: historyLoading } = useQuery({
        queryKey: ['autonomousHistory'],
        queryFn: () => autonomousService.getHistory(),
        enabled: showHistory,
    });

    const toggleMutation = useMutation({
        mutationFn: (enabled: boolean) => autonomousService.toggle(enabled),
        onSuccess: () => {
            toast.success('Autonomous workflow toggled');
            queryClient.invalidateQueries({ queryKey: ['autonomousConfig'] });
        },
        onError: () => toast.error('Failed to toggle autonomous workflow'),
    });

    const updateConfigMutation = useMutation({
        mutationFn: (updates: Partial<ConfigType>) => autonomousService.updateConfig(updates),
        onSuccess: () => {
            toast.success('Configuration updated');
            queryClient.invalidateQueries({ queryKey: ['autonomousConfig'] });
        },
        onError: () => toast.error('Failed to update configuration'),
    });

    const runNowMutation = useMutation({
        mutationFn: () => autonomousService.runNow(),
        onSuccess: (res) => {
            toast.success(`Run triggered! Run ID: ${res.active_run_id}`);
            queryClient.invalidateQueries({ queryKey: ['autonomousHistory'] });
        },
        onError: () => toast.error('Failed to trigger run'),
    });

    const [localConfig, setLocalConfig] = useState<Partial<ConfigType>>({});

    // Update local config when data loads
    if (config && Object.keys(localConfig).length === 0) {
        setLocalConfig(config);
    }

    const handleSave = () => {
        updateConfigMutation.mutate(localConfig);
    };

    const isEnabled = config?.enabled || false;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Autonomous Workflow</h1>
                    <p className="text-sm text-slate-500 mt-1">Configure and manage autonomous marketing operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">Status:</span>
                    <div className="flex items-center gap-2">
                        {configLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : (
                            <>
                                {isEnabled ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                        <Play className="w-3.5 h-3.5 fill-current" /> Enabled
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                        <Pause className="w-3.5 h-3.5 fill-current" /> Disabled
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Enable/Disable Card */}
            <div className="clean-panel mb-6">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <Bot className="w-4 h-4 text-indigo-500" /> Workflow Status
                    </h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-slate-900">Autonomous Workflow</h3>
                            <p className="text-sm text-slate-500">Enable or disable the autonomous marketing workflow</p>
                        </div>
                        <ToggleSwitch
                            checked={isEnabled}
                            onChange={(v) => toggleMutation.mutate(v)}
                            disabled={toggleMutation.isPending || configLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Configuration */}
            <div className="clean-panel mb-6">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-500" /> Configuration
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Interval */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" /> Interval (hours)
                        </label>
                        <input
                            type="number"
                            value={localConfig.interval_hours ?? config?.interval_hours ?? 4}
                            onChange={e => setLocalConfig({ ...localConfig, interval_hours: parseInt(e.target.value) || 4 })}
                            min={1}
                            max={24}
                            className="w-32 px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                        <p className="text-xs text-slate-500 mt-1">How often the autonomous workflow runs</p>
                    </div>

                    {/* Governance Mode */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Governance Mode</label>
                        <div className="flex gap-2">
                            {(['observe', 'suggest', 'execute'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setLocalConfig({ ...localConfig, governance_mode: mode })}
                                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${(localConfig.governance_mode ?? config?.governance_mode) === mode
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <span className="capitalize">{mode}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Controls how the autonomous workflow makes decisions
                        </p>
                    </div>

                    {/* Selected Sources */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Data Sources</label>
                        <div className="flex flex-wrap gap-2">
                            {['hubspot', 'csv', 'ga4', 'clarity', 'meta_ads'].map((source) => {
                                const isSelected = (localConfig.selected_sources ?? config?.selected_sources ?? []).includes(source);
                                return (
                                    <button
                                        key={source}
                                        onClick={() => {
                                            const current = localConfig.selected_sources ?? config?.selected_sources ?? [];
                                            const updated = isSelected
                                                ? current.filter(s => s !== source)
                                                : [...current, source];
                                            setLocalConfig({ ...localConfig, selected_sources: updated });
                                        }}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${isSelected
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {isSelected && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
                                        <span className="capitalize">{source.replace('_', ' ')}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Limits */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Daily Emails</label>
                            <input
                                type="number"
                                value={localConfig.action_limits?.max_daily_email_campaigns ?? config?.action_limits?.max_daily_email_campaigns ?? 3}
                                onChange={e => setLocalConfig({
                                    ...localConfig,
                                    action_limits: {
                                        max_daily_email_campaigns: parseInt(e.target.value) || 0,
                                        max_daily_social_posts: localConfig.action_limits?.max_daily_social_posts ?? config?.action_limits?.max_daily_social_posts ?? 5,
                                        max_daily_ad_spend: localConfig.action_limits?.max_daily_ad_spend ?? config?.action_limits?.max_daily_ad_spend ?? 500,
                                    }
                                })}
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Daily Social Posts</label>
                            <input
                                type="number"
                                value={localConfig.action_limits?.max_daily_social_posts ?? config?.action_limits?.max_daily_social_posts ?? 5}
                                onChange={e => setLocalConfig({
                                    ...localConfig,
                                    action_limits: {
                                        max_daily_email_campaigns: localConfig.action_limits?.max_daily_email_campaigns ?? config?.action_limits?.max_daily_email_campaigns ?? 3,
                                        max_daily_social_posts: parseInt(e.target.value) || 0,
                                        max_daily_ad_spend: localConfig.action_limits?.max_daily_ad_spend ?? config?.action_limits?.max_daily_ad_spend ?? 500,
                                    }
                                })}
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Daily Ad Spend ($)</label>
                            <input
                                type="number"
                                value={localConfig.action_limits?.max_daily_ad_spend ?? config?.action_limits?.max_daily_ad_spend ?? 500}
                                onChange={e => setLocalConfig({
                                    ...localConfig,
                                    action_limits: {
                                        max_daily_email_campaigns: localConfig.action_limits?.max_daily_email_campaigns ?? config?.action_limits?.max_daily_email_campaigns ?? 3,
                                        max_daily_social_posts: localConfig.action_limits?.max_daily_social_posts ?? config?.action_limits?.max_daily_social_posts ?? 5,
                                        max_daily_ad_spend: parseInt(e.target.value) || 0,
                                    }
                                })}
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={() => setLocalConfig({})}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateConfigMutation.isPending || Object.keys(localConfig).length === 0}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {updateConfigMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Configuration
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="clean-panel mb-6">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-slate-500" /> Actions
                    </h2>
                </div>
                <div className="p-6">
                    <button
                        onClick={() => runNowMutation.mutate()}
                        disabled={runNowMutation.isPending}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {runNowMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Run Now
                    </button>
                </div>
            </div>

            {/* Run History */}
            <div className="clean-panel">
                <div
                    className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-500" /> Run History
                    </h2>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {showHistory && (
                    <div className="overflow-x-auto">
                        {historyLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                        ) : history?.runs.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>No run history yet</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="py-3 px-4">Run ID</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Started</th>
                                        <th className="py-3 px-4">Completed</th>
                                        <th className="py-3 px-4">Duration</th>
                                        <th className="py-3 px-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history?.runs.map((run) => (
                                        <HistoryRunRow key={run.run_id} run={run} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
