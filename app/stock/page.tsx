'use client';

import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Plus, Package, AlertTriangle } from 'lucide-react';
// import { stockMovements as initialMovements, products } from '@/data/mockData';
import { StockMovement, Product } from '@/types';
import * as api from '@/lib/api';

export default function StockPage() {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const [user, setUser] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        productId: '',
        type: 'in' as 'in' | 'out' | 'adjustment',
        quantity: '',
        reference: '',
        reason: '',
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [movementsData, productsData] = await Promise.all([
                api.getStockMovements(),
                api.getProducts()
            ]);
            setMovements(movementsData.map((m: any) => ({
                ...m,
                productName: m.Product ? m.Product.name : 'Unknown Product',
                type: m.movementType === 'IN' ? 'in' : m.movementType === 'OUT' ? 'out' : 'adjustment',
                createdAt: new Date(m.createdAt),
                createdBy: m.User ? m.User.username : 'Unknown User'
            })));
            setProducts(productsData.map((p: any) => ({
                ...p,
                price: parseFloat(p.price) || 0,
                cost: parseFloat(p.cost) || 0,
                stock: parseInt(p.stockQuantity) || 0,
                reorderLevel: parseInt(p.reorderLevel) || 0,
                category: p.Category ? p.Category.name : 'Uncategorized',
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt)
            })));
        } catch (error) {
            console.error("Failed to load stock data", error);
        }
    };

    // Filter movements
    const filteredMovements = useMemo(() => {
        return movements.filter(movement => {
            const matchesSearch = movement.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movement.reference?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || movement.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [movements, searchTerm, typeFilter]);

    // Calculate stock statistics
    const stockStats = useMemo(() => {
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;
        const outOfStockCount = products.filter(p => p.stock === 0).length;
        const stockValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);

        return {
            totalProducts,
            totalStock,
            lowStockCount,
            outOfStockCount,
            stockValue,
        };
    }, [products]);

    const handleOpenModal = () => {
        setFormData({
            productId: '',
            type: 'in',
            quantity: '',
            reference: '',
            reason: '',
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('User not authenticated');
            return;
        }
        const product = products.find(p => Number(p.id) === parseInt(formData.productId));
        if (!product) return;

        const backendType = formData.type === 'in' ? 'IN' : formData.type === 'out' ? 'OUT' : 'ADJ';

        const payload = {
            productId: parseInt(formData.productId),
            movementType: backendType,
            quantity: parseInt(formData.quantity),
            reference: formData.reference,
            reason: formData.reason,
            userId: user.id,
        };
        try {
            await api.createStockMovement(payload);
            loadData();
            handleCloseModal();
        } catch (error: any) {
            alert('Failed to record movement: ' + error.message);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-theme-primary mb-2">Stock Management</h1>
                        <p className="text-theme-secondary">Monitor and manage your inventory levels</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="btn-primary flex items-center gap-2 w-fit"
                    >
                        <Plus className="w-5 h-5" />
                        Record Movement
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-theme-secondary font-medium mb-2">Total Products</p>
                                <h3 className="text-3xl font-bold text-theme-primary">{stockStats.totalProducts}</h3>
                            </div>
                            <Package className="w-8 h-8 text-primary-400" />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-theme-secondary font-medium mb-2">Total Stock</p>
                                <h3 className="text-3xl font-bold text-theme-primary">{stockStats.totalStock}</h3>
                                <p className="text-xs text-theme-secondary">units</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-400" />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-theme-secondary font-medium mb-2">Low Stock Items</p>
                                <h3 className="text-3xl font-bold text-yellow-400">{stockStats.lowStockCount}</h3>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-theme-secondary font-medium mb-2">Stock Value</p>
                                <h3 className="text-3xl font-bold text-theme-primary">
                                    LKR {stockStats.stockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <TrendingUp className="w-8 h-8 text-accent-400" />
                        </div>
                    </div>
                </div>

                {/* Current Stock Levels */}
                <div className="glass-card p-6 mb-6 animate-slide-up">
                    <h2 className="text-xl font-bold text-theme-primary mb-6">Current Stock Levels</h2>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Level</th>
                                    <th>Unit Cost</th>
                                    <th>Stock Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    const stockValue = product.stock * product.cost;
                                    // const stockPercentage = (product.stock / product.reorderLevel) * 100;

                                    return (
                                        <tr key={product.id}>
                                            <td className="font-semibold">{product.name}</td>
                                            <td>{product.sku}</td>
                                            <td>{product.category}</td>
                                            <td>
                                                <span className={`font-bold ${product.stock === 0 ? 'text-red-400' :
                                                    product.stock <= product.reorderLevel ? 'text-yellow-400' : 'text-green-400'
                                                    }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td>{product.reorderLevel}</td>
                                            <td>LKR {product.cost.toFixed(2)}</td>
                                            <td className="font-semibold">LKR {stockValue.toFixed(2)}</td>
                                            <td>
                                                <span className={`badge ${product.stock === 0 ? 'badge-danger' :
                                                    product.stock <= product.reorderLevel / 2 ? 'badge-warning' :
                                                        product.stock <= product.reorderLevel ? 'badge-info' : 'badge-success'
                                                    }`}>
                                                    {product.stock === 0 ? 'Out of Stock' :
                                                        product.stock <= product.reorderLevel / 2 ? 'Critical' :
                                                            product.stock <= product.reorderLevel ? 'Low' : 'In Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock Movements */}
                <div className="glass-card p-6 animate-slide-up">
                    <h2 className="text-xl font-bold text-theme-primary mb-6">Stock Movements</h2>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                            <input
                                type="text"
                                placeholder="Search movements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Types</option>
                            <option value="in">Stock In</option>
                            <option value="out">Stock Out</option>
                            <option value="adjustment">Adjustment</option>
                        </select>
                    </div>

                    {/* Movements Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Reference</th>
                                    <th>Reason</th>
                                    <th>Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMovements.map((movement) => (
                                    <tr key={movement.id}>
                                        <td>{movement.createdAt.toLocaleString()}</td>
                                        <td className="font-semibold">{movement.productName}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {movement.type === 'in' ? (
                                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                                ) : movement.type === 'out' ? (
                                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                                ) : (
                                                    <Package className="w-4 h-4 text-blue-400" />
                                                )}
                                                <span className={`badge ${movement.type === 'in' ? 'badge-success' :
                                                    movement.type === 'out' ? 'badge-danger' : 'badge-info'
                                                    }`}>
                                                    {movement.type === 'in' ? 'Stock In' :
                                                        movement.type === 'out' ? 'Stock Out' : 'Adjustment'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`font-bold ${movement.type === 'in' ? 'text-green-400' :
                                                movement.type === 'out' ? 'text-red-400' : 'text-blue-400'
                                                }`}>
                                                {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
                                                {movement.quantity}
                                            </span>
                                        </td>
                                        <td>{movement.reference}</td>
                                        <td className="text-theme-secondary">{movement.reason}</td>
                                        <td>{movement.createdBy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredMovements.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-theme-secondary mb-2">No movements found</h3>
                            <p className="text-theme-secondary">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>

                {/* Record Movement Modal */}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Record Stock Movement">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">
                                Product *
                            </label>
                            <select
                                required
                                value={formData.productId}
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                className="input-field"
                            >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} (Current Stock: {product.stock})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Movement Type *
                                </label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="input-field"
                                >
                                    <option value="in">Stock In</option>
                                    <option value="out">Stock Out</option>
                                    <option value="adjustment">Adjustment</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2">
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter quantity"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">
                                Reference *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                className="input-field"
                                placeholder="e.g., PUR-2024-001, SAL-2024-001, ADJ-001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">
                                Reason *
                            </label>
                            <textarea
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="input-field"
                                rows={3}
                                placeholder="Enter reason for stock movement"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="btn-primary flex-1">
                                Record Movement
                            </button>
                            <button type="button" onClick={handleCloseModal} className="btn-outline flex-1">
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}
