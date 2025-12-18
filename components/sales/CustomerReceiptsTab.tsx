'use client';

import Modal from '@/components/Modal';
import { useState, useMemo } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { customerReceipts as initialReceipts, customers, salesInvoices } from '@/data/salesData';
import { CustomerReceipt } from '@/types';

export default function CustomerReceiptsTab() {
    const [receipts, setReceipts] = useState(initialReceipts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingReceipt, setViewingReceipt] = useState<CustomerReceipt | null>(null);

    const [formData, setFormData] = useState({
        customerId: '',
        invoiceId: '',
        amount: '',
        paymentMethod: 'cash' as 'cash' | 'card' | 'online' | 'check' | 'bank_transfer',
        referenceNumber: '',
        notes: '',
    });

    const filteredReceipts = useMemo(() => {
        return receipts.filter(receipt => {
            const matchesSearch = receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [receipts, searchTerm]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const customer = customers.find(c => c.id === formData.customerId);
        if (!customer) return;

        const invoice = formData.invoiceId ? salesInvoices.find(i => i.id === formData.invoiceId) : undefined;

        const newReceipt: CustomerReceipt = {
            id: Date.now().toString(),
            receiptNumber: `RCP-2024-${String(receipts.length + 1).padStart(3, '0')}`,
            customerId: formData.customerId,
            customerName: customer.name,
            invoiceId: formData.invoiceId || undefined,
            invoiceNumber: invoice?.invoiceNumber,
            amount: parseFloat(formData.amount),
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.referenceNumber,
            notes: formData.notes,
            createdAt: new Date(),
        };

        setReceipts([newReceipt, ...receipts]);
        setIsModalOpen(false);
        setFormData({
            customerId: '',
            invoiceId: '',
            amount: '',
            paymentMethod: 'cash',
            referenceNumber: '',
            notes: '',
        });
    };

    const customerInvoices = formData.customerId
        ? salesInvoices.filter(inv => inv.customerId === formData.customerId && inv.amountDue > 0)
        : [];

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Customer Receipts</h2>
                    <p className="text-gray-400">Record customer payments and receipts</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 w-fit">
                    <Plus className="w-5 h-5" />
                    New Receipt
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">Total Receipts</p>
                    <p className="text-2xl font-bold text-white">{receipts.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">Total Received</p>
                    <p className="text-2xl font-bold text-green-400">${receipts.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-400 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-white">
                        ${receipts.filter(r => {
                            const now = new Date();
                            return r.createdAt.getMonth() === now.getMonth() && r.createdAt.getFullYear() === now.getFullYear();
                        }).reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="glass-card p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search receipts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
                </div>
            </div>

            {/* Receipts Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Receipt Number</th>
                            <th>Customer</th>
                            <th>Invoice</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Reference</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.map((receipt) => (
                            <tr key={receipt.id}>
                                <td className="font-semibold">{receipt.receiptNumber}</td>
                                <td>{receipt.customerName}</td>
                                <td>{receipt.invoiceNumber || '-'}</td>
                                <td className="font-bold text-green-400">${receipt.amount.toFixed(2)}</td>
                                <td>
                                    <span className="badge badge-info capitalize">{receipt.paymentMethod.replace('_', ' ')}</span>
                                </td>
                                <td>{receipt.referenceNumber || '-'}</td>
                                <td>{receipt.createdAt.toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => { setViewingReceipt(receipt); setIsViewModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View">
                                        <Eye className="w-4 h-4 text-primary-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Customer Receipt">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Customer *</label>
                            <select required value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value, invoiceId: '' })} className="input-field">
                                <option value="">Select Customer</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Invoice (Optional)</label>
                            <select value={formData.invoiceId} onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })} className="input-field" disabled={!formData.customerId}>
                                <option value="">Payment on Account</option>
                                {customerInvoices.map(invoice => (
                                    <option key={invoice.id} value={invoice.id}>
                                        {invoice.invoiceNumber} - Due: ${invoice.amountDue.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Amount *</label>
                            <input type="number" step="0.01" min="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-field" placeholder="0.00" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method *</label>
                            <select required value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })} className="input-field">
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="online">Online</option>
                                <option value="check">Check</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Reference Number</label>
                            <input type="text" value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} className="input-field" placeholder="Transaction reference" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" rows={3} placeholder="Payment notes..." />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="btn-primary flex-1">Create Receipt</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Receipt Details">
                {viewingReceipt && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Receipt Number</p>
                                <p className="font-semibold text-white">{viewingReceipt.receiptNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Date</p>
                                <p className="font-semibold text-white">{viewingReceipt.createdAt.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Customer</p>
                                <p className="font-semibold text-white">{viewingReceipt.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Invoice</p>
                                <p className="font-semibold text-white">{viewingReceipt.invoiceNumber || 'Payment on Account'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Payment Method</p>
                                <p className="font-semibold text-white capitalize">{viewingReceipt.paymentMethod.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Reference Number</p>
                                <p className="font-semibold text-white">{viewingReceipt.referenceNumber || '-'}</p>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-400 mb-2">Amount Received</p>
                            <p className="text-4xl font-bold text-green-400">${viewingReceipt.amount.toFixed(2)}</p>
                        </div>

                        {viewingReceipt.notes && (
                            <div>
                                <p className="text-sm text-gray-400 mb-2">Notes</p>
                                <p className="text-white bg-white/5 p-3 rounded-lg">{viewingReceipt.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
