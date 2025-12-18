'use client';

import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useState, useMemo } from 'react';
import { ShoppingBag, Plus, Search, Eye, Trash2, CheckCircle } from 'lucide-react';
import { purchases as initialPurchases, products } from '@/data/mockData';
import { Purchase, PurchaseItem } from '@/types';

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState(initialPurchases);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        supplier: 'TechSupply Co.',
        supplierEmail: 'contact@techsupply.com',
    });

    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');

    // Filter purchases
    const filteredPurchases = useMemo(() => {
        return purchases.filter(purchase => {
            const matchesSearch = purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [purchases, searchTerm, statusFilter]);

    // Calculate totals
    const calculateTotals = () => {
        const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const handleOpenModal = () => {
        setFormData({
            supplier: 'TechSupply Co.',
            supplierEmail: 'contact@techsupply.com',
        });
        setPurchaseItems([]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSupplierChange = (supplier: string) => {
        const supplierEmails: Record<string, string> = {
            'TechSupply Co.': 'contact@techsupply.com',
            'Fashion Wholesale Inc.': 'orders@fashionwholesale.com',
            'Global Foods Ltd.': 'sales@globalfoods.com',
        };
        setFormData({
            supplier,
            supplierEmail: supplierEmails[supplier] || '',
        });
    };

    const handleAddItem = () => {
        if (!selectedProduct || !quantity) return;

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const qty = parseInt(quantity);
        const existingItem = purchaseItems.find(item => item.productId === selectedProduct);

        if (existingItem) {
            setPurchaseItems(purchaseItems.map(item =>
                item.productId === selectedProduct
                    ? { ...item, quantity: item.quantity + qty, total: (item.quantity + qty) * item.cost }
                    : item
            ));
        } else {
            setPurchaseItems([...purchaseItems, {
                productId: product.id,
                productName: product.name,
                quantity: qty,
                cost: product.cost,
                total: qty * product.cost,
            }]);
        }

        setSelectedProduct('');
        setQuantity('1');
    };

    const handleRemoveItem = (productId: string) => {
        setPurchaseItems(purchaseItems.filter(item => item.productId !== productId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (purchaseItems.length === 0) {
            alert('Please add at least one item to the purchase order');
            return;
        }

        const { subtotal, tax, total } = calculateTotals();

        const newPurchase: Purchase = {
            id: Date.now().toString(),
            purchaseNumber: `PUR-2024-${String(purchases.length + 1).padStart(3, '0')}`,
            supplier: formData.supplier,
            supplierEmail: formData.supplierEmail,
            items: purchaseItems,
            subtotal,
            tax,
            total,
            status: 'pending',
            paymentStatus: 'unpaid',
            createdAt: new Date(),
        };

        setPurchases([newPurchase, ...purchases]);
        handleCloseModal();
    };

    const handleViewPurchase = (purchase: Purchase) => {
        setViewingPurchase(purchase);
        setIsViewModalOpen(true);
    };

    const handleDeletePurchase = (id: string) => {
        if (confirm('Are you sure you want to delete this purchase order?')) {
            setPurchases(purchases.filter(p => p.id !== id));
        }
    };

    const handleReceivePurchase = (id: string) => {
        setPurchases(purchases.map(p =>
            p.id === id
                ? { ...p, status: 'received' as const, receivedAt: new Date() }
                : p
        ));
    };

    const totals = calculateTotals();

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Purchases</h1>
                        <p className="text-gray-400">Manage your purchase orders</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="btn-primary flex items-center gap-2 w-fit"
                    >
                        <Plus className="w-5 h-5" />
                        New Purchase Order
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 font-medium mb-2">Total Orders</p>
                                <h3 className="text-3xl font-bold text-white">{purchases.length}</h3>
                            </div>
                            <ShoppingBag className="w-8 h-8 text-primary-400" />
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 font-medium mb-2">Received</p>
                                <h3 className="text-3xl font-bold text-green-400">
                                    {purchases.filter(p => p.status === 'received').length}
                                </h3>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 font-medium mb-2">Total Spent</p>
                                <h3 className="text-3xl font-bold text-white">
                                    ${purchases.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                                </h3>
                            </div>
                            <ShoppingBag className="w-8 h-8 text-accent-400" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search purchases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Purchases Table */}
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Purchase Number</th>
                                <th>Supplier</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment Status</th>
                                <th>Order Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPurchases.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td className="font-semibold">{purchase.purchaseNumber}</td>
                                    <td>
                                        <div>
                                            <p className="font-medium">{purchase.supplier}</p>
                                            <p className="text-xs text-gray-400">{purchase.supplierEmail}</p>
                                        </div>
                                    </td>
                                    <td>{purchase.items.length} items</td>
                                    <td className="font-bold">${purchase.total.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${purchase.paymentStatus === 'paid' ? 'badge-success' :
                                                purchase.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'
                                            }`}>
                                            {purchase.paymentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${purchase.status === 'received' ? 'badge-success' :
                                                purchase.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                            }`}>
                                            {purchase.status}
                                        </span>
                                    </td>
                                    <td>{purchase.createdAt.toLocaleDateString()}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewPurchase(purchase)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4 text-primary-400" />
                                            </button>
                                            {purchase.status === 'pending' && (
                                                <button
                                                    onClick={() => handleReceivePurchase(purchase.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Mark as Received"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeletePurchase(purchase.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* New Purchase Modal */}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Purchase Order">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Supplier Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Supplier *
                                </label>
                                <select
                                    required
                                    value={formData.supplier}
                                    onChange={(e) => handleSupplierChange(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="TechSupply Co.">TechSupply Co.</option>
                                    <option value="Fashion Wholesale Inc.">Fashion Wholesale Inc.</option>
                                    <option value="Global Foods Ltd.">Global Foods Ltd.</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Supplier Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.supplierEmail}
                                    onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                                    className="input-field"
                                    placeholder="supplier@email.com"
                                />
                            </div>
                        </div>

                        {/* Add Items */}
                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Add Items</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - Cost: ${product.cost.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="input-field"
                                        placeholder="Qty"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="btn-primary whitespace-nowrap"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Items List */}
                            {purchaseItems.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {purchaseItems.map((item) => (
                                        <div key={item.productId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-white">{item.productName}</p>
                                                <p className="text-sm text-gray-400">
                                                    {item.quantity} × ${item.cost.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-bold text-white">${item.total.toFixed(2)}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        {purchaseItems.length > 0 && (
                            <div className="bg-white/5 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal:</span>
                                    <span>${totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Tax (10%):</span>
                                    <span>${totals.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-white border-t border-white/10 pt-2">
                                    <span>Total:</span>
                                    <span>${totals.total.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="btn-primary flex-1">
                                Create Purchase Order
                            </button>
                            <button type="button" onClick={handleCloseModal} className="btn-outline flex-1">
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* View Purchase Modal */}
                <Modal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Purchase Order Details"
                >
                    {viewingPurchase && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400">Purchase Number</p>
                                    <p className="font-semibold text-white">{viewingPurchase.purchaseNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Date</p>
                                    <p className="font-semibold text-white">{viewingPurchase.createdAt.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Supplier</p>
                                    <p className="font-semibold text-white">{viewingPurchase.supplier}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Status</p>
                                    <span className={`badge ${viewingPurchase.status === 'received' ? 'badge-success' :
                                            viewingPurchase.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {viewingPurchase.status}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
                                <div className="space-y-2">
                                    {viewingPurchase.items.map((item, index) => (
                                        <div key={index} className="flex justify-between p-3 bg-white/5 rounded-lg">
                                            <div>
                                                <p className="font-medium text-white">{item.productName}</p>
                                                <p className="text-sm text-gray-400">
                                                    {item.quantity} × ${item.cost.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="font-bold text-white">${item.total.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal:</span>
                                    <span>${viewingPurchase.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Tax:</span>
                                    <span>${viewingPurchase.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-white border-t border-white/10 pt-2">
                                    <span>Total:</span>
                                    <span>${viewingPurchase.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </main>
        </div>
    );
}
