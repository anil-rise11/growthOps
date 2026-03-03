import { Bell, Search, Settings } from 'lucide-react';

export function TopNav() {
    return (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
            <div className="flex items-center bg-slate-100 rounded-md px-3 py-1.5 focus-within:ring-2 ring-slate-200 transition-shadow">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-500 w-64"
                />
            </div>

            <div className="flex items-center gap-3">
                <button className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                    <Bell className="w-5 h-5 stroke-[1.5px]" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                    <Settings className="w-5 h-5 stroke-[1.5px]" />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-200 ml-2 cursor-pointer border border-slate-300"></div>
            </div>
        </header>
    );
}
