'use client';

import Modal from '@/components/Modal';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Building2 } from 'lucide-react';
import { Supplier } from '@/types';
import * as api from '@/lib/api';

export default function SuppliersTab() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getSuppliers();
            setSuppliers(data.map((s: any) => ({
                ...s,
                id: s.id.toString(),
                createdAt: new Date(s.createdAt)
            })));
        } catch (error) {
            console.error("Failed to load suppliers", error);
        }
    };

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((supplier: Supplier) => {
            const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [suppliers, searchTerm]);

    const handleOpenModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                person: supplier.contactPerson || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                city: supplier.city || '',
                country: supplier.country || '',
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                person: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            contactPerson: formData.person,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: formData.country,
        };

        try {
            if (editingSupplier) {
                await api.updateSupplier(editingSupplier.id, payload);
            } else {
                await api.createSupplier(payload);
            }
            loadData();
            setIsModalOpen(false);
        } catch (error: any) {
            alert('Failed to save supplier: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            try {
                await api.deleteSupplier(id);
                loadData();
            } catch (error: any) {
                alert('Failed to delete supplier: ' + error.message);
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-primary">Supplier Management</h2>
                    <p className="text-theme-secondary">Manage your supplier database</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 w-fit">
                    <Plus className="w-5 h-5" />
                    New Supplier
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Suppliers</p>
                    <p className="text-2xl font-bold text-theme-primary">{suppliers.length}</p>
                </div>
                {/* Additional stats could go here */}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Suppliers Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Country</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.map((supplier) => (
                            <tr key={supplier.id}>
                                <td className="font-semibold flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-theme-secondary" />
                                    {supplier.name}
                                </td>
                                <td>{supplier.contactPerson || '-'}</td>
                                <td>{supplier.email || '-'}</td>
                                <td>{supplier.phone || '-'}</td>
                                <td>{supplier.city || '-'}</td>
                                <td>{supplier.country || '-'}</td>
                                <td>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setViewingSupplier(supplier); setIsViewModalOpen(true); }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4 text-primary-400" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(supplier)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4 text-blue-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
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
                title={editingSupplier ? 'Edit Supplier' : 'New Supplier'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Supplier Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="Company Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Contact Person</label>
                            <input
                                type="text"
                                value={formData.person}
                                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                                className="input-field"
                                placeholder="Full Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                placeholder="email@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input-field"
                                placeholder="+1-555-0100"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="input-field"
                                placeholder="123 Business Rd"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="input-field"
                                placeholder="City"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="input-field"
                                placeholder="Country"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="btn-primary flex-1">
                            {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
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
                title="Supplier Details"
            >
                {viewingSupplier && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-theme-primary">{viewingSupplier.name}</h3>
                                <p className="text-theme-secondary flex items-center gap-1">
                                    <Building2 className="w-4 h-4" /> Supplier
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-theme-secondary">Contact Person</p>
                                <p className="font-semibold text-theme-primary">{viewingSupplier.contactPerson || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Email</p>
                                <p className="font-semibold text-theme-primary">{viewingSupplier.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Phone</p>
                                <p className="font-semibold text-theme-primary">{viewingSupplier.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Date Added</p>
                                <p className="font-semibold text-theme-primary">{viewingSupplier.createdAt?.toLocaleDateString()}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-theme-secondary">Address</p>
                                <p className="font-semibold text-theme-primary">
                                    {[viewingSupplier.address, viewingSupplier.city, viewingSupplier.country].filter(Boolean).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
