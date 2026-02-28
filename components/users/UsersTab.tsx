'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../../lib/api';
import { Plus, Edit2, Trash2, X, Search, UserCheck, UserX } from 'lucide-react';

export default function UsersTab() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', roleId: '', isActive: true });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    };

    const loadRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles', error);
        }
    };

    const handleOpenModal = (user: any = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                roleId: user.roleId || '',
                isActive: user.isActive
            });
        } else {
            setCurrentUser(null);
            setFormData({ username: '', email: '', password: '', roleId: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentUser) {
                await updateUser(currentUser.id, formData);
            } else {
                await createUser(formData);
            }
            setIsModalOpen(false);
            loadUsers();
        } catch (error) {
            console.error('Failed to save user', error);
            alert('Failed to save user');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                loadUsers();
            } catch (error) {
                console.error('Failed to delete user', error);
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">User Management</h1>
                    <p className="text-theme-secondary mt-1">Manage system access and roles</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New User</span>
                </button>
            </div>

            <div className="table-container mb-8">
                {/* Filters */}
                <div className="p-4 border-b border-theme-border flex items-center gap-4">
                    <div className="search-wrapper flex-1 max-w-sm">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="input-field search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr className="border-b border-theme-border bg-theme-surface">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-theme-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-theme-hover transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-theme-primary font-bold mr-3">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-theme-primary">{user.username}</div>
                                            <div className="text-sm text-theme-secondary">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-theme-primary bg-theme-surface px-3 py-1 rounded-full inline-block border border-theme-border">
                                        {user.Role ? user.Role.name : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${user.isActive
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content relative max-w-lg">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-theme-secondary hover:text-theme-primary transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-theme-primary mb-6">
                            {currentUser ? 'Edit User' : 'Add New User'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-theme-primary mb-1.5">Username</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-theme-primary mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="input-field"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-theme-primary mb-1.5">
                                        Password {currentUser && <span className="text-theme-secondary font-normal">(Leave blank to keep current)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        className="input-field"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!currentUser}
                                        placeholder={currentUser ? "••••••••" : "Enter password"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-theme-primary mb-1.5">Role</label>
                                    <select
                                        className="input-field"
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-theme-surface rounded-lg border border-theme-border">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActive" className="text-sm text-theme-primary cursor-pointer select-none">
                                        User Account Active
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-theme-border">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-theme-border rounded-lg text-theme-secondary hover:bg-theme-hover hover:text-theme-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {currentUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
