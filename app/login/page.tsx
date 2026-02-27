'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/api';
import { User, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const data = await login({ username, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="glass-card w-full max-w-[440px] p-10 space-y-8 animate-scale-in border-white/10 shadow-2xl relative overflow-hidden group">
                {/* Subtle light beam effect */}
                <div className="absolute top-0 left-[-100%] w-[200%] h-[500%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 transition-all duration-1000 pointer-events-none group-hover:left-[100%]" />

                <div className="text-center relative">
                    <div className="flex justify-center mb-6">
                        <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-primary-500/20 to-accent-500/20 backdrop-blur-md border border-white/10 shadow-inner">
                            <Image
                                src="/assets/company_logo.jpeg"
                                alt="Company Logo"
                                width={80}
                                height={80}
                                className="rounded-xl shadow-lg object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                        {/* <span className="gradient-text">THAHA</span> */}
                        <span className="text-theme-primary ml-2 uppercase tracking-[0.2em] text-xs block mt-1 font-bold opacity-70">Inventory Management</span>
                    </h1>
                    <p className="text-white/50 text-sm font-medium">Welcome back! Please enter your details.</p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-bold text-white/40 ml-1 uppercase tracking-[0.2em]">Username</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary-500 transition-colors duration-300 pointer-events-none z-10">
                                    <User size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-field !pl-12 h-12 bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.08] border-white/10 focus:border-primary-500 transition-all duration-300 placeholder:text-white/40"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-bold text-white/40 ml-1 uppercase tracking-[0.2em]">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary-500 transition-colors duration-300 pointer-events-none z-10">
                                    <Lock size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="input-field !pl-12 h-12 bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.08] border-white/10 focus:border-primary-500 transition-all duration-300 placeholder:text-white/40"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary-400 transition-colors duration-300 z-10"
                                >
                                    {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" id="remember" className="rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500/20 w-4 h-4" />
                            <label htmlFor="remember" className="text-xs text-white/50 group-hover:text-white/80 transition-colors cursor-pointer">Remember me</label>
                        </div>
                        <button type="button" className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full h-12 flex justify-center items-center gap-2 group overflow-hidden relative"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span className="relative z-10 font-bold tracking-wide">SIGN IN</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </form>

                <div className="pt-2 text-center">
                    <p className="text-xs text-white/40">
                        Don't have an account? <button type="button" className="font-bold text-primary-400/80 hover:text-primary-400 hover:underline">Contact Administrator</button>
                    </p>
                </div>
            </div>

            {/* Subtle Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center space-y-1">
                <div className="text-[10px] uppercase tracking-[0.3em] font-semibold text-white/30">
                    Thaha Inventory Management &copy; 2026
                </div>
                <div className="text-[9px] uppercase tracking-[0.1em] font-medium text-white/20">
                    Product of <span className="text-primary-400/40">Code Aqua Technologies</span>
                </div>
            </div>
        </div>
    );
}
