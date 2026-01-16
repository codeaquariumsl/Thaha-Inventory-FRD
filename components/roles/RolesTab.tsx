'use client';

import { useState, useEffect } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../../lib/api';
import { Shield, Plus, Edit2, Trash2, X, Search, Lock } from 'lucide-react';

export default function RolesTab() {
    const [roles, setRoles] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (role: any = null) => {
        if (role) {
            setCurrentRole(role);
            setFormData({ name: role.name });
        } else {
            setCurrentRole(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentRole) {
                await updateRole(currentRole.id, formData);
            } else {
                await createRole(formData);
            }
            setIsModalOpen(false);
            loadRoles();
        } catch (error) {
            console.error('Failed to save role', error);
            alert('Failed to save role');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this role? This might affect users assigned to this role.')) {
            try {
                await deleteRole(id);
                loadRoles();
            } catch (error) {
                console.error('Failed to delete role', error);
            }
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Role Management</h1>
                    <p className="text-theme-secondary mt-1">Manage user roles and access levels</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Role</span>
                </button>
            </div>

            <div className="table-container mb-8">
                {/* Filters */}
                <div className="p-4 border-b border-white/10 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">Role Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-theme-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-theme-secondary">Loading...</td>
                            </tr>
                        ) : filteredRoles.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-theme-secondary">No roles found</td>
                            </tr>
                        ) : (
                            filteredRoles.map((role) => (
                                <tr key={role.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-theme-primary font-bold mr-3">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div className="text-sm font-medium text-theme-primary">{role.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">
                                        <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded">{role.id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(role)}
                                                className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                                title="Edit Role"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete Role"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content relative max-w-md">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-theme-primary mb-6">
                            {currentRole ? 'Edit Role' : 'Create New Role'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-theme-primary mb-1.5">Role Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="input-field pl-10"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Administrator, Manager"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-white/10 rounded-lg text-theme-secondary hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {currentRole ? 'Save Changes' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
