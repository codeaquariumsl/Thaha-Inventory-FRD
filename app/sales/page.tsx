'use client';

import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import {
    FileText,
    Truck,
    Receipt,
    RotateCcw,
    Wallet,
    Users
} from 'lucide-react';

// Import tab components
import SalesOrdersTab from '@/components/sales/SalesOrdersTab';
import DeliveryOrdersTab from '@/components/sales/DeliveryOrdersTab';
import SalesInvoicesTab from '@/components/sales/SalesInvoicesTab';
import SalesReturnsTab from '@/components/sales/SalesReturnsTab';
import CustomerReceiptsTab from '@/components/sales/CustomerReceiptsTab';
import CustomersTab from '@/components/sales/CustomersTab';

type TabType = 'orders' | 'deliveries' | 'invoices' | 'returns' | 'receipts' | 'customers';

const tabs = [
    { id: 'orders' as TabType, name: 'Sales Orders', icon: FileText },
    { id: 'deliveries' as TabType, name: 'Delivery Orders', icon: Truck },
    { id: 'invoices' as TabType, name: 'Sales Invoices', icon: Receipt },
    { id: 'returns' as TabType, name: 'Sales Returns', icon: RotateCcw },
    { id: 'receipts' as TabType, name: 'Customer Receipts', icon: Wallet },
    { id: 'customers' as TabType, name: 'Customers', icon: Users },
];

export default function SalesPage() {
    const [activeTab, setActiveTab] = useState<TabType>('orders');

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Sales Management</h1>
                    <p className="text-gray-400">Manage orders, deliveries, invoices, returns, and customers</p>
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
                    {activeTab === 'orders' && <SalesOrdersTab />}
                    {activeTab === 'deliveries' && <DeliveryOrdersTab />}
                    {activeTab === 'invoices' && <SalesInvoicesTab />}
                    {activeTab === 'returns' && <SalesReturnsTab />}
                    {activeTab === 'receipts' && <CustomerReceiptsTab />}
                    {activeTab === 'customers' && <CustomersTab />}
                </div>
            </main>
        </div>
    );
}
