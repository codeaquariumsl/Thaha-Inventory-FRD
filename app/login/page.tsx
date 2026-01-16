'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/api';
import { Package } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await login({ username, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/');
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 space-y-8 animate-scale-in">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
                    <p className="text-theme-secondary">Sign in to access your inventory</p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg animate-fade-in">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-primary mb-1.5">Username</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-primary mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
