'use client';

import Modal from '@/components/Modal';
import { useState, useMemo } from 'react';
import { Plus, Search, Eye, CheckCircle, X } from 'lucide-react';
import { salesReturns as initialReturns, customers, salesInvoices } from '@/data/salesData';
import { SalesReturn } from '@/types';

export default function SalesReturnsTab() {
    const [returns, setReturns] = useState(initialReturns);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingReturn, setViewingReturn] = useState<SalesReturn | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const filteredReturns = useMemo(() => {
        return returns.filter(ret => {
            const matchesSearch = ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ret.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [returns, searchTerm, statusFilter]);

    const handleApprove = (id: string) => {
        setReturns(returns.map(r =>
            r.id === id ? { ...r, status: 'approved' as const, processedAt: new Date() } : r
        ));
    };

    const handleReject = (id: string) => {
        setReturns(returns.map(r =>
            r.id === id ? { ...r, status: 'rejected' as const, processedAt: new Date() } : r
        ));
    };

    const handleRefund = (id: string) => {
        setReturns(returns.map(r =>
            r.id === id ? { ...r, status: 'refunded' as const, processedAt: new Date() } : r
        ));
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Sales Returns</h2>
                    <p className="text-gray-400">Manage product returns and refunds</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">Total Returns</p>
                    <p className="text-2xl font-bold text-white">{returns.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{returns.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">Approved</p>
                    <p className="text-2xl font-bold text-green-400">{returns.filter(r => r.status === 'approved').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">Total Refunds</p>
                    <p className="text-2xl font-bold text-white">${returns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.refundAmount, 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Search returns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
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
                                <td className="font-bold text-red-400">${ret.refundAmount.toFixed(2)}</td>
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
                                <p className="text-sm text-gray-400">Return Number</p>
                                <p className="font-semibold text-white">{viewingReturn.returnNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Invoice Number</p>
                                <p className="font-semibold text-white">{viewingReturn.invoiceNumber || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Customer</p>
                                <p className="font-semibold text-white">{viewingReturn.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Status</p>
                                <span className={`badge ${viewingReturn.status === 'refunded' ? 'badge-success' :
                                        viewingReturn.status === 'approved' ? 'badge-info' :
                                            viewingReturn.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {viewingReturn.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Refund Method</p>
                                <p className="font-semibold text-white capitalize">{viewingReturn.refundMethod.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Created</p>
                                <p className="font-semibold text-white">{viewingReturn.createdAt.toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400 mb-2">Reason for Return</p>
                            <p className="text-white bg-white/5 p-3 rounded-lg">{viewingReturn.reason}</p>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Returned Items</h3>
                            <div className="space-y-2">
                                {viewingReturn.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="font-medium text-white">{item.productName}</p>
                                            <p className="text-sm text-gray-400">{item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-white">${item.total.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-gray-300">
                                <span>Subtotal:</span>
                                <span>${viewingReturn.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Tax:</span>
                                <span>${viewingReturn.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-red-400 border-t border-white/10 pt-2">
                                <span>Refund Amount:</span>
                                <span>${viewingReturn.refundAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
