'use client';

import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import {
    DollarSign,
    ShoppingCart,
    ShoppingBag,
    AlertTriangle,
    TrendingUp,
    Package
} from 'lucide-react';
import { products, sales, purchases } from '@/data/mockData';
import { useMemo } from 'react';

export default function Home() {
    // Calculate dashboard statistics
    const stats = useMemo(() => {
        const totalRevenue = sales
            .filter(s => s.status === 'completed')
            .reduce((sum, sale) => sum + sale.total, 0);

        const totalSalesCount = sales.filter(s => s.status === 'completed').length;

        const totalPurchases = purchases
            .reduce((sum, purchase) => sum + purchase.total, 0);

        const lowStockItems = products.filter(p => p.stock <= p.reorderLevel).length;

        return {
            totalRevenue,
            totalSalesCount,
            totalPurchases,
            lowStockItems,
        };
    }, []);

    // Get recent sales
    const recentSales = useMemo(() => {
        return [...sales]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);
    }, []);

    // Get low stock products
    const lowStockProducts = useMemo(() => {
        return products
            .filter(p => p.stock <= p.reorderLevel)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5);
    }, []);

    // Get top selling products
    const topProducts = useMemo(() => {
        const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

        sales.forEach(sale => {
            if (sale.status === 'completed') {
                sale.items.forEach(item => {
                    const existing = productSales.get(item.productId) || {
                        name: item.productName,
                        quantity: 0,
                        revenue: 0
                    };
                    productSales.set(item.productId, {
                        name: item.productName,
                        quantity: existing.quantity + item.quantity,
                        revenue: existing.revenue + item.total,
                    });
                });
            }
        });

        return Array.from(productSales.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, []);

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-gray-400">Welcome back! Here's what's happening with your inventory.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        change={12.5}
                        trend="up"
                        icon={<DollarSign className="w-6 h-6 text-primary-400" />}
                    />
                    <StatCard
                        title="Total Sales"
                        value={stats.totalSalesCount}
                        change={8.2}
                        trend="up"
                        icon={<ShoppingCart className="w-6 h-6 text-accent-400" />}
                    />
                    <StatCard
                        title="Total Purchases"
                        value={`$${stats.totalPurchases.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        change={-3.1}
                        trend="down"
                        icon={<ShoppingBag className="w-6 h-6 text-primary-400" />}
                    />
                    <StatCard
                        title="Low Stock Items"
                        value={stats.lowStockItems}
                        icon={<AlertTriangle className="w-6 h-6 text-yellow-400" />}
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Sales */}
                    <div className="glass-card p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Recent Sales</h2>
                            <ShoppingCart className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="space-y-4">
                            {recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-semibold text-white">{sale.customer}</p>
                                        <p className="text-sm text-gray-400">{sale.saleNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">${sale.total.toFixed(2)}</p>
                                        <span className={`badge ${sale.status === 'completed' ? 'badge-success' :
                                                sale.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                            }`}>
                                            {sale.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    <div className="glass-card p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Top Selling Products</h2>
                            <TrendingUp className="w-5 h-5 text-accent-400" />
                        </div>
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white">{product.name}</p>
                                        <p className="text-sm text-gray-400">{product.quantity} units sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">${product.revenue.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="glass-card p-6 animate-slide-up">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-xl font-bold text-white">Low Stock Alert</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Level</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="font-semibold">{product.name}</td>
                                        <td>{product.sku}</td>
                                        <td>{product.category}</td>
                                        <td>
                                            <span className="font-bold text-yellow-400">{product.stock}</span>
                                        </td>
                                        <td>{product.reorderLevel}</td>
                                        <td>
                                            <span className={`badge ${product.stock === 0 ? 'badge-danger' :
                                                    product.stock < product.reorderLevel / 2 ? 'badge-warning' : 'badge-info'
                                                }`}>
                                                {product.stock === 0 ? 'Out of Stock' :
                                                    product.stock < product.reorderLevel / 2 ? 'Critical' : 'Low'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
