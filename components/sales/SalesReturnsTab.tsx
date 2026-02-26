'use client';

import Modal from '@/components/Modal';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Eye, CheckCircle, X } from 'lucide-react';
// import { salesReturns as initialReturns, customers, salesInvoices } from '@/data/salesData';
import { SalesReturn } from '@/types';
import * as api from '@/lib/api';

export default function SalesReturnsTab() {
    const [returns, setReturns] = useState<SalesReturn[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingReturn, setViewingReturn] = useState<SalesReturn | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getSalesReturns();
            setReturns(data.map((r: any) => ({
                ...r,
                id: r.id.toString(),
                customerName: r.Customer ? r.Customer.name : (r.customerName || 'Unknown'),
                subtotal: parseFloat(r.subtotal) || 0,
                tax: parseFloat(r.tax) || 0,
                total: parseFloat(r.total) || 0,
                refundAmount: parseFloat(r.refundAmount) || 0,
                createdAt: new Date(r.createdAt),
                processedAt: r.processedAt ? new Date(r.processedAt) : undefined,
                items: r.items ? r.items.map((item: any) => ({
                    ...item,
                    price: parseFloat(item.price) || 0,
                    quantity: parseInt(item.quantity) || 0,
                    total: parseFloat(item.total) || 0,
                })) : []
            })));
        } catch (error) {
            console.error("Failed to load sales returns", error);
        }
    };

    const filteredReturns = useMemo(() => {
        return returns.filter((ret: SalesReturn) => {
            const matchesSearch = ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ret.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [returns, searchTerm, statusFilter]);

    const handleApprove = async (id: string) => {
        try {
            await api.updateSalesReturn(id, { status: 'approved', processedAt: new Date() });
            loadData();
        } catch (error: any) {
            alert('Failed to approve return: ' + error.message);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.updateSalesReturn(id, { status: 'rejected', processedAt: new Date() });
            loadData();
        } catch (error: any) {
            alert('Failed to reject return: ' + error.message);
        }
    };

    const handleRefund = async (id: string) => {
        try {
            await api.updateSalesReturn(id, { status: 'refunded', processedAt: new Date() });
            loadData();
        } catch (error: any) {
            alert('Failed to process refund: ' + error.message);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-primary">Sales Returns</h2>
                    <p className="text-theme-secondary">Manage product returns and refunds</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Returns</p>
                    <p className="text-2xl font-bold text-theme-primary">{returns.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{returns.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Approved</p>
                    <p className="text-2xl font-bold text-green-400">{returns.filter(r => r.status === 'approved').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-theme-secondary mb-1">Total Refunds</p>
                    <p className="text-2xl font-bold text-theme-primary">LKR {returns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.refundAmount, 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="search-wrapper">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search returns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field search-input"
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Returns Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Return Number</th>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Refund Amount</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReturns.map((ret) => (
                            <tr key={ret.id}>
                                <td className="font-semibold">{ret.returnNumber}</td>
                                <td>{ret.invoiceNumber || '-'}</td>
                                <td>{ret.customerName}</td>
                                <td>{ret.items.length} items</td>
                                <td className="font-bold text-red-400">LKR {ret.refundAmount.toFixed(2)}</td>
                                <td className="max-w-xs truncate">{ret.reason}</td>
                                <td>
                                    <span className={`badge ${ret.status === 'refunded' ? 'badge-success' :
                                        ret.status === 'approved' ? 'badge-info' :
                                            ret.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {ret.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setViewingReturn(ret); setIsViewModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View">
                                            <Eye className="w-4 h-4 text-primary-400" />
                                        </button>
                                        {ret.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(ret.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Approve">
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                </button>
                                                <button onClick={() => handleReject(ret.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Reject">
                                                    <X className="w-4 h-4 text-red-400" />
                                                </button>
                                            </>
                                        )}
                                        {ret.status === 'approved' && (
                                            <button onClick={() => handleRefund(ret.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Process Refund">
                                                <CheckCircle className="w-4 h-4 text-blue-400" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Sales Return Details">
                {viewingReturn && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-theme-secondary">Return Number</p>
                                <p className="font-semibold text-theme-primary">{viewingReturn.returnNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Invoice Number</p>
                                <p className="font-semibold text-theme-primary">{viewingReturn.invoiceNumber || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Customer</p>
                                <p className="font-semibold text-theme-primary">{viewingReturn.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Status</p>
                                <span className={`badge ${viewingReturn.status === 'refunded' ? 'badge-success' :
                                    viewingReturn.status === 'approved' ? 'badge-info' :
                                        viewingReturn.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {viewingReturn.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Refund Method</p>
                                <p className="font-semibold text-theme-primary capitalize">{viewingReturn.refundMethod.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-theme-secondary">Created</p>
                                <p className="font-semibold text-theme-primary">{viewingReturn.createdAt.toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-theme-secondary mb-2">Reason for Return</p>
                            <p className="text-theme-primary bg-white/5 p-3 rounded-lg">{viewingReturn.reason}</p>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-semibold text-theme-primary mb-4">Returned Items</h3>
                            <div className="space-y-2">
                                {viewingReturn.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="font-medium text-theme-primary">{item.productName}</p>
                                            <p className="text-sm text-theme-secondary">{item.quantity} × LKR {item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-theme-primary">LKR {item.total.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-theme-secondary">
                                <span>Subtotal:</span>
                                <span>LKR {viewingReturn.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-theme-secondary">
                                <span>Tax:</span>
                                <span>LKR {viewingReturn.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-red-400 border-t border-white/10 pt-2">
                                <span>Refund Amount:</span>
                                <span>LKR {viewingReturn.refundAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
