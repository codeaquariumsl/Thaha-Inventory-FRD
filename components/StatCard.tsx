'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
}

export default function StatCard({ title, value, change, icon, trend }: StatCardProps) {
    const isPositive = trend === 'up';

    return (
        <div className="stat-card animate-slide-up">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-400 font-medium mb-2">{title}</p>
                    <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{Math.abs(change)}%</span>
                            <span className="text-gray-500 font-normal">vs last month</span>
                        </div>
                    )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}
