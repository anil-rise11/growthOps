import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Users, Briefcase, StickyNote, GitBranch, RefreshCw, Loader2, Plus, Edit2, Trash2, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { hubspotService, type HubSpotContact, type HubSpotDeal, type HubSpotNote, type HubSpotPipeline } from '../api/hubspot';

type TabType = 'contacts' | 'deals' | 'notes' | 'pipelines';

// ── Status Icons ─────────────────────────────────────────────────────────────
const SYNC_STATUS_ICONS: Record<string, React.ReactNode> = {
    synced: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    syncing: <Clock className="w-4 h-4 text-amber-500" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500" />,
};

// ── Contact Modal ────────────────────────────────────────────────────────────
function ContactModal({ contact, onClose }: { contact?: HubSpotContact; onClose: () => void }) {
    const queryClient = useQueryClient();
    const isEdit = !!contact;
    const [formData, setFormData] = useState({
        email: contact?.email || '',
        firstname: contact?.firstname || '',
        lastname: contact?.lastname || '',
        company: contact?.company || '',
        phone: contact?.phone || '',
    });

    const mutation = useMutation({
        mutationFn: () => isEdit
            ? hubspotService.updateContact(contact!.contact_id, { properties: formData })
            : hubspotService.createContact({ properties: formData }),
        onSuccess: () => {
            toast.success(isEdit ? 'Contact updated' : 'Contact created');
            queryClient.invalidateQueries({ queryKey: ['hubspotContacts'] });
            onClose();
        },
        onError: () => toast.error(`Failed to ${isEdit ? 'update' : 'create'} contact`),
    });

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit' : 'New'} Contact</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                            <input
                                value={formData.firstname}
                                onChange={e => setFormData({ ...formData, firstname: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                            <input
                                value={formData.lastname}
                                onChange={e => setFormData({ ...formData, lastname: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Company</label>
                        <input
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !formData.email}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEdit ? 'Update' : 'Create'} Contact
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Deal Modal ───────────────────────────────────────────────────────────────
function DealModal({ deal, onClose }: { deal?: HubSpotDeal; onClose: () => void }) {
    const queryClient = useQueryClient();
    const isEdit = !!deal;
    const [formData, setFormData] = useState({
        dealname: deal?.dealname || '',
        amount: deal?.amount?.toString() || '',
        dealstage: deal?.dealstage || '',
    });

    const mutation = useMutation({
        mutationFn: () => isEdit
            ? hubspotService.updateDeal(deal!.deal_id, { properties: { dealname: formData.dealname, amount: formData.amount, dealstage: formData.dealstage } })
            : hubspotService.createDeal({ properties: { dealname: formData.dealname, amount: formData.amount, dealstage: formData.dealstage } }),
        onSuccess: () => {
            toast.success(isEdit ? 'Deal updated' : 'Deal created');
            queryClient.invalidateQueries({ queryKey: ['hubspotDeals'] });
            onClose();
        },
        onError: () => toast.error(`Failed to ${isEdit ? 'update' : 'create'} deal`),
    });

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit' : 'New'} Deal</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Deal Name *</label>
                        <input
                            value={formData.dealname}
                            onChange={e => setFormData({ ...formData, dealname: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Amount</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Stage</label>
                        <input
                            value={formData.dealstage}
                            onChange={e => setFormData({ ...formData, dealstage: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !formData.dealname}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEdit ? 'Update' : 'Create'} Deal
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function HubSpotManager() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('contacts');
    const [showContactModal, setShowContactModal] = useState(false);
    const [showDealModal, setShowDealModal] = useState(false);
    const [editingContact, setEditingContact] = useState<HubSpotContact | undefined>();
    const [editingDeal, setEditingDeal] = useState<HubSpotDeal | undefined>();

    const { data: syncStatus, isLoading: statusLoading } = useQuery({
        queryKey: ['hubspotSyncStatus'],
        queryFn: () => hubspotService.getSyncStatus(),
        refetchInterval: 30000,
    });

    const { data: contactsData, isLoading: contactsLoading } = useQuery({
        queryKey: ['hubspotContacts'],
        queryFn: () => hubspotService.getContacts(),
        enabled: activeTab === 'contacts',
    });

    const { data: dealsData, isLoading: dealsLoading } = useQuery({
        queryKey: ['hubspotDeals'],
        queryFn: () => hubspotService.getDeals(),
        enabled: activeTab === 'deals',
    });

    const { data: notesData, isLoading: notesLoading } = useQuery({
        queryKey: ['hubspotNotes'],
        queryFn: () => hubspotService.getNotes(),
        enabled: activeTab === 'notes',
    });

    const { data: pipelinesData, isLoading: pipelinesLoading } = useQuery({
        queryKey: ['hubspotPipelines'],
        queryFn: () => hubspotService.getPipelines(),
        enabled: activeTab === 'pipelines',
    });

    const syncMutation = useMutation({
        mutationFn: () => hubspotService.sync(),
        onSuccess: () => {
            toast.success('Sync started');
            queryClient.invalidateQueries({ queryKey: ['hubspotSyncStatus'] });
        },
        onError: () => toast.error('Failed to start sync'),
    });

    const deleteContactMutation = useMutation({
        mutationFn: (id: string) => hubspotService.deleteContact(id),
        onSuccess: () => {
            toast.success('Contact deleted');
            queryClient.invalidateQueries({ queryKey: ['hubspotContacts'] });
        },
        onError: () => toast.error('Failed to delete contact'),
    });

    const deleteDealMutation = useMutation({
        mutationFn: (id: string) => hubspotService.deleteDeal(id),
        onSuccess: () => {
            toast.success('Deal deleted');
            queryClient.invalidateQueries({ queryKey: ['hubspotDeals'] });
        },
        onError: () => toast.error('Failed to delete deal'),
    });

    const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'deals', label: 'Deals', icon: Briefcase },
        { id: 'notes', label: 'Notes', icon: StickyNote },
        { id: 'pipelines', label: 'Pipelines', icon: GitBranch },
    ];

    const handleEditContact = (contact: HubSpotContact) => {
        setEditingContact(contact);
        setShowContactModal(true);
    };

    const handleEditDeal = (deal: HubSpotDeal) => {
        setEditingDeal(deal);
        setShowDealModal(true);
    };

    const handleNewContact = () => {
        setEditingContact(undefined);
        setShowContactModal(true);
    };

    const handleNewDeal = () => {
        setEditingDeal(undefined);
        setShowDealModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HubSpot Manager</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage CRM contacts, deals, and pipelines</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Sync Status */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                        {statusLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : (
                            SYNC_STATUS_ICONS[syncStatus?.status || 'error']
                        )}
                        <span className="text-slate-600 capitalize">{syncStatus?.status || 'Unknown'}</span>
                        {syncStatus?.last_synced_at && (
                            <span className="text-slate-400">
                                · {new Date(syncStatus.last_synced_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => syncMutation.mutate()}
                        disabled={syncMutation.isPending}
                        className="clean-button btn-secondary flex items-center gap-2"
                    >
                        {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Sync Now
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="clean-panel overflow-hidden">
                {/* Tab Header with Actions */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        {activeTab === 'contacts' && <><Users className="w-4 h-4 text-orange-500" /> Contacts ({contactsData?.total ?? 0})</>}
                        {activeTab === 'deals' && <><Briefcase className="w-4 h-4 text-emerald-500" /> Deals ({dealsData?.total ?? 0})</>}
                        {activeTab === 'notes' && <><StickyNote className="w-4 h-4 text-amber-500" /> Notes ({notesData?.total ?? 0})</>}
                        {activeTab === 'pipelines' && <><GitBranch className="w-4 h-4 text-purple-500" /> Pipelines ({(pipelinesData?.pipelines ?? []).length})</>}
                    </h2>
                    {(activeTab === 'contacts' || activeTab === 'deals') && (
                        <button
                            onClick={activeTab === 'contacts' ? handleNewContact : handleNewDeal}
                            className="clean-button btn-primary text-xs flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> New {activeTab === 'contacts' ? 'Contact' : 'Deal'}
                        </button>
                    )}
                </div>

                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                    <div className="overflow-x-auto">
                        {contactsLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="py-3 px-6">Name</th>
                                        <th className="py-3 px-6">Email</th>
                                        <th className="py-3 px-6">Company</th>
                                        <th className="py-3 px-6">Phone</th>
                                        <th className="py-3 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {(contactsData?.contacts ?? []).map((contact) => (
                                        <tr key={contact.contact_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-6">
                                                <span className="font-medium text-slate-900">
                                                    {contact.firstname} {contact.lastname}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="text-slate-600">{contact.email}</span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="text-slate-600">{contact.company || '—'}</span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="text-slate-600">{contact.phone || '—'}</span>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditContact(contact)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteContactMutation.mutate(contact.contact_id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Deals Tab */}
                {activeTab === 'deals' && (
                    <div className="overflow-x-auto">
                        {dealsLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="py-3 px-6">Deal Name</th>
                                        <th className="py-3 px-6">Amount</th>
                                        <th className="py-3 px-6">Stage</th>
                                        <th className="py-3 px-6">Pipeline</th>
                                        <th className="py-3 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {(dealsData?.deals ?? []).map((deal) => (
                                        <tr key={deal.deal_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-6">
                                                <span className="font-medium text-slate-900">{deal.dealname}</span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="text-slate-900 font-semibold">
                                                    ${deal.amount?.toLocaleString() || '0'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="text-slate-600">{deal.dealstage || '—'}</span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="text-slate-600">{deal.pipeline || '—'}</span>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditDeal(deal)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteDealMutation.mutate(deal.deal_id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="p-6">
                        {notesLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : (notesData?.notes ?? []).length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                <StickyNote className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>No notes found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(notesData?.notes ?? []).map((note) => (
                                    <div key={note.note_id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs font-mono text-slate-500">Contact: {note.contact_id}</span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(note.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700">{note.note_body}</p>
                                        {note.created_by && (
                                            <p className="text-xs text-slate-500 mt-2">By: {note.created_by}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pipelines Tab */}
                {activeTab === 'pipelines' && (
                    <div className="p-6">
                        {pipelinesLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : (pipelinesData?.pipelines ?? []).length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                <GitBranch className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>No pipelines found</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {(pipelinesData?.pipelines ?? []).map((pipeline) => (
                                    <div key={pipeline.pipeline_id} className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                            <h3 className="font-semibold text-slate-900">{pipeline.label}</h3>
                                            <span className="text-xs text-slate-500 font-mono">{pipeline.pipeline_id}</span>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {(pipeline.stages ?? []).map((stage) => (
                                                    <div
                                                        key={stage.stage_id}
                                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                    >
                                                        <span className="font-medium text-slate-700">{stage.label}</span>
                                                        <span className="text-xs text-slate-400 ml-2">#{stage.display_order}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showContactModal && (
                <ContactModal contact={editingContact} onClose={() => setShowContactModal(false)} />
            )}
            {showDealModal && (
                <DealModal deal={editingDeal} onClose={() => setShowDealModal(false)} />
            )}
        </div>
    );
}
