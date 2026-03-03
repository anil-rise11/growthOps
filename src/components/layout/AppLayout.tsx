import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppLayout() {
    return (
        <div className="flex min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-main)]">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col relative">
                <TopNav />
                <main className="flex-1 p-8 z-0 overflow-y-auto w-full relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
