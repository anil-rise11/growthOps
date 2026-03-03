import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Share2, Play, Pause, Trash2, Loader2, Plus, Facebook, Instagram } from 'lucide-react';
import { toast } from 'react-toastify';
import { socialService } from '../api/social';

export function SocialCampaigns() {
    const queryClient = useQueryClient();

    const { data = { campaigns: [], count: 0 }, isLoading } = useQuery({
        queryKey: ['socialCampaigns'],
        queryFn: socialService.getCampaigns,
        refetchInterval: 15000,
    });

    const campaigns = data.campaigns || [];

    const pauseMutation = useMutation({
        mutationFn: socialService.pauseCampaign,
        onSuccess: () => {
            toast.success('Social campaign paused.');
            queryClient.invalidateQueries({ queryKey: ['socialCampaigns'] });
        }
    });

    const resumeMutation = useMutation({
        mutationFn: socialService.resumeCampaign,
        onSuccess: () => {
            toast.success('Social campaign resumed.');
            queryClient.invalidateQueries({ queryKey: ['socialCampaigns'] });
        }
    });

    const cancelMutation = useMutation({
        mutationFn: socialService.cancelCampaign,
        onSuccess: () => {
            toast.info('Social campaign cancelled.');
            queryClient.invalidateQueries({ queryKey: ['socialCampaigns'] });
        }
    });

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Social Media Campaigns</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage AI-generated post schedules for Facebook and Instagram</p>
                </div>

                <div className="flex gap-3">
                    <button className="clean-button btn-primary shadow-sm hover:shadow flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Campaign
                    </button>
                </div>
            </div>

            <div className="clean-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-indigo-500" /> Active Schedules
                    </h2>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="py-3 px-6">Campaign Info</th>
                            <th className="py-3 px-6">Platform</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6">Posts (Pub/Tot)</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading social campaigns...
                                </td>
                            </tr>
                        ) : campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-500">
                                    No active social campaigns found.
                                </td>
                            </tr>
                        ) : campaigns.map((campaign) => {
                            const total = campaign.posts_scheduled || 3;
                            const published = campaign.metrics?.published || 0;
                            const progress = Math.min(100, Math.round((published / total) * 100));

                            return (
                                <tr key={campaign.campaign_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{campaign.name}</span>
                                            <span className="text-slate-500 text-xs mt-0.5">{campaign.description}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-slate-600 font-medium capitalize">
                                            {campaign.platform === 'facebook' ? <Facebook className="w-4 h-4 text-blue-600" /> : <Instagram className="w-4 h-4 text-pink-600" />}
                                            {campaign.platform}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${campaign.status === 'running' ? 'bg-emerald-100 text-emerald-700' :
                                                campaign.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                                                    campaign.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                                                        'bg-rose-100 text-rose-700'
                                            }`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1 w-full max-w-[120px]">
                                            <div className="flex items-center justify-between text-xs text-slate-600 mb-0.5">
                                                <span>{published} / {total}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${campaign.platform === 'facebook' ? 'bg-blue-500' : 'bg-pink-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end gap-2">
                                            {campaign.status === 'running' && (
                                                <button
                                                    onClick={() => pauseMutation.mutate(campaign.campaign_id)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                    title="Pause"
                                                >
                                                    <Pause className="w-4 h-4 fill-current" />
                                                </button>
                                            )}
                                            {campaign.status === 'paused' && (
                                                <button
                                                    onClick={() => resumeMutation.mutate(campaign.campaign_id)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                                    title="Resume"
                                                >
                                                    <Play className="w-4 h-4 fill-current" />
                                                </button>
                                            )}
                                            {campaign.status !== 'completed' && campaign.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => cancelMutation.mutate(campaign.campaign_id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                    title="Cancel"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
