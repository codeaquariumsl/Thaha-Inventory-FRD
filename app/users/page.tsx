'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import UsersTab from '../../components/users/UsersTab';
import RolesTab from '../../components/roles/RolesTab';

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState('users');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user?.role?.toLowerCase() !== 'admin') {
                router.push('/');
            } else {
                setIsLoading(false);
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center text-theme-secondary">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 animate-fade-in relative z-0">
                <div className="flex items-center gap-4 mb-4 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'users'
                            ? 'text-theme-primary border-b-2 border-primary-500'
                            : 'text-theme-secondary hover:text-theme-primary'
                            }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'roles'
                            ? 'text-theme-primary border-b-2 border-primary-500'
                            : 'text-theme-secondary hover:text-theme-primary'
                            }`}
                    >
                        Role Management
                    </button>
                </div>

                {activeTab === 'users' ? <UsersTab /> : <RolesTab />}
            </main>
        </div>
    );
}
