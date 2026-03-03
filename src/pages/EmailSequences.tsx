import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, Play, Pause, Trash2, Loader2, RefreshCw, Edit3, Users, Clock, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { sequencesService, type EmailSequence, type SequenceStep, type Enrollment } from '../api/sequences';

// ── Status Colors ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    paused: 'bg-amber-100 text-amber-700',
    draft: 'bg-slate-100 text-slate-600',
};

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    paused: 'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
    unenrolled: 'bg-slate-100 text-slate-500',
};

// ── New Sequence Modal ───────────────────────────────────────────────────────
function NewSequenceModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState<Omit<SequenceStep, 'step_number'>[]>([
        { delay_days: 0, subject: '', body_template: '' },
    ]);

    const createMutation = useMutation({
        mutationFn: () => sequencesService.createSequence({
            name,
            description,
            steps,
        }),
        onSuccess: () => {
            toast.success('Sequence created successfully!');
            queryClient.invalidateQueries({ queryKey: ['sequences'] });
            onClose();
        },
        onError: () => toast.error('Failed to create sequence'),
    });

    const addStep = () => {
        setSteps([...steps, { delay_days: 1, subject: '', body_template: '' }]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const updateStep = (index: number, field: keyof Omit<SequenceStep, 'step_number'>, value: string | number) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Create Email Sequence</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Sequence Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Welcome Series"
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the purpose of this sequence..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-700">Steps ({steps.length})</label>
                            <button
                                onClick={addStep}
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Step
                            </button>
                        </div>

                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-slate-700">Step {index + 1}</span>
                                        {steps.length > 1 && (
                                            <button
                                                onClick={() => removeStep(index)}
                                                className="text-rose-500 hover:text-rose-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Delay (days)</label>
                                            <input
                                                type="number"
                                                value={step.delay_days}
                                                onChange={e => updateStep(index, 'delay_days', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="block text-xs text-slate-500 mb-1">Subject</label>
                                        <input
                                            value={step.subject}
                                            onChange={e => updateStep(index, 'subject', e.target.value)}
                                            placeholder="Email subject line"
                                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Body Template</label>
                                        <textarea
                                            value={step.body_template}
                                            onChange={e => updateStep(index, 'body_template', e.target.value)}
                                            placeholder="Email body content..."
                                            rows={3}
                                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 ring-slate-300"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending || !name || steps.some(s => !s.subject)}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Sequence
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Enrollment Row Component ─────────────────────────────────────────────────
function EnrollmentRow({ enrollment }: { enrollment: Enrollment }) {
    const queryClient = useQueryClient();
    const [expanded, setExpanded] = useState(false);

    const pauseMutation = useMutation({
        mutationFn: () => sequencesService.pauseEnrollment(enrollment.enrollment_id),
        onSuccess: () => {
            toast.success('Enrollment paused');
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        },
        onError: () => toast.error('Failed to pause enrollment'),
    });

    const resumeMutation = useMutation({
        mutationFn: () => sequencesService.resumeEnrollment(enrollment.enrollment_id),
        onSuccess: () => {
            toast.success('Enrollment resumed');
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        },
        onError: () => toast.error('Failed to resume enrollment'),
    });

    return (
        <>
            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                <td className="py-3 px-4">
                    <span className="font-mono text-xs text-slate-600">{enrollment.enrollment_id.slice(0, 8)}...</span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-900">{enrollment.email}</span>
                </td>
                <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ENROLLMENT_STATUS_COLORS[enrollment.status] || 'bg-slate-100 text-slate-600'}`}>
                        {enrollment.status}
                    </span>
                </td>
                <td className="py-3 px-4 text-center">
                    <span className="text-slate-900 font-medium">{enrollment.current_step}</span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-slate-500 text-sm">
                        {enrollment.next_email_at ? new Date(enrollment.next_email_at).toLocaleDateString() : '—'}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                        {enrollment.status === 'active' ? (
                            <button
                                onClick={() => pauseMutation.mutate()}
                                disabled={pauseMutation.isPending}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                title="Pause"
                            >
                                <Pause className="w-4 h-4" />
                            </button>
                        ) : enrollment.status === 'paused' ? (
                            <button
                                onClick={() => resumeMutation.mutate()}
                                disabled={resumeMutation.isPending}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Resume"
                            >
                                <Play className="w-4 h-4" />
                            </button>
                        ) : null}
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50">
                    <td colSpan={6} className="py-3 px-4">
                        <div className="text-sm text-slate-600 space-y-1">
                            <p><span className="font-medium">Enrolled:</span> {new Date(enrollment.enrolled_at).toLocaleString()}</p>
                            <p><span className="font-medium">Lead ID:</span> <span className="font-mono text-xs">{enrollment.lead_id}</span></p>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Sequence Card Component ──────────────────────────────────────────────────
function SequenceCard({
    sequence,
    onDelete,
}: {
    sequence: EmailSequence;
    onDelete: (id: string) => void;
}) {
    const [showEnrollments, setShowEnrollments] = useState(false);
    const { data: enrollments = [] } = useQuery({
        queryKey: ['enrollments', sequence.sequence_id],
        queryFn: () => sequencesService.getEnrollments({ sequence_id: sequence.sequence_id }),
        enabled: showEnrollments,
    });

    return (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{sequence.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[sequence.status] || 'bg-slate-100 text-slate-600'}`}>
                                {sequence.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">{sequence.description}</p>
                    </div>
                    <button
                        onClick={() => onDelete(sequence.sequence_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{sequence.step_count} steps</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>ID: {sequence.sequence_id.slice(0, 8)}...</span>
                    </div>
                </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                    onClick={() => setShowEnrollments(!showEnrollments)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                    <Users className="w-4 h-4" />
                    {showEnrollments ? 'Hide' : 'View'} Enrollments
                    {enrollments.length > 0 && <span className="text-xs text-slate-400">({enrollments.length})</span>}
                </button>
            </div>

            {showEnrollments && (
                <div className="border-t border-slate-200">
                    {enrollments.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                            No enrollments yet
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                <tr>
                                    <th className="py-2 px-4">ID</th>
                                    <th className="py-2 px-4">Email</th>
                                    <th className="py-2 px-4">Status</th>
                                    <th className="py-2 px-4 text-center">Step</th>
                                    <th className="py-2 px-4">Next Email</th>
                                    <th className="py-2 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((enrollment) => (
                                    <EnrollmentRow key={enrollment.enrollment_id} enrollment={enrollment} />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function EmailSequences() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);

    const { data: sequences = [], isLoading, refetch } = useQuery({
        queryKey: ['sequences'],
        queryFn: () => sequencesService.getSequences(),
        refetchInterval: 30000,
    });

    const deleteMutation = useMutation({
        mutationFn: (sequenceId: string) => sequencesService.deleteSequence(sequenceId),
        onSuccess: () => {
            toast.success('Sequence deleted');
            queryClient.invalidateQueries({ queryKey: ['sequences'] });
        },
        onError: () => toast.error('Failed to delete sequence'),
    });

    const handleDelete = (sequenceId: string) => {
        if (confirm('Are you sure you want to delete this sequence?')) {
            deleteMutation.mutate(sequenceId);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Sequences</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and manage automated email sequences</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetch()}
                        className="clean-button btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="clean-button btn-primary shadow-sm hover:shadow flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Sequence
                    </button>
                </div>
            </div>

            {/* Sequences Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
            ) : sequences.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No sequences yet</h3>
                    <p className="text-slate-500 mb-4">Create your first email sequence to get started</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="clean-button btn-primary"
                    >
                        <Plus className="w-4 h-4 inline mr-2" /> Create Sequence
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sequences.map((sequence) => (
                        <SequenceCard
                            key={sequence.sequence_id}
                            sequence={sequence}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {showModal && <NewSequenceModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
