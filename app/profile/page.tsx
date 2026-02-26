'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateUser } from '../../lib/api';
import { UserCircle, Mail, Key, Shield } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setFormData({ username: userData.username, email: userData.email, password: '' });
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            await updateUser(user.id, formData);
            const updatedUser = { ...user, username: formData.username, email: formData.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            console.error('Failed to update profile', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold gradient-text mb-8">My Profile</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="glass-card p-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
                                <span className="text-3xl font-bold text-white uppercase">{user.username.charAt(0)}</span>
                            </div>
                            <h2 className="text-xl font-bold text-theme-primary mb-1">{user.username}</h2>
                            <p className="text-theme-secondary text-sm mb-4">{user.email}</p>
                            <div className="badge badge-info px-4 py-2">
                                {user.role || 'User'}
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-8 animate-slide-up">
                            <div className="flex items-center gap-3 mb-6">
                                <UserCircle className="w-6 h-6 text-primary-400" />
                                <h2 className="text-xl font-bold text-theme-primary">Edit Details</h2>
                            </div>

                            {message && (
                                <div className={`p-4 mb-6 rounded-lg border ${message.type === 'success'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                    } animate-fade-in`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-theme-primary mb-2">Username</label>
                                        <div className="search-wrapper">
                                            <UserCircle className="search-icon text-gray-500" />
                                            <input
                                                type="text"
                                                required
                                                className="input-field search-input opacity-70 cursor-not-allowed"
                                                value={formData.username}
                                                readOnly
                                                title="Username cannot be changed"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-theme-primary mb-2">Email</label>
                                        <div className="search-wrapper">
                                            <Mail className="search-icon" />
                                            <input
                                                type="email"
                                                required
                                                className="input-field search-input"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-theme-primary mb-2">
                                        New Password <span className="text-theme-secondary text-xs font-normal">(Leave blank to keep current)</span>
                                    </label>
                                    <div className="search-wrapper">
                                        <Key className="search-icon" />
                                        <input
                                            type="password"
                                            className="input-field search-input"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-theme-primary mb-2">Role</label>
                                    <div className="search-wrapper">
                                        <Shield className="search-icon text-gray-500" />
                                        <div className="input-field search-input flex items-center opacity-70 cursor-not-allowed">
                                            {user.role || 'User'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
