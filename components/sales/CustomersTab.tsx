'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Modal from '@/components/Modal';
import { Plus, Search, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Customer, Product } from '@/types';
import * as api from '@/lib/api';

export default function CustomersTab() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
        creditLimit: '',
        customerPrices: {} as Record<string, number>,
    });

    const [pricingProductId, setPricingProductId] = useState('');
    const [pricingAmount, setPricingAmount] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [custData, prodData] = await Promise.all([
                api.getCustomers(),
                api.getProducts()
            ]);
            setCustomers(custData.map((c: any) => ({
                ...c,
                id: c.id.toString(),
                creditLimit: parseFloat(c.creditLimit || '0'),
                balance: parseFloat(c.currentBalance || '0'),
                customerPrices: c.customerPrices || {},
                createdAt: new Date(c.createdAt)
            })));
            setProducts(prodData);
        } catch (error) {
            console.error("Failed to load customers", error);
        }
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer: Customer) => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [customers, searchTerm, statusFilter]);

    const handleOpenModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                city: customer.city,
                country: customer.country,
                taxId: customer.taxId || '',
                creditLimit: customer.creditLimit.toString(),
                customerPrices: customer.customerPrices || {},
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: '',
                taxId: '',
                creditLimit: '5000',
                customerPrices: {},
            });
        }
        setPricingProductId('');
        setPricingAmount('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            taxId: formData.taxId || null,
            creditLimit: parseFloat(formData.creditLimit),
            customerPrices: formData.customerPrices,
            // Status and balance handled by defaults or separate logic
        };

        try {
            if (editingCustomer) {
                await api.updateCustomer(editingCustomer.id, payload);
            } else {
                await api.createCustomer(payload);
            }
            loadData();
            setIsModalOpen(false);
        } catch (error: any) {
            alert('Failed to save customer: ' + error.message);
        }
    };

    const handleToggleStatus = async (id: string) => {
        const customer = customers.find(c => c.id === id);
        if (customer) {
            const newStatus = customer.status === 'active' ? 'inactive' : 'active';
            try {
                await api.updateCustomer(id, { status: newStatus });
                loadData();
            } catch (error: any) {
                alert('Failed to update status: ' + error.message);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            try {
                await api.deleteCustomer(id);
                loadData();
            } catch (error: any) {
                alert('Failed to delete customer: ' + error.message);
            }
        }
    };

    const handleAddPrice = () => {
        if (!pricingProductId || !pricingAmount) return;

        const price = parseFloat(pricingAmount);
        if (isNaN(price) || price < 0) return;

        setFormData(prev => ({
            ...prev,
            customerPrices: {
                ...prev.customerPrices,
                [pricingProductId]: price
            }
        }));

        setPricingProductId('');
        setPricingAmount('');
    };

    const handleRemovePrice = (productId: string) => {
        const newPrices = { ...formData.customerPrices };
        delete newPrices[productId];
        setFormData(prev => ({ ...prev, customerPrices: newPrices }));
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-primary">Customer Management</h2>
                    <p className="text-theme-secondary">Manage your customer database</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 w-fit">
                    <Plus className="w-5 h-5" />
                    New Customer
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Customers</p>
                    <p className="text-2xl font-bold text-theme-primary">{customers.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-400">{customers.filter(c => c.status === 'active').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Inactive</p>
                    <p className="text-2xl font-bold text-theme-secondary">{customers.filter(c => c.status === 'inactive').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Balance</p>
                    <p className="text-2xl font-bold text-theme-primary">LKR {customers.reduce((sum, c) => sum + c.balance, 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Customers Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Credit Limit</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id}>
                                <td className="font-semibold">{customer.name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.city}, {customer.country}</td>
                                <td className="font-semibold">LKR {customer.creditLimit.toLocaleString()}</td>
                                <td className={`font-bold ${customer.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    LKR {customer.balance.toFixed(2)}
                                </td>
                                <td>
                                    <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setViewingCustomer(customer); setIsViewModalOpen(true); }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4 text-primary-400" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(customer)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4 text-blue-400" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(customer.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
                                        >
                                            {customer.status === 'active' ? (
                                                <UserX className="w-4 h-4 text-yellow-400" />
                                            ) : (
                                                <UserCheck className="w-4 h-4 text-green-400" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id)}
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

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCustomer ? 'Edit Customer' : 'New Customer'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Customer Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Phone *</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input-field"
                                placeholder="+1-555-0100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Tax ID</label>
                            <input
                                type="text"
                                value={formData.taxId}
                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                className="input-field"
                                placeholder="TX123456"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Address *</label>
                            <input
                                type="text"
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="input-field"
                                placeholder="123 Main Street"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">City *</label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="input-field"
                                placeholder="New York"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Country *</label>
                            <input
                                type="text"
                                required
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="input-field"
                                placeholder="USA"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Credit Limit (LKR) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={formData.creditLimit}
                                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                                className="input-field"
                                placeholder="5000.00"
                            />
                        </div>
                    </div>

                    {/* Customer Pricing Section */}
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-theme-primary mb-4">Customer Specific Pricing</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2">
                                <select
                                    value={pricingProductId}
                                    onChange={(e) => setPricingProductId(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Select Product</option>
                                    {products.map(product => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                            disabled={!!formData.customerPrices[product.id]}
                                        >
                                            {product.name} (Reg: LKR {product.price})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={pricingAmount}
                                    onChange={(e) => setPricingAmount(e.target.value)}
                                    className="input-field"
                                    placeholder="Price"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddPrice}
                                    className="btn-secondary whitespace-nowrap"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {Object.keys(formData.customerPrices).length > 0 && (
                            <div className="table-container max-h-40 overflow-y-auto">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Standard Price</th>
                                            <th>Custom Price</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(formData.customerPrices).map(([productId, price]) => {
                                            const product = products.find(p => p.id === productId);
                                            if (!product) return null;
                                            return (
                                                <tr key={productId}>
                                                    <td className="py-2 text-theme-primary">{product.name}</td>
                                                    <td className="py-2 text-theme-secondary text-sm decoration-slate-500 line-through">
                                                        LKR {product.price.toFixed(2)}
                                                    </td>
                                                    <td className="py-2 text-green-400 font-bold">LKR {price.toFixed(2)}</td>
                                                    <td className="py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePrice(productId)}
                                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                            title="Remove Price"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="btn-primary flex-1">
                            {editingCustomer ? 'Update Customer' : 'Create Customer'}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Customer Details"
            >
                {viewingCustomer && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-theme-primary">{viewingCustomer.name}</h3>
                                <p className="text-theme-secondary">{viewingCustomer.email}</p>
                            </div>
                            <span className={`badge ${viewingCustomer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                {viewingCustomer.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-theme-secondary">Phone</p>
                                <p className="font-semibold text-theme-primary">{viewingCustomer.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Tax ID</p>
                                <p className="font-semibold text-theme-primary">{viewingCustomer.taxId || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-theme-secondary">Address</p>
                                <p className="font-semibold text-theme-primary">
                                    {viewingCustomer.address}, {viewingCustomer.city}, {viewingCustomer.country}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Credit Limit</p>
                                <p className="font-semibold text-theme-primary">LKR {viewingCustomer.creditLimit.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Current Balance</p>
                                <p className={`font-semibold ${viewingCustomer.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    LKR {viewingCustomer.balance.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Available Credit</p>
                                <p className="font-semibold text-green-400">
                                    LKR {(viewingCustomer.creditLimit - viewingCustomer.balance).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Customer Since</p>
                                <p className="font-semibold text-theme-primary">{viewingCustomer.createdAt.toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Credit Usage Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-theme-secondary">Credit Usage</span>
                                <span className="text-theme-primary font-semibold">
                                    {((viewingCustomer.balance / viewingCustomer.creditLimit) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${(viewingCustomer.balance / viewingCustomer.creditLimit) * 100 > 80
                                        ? 'bg-red-500'
                                        : (viewingCustomer.balance / viewingCustomer.creditLimit) * 100 > 50
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min((viewingCustomer.balance / viewingCustomer.creditLimit) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Special Pricing List */}
                        {viewingCustomer.customerPrices && Object.keys(viewingCustomer.customerPrices).length > 0 && (
                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-lg font-semibold text-theme-primary mb-4">Special Pricing</h3>
                                <div className="table-container max-h-60 overflow-y-auto">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th className="text-right">Custom Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(viewingCustomer.customerPrices).map(([productId, price]) => {
                                                const product = products.find(p => p.id === productId);
                                                return (
                                                    <tr key={productId}>
                                                        <td className="text-theme-primary">{product ? product.name : 'Unknown Product'}</td>
                                                        <td className="text-right font-bold text-green-400">LKR {price.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
