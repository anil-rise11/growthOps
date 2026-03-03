import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Table, ArrowUpRight, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { csvService } from '../api/csv';

function PreviewModal({ fileName, onClose }: { fileName: string; onClose: () => void }) {
    const { data, isLoading } = useQuery({
        queryKey: ['csvPreview', fileName],
        queryFn: () => csvService.previewCsv(fileName),
    });

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="font-bold text-slate-900">Preview: {fileName}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="w-4 h-4 text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" />Loading…</div>
                    ) : data ? (
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50">
                                    {data.headers.map(h => <th key={h} className="text-left py-2 px-3 text-slate-500 font-semibold border border-slate-200">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        {data.headers.map(h => <td key={h} className="py-2 px-3 border border-slate-100 text-slate-700">{row[h] ?? ''}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}
                </div>
                {data && (
                    <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
                        Showing {data.rows.length} of {data.row_count} rows
                    </div>
                )}
            </div>
        </div>
    );
}

export function CsvManager() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [previewFile, setPreviewFile] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['csvFiles'],
        queryFn: csvService.listFiles,
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) => csvService.uploadCsv(file),
        onSuccess: (res) => {
            toast.success(`Uploaded "${res.uploaded_file}" — ${res.row_count} rows`);
            if (res.warnings) toast.info(`${res.warnings.message}`);
            queryClient.invalidateQueries({ queryKey: ['csvFiles'] });
        },
        onError: () => toast.error('Upload failed — file must contain an email column'),
    });

    const syncMutation = useMutation({
        mutationFn: (fileName: string) => csvService.syncToHubspot(fileName),
        onSuccess: (res) => toast.success(`Synced: ${res.created} created, ${res.updated} updated, ${res.skipped} skipped`),
        onError: () => toast.error('HubSpot sync failed'),
    });

    const handleFiles = (files: FileList | null) => {
        if (!files?.length) return;
        uploadMutation.mutate(files[0]);
    };

    const files = data?.files ?? [];

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            {previewFile && <PreviewModal fileName={previewFile} onClose={() => setPreviewFile(null)} />}

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CSV Manager</h1>
                <p className="text-sm text-slate-500 mt-1">Upload lead lists and push them directly to HubSpot</p>
            </div>

            {/* Upload zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-6 ${dragging ? 'border-slate-500 bg-slate-50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50'}`}
            >
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={e => handleFiles(e.target.files)} />
                {uploadMutation.isPending ? (
                    <div className="flex flex-col items-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm font-medium">Uploading…</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <Upload className="w-8 h-8 mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">Drop a CSV file here, or click to browse</p>
                        <p className="text-xs mt-1 text-slate-400">Must contain an <code className="bg-slate-100 px-1 rounded">email</code> column</p>
                    </div>
                )}
            </div>

            {/* File list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" />Loading files…</div>
            ) : files.length === 0 ? (
                <div className="clean-panel p-8 text-center text-slate-400 text-sm">No files yet. Upload your first CSV above.</div>
            ) : (
                <div className="clean-panel overflow-hidden bg-white">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-5">File</th>
                                <th className="py-3 px-5">Rows</th>
                                <th className="py-3 px-5">Columns</th>
                                <th className="py-3 px-5">Uploaded</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {files.map(file => (
                                <tr key={file.file_name} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 px-5 font-semibold text-slate-800">{file.file_name}</td>
                                    <td className="py-3.5 px-5 text-slate-600">{file.row_count.toLocaleString()}</td>
                                    <td className="py-3.5 px-5">
                                        <div className="flex flex-wrap gap-1">
                                            {file.headers.slice(0, 4).map(h => (
                                                <span key={h} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono">{h}</span>
                                            ))}
                                            {file.headers.length > 4 && <span className="text-xs text-slate-400">+{file.headers.length - 4}</span>}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5 text-slate-400 text-xs">
                                        {new Date(file.uploaded_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-3.5 px-5">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setPreviewFile(file.file_name)}
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                                            >
                                                <Table className="w-3.5 h-3.5" /> Preview
                                            </button>
                                            <button
                                                onClick={() => syncMutation.mutate(file.file_name)}
                                                disabled={syncMutation.isPending}
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                                            >
                                                <ArrowUpRight className="w-3.5 h-3.5" /> Sync to HubSpot
                                            </button>
                                        </div>
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
