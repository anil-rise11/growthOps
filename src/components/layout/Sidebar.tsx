import { NavLink } from 'react-router-dom';
import {
    Home, Play, CheckSquare, Users, Mail, Share2, Plug, FileSpreadsheet,
    Target, MessageSquare, ScrollText, DollarSign, GitBranch, Database,
    Webhook, Bot, Brain, BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { workflowService } from '../../api/workflows';
import type { WorkflowRun } from '../../api/types';

const navSections = [
    {
        label: 'Agent',
        items: [
            { name: 'Overview', icon: Home, path: '/' },
            { name: 'Workflows', icon: Play, path: '/workflows' },
            { name: 'Approvals', icon: CheckSquare, path: '/approvals' },
            { name: 'Autonomous', icon: Bot, path: '/autonomous' },
        ],
    },
    {
        label: 'Marketing',
        items: [
            { name: 'Leads', icon: Users, path: '/leads' },
            { name: 'Email Campaigns', icon: Mail, path: '/campaigns/email' },
            { name: 'Email Sequences', icon: GitBranch, path: '/sequences' },
            { name: 'Social Media', icon: Share2, path: '/campaigns/social' },
            //            { name: 'Ads Dashboard', icon: Target, path: '/ads' },
            { name: 'WhatsApp', icon: MessageSquare, path: '/whatsapp' },
        ],
    },
    {
        label: 'CRM & Data',
        items: [
            { name: 'HubSpot', icon: Database, path: '/hubspot' },
            { name: 'CSV Manager', icon: FileSpreadsheet, path: '/csv' },
            { name: 'Integrations', icon: Plug, path: '/integrations' },
            { name: 'Webhooks', icon: Webhook, path: '/webhooks' },
        ],
    },
    {
        label: 'Analytics',
        items: [
            { name: 'Revenue', icon: DollarSign, path: '/revenue' },
            { name: 'Performance', icon: Brain, path: '/performance' },
            { name: 'Audit Log', icon: ScrollText, path: '/audit' },
        ],
    },
];

export function Sidebar() {
    const { data: runs = [] } = useQuery({
        queryKey: ['workflows'],
        queryFn: () => workflowService.getRuns(),
        refetchInterval: 10000,
        staleTime: 5000,
    });

    const isRunning = (runs as WorkflowRun[]).some(r => r.status === 'running');

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col p-4 fixed left-0 top-0 z-20">
            <div className="flex items-center gap-2 mb-8 px-2 mt-4 cursor-pointer">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AO</span>
                </div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    AgentaOps
                </h1>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto">
                {navSections.map(section => (
                    <div key={section.label}>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">{section.label}</div>
                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                            ? 'bg-slate-100 text-slate-900'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        }`
                                    }
                                >
                                    <item.icon className="w-4 h-4" strokeWidth={2} />
                                    <span className="flex-1">{item.name}</span>
                                    {/* Running indicator on Workflows item */}
                                    {item.name === 'Workflows' && isRunning && (
                                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse flex-shrink-0" title="Workflow running" />
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="mt-auto px-2">
                <div className="flex items-center gap-2 p-2 rounded-md text-sm">
                    {isRunning ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse flex-shrink-0" />
                            <span className="text-sky-600 font-medium">Agent Running…</span>
                        </>
                    ) : (
                        <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600 font-medium">System Operational</span>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
