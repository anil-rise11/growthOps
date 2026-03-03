import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, PieChart, BarChart3, Loader2, RefreshCw, Target, Users, ShoppingCart } from 'lucide-react';
import { revenueService, type RevenueByCampaign, type RevenueByChannel } from '../api/revenue';

// ── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    color = 'slate',
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    color?: 'slate' | 'emerald' | 'blue' | 'indigo';
}) {
    const colorClasses = {
        slate: 'bg-slate-50 border-slate-200 text-slate-900',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        blue: 'bg-blue-50 border-blue-200 text-blue-900',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    };

    const iconColors = {
        slate: 'text-slate-500',
        emerald: 'text-emerald-500',
        blue: 'text-blue-500',
        indigo: 'text-indigo-500',
    };

    return (
        <div className={`border rounded-xl px-5 py-4 ${colorClasses[color]}`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-2xl font-bold tabular-nums">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <div className="text-sm opacity-70 mt-0.5">{label}</div>
                    {sub && <div className="text-xs opacity-50 mt-1">{sub}</div>}
                </div>
                <Icon className={`w-5 h-5 ${iconColors[color]}`} />
            </div>
        </div>
    );
}

// ── Progress Bar Component ───────────────────────────────────────────────────
function ProgressBar({ value, max, label, color = 'emerald' }: { value: number; max: number; label: string; color?: string }) {
    const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    const colorClasses: Record<string, string> = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        indigo: 'bg-indigo-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium truncate max-w-[200px]">{label}</span>
                <span className="text-slate-500 tabular-nums">${value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${colorClasses[color] || colorClasses.emerald} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// ── Campaign Row Component ───────────────────────────────────────────────────
function CampaignRow({ campaign, maxRevenue }: { campaign: RevenueByCampaign; maxRevenue: number }) {
    const conversionRate = campaign.leads > 0 ? ((campaign.conversions / campaign.leads) * 100).toFixed(1) : '0.0';

    return (
        <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
            <td className="py-3 px-6">
                <span className="font-medium text-slate-900">{campaign.campaign}</span>
            </td>
            <td className="py-3 px-6">
                <div className="w-full max-w-[200px]">
                    <ProgressBar value={campaign.revenue} max={maxRevenue} label="" />
                </div>
            </td>
            <td className="py-3 px-6 text-right">
                <span className="font-semibold text-slate-900">${campaign.revenue.toLocaleString()}</span>
            </td>
            <td className="py-3 px-6 text-right">
                <span className="text-slate-600">{campaign.leads.toLocaleString()}</span>
            </td>
            <td className="py-3 px-6 text-right">
                <span className="text-slate-600">{campaign.conversions.toLocaleString()}</span>
            </td>
            <td className="py-3 px-6 text-right">
                <span className={`font-medium ${parseFloat(conversionRate) >= 10 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {conversionRate}%
                </span>
            </td>
        </tr>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function RevenueDashboard() {
    const { data: attribution, isLoading: attributionLoading, refetch: refetchAttribution } = useQuery({
        queryKey: ['revenueAttribution'],
        queryFn: () => revenueService.getAttribution(),
        refetchInterval: 60000,
    });

    const { data: byCampaign, isLoading: campaignLoading } = useQuery({
        queryKey: ['revenueByCampaign'],
        queryFn: () => revenueService.getAttributionByCampaign(),
        refetchInterval: 60000,
    });

    const { data: byChannel, isLoading: channelLoading } = useQuery({
        queryKey: ['revenueByChannel'],
        queryFn: () => revenueService.getAttributionByChannel(),
        refetchInterval: 60000,
    });

    const totalRevenue = attribution?.total_attributed_revenue ?? 0;
    const campaigns = byCampaign?.campaigns ?? [];
    const channels = byChannel?.channels ?? [];

    const maxCampaignRevenue = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.revenue)) : 0;
    const maxChannelRevenue = channels.length > 0 ? Math.max(...channels.map(c => c.revenue)) : 0;

    const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const avgConversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : '0.0';

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue Attribution</h1>
                    <p className="text-sm text-slate-500 mt-1">Track revenue attribution by campaign and channel</p>
                </div>
                <button
                    onClick={() => refetchAttribution()}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    sub="Attributed"
                    icon={DollarSign}
                    color="emerald"
                />
                <StatCard
                    label="Total Leads"
                    value={totalLeads}
                    sub="All campaigns"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    label="Conversions"
                    value={totalConversions}
                    sub={`${avgConversionRate}% rate`}
                    icon={ShoppingCart}
                    color="indigo"
                />
                <StatCard
                    label="Active Channels"
                    value={channels.length}
                    sub="Revenue sources"
                    icon={Target}
                    color="slate"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Campaign Breakdown */}
                <div className="clean-panel overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-500" /> Revenue by Campaign
                        </h2>
                        <span className="text-xs text-slate-500">{campaigns.length} campaigns</span>
                    </div>

                    {campaignLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <BarChart3 className="w-8 h-8 mb-2 text-slate-300" />
                            <p>No campaign data available</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="py-3 px-6">Campaign</th>
                                        <th className="py-3 px-6">Progress</th>
                                        <th className="py-3 px-6 text-right">Revenue</th>
                                        <th className="py-3 px-6 text-right">Leads</th>
                                        <th className="py-3 px-6 text-right">Conv.</th>
                                        <th className="py-3 px-6 text-right">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((campaign) => (
                                        <CampaignRow
                                            key={campaign.campaign}
                                            campaign={campaign}
                                            maxRevenue={maxCampaignRevenue}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Channel Breakdown */}
                <div className="clean-panel overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-emerald-500" /> Revenue by Channel
                        </h2>
                        <span className="text-xs text-slate-500">{channels.length} channels</span>
                    </div>

                    {channelLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : channels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <PieChart className="w-8 h-8 mb-2 text-slate-300" />
                            <p>No channel data available</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-5">
                            {channels.map((channel, index) => {
                                const colors = ['emerald', 'blue', 'indigo', 'amber', 'rose', 'purple'];
                                const color = colors[index % colors.length];
                                return (
                                    <ProgressBar
                                        key={channel.channel}
                                        value={channel.revenue}
                                        max={maxChannelRevenue}
                                        label={channel.channel}
                                        color={color}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Summary */}
                    {!channelLoading && channels.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Total Channel Revenue</span>
                                <span className="font-semibold text-slate-900">
                                    ${byChannel?.total_revenue?.toLocaleString() || '0'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
