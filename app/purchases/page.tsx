'use client';

import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { ShoppingBag, Users as UsersIcon } from 'lucide-react';
import PurchaseOrdersTab from '@/components/purchases/PurchaseOrdersTab';
import SuppliersTab from '@/components/purchases/SuppliersTab';

type TabType = 'orders' | 'suppliers';

const tabs = [
    { id: 'orders' as TabType, name: 'Purchase Orders', icon: ShoppingBag },
    { id: 'suppliers' as TabType, name: 'Suppliers', icon: UsersIcon },
];

export default function PurchasesPage() {
    const [activeTab, setActiveTab] = useState<TabType>('orders');

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Purchases</h1>
                    <p className="text-gray-400">Manage purchase orders and supplier relationships</p>
                </div>

                {/* Tabs */}
                <div className="glass-card p-2 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium
                                        ${isActive
                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in">
                    {activeTab === 'orders' && <PurchaseOrdersTab />}
                    {activeTab === 'suppliers' && <SuppliersTab />}
                </div>
            </main>
        </div>
    );
}
