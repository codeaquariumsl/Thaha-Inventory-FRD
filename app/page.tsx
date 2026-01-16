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
// import { products, sales, purchases } from '@/data/mockData';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import * as api from '@/lib/api';
import { Product, SalesOrder, Purchase } from '@/types';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<SalesOrder[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            const [prodData, salesData, purchData] = await Promise.all([
                api.getProducts(),
                api.getSalesOrders(),
                api.getPurchaseOrders()
            ]);

            setProducts(prodData.map((p: any) => ({
                ...p,
                price: parseFloat(p.price) || 0,
                cost: parseFloat(p.cost) || 0,
                stock: parseInt(p.stockQuantity) || 0,
                reorderLevel: parseInt(p.reorderLevel) || 0,
                category: p.Category ? p.Category.name : 'Uncategorized',
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt)
            })));

            setSales(salesData.map((s: any) => ({
                ...s,
                createdAt: new Date(s.createdAt),
                items: s.items || []
            })));

            setPurchases(purchData.map((p: any) => ({
                ...p,
                createdAt: new Date(p.createdAt),
            })));

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        }
    };

    // Calculate dashboard statistics
    const stats = useMemo(() => {
        const totalRevenue = sales
            .filter(s => s.status === 'Completed' || s.status === 'Confirmed') // Adjusted logic
            .reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);

        const totalSalesCount = sales.filter(s => s.status === 'Completed' || s.status === 'Confirmed').length;

        const totalPurchases = purchases
            .filter(p => p.status === 'received' || p.status === 'pending')
            .reduce((sum, purchase) => sum + (purchase.total || 0), 0);

        const lowStockItems = products.filter(p => p.stock <= p.reorderLevel).length;

        return {
            totalRevenue,
            totalSalesCount,
            totalPurchases,
            lowStockItems,
        };
    }, [sales, purchases, products]);

    // Get recent sales
    const recentSales = useMemo(() => {
        return [...sales]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);
    }, [sales]);

    // Get low stock products
    const lowStockProducts = useMemo(() => {
        return products
            .filter(p => p.stock <= p.reorderLevel)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5);
    }, [products]);

    // Get top selling products
    const topProducts = useMemo(() => {
        const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

        sales.forEach(sale => {
            if (sale.status === 'Completed' || sale.status === 'Confirmed') {
                sale.items.forEach(item => {
                    const existing = productSales.get(item.productId) || {
                        name: item.productName,
                        quantity: 0,
                        revenue: 0
                    };
                    productSales.set(item.productId, {
                        name: item.productName,
                        quantity: existing.quantity + item.quantity,
                        revenue: existing.revenue + parseFloat(item.total || "0"),
                    });
                });
            }
        });

        return Array.from(productSales.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [sales]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-theme-primary mb-2">Dashboard</h1>
                    <p className="text-theme-secondary">Welcome back! Here&apos;s what&apos;s happening with your inventory.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Revenue"
                        value={`LKR ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                        value={`LKR ${stats.totalPurchases.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                            <h2 className="text-xl font-bold text-theme-primary">Recent Sales</h2>
                            <ShoppingCart className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="space-y-4">
                            {recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-semibold text-theme-primary">{sale.Customer.name || sale.id}</p>
                                        <p className="text-sm text-theme-secondary">{sale.orderNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-theme-primary">LKR {(sale.total || 0)}</p>
                                        <span className={`badge ${sale.status === 'Completed' ? 'badge-success' :
                                            (sale.status === 'Draft' || sale.status === 'Confirmed' || sale.status === 'Processing') ? 'badge-warning' : 'badge-danger'
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
                            <h2 className="text-xl font-bold text-theme-primary">Top Selling Products</h2>
                            <TrendingUp className="w-5 h-5 text-accent-400" />
                        </div>
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-theme-primary">{product.name}</p>
                                        <p className="text-sm text-theme-secondary">{product.quantity} units sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-theme-primary">LKR {product.revenue.toFixed(2)}</p>
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
                        <h2 className="text-xl font-bold text-theme-primary">Low Stock Alert</h2>
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
