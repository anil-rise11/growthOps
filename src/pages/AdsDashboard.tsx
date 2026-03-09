import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Eye, Play, Pause, Plus, Loader2, Target, Globe, MousePointer } from 'lucide-react';
import { toast } from 'react-toastify';
import { adsService, type MetaCampaign, type CreateCampaignRequest } from '../api/ads';

// ── Status Colors ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    PAUSED: 'bg-amber-100 text-amber-700',
    DELETED: 'bg-slate-100 text-slate-600',
    ARCHIVED: 'bg-slate-100 text-slate-500',
};

// ── New Campaign Modal ───────────────────────────────────────────────────────
function NewCampaignModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateCampaignRequest>({
        business_context: '',
        image_path: '',
        link_url: '',
        daily_budget: 50,
        countries: ['US'],
        age_min: 25,
        age_max: 65,
    });

    const createMutation = useMutation({
        mutationFn: () => adsService.createCampaign(formData),
        onSuccess: (res) => {
            toast.success(`Campaign created successfully! ID: ${res.campaign_id}`);
            queryClient.invalidateQueries({ queryKey: ['adsStats'] });
            onClose();
        },
        onError: () => toast.error('Failed to create campaign'),
    });

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Create Meta Campaign</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <span className="text-slate-500 text-xl">×</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Business Context</label>
                        <textarea
                            value={formData.business_context}
                            onChange={e => setFormData({ ...formData, business_context: e.target.value })}
                            placeholder="Describe your business and campaign goals..."
                            rows={3}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Image Path</label>
                            <input
                                value={formData.image_path}
                                onChange={e => setFormData({ ...formData, image_path: e.target.value })}
                                placeholder="/path/to/image.jpg"
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Link URL</label>
                            <input
                                value={formData.link_url}
                                onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                                placeholder="https://example.com"
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Daily Budget ($)</label>
                        <input
                            type="number"
                            value={formData.daily_budget}
                            onChange={e => setFormData({ ...formData, daily_budget: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Min Age</label>
                            <input
                                type="number"
                                value={formData.age_min}
                                onChange={e => setFormData({ ...formData, age_min: parseInt(e.target.value) || 18 })}
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Max Age</label>
                            <input
                                type="number"
                                value={formData.age_max}
                                onChange={e => setFormData({ ...formData, age_max: parseInt(e.target.value) || 65 })}
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Countries (comma-separated)</label>
                        <input
                            value={formData.countries.join(', ')}
                            onChange={e => setFormData({ ...formData, countries: e.target.value.split(',').map(c => c.trim()).filter(Boolean) })}
                            placeholder="US, CA, UK"
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending || !formData.business_context}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Campaign
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AdsDashboard() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);

    const { data: adsStats, isLoading: statsLoading } = useQuery({
        queryKey: ['adsStats'],
        queryFn: () => adsService.getAdsStatsV2(),
        refetchInterval: 60000,
    });

    const { data: ga4Data, isLoading: ga4Loading } = useQuery({
        queryKey: ['ga4Snapshot'],
        queryFn: () => adsService.getGA4Snapshot(7),
        refetchInterval: 300000,
    });

    const { data: clarityData, isLoading: clarityLoading } = useQuery({
        queryKey: ['claritySnapshot'],
        queryFn: () => adsService.getClaritySnapshot(),
        refetchInterval: 300000,
    });

    const toggleMutation = useMutation({
        mutationFn: ({ campaignId, action, platform }: { campaignId: string; action: 'pause' | 'activate'; platform: 'meta_ads' | 'google' | 'linkedin' }) =>
            adsService.toggleCampaign({ campaign_id: campaignId, action, platform }),
        onSuccess: () => {
            toast.success('Campaign status updated');
            queryClient.invalidateQueries({ queryKey: ['adsStats'] });
        },
        onError: () => toast.error('Failed to toggle campaign'),
    });

    const metaCampaigns = adsStats?.meta?.campaigns || [];
    const metaTotals = adsStats?.meta?.totals;

    const handleToggle = (campaign: MetaCampaign) => {
        const action = campaign.status === 'ACTIVE' ? 'pause' : 'activate';
        toggleMutation.mutate({ campaignId: campaign.campaign_id, action, platform: 'meta_ads' });
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ads & Analytics Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Meta Ads, GA4, and Microsoft Clarity insights</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="clean-button btn-primary shadow-sm hover:shadow flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> New Meta Campaign
                </button>
            </div>

            {/* Analytics Snapshots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* GA4 Snapshot */}
                <div className="clean-panel">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" /> GA4 Snapshot
                        </h2>
                        <span className="text-xs text-slate-400">Last 7 days</span>
                    </div>
                    <div className="p-6">
                        {ga4Loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                        ) : ga4Data?.status === 'error' ? (
                            <div className="text-center text-slate-500 py-8">
                                <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>GA4 not configured or error fetching data</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-slate-900">{ga4Data?.count || 0}</div>
                                        <div className="text-xs text-slate-500">Events</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-slate-900">{ga4Data?.snapshot?.length || 0}</div>
                                        <div className="text-xs text-slate-500">Sessions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-emerald-600">{ga4Data?.status || 'OK'}</div>
                                        <div className="text-xs text-slate-500">Status</div>
                                    </div>
                                </div>
                                {ga4Data?.fetched_at && (
                                    <p className="text-xs text-slate-400 text-center">
                                        Fetched: {new Date(ga4Data.fetched_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Clarity Snapshot */}
                <div className="clean-panel">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <Eye className="w-4 h-4 text-purple-500" /> Microsoft Clarity
                        </h2>
                        <span className="text-xs text-slate-400">User behavior</span>
                    </div>
                    <div className="p-6">
                        {clarityLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                        ) : clarityData?.status === 'error' ? (
                            <div className="text-center text-slate-500 py-8">
                                <MousePointer className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>Clarity not configured or error fetching data</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-slate-900">{clarityData?.count || 0}</div>
                                        <div className="text-xs text-slate-500">Friction Points</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-slate-900">{clarityData?.friction_data?.length || 0}</div>
                                        <div className="text-xs text-slate-500">Heatmaps</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-emerald-600">{clarityData?.status || 'OK'}</div>
                                        <div className="text-xs text-slate-500">Status</div>
                                    </div>
                                </div>
                                {clarityData?.fetched_at && (
                                    <p className="text-xs text-slate-400 text-center">
                                        Fetched: {new Date(clarityData.fetched_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Meta Campaigns */}
            <div className="clean-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-500" /> Meta Ads Campaigns
                    </h2>
                    <div className="flex items-center gap-4">
                        {metaTotals && (
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-slate-500">Spend: <span className="font-semibold text-slate-900">${metaTotals.spend?.toFixed(2) || '0.00'}</span></span>
                                <span className="text-slate-500">ROAS: <span className="font-semibold text-slate-900">{metaTotals.roas?.toFixed(2) || '0.00'}</span></span>
                                <span className="text-slate-500">CTR: <span className="font-semibold text-slate-900">{(metaTotals.ctr * 100)?.toFixed(2) || '0.00'}%</span></span>
                            </div>
                        )}
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="py-3 px-6">Campaign</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6">Spend</th>
                            <th className="py-3 px-6">Impressions</th>
                            <th className="py-3 px-6">Clicks</th>
                            <th className="py-3 px-6">Conversions</th>
                            <th className="py-3 px-6">ROAS</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {statsLoading ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading campaigns...
                                </td>
                            </tr>
                        ) : metaCampaigns.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-slate-500">
                                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    No Meta campaigns found. Connect your Meta Ads account or create a new campaign.
                                </td>
                            </tr>
                        ) : (
                            metaCampaigns.map((campaign: any) => (
                                <tr key={campaign.campaign_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{campaign.campaign_name}</span>
                                            <span className="text-slate-500 text-xs font-mono">{campaign.campaign_id}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${STATUS_COLORS[campaign.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-slate-900 font-medium">${campaign.spend?.toFixed(2) || '0.00'}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-slate-900">{campaign.impressions?.toLocaleString() || '0'}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-slate-900">{campaign.clicks?.toLocaleString() || '0'}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-slate-900">{campaign.conversions?.toLocaleString() || '0'}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`font-semibold ${campaign.roas >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {campaign.roas?.toFixed(2) || '0.00'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleToggle(campaign)}
                                                disabled={toggleMutation.isPending}
                                                className={`p-1.5 rounded transition-colors ${campaign.status === 'ACTIVE'
                                                    ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                                title={campaign.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                                            >
                                                {campaign.status === 'ACTIVE' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && <NewCampaignModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
